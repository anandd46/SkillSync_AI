"""Analytics API — institution, department, student stats."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.skill import Skill, StudentSkill
from app.models.system import CourseSkill
from app.models.ai_models import SkillGap, Recommendation
from app.models.industry import JobRole, JobSkill
from app.models.institution import Institution, Department

router = APIRouter()


@router.get("/institution")
async def institution_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("admin", "faculty"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Total students
    total_students = await db.execute(select(func.count(Student.id)))
    total_students_count = total_students.scalar() or 0

    # Average readiness
    avg_readiness = await db.execute(select(func.avg(Student.readiness_score)))
    avg_readiness_val = float(avg_readiness.scalar() or 0)

    # Top skill gaps
    top_gaps = await db.execute(
        select(Skill.name, func.count(SkillGap.id).label("count"))
        .join(SkillGap, SkillGap.skill_id == Skill.id)
        .where(SkillGap.status.in_(["missing", "major_gap"]))
        .group_by(Skill.name)
        .order_by(func.count(SkillGap.id).desc())
        .limit(10)
    )
    top_gaps_data = [{"skill": row[0], "count": row[1]} for row in top_gaps.all()]

    # Readiness distribution
    dist_result = await db.execute(
        select(
            func.sum(func.cast(Student.readiness_score < 40, func.Integer)).label("needs_improvement"),
            func.sum(func.cast((Student.readiness_score >= 40) & (Student.readiness_score < 60), func.Integer)).label("developing"),
            func.sum(func.cast((Student.readiness_score >= 60) & (Student.readiness_score < 75), func.Integer)).label("moderately_ready"),
            func.sum(func.cast((Student.readiness_score >= 75) & (Student.readiness_score < 90), func.Integer)).label("job_ready"),
            func.sum(func.cast(Student.readiness_score >= 90, func.Integer)).label("highly_ready"),
        )
    )
    dist_row = dist_result.first()
    readiness_distribution = {
        "Needs Improvement": int(dist_row[0] or 0),
        "Developing": int(dist_row[1] or 0),
        "Moderately Ready": int(dist_row[2] or 0),
        "Job Ready": int(dist_row[3] or 0),
        "Highly Ready": int(dist_row[4] or 0),
    }

    # Most demanded industry skills
    top_demanded = await db.execute(
        select(Skill.name, func.count(JobSkill.id).label("demand"))
        .join(JobSkill, JobSkill.skill_id == Skill.id)
        .group_by(Skill.name)
        .order_by(func.count(JobSkill.id).desc())
        .limit(10)
    )
    top_demanded_data = [{"skill": row[0], "demand": row[1]} for row in top_demanded.all()]

    return {
        "total_students": total_students_count,
        "average_readiness": round(avg_readiness_val, 1),
        "top_skill_gaps": top_gaps_data,
        "readiness_distribution": readiness_distribution,
        "top_demanded_skills": top_demanded_data,
    }


@router.get("/department/{dept_id}")
async def department_analytics(
    dept_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("admin", "faculty"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Students in department
    students_result = await db.execute(
        select(Student).where(Student.department_id == dept_id)
    )
    students = students_result.scalars().all()
    student_ids = [s.id for s in students]

    avg_readiness = sum(s.readiness_score for s in students) / len(students) if students else 0

    # Top gaps for department
    if student_ids:
        top_gaps = await db.execute(
            select(Skill.name, func.count(SkillGap.id).label("count"))
            .join(SkillGap, SkillGap.skill_id == Skill.id)
            .where(SkillGap.student_id.in_(student_ids))
            .where(SkillGap.status.in_(["missing", "major_gap"]))
            .group_by(Skill.name)
            .order_by(func.count(SkillGap.id).desc())
            .limit(8)
        )
        dept_gaps = [{"skill": row[0], "count": row[1]} for row in top_gaps.all()]
    else:
        dept_gaps = []

    return {
        "department_id": dept_id,
        "student_count": len(students),
        "average_readiness": round(avg_readiness, 1),
        "top_skill_gaps": dept_gaps,
        "students": [
            {
                "id": s.id,
                "readiness_score": s.readiness_score,
                "career_goal": s.career_goal,
            }
            for s in students[:20]
        ],
    }


@router.get("/curriculum-alignment")
async def curriculum_alignment(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compare curriculum skills with industry demanded skills."""
    if current_user.role not in ("admin", "faculty"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Industry required skills
    industry_skills = await db.execute(
        select(Skill.id, Skill.name, func.count(JobSkill.id).label("demand"))
        .join(JobSkill, JobSkill.skill_id == Skill.id)
        .group_by(Skill.id, Skill.name)
        .order_by(func.count(JobSkill.id).desc())
        .limit(20)
    )
    industry_skill_data = {row[1]: {"skill_id": row[0], "demand": row[2]} for row in industry_skills.all()}

    # Curriculum skills
    curriculum_skills = await db.execute(
        select(Skill.name, func.avg(CourseSkill.coverage_level).label("avg_coverage"))
        .join(CourseSkill, CourseSkill.skill_id == Skill.id)
        .group_by(Skill.name)
    )
    curriculum_data = {row[0]: row[1] for row in curriculum_skills.all()}

    alignment = []
    for skill_name, info in industry_skill_data.items():
        curriculum_coverage = curriculum_data.get(skill_name)
        if curriculum_coverage is None:
            coverage_pct = 0
            status = "Not Covered"
        elif curriculum_coverage >= 4:
            coverage_pct = 100
            status = "Fully Covered"
        elif curriculum_coverage >= 3:
            coverage_pct = 75
            status = "Mostly Covered"
        elif curriculum_coverage >= 2:
            coverage_pct = 50
            status = "Partially Covered"
        else:
            coverage_pct = 25
            status = "Minimally Covered"

        alignment.append({
            "skill_name": skill_name,
            "industry_demand": info["demand"],
            "curriculum_coverage_level": float(curriculum_coverage or 0),
            "coverage_percentage": coverage_pct,
            "status": status,
        })

    alignment.sort(key=lambda x: -x["industry_demand"])
    return {"alignment": alignment, "total_skills": len(alignment)}
