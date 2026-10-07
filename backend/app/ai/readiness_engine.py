"""
Readiness Engine: Calculates job readiness score 0-100 with explanation.
"""
import logging
from typing import List, Dict, Optional
from app.ai.gap_detector import GapStatus
from app.ai.taxonomy import READINESS_THRESHOLDS, EVIDENCE_WEIGHTS

logger = logging.getLogger(__name__)


class ReadinessEngine:
    """
    Computes a holistic readiness score for a student vs a job role.
    Components:
    - Skill match score (40%)
    - Proficiency score (25%)
    - Evidence quality (20%)
    - Assessment performance (15%)
    """

    WEIGHTS = {
        "skill_match": 0.40,
        "proficiency": 0.25,
        "evidence": 0.20,
        "assessment": 0.15,
    }

    LABELS = {
        "needs_improvement": "Needs Improvement",
        "developing": "Developing",
        "moderately_ready": "Moderately Ready",
        "job_ready": "Job Ready",
        "highly_ready": "Highly Ready",
    }

    def compute_readiness(
        self,
        gaps: List[Dict],
        evidence_score: float = 0.0,
        assessment_score: float = 0.0,
    ) -> Dict:
        """
        Compute readiness score from gaps, evidence, and assessment.
        Returns score breakdown and explanation.
        """
        # 1. Skill match score from gaps
        matched = sum(1 for g in gaps if g["status"] in (GapStatus.MATCHED, GapStatus.EXCEEDS))
        partial = sum(1 for g in gaps if g["status"] == GapStatus.PARTIAL_GAP)
        total = len(gaps) if gaps else 1

        skill_match_score = ((matched + partial * 0.5) / total) * 100 if total > 0 else 0.0

        # 2. Proficiency score (average coverage)
        proficiency_scores = []
        for gap in gaps:
            req = gap["required_level"]
            curr = gap["current_level"]
            if req > 0:
                proficiency_scores.append(min(curr / req, 1.0) * 100)
            else:
                proficiency_scores.append(100.0)
        proficiency_score = sum(proficiency_scores) / len(proficiency_scores) if proficiency_scores else 0.0

        # 3. Evidence score (passed in, 0-100)
        ev_score = min(max(evidence_score, 0.0), 100.0)

        # 4. Assessment score (passed in, 0-100)
        asmnt_score = min(max(assessment_score, 0.0), 100.0)

        # Weighted total
        total_score = (
            skill_match_score * self.WEIGHTS["skill_match"] +
            proficiency_score * self.WEIGHTS["proficiency"] +
            ev_score * self.WEIGHTS["evidence"] +
            asmnt_score * self.WEIGHTS["assessment"]
        )
        total_score = round(min(max(total_score, 0.0), 100.0), 1)

        # Categorize
        category = self._categorize(total_score)

        # Skill-level breakdown
        skill_breakdown = []
        for gap in gaps:
            req = gap["required_level"]
            curr = gap["current_level"]
            skill_score = min(curr / req, 1.0) * 100 if req > 0 else 100.0
            skill_breakdown.append({
                "skill": gap["skill_name"],
                "score": round(skill_score, 1),
                "status": gap["status"],
                "required_level": gap["required_level_name"],
                "current_level": gap["current_level_name"],
            })

        # Sort by score ascending (weakest first)
        skill_breakdown.sort(key=lambda x: x["score"])
        weakest = skill_breakdown[0]["skill"] if skill_breakdown else None

        # Generate explanation
        explanation = self._generate_explanation(
            total_score, category, skill_breakdown, weakest,
            skill_match_score, proficiency_score, ev_score, asmnt_score
        )

        return {
            "score": total_score,
            "category": category,
            "label": self.LABELS.get(category, "Unknown"),
            "breakdown": {
                "skill_match": round(skill_match_score, 1),
                "proficiency": round(proficiency_score, 1),
                "evidence": round(ev_score, 1),
                "assessment": round(asmnt_score, 1),
            },
            "skill_scores": skill_breakdown,
            "weakest_skill": weakest,
            "explanation": explanation,
            "matched_count": matched,
            "partial_count": partial,
            "missing_count": total - matched - partial,
            "total_required": total,
        }

    def _categorize(self, score: float) -> str:
        for category, (low, high) in READINESS_THRESHOLDS.items():
            if low <= score <= high:
                return category
        return "needs_improvement"

    def _generate_explanation(
        self,
        score: float,
        category: str,
        skill_breakdown: List[Dict],
        weakest: Optional[str],
        skill_match: float,
        proficiency: float,
        evidence: float,
        assessment: float,
    ) -> str:
        label = self.LABELS.get(category, "")
        lines = [
            f"Your overall readiness score is {score:.0f}% ({label}).",
            "",
            "Score breakdown:",
            f"• Skill Coverage: {skill_match:.0f}% — how many required skills you have",
            f"• Proficiency: {proficiency:.0f}% — how deeply you know the required skills",
            f"• Evidence Quality: {evidence:.0f}% — strength of your portfolio (projects, certificates, internships)",
            f"• Assessment Performance: {assessment:.0f}% — scores from skill assessments",
        ]

        if weakest:
            lines.append("")
            lines.append(f"Main weakness: {weakest}")
            low_skills = [s["skill"] for s in skill_breakdown[:3] if s["score"] < 60]
            if low_skills:
                lines.append(f"Priority areas: {', '.join(low_skills)}")

        return "\n".join(lines)


# Singleton
_readiness_instance: Optional[ReadinessEngine] = None


def get_readiness_engine() -> ReadinessEngine:
    global _readiness_instance
    if _readiness_instance is None:
        _readiness_instance = ReadinessEngine()
    return _readiness_instance
