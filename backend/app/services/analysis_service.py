"""Analysis service — runs the full AI gap analysis pipeline."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional

logger = logging.getLogger(__name__)


async def run_gap_analysis(db: AsyncSession, student):
    """
    Full pipeline:
    1. Get target job role required skills
    2. Get student skill levels (from evidence)
    3. Run gap detection
    4. Update skill gaps in DB
    5. Compute readiness score
    6. Generate recommendations
    7. Update student readiness score
    """
    from app.models.industry import JobSkill, JobRole
    from app.models.skill import Skill, StudentSkill, StudentSkillEvidence
    from app.models.ai_models import SkillGap, Recommendation
    from app.models.assessment import AssessmentAttempt
    from app.ai.gap_detector import get_detector
    from app.ai.readiness_engine import get_readiness_engine
    from app.ai.recommendation_engine import get_recommendation_engine
    from app.services.skill_service import compute_student_skill_levels, compute_evidence_score
    from sqlalchemy import func

    if not student.target_role_id:
        return

    # 1. Get required skills for the job role
    req_result = await db.execute(
        select(JobSkill, Skill)
        .join(Skill, JobSkill.skill_id == Skill.id)
        .where(JobSkill.job_role_id == student.target_role_id)
    )
    required_skills_data = req_result.all()

    if not required_skills_data:
        logger.warning("No required skills found for role %s", student.target_role_id)
        return

    required_skills = [
        {"skill_name": skill.name, "skill_id": skill.id, "required_level": job_skill.required_level}
        for job_skill, skill in required_skills_data
    ]

    # 2. Get student skill levels from evidence
    student_skill_levels = await compute_student_skill_levels(db, student.id)

    # Also incorporate assessment scores
    attempts_result = await db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.student_id == student.id)
        .where(AssessmentAttempt.status == "completed")
    )
    attempts = attempts_result.scalars().all()

    # 3. Run gap detection
    detector = get_detector()
    gaps = detector.detect_gaps_batch(required_skills, student_skill_levels)

    # 4. Update DB — delete old gaps, insert new
    await db.execute(delete(SkillGap).where(SkillGap.student_id == student.id))

    skill_id_map = {s["skill_name"]: s["skill_id"] for s in required_skills}

    for gap in gaps:
        skill_id = skill_id_map.get(gap["skill_name"])
        if not skill_id:
            continue
        db_gap = SkillGap(
            student_id=student.id,
            skill_id=skill_id,
            job_role_id=student.target_role_id,
            required_level=gap["required_level"],
            current_level=gap["current_level"],
            gap_level=gap["gap_level"],
            status=gap["status"],
            explanation=gap["explanation"],
            priority=gap["priority"],
        )
        db.add(db_gap)

    # 5. Compute readiness
    evidence_score = await compute_evidence_score(db, student.id)
    avg_assessment = sum(a.score for a in attempts if a.score) / len(attempts) if attempts else 0.0

    re_engine = get_readiness_engine()
    readiness = re_engine.compute_readiness(gaps, evidence_score, avg_assessment)

    student.readiness_score = readiness["score"]
    student.last_assessed_at = __import__("datetime").datetime.utcnow()

    # 6. Generate recommendations and update DB
    await db.execute(delete(Recommendation).where(Recommendation.student_id == student.id))

    rec_engine = get_recommendation_engine()
    recommendations = rec_engine.generate_recommendations(gaps, student.career_goal or "")

    for rec in recommendations:
        skill_id = skill_id_map.get(rec["skill_name"])
        db_rec = Recommendation(
            student_id=student.id,
            skill_id=skill_id,
            recommendation_type=rec["recommendation_type"],
            title=rec["title"],
            description=rec.get("description", ""),
            explanation=rec["explanation"],
            resource_url=rec.get("resource_url", ""),
            priority=rec["priority"],
            estimated_hours=rec.get("estimated_hours"),
        )
        db.add(db_rec)

    await db.commit()
    logger.info("Gap analysis complete for student %s. Readiness: %.1f%%", student.id, readiness["score"])
