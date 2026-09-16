"""Skill service — compute proficiency from evidence."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict

from app.ai.taxonomy import EVIDENCE_WEIGHTS

logger = logging.getLogger(__name__)

PROFICIENCY_LEVELS = {0: "No Evidence", 1: "Beginner", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert"}


async def compute_student_skill_levels(db: AsyncSession, student_id: int) -> Dict[str, Dict]:
    """Compute skill levels for a student based on all evidence."""
    from app.models.skill import StudentSkillEvidence, StudentSkill, Skill

    result = await db.execute(
        select(StudentSkillEvidence, Skill)
        .join(Skill, StudentSkillEvidence.skill_id == Skill.id)
        .where(StudentSkillEvidence.student_id == student_id)
    )
    evidence_records = result.all()

    skill_data: Dict[str, Dict] = {}

    for evidence, skill in evidence_records:
        name = skill.name
        if name not in skill_data:
            skill_data[name] = {"weighted_score": 0.0, "total_weight": 0.0, "evidence_count": 0}

        weight = EVIDENCE_WEIGHTS.get(evidence.source_type, 0.05)
        confidence = evidence.confidence or 0.5
        level = evidence.proficiency_indicated or 1

        # Convert level to 0-100 score
        level_score = (level / 5.0) * 100 * confidence
        skill_data[name]["weighted_score"] += level_score * weight
        skill_data[name]["total_weight"] += weight
        skill_data[name]["evidence_count"] += 1

    result_map = {}
    for name, data in skill_data.items():
        if data["total_weight"] > 0:
            score = data["weighted_score"] / data["total_weight"]
        else:
            score = 0.0
        level = score_to_level(score)
        result_map[name] = {"level": level, "score": score, "evidence_count": data["evidence_count"]}

    return result_map


def score_to_level(score: float) -> int:
    """Convert 0-100 score to 0-5 proficiency level."""
    if score <= 0:
        return 0
    elif score <= 20:
        return 1
    elif score <= 40:
        return 2
    elif score <= 60:
        return 3
    elif score <= 80:
        return 4
    else:
        return 5


async def compute_evidence_score(db: AsyncSession, student_id: int) -> float:
    """Compute overall evidence quality score 0-100."""
    from app.models.skill import StudentSkillEvidence

    result = await db.execute(
        select(func.count(StudentSkillEvidence.id), func.avg(StudentSkillEvidence.confidence))
        .where(StudentSkillEvidence.student_id == student_id)
    )
    row = result.first()
    count = row[0] or 0
    avg_confidence = float(row[1] or 0.0)

    if count == 0:
        return 0.0

    # Count is bounded at 20 pieces of evidence for max score
    count_score = min(count / 20, 1.0) * 100
    confidence_score = avg_confidence * 100
    return round((count_score * 0.4 + confidence_score * 0.6), 1)
