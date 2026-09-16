"""Recommendations API."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.ai_models import Recommendation, Skill

router = APIRouter()


@router.get("/me")
async def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student_result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    result = await db.execute(
        select(Recommendation, Skill)
        .outerjoin(Skill, Recommendation.skill_id == Skill.id)
        .where(Recommendation.student_id == student.id)
        .where(Recommendation.is_dismissed == False)
        .order_by(Recommendation.priority)
    )
    rows = result.all()

    return [
        {
            "id": rec.id,
            "skill_name": skill.name if skill else None,
            "recommendation_type": rec.recommendation_type,
            "title": rec.title,
            "description": rec.description,
            "explanation": rec.explanation,
            "resource_url": rec.resource_url,
            "priority": rec.priority,
            "estimated_hours": rec.estimated_hours,
            "is_completed": rec.is_completed,
        }
        for rec, skill in rows
    ]


@router.post("/{rec_id}/complete")
async def mark_recommendation_complete(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Recommendation).where(Recommendation.id == rec_id))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    from datetime import datetime
    rec.is_completed = True
    rec.completed_at = datetime.utcnow()
    await db.commit()
    return {"message": "Marked as completed"}


@router.post("/{rec_id}/dismiss")
async def dismiss_recommendation(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Recommendation).where(Recommendation.id == rec_id))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.is_dismissed = True
    await db.commit()
    return {"message": "Dismissed"}
