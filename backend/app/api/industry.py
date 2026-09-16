"""Industry API routes — companies, job roles, skills, feedback."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.industry import Industry, JobRole, JobDescription, JobSkill
from app.models.skill import Skill
from app.models.system import IndustryFeedback
from app.ai.skill_extractor import get_extractor
from app.ai.skill_normalizer import get_normalizer
from app.services.audit_service import log_action

router = APIRouter()


class JobRoleCreate(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    experience_required: Optional[str] = None


class JobSkillAdd(BaseModel):
    skill_name: str
    required_level: int = 3  # 1-5
    is_mandatory: bool = True


class JDUpload(BaseModel):
    raw_text: str


class FeedbackCreate(BaseModel):
    feedback_text: str
    feedback_type: str = "general"
    rating: Optional[float] = None


@router.get("/me")
async def get_my_industry_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("industry", "admin"):
        raise HTTPException(status_code=403, detail="Industry access required")

    result = await db.execute(select(Industry).where(Industry.user_id == current_user.id))
    industry = result.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    return {
        "id": industry.id,
        "name": industry.name,
        "sector": industry.sector,
        "description": industry.description,
        "website": industry.website,
        "location": industry.location,
        "size": industry.size,
    }


@router.get("/job-roles")
async def list_job_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(JobRole, Industry)
        .join(Industry, JobRole.industry_id == Industry.id)
        .where(JobRole.is_active == True)
    )
    rows = result.all()
    return [
        {
            "id": jr.id,
            "title": jr.title,
            "category": jr.category,
            "description": jr.description,
            "company": ind.name,
            "experience_required": jr.experience_required,
        }
        for jr, ind in rows
    ]


@router.post("/job-roles")
async def create_job_role(
    data: JobRoleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("industry", "admin"):
        raise HTTPException(status_code=403, detail="Industry access required")

    ind_result = await db.execute(select(Industry).where(Industry.user_id == current_user.id))
    industry = ind_result.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    job_role = JobRole(
        industry_id=industry.id,
        title=data.title,
        category=data.category,
        description=data.description,
        experience_required=data.experience_required,
    )
    db.add(job_role)
    await db.commit()
    await db.refresh(job_role)
    await log_action(db, current_user.id, "JOB_ROLE_CREATED", "job_role", job_role.id)
    return {"id": job_role.id, "title": job_role.title, "message": "Job role created"}


@router.post("/job-roles/{role_id}/skills")
async def add_job_skill(
    role_id: int,
    data: JobSkillAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("industry", "admin"):
        raise HTTPException(status_code=403, detail="Industry access required")

    # Normalize skill name
    normalizer = get_normalizer()
    canonical, confidence = normalizer.normalize(data.skill_name)
    if not canonical:
        canonical = data.skill_name  # Store as-is if not found

    # Find or create skill in DB
    skill_result = await db.execute(select(Skill).where(Skill.name == canonical))
    skill = skill_result.scalar_one_or_none()
    if not skill:
        skill = Skill(name=canonical)
        db.add(skill)
        await db.flush()

    # Add job skill
    js = JobSkill(
        job_role_id=role_id,
        skill_id=skill.id,
        required_level=data.required_level,
        is_mandatory=data.is_mandatory,
    )
    db.add(js)
    await db.commit()
    return {"message": f"Skill '{canonical}' added to job role", "skill_name": canonical, "confidence": confidence}


@router.post("/job-roles/{role_id}/extract-skills")
async def extract_skills_from_jd(
    role_id: int,
    data: JDUpload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload job description text → AI extracts and normalizes skills."""
    if current_user.role not in ("industry", "admin"):
        raise HTTPException(status_code=403, detail="Industry access required")

    # Save JD
    jd = JobDescription(job_role_id=role_id, raw_text=data.raw_text, processing_status="processing")
    db.add(jd)
    await db.flush()

    # Extract skills with AI
    extractor = get_extractor()
    extracted = extractor.extract_from_jd(data.raw_text)

    # Add skills to job role
    added_skills = []
    for skill_info in extracted:
        skill_name = skill_info["skill_name"]
        confidence = skill_info["confidence"]

        skill_result = await db.execute(select(Skill).where(Skill.name == skill_name))
        skill = skill_result.scalar_one_or_none()
        if not skill:
            skill = Skill(name=skill_name)
            db.add(skill)
            await db.flush()

        # Check if already added
        existing = await db.execute(
            select(JobSkill).where(
                JobSkill.job_role_id == role_id,
                JobSkill.skill_id == skill.id,
            )
        )
        if not existing.scalar_one_or_none():
            # Determine required level from context
            required_level = 3  # default intermediate
            js = JobSkill(job_role_id=role_id, skill_id=skill.id, required_level=required_level)
            db.add(js)
            added_skills.append({"skill": skill_name, "confidence": confidence})

    jd.extracted_skills = extracted
    jd.processing_status = "done"

    await db.commit()
    await log_action(db, current_user.id, "JD_SKILLS_EXTRACTED", "job_description", jd.id, new_value={"skills_count": len(added_skills)})

    return {
        "message": f"Extracted {len(added_skills)} skills from job description",
        "extracted_skills": added_skills,
        "job_description_id": jd.id,
    }


@router.get("/job-roles/{role_id}/skills")
async def get_job_role_skills(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(JobSkill, Skill)
        .join(Skill, JobSkill.skill_id == Skill.id)
        .where(JobSkill.job_role_id == role_id)
    )
    rows = result.all()

    level_names = {0: "None", 1: "Beginner", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert"}

    return [
        {
            "id": js.id,
            "skill_id": skill.id,
            "skill_name": skill.name,
            "required_level": js.required_level,
            "required_level_name": level_names.get(js.required_level, "Unknown"),
            "is_mandatory": js.is_mandatory,
        }
        for js, skill in rows
    ]


@router.post("/feedback")
async def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ("industry", "admin"):
        raise HTTPException(status_code=403, detail="Industry access required")

    ind_result = await db.execute(select(Industry).where(Industry.user_id == current_user.id))
    industry = ind_result.scalar_one_or_none()

    feedback = IndustryFeedback(
        industry_id=industry.id if industry else 1,
        feedback_text=data.feedback_text,
        feedback_type=data.feedback_type,
        rating=data.rating,
    )
    db.add(feedback)
    await db.commit()
    return {"message": "Feedback submitted successfully", "id": feedback.id}
