"""Assessments API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, SkillScore
)
from app.models.skill import StudentSkill, Skill, StudentSkillEvidence
from app.services.audit_service import log_action

router = APIRouter()

LEVEL_NAMES = {0: "No Evidence", 1: "Beginner", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert"}


def score_to_level(score: float) -> int:
    if score < 20: return 1
    elif score < 40: return 2
    elif score < 60: return 3
    elif score < 80: return 4
    else: return 5


@router.get("/")
async def list_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Assessment, Skill)
        .outerjoin(Skill, Assessment.skill_id == Skill.id)
        .where(Assessment.is_active == True)
    )
    rows = result.all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "skill_name": s.name if s else None,
            "total_questions": a.total_questions,
            "time_limit_minutes": a.time_limit_minutes,
            "difficulty": a.difficulty,
        }
        for a, s in rows
    ]


@router.get("/{assessment_id}")
async def get_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions_result = await db.execute(
        select(AssessmentQuestion)
        .where(AssessmentQuestion.assessment_id == assessment_id)
        .where(AssessmentQuestion.is_active == True)
        .order_by(AssessmentQuestion.order_index)
    )
    questions = questions_result.scalars().all()

    return {
        "id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "total_questions": assessment.total_questions,
        "time_limit_minutes": assessment.time_limit_minutes,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": q.options,
                "points": q.points,
                # Don't expose correct_answer here
            }
            for q in questions
        ],
    }


class SubmitAssessment(BaseModel):
    answers: List[dict]  # [{question_id, answer}]


@router.post("/{assessment_id}/start")
async def start_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    student_result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    attempt = AssessmentAttempt(
        student_id=student.id,
        assessment_id=assessment_id,
        status="in_progress",
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return {"attempt_id": attempt.id, "message": "Assessment started"}


@router.post("/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: int,
    data: SubmitAssessment,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    student_result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get assessment and questions
    assessment_result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = assessment_result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions_result = await db.execute(
        select(AssessmentQuestion)
        .where(AssessmentQuestion.assessment_id == assessment_id)
        .where(AssessmentQuestion.is_active == True)
    )
    questions = {q.id: q for q in questions_result.scalars().all()}

    # Grade answers
    correct = 0
    total_points = 0
    earned_points = 0

    attempt = AssessmentAttempt(
        student_id=student.id,
        assessment_id=assessment_id,
        status="completed",
        total_questions=len(questions),
        completed_at=datetime.utcnow(),
    )
    db.add(attempt)
    await db.flush()

    for answer_data in data.answers:
        qid = answer_data.get("question_id")
        student_answer = answer_data.get("answer", "")
        question = questions.get(qid)
        if not question:
            continue

        is_correct = student_answer.strip().lower() == question.correct_answer.strip().lower()
        points = question.points if is_correct else 0
        if is_correct:
            correct += 1

        total_points += question.points
        earned_points += points

        aa = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=qid,
            student_answer=student_answer,
            is_correct=is_correct,
            points_earned=points,
        )
        db.add(aa)

    # Calculate score
    score = (earned_points / total_points * 100) if total_points > 0 else 0
    prof_level = score_to_level(score)

    attempt.score = round(score, 1)
    attempt.correct_answers = correct
    attempt.proficiency_estimated = prof_level

    # Update student skill proficiency
    if assessment.skill_id:
        skill_result = await db.execute(select(Skill).where(Skill.id == assessment.skill_id))
        skill = skill_result.scalar_one_or_none()

        # Add evidence
        evidence = StudentSkillEvidence(
            student_id=student.id,
            skill_id=assessment.skill_id,
            source_type="assessment",
            source_id=attempt.id,
            confidence=score / 100,
            weight=0.30,
            proficiency_indicated=prof_level,
            is_verified=True,
        )
        db.add(evidence)

        # Update or create student skill
        ss_result = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == student.id,
                StudentSkill.skill_id == assessment.skill_id,
            )
        )
        ss = ss_result.scalar_one_or_none()
        if ss:
            if prof_level > ss.proficiency_level:
                ss.proficiency_level = prof_level
                ss.proficiency_score = score
        else:
            ss = StudentSkill(
                student_id=student.id,
                skill_id=assessment.skill_id,
                proficiency_level=prof_level,
                proficiency_score=score,
            )
            db.add(ss)

    await db.commit()
    await log_action(db, current_user.id, "ASSESSMENT_SUBMITTED", "assessment", assessment_id)

    return {
        "score": round(score, 1),
        "correct": correct,
        "total": len(questions),
        "proficiency_level": prof_level,
        "proficiency_name": LEVEL_NAMES.get(prof_level),
        "passed": score >= assessment.passing_score,
        "message": f"Assessment completed! Score: {score:.0f}%",
    }


@router.get("/my/history")
async def get_my_assessment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student_result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    result = await db.execute(
        select(AssessmentAttempt, Assessment)
        .join(Assessment, AssessmentAttempt.assessment_id == Assessment.id)
        .where(AssessmentAttempt.student_id == student.id)
        .order_by(AssessmentAttempt.started_at.desc())
    )
    rows = result.all()

    return [
        {
            "attempt_id": attempt.id,
            "assessment_title": assessment.title,
            "score": attempt.score,
            "status": attempt.status,
            "proficiency_level": attempt.proficiency_estimated,
            "proficiency_name": LEVEL_NAMES.get(attempt.proficiency_estimated or 0),
            "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
            "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
        }
        for attempt, assessment in rows
    ]
