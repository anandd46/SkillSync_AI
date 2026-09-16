"""Admin API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.student import Student
from app.models.institution import Institution, Department, Program, Course
from app.models.system import AuditLog
from app.models.skill import Skill
from app.models.system import CourseSkill
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


@router.get("/users")
async def list_users(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).limit(100))
    users = result.scalars().all()
    return [
        {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active}
        for u in users
    ]


@router.get("/audit-logs")
async def get_audit_logs(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AuditLog, User)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(100)
    )
    rows = result.all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "user_name": user.full_name if user else "System",
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log, user in rows
    ]


@router.get("/dashboard-stats")
async def admin_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_students = (await db.execute(select(func.count(Student.id)))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    avg_readiness = float((await db.execute(select(func.avg(Student.readiness_score)))).scalar() or 0)

    return {
        "total_users": total_users,
        "total_students": total_students,
        "average_readiness": round(avg_readiness, 1),
    }


class CourseSkillAdd(BaseModel):
    skill_name: str
    coverage_level: int = 3
    is_primary: bool = False


@router.post("/courses/{course_id}/skills")
async def add_course_skill(
    course_id: int,
    data: CourseSkillAdd,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    skill_result = await db.execute(select(Skill).where(Skill.name == data.skill_name))
    skill = skill_result.scalar_one_or_none()
    if not skill:
        skill = Skill(name=data.skill_name)
        db.add(skill)
        await db.flush()

    cs = CourseSkill(
        course_id=course_id,
        skill_id=skill.id,
        coverage_level=data.coverage_level,
        is_primary=data.is_primary,
    )
    db.add(cs)
    await db.commit()
    return {"message": f"Skill '{data.skill_name}' added to course"}
