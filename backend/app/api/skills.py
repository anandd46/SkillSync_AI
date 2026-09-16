"""Skills API routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.skill import Skill, SkillAlias, SkillCategory
from app.ai.skill_normalizer import get_normalizer
from app.ai.skill_extractor import get_extractor

router = APIRouter()


@router.get("/")
async def list_skills(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None),
    skill_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    query = select(Skill).where(Skill.is_active == True)

    if q:
        query = query.where(Skill.name.ilike(f"%{q}%"))
    if skill_type:
        query = query.where(Skill.skill_type == skill_type)

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    skills = result.scalars().all()

    return [
        {
            "id": s.id,
            "name": s.name,
            "category_id": s.category_id,
            "description": s.description,
            "skill_type": s.skill_type,
            "difficulty": s.difficulty,
        }
        for s in skills
    ]


@router.get("/{skill_id}")
async def get_skill(skill_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    # Get aliases
    alias_result = await db.execute(select(SkillAlias).where(SkillAlias.skill_id == skill.id))
    aliases = [a.alias for a in alias_result.scalars().all()]

    return {
        "id": skill.id,
        "name": skill.name,
        "description": skill.description,
        "skill_type": skill.skill_type,
        "difficulty": skill.difficulty,
        "aliases": aliases,
        "esco_uri": skill.esco_uri,
    }


@router.post("/normalize")
async def normalize_skill(body: dict, current_user: User = Depends(get_current_user)):
    """Normalize a raw skill name to canonical form."""
    raw = body.get("skill_name", "")
    normalizer = get_normalizer()
    canonical, confidence = normalizer.normalize(raw)
    return {
        "raw": raw,
        "canonical": canonical,
        "confidence": confidence,
        "matched": canonical is not None,
    }


@router.post("/extract")
async def extract_skills_from_text(
    body: dict,
    current_user: User = Depends(get_current_user),
):
    """Extract skills from free text."""
    text = body.get("text", "")
    source = body.get("source", "unknown")
    extractor = get_extractor()
    extracted = extractor.extract(text, source)
    return {"extracted_skills": extracted, "count": len(extracted)}
