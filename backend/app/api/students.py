"""Student API routes — profile, skills, gaps, readiness."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.student import Student
from app.models.skill import StudentSkill, StudentSkillEvidence, Skill
from app.models.ai_models import SkillGap, Recommendation
from app.models.assessment import AssessmentAttempt
from app.ai.gap_detector import get_detector
from app.ai.readiness_engine import get_readiness_engine
from app.ai.recommendation_engine import get_recommendation_engine
from app.services.skill_service import compute_student_skill_levels, compute_evidence_score
from app.services.audit_service import log_action

router = APIRouter()


class StudentProfileUpdate(BaseModel):
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    career_goal: Optional[str] = None
    target_role_id: Optional[int] = None
    cgpa: Optional[float] = None
    current_semester: Optional[int] = None


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Student)
        .where(Student.user_id == current_user.id)
        .options(selectinload(Student.department), selectinload(Student.program))
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
        },
        "student": {
            "id": student.id,
            "roll_number": student.roll_number,
            "batch_year": student.batch_year,
            "cgpa": student.cgpa,
            "bio": student.bio,
            "linkedin_url": student.linkedin_url,
            "github_url": student.github_url,
            "portfolio_url": student.portfolio_url,
            "career_goal": student.career_goal,
            "readiness_score": student.readiness_score,
            "profile_completion": student.profile_completion,
            "department": student.department.name if student.department else None,
            "program": student.program.name if student.program else None,
        }
    }


@router.put("/me")
async def update_profile(
    data: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(student, key, value)

    # Recalculate profile completion
    fields = [student.bio, student.linkedin_url, student.github_url, student.career_goal, student.cgpa]
    student.profile_completion = (sum(1 for f in fields if f) / len(fields)) * 100

    await db.commit()
    return {"message": "Profile updated", "profile_completion": student.profile_completion}


@router.get("/me/skills")
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    skills_result = await db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student.id)
    )
    skills_data = skills_result.all()

    proficiency_names = {0: "No Evidence", 1: "Beginner", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert"}

    return [
        {
            "id": ss.id,
            "skill_id": skill.id,
            "skill_name": skill.name,
            "category": None,
            "proficiency_level": ss.proficiency_level,
            "proficiency_name": proficiency_names.get(ss.proficiency_level, "Unknown"),
            "proficiency_score": ss.proficiency_score,
            "is_verified": ss.is_verified,
            "evidence_count": ss.evidence_count,
        }
        for ss, skill in skills_data
    ]


@router.get("/me/skill-gaps")
async def get_my_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    gaps_result = await db.execute(
        select(SkillGap, Skill)
        .join(Skill, SkillGap.skill_id == Skill.id)
        .where(SkillGap.student_id == student.id)
        .order_by(SkillGap.priority)
    )
    gaps_data = gaps_result.all()

    return [
        {
            "id": gap.id,
            "skill_name": skill.name,
            "required_level": gap.required_level,
            "current_level": gap.current_level,
            "gap_level": gap.gap_level,
            "status": gap.status,
            "explanation": gap.explanation,
            "priority": gap.priority,
        }
        for gap, skill in gaps_data
    ]


@router.get("/me/readiness")
async def get_my_readiness(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get gaps
    gaps_result = await db.execute(
        select(SkillGap, Skill)
        .join(Skill, SkillGap.skill_id == Skill.id)
        .where(SkillGap.student_id == student.id)
    )
    gap_records = [
        {
            "skill_name": skill.name,
            "required_level": gap.required_level,
            "current_level": gap.current_level,
            "gap_level": gap.gap_level,
            "status": gap.status,
            "required_level_name": ["No Evidence", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"][gap.required_level],
            "current_level_name": ["No Evidence", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"][gap.current_level],
            "priority": gap.priority,
        }
        for gap, skill in gaps_result.all()
    ]

    if not gap_records:
        return {
            "score": student.readiness_score,
            "category": "needs_improvement",
            "label": "No assessment data yet",
            "breakdown": {},
            "skill_scores": [],
            "explanation": "Complete your profile and take assessments to see your readiness score.",
        }

    evidence_score = await compute_evidence_score(db, student.id)
    # Get latest assessment avg
    attempts = await db.execute(
        select(func.avg(AssessmentAttempt.score))
        .where(AssessmentAttempt.student_id == student.id)
        .where(AssessmentAttempt.status == "completed")
    )
    avg_assessment = attempts.scalar() or 0.0

    engine = get_readiness_engine()
    readiness = engine.compute_readiness(gap_records, evidence_score, float(avg_assessment))
    return readiness


@router.post("/me/analyze")
async def analyze_my_gaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger AI skill gap analysis for the student's target role."""
    result = await db.execute(
        select(Student)
        .where(Student.user_id == current_user.id)
        .options(selectinload(Student.target_role))
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.target_role_id:
        raise HTTPException(status_code=400, detail="Please set a target job role first")

    from app.services.analysis_service import run_gap_analysis
    await run_gap_analysis(db, student)
    return {"message": "Analysis complete. Skill gaps and readiness score updated."}


@router.get("/{student_id}/profile")
async def get_student_profile(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Faculty/admin view of student profile."""
    if current_user.role not in ("faculty", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(Student, User)
        .join(User, Student.user_id == User.id)
        .where(Student.id == student_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")

    student, user = row
    return {
        "id": student.id,
        "full_name": user.full_name,
        "email": user.email,
        "roll_number": student.roll_number,
        "batch_year": student.batch_year,
        "cgpa": student.cgpa,
        "career_goal": student.career_goal,
        "readiness_score": student.readiness_score,
        "profile_completion": student.profile_completion,
    }
