"""Faculty API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.ai_models import SkillGap
from app.models.skill import Skill

router = APIRouter()


@router.get("/students")
async def list_department_students(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("faculty", "admin"):
        raise HTTPException(status_code=403, detail="Faculty access required")

    faculty_result = await db.execute(select(Faculty).where(Faculty.user_id == current_user.id))
    faculty = faculty_result.scalar_one_or_none()

    query = select(Student, User).join(User, Student.user_id == User.id)
    if faculty and faculty.department_id:
        query = query.where(Student.department_id == faculty.department_id)

    result = await db.execute(query.limit(50))
    rows = result.all()

    return [
        {
            "id": student.id,
            "full_name": user.full_name,
            "email": user.email,
            "roll_number": student.roll_number,
            "batch_year": student.batch_year,
            "career_goal": student.career_goal,
            "readiness_score": student.readiness_score,
            "profile_completion": student.profile_completion,
        }
        for student, user in rows
    ]


@router.get("/dashboard-stats")
async def faculty_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("faculty", "admin"):
        raise HTTPException(status_code=403, detail="Faculty access required")

    total = await db.execute(select(func.count(Student.id)))
    avg_r = await db.execute(select(func.avg(Student.readiness_score)))

    top_gaps = await db.execute(
        select(Skill.name, func.count(SkillGap.id).label("c"))
        .join(SkillGap, SkillGap.skill_id == Skill.id)
        .where(SkillGap.status.in_(["missing", "major_gap"]))
        .group_by(Skill.name)
        .order_by(func.count(SkillGap.id).desc())
        .limit(5)
    )

    return {
        "total_students": total.scalar() or 0,
        "average_readiness": round(float(avg_r.scalar() or 0), 1),
        "top_skill_gaps": [{"skill": r[0], "count": r[1]} for r in top_gaps.all()],
    }
