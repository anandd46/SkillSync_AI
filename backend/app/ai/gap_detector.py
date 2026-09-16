"""
Skill Gap Detector: Computes gaps between required and student skills.
"""
import logging
from typing import List, Dict, Optional
from app.ai.taxonomy import PROFICIENCY_LEVELS

logger = logging.getLogger(__name__)


class GapStatus:
    MATCHED = "matched"
    EXCEEDS = "exceeds"
    PARTIAL_GAP = "partial_gap"
    MAJOR_GAP = "major_gap"
    MISSING = "missing"


class GapDetector:
    """
    Detects and classifies skill gaps between industry requirements and student proficiency.
    """

    LEVEL_NAMES = {
        0: "No Evidence",
        1: "Beginner",
        2: "Basic",
        3: "Intermediate",
        4: "Advanced",
        5: "Expert",
    }

    def detect_gap(
        self,
        skill_name: str,
        required_level: int,
        current_level: int,
        current_score: float = 0.0,
    ) -> Dict:
        """
        Detect gap for a single skill.
        Returns gap info with status and explanation.
        """
        gap = required_level - current_level
        required_name = self.LEVEL_NAMES.get(required_level, "Unknown")
        current_name = self.LEVEL_NAMES.get(current_level, "Unknown")

        if current_level == 0:
            status = GapStatus.MISSING
            explanation = (
                f"'{skill_name}' is marked as MISSING because the selected job role requires "
                f"{required_name} proficiency, but no verified evidence of this skill has been found "
                f"in your profile (assessments, projects, certificates, or internships)."
            )
            priority = 1 if required_level >= 3 else 2
        elif gap <= 0:
            if gap == 0:
                status = GapStatus.MATCHED
                explanation = (
                    f"'{skill_name}' is FULLY MATCHED. Your current proficiency ({current_name}) "
                    f"meets the required level ({required_name}) for the target role."
                )
            else:
                status = GapStatus.EXCEEDS
                explanation = (
                    f"'{skill_name}' EXCEEDS the requirement. Your proficiency ({current_name}) "
                    f"surpasses the required level ({required_name}). This is a strength."
                )
            priority = 5
        elif gap == 1:
            status = GapStatus.PARTIAL_GAP
            explanation = (
                f"'{skill_name}' has a PARTIAL GAP. The target role requires {required_name} "
                f"proficiency, while your verified evidence indicates {current_name}. "
                f"A focused effort can close this gap quickly."
            )
            priority = 2
        else:
            status = GapStatus.MAJOR_GAP
            explanation = (
                f"'{skill_name}' has a MAJOR GAP of {gap} levels. The target role requires "
                f"{required_name} (level {required_level}), but your current evidence shows "
                f"{current_name} (level {current_level}). This requires significant learning investment."
            )
            priority = 1

        return {
            "skill_name": skill_name,
            "required_level": required_level,
            "required_level_name": required_name,
            "current_level": current_level,
            "current_level_name": current_name,
            "gap_level": max(0, gap),
            "status": status,
            "explanation": explanation,
            "priority": priority,
        }

    def detect_gaps_batch(
        self,
        required_skills: List[Dict],
        student_skills: Dict[str, Dict],
    ) -> List[Dict]:
        """
        Detect gaps for multiple required skills.
        required_skills: [{skill_name, required_level}]
        student_skills: {skill_name: {level, score}}
        Returns sorted gap list.
        """
        gaps = []
        for req in required_skills:
            skill_name = req["skill_name"]
            required_level = req.get("required_level", 3)

            student_info = student_skills.get(skill_name, {})
            current_level = student_info.get("level", 0)
            current_score = student_info.get("score", 0.0)

            gap_info = self.detect_gap(skill_name, required_level, current_level, current_score)
            gaps.append(gap_info)

        # Sort by priority (ascending = most critical first)
        gaps.sort(key=lambda x: (x["priority"], -x["gap_level"]))
        return gaps

    def compute_overall_match_score(self, gaps: List[Dict]) -> float:
        """
        Compute an overall skill match percentage from gap results.
        """
        if not gaps:
            return 0.0

        total_weight = 0.0
        weighted_score = 0.0

        for gap in gaps:
            req_level = gap["required_level"]
            curr_level = gap["current_level"]
            weight = req_level / 5.0  # higher requirements have more weight

            if gap["status"] == GapStatus.MISSING:
                match = 0.0
            elif gap["status"] == GapStatus.EXCEEDS:
                match = 1.0
            elif gap["status"] == GapStatus.MATCHED:
                match = 1.0
            else:
                match = curr_level / req_level if req_level > 0 else 0.0

            weighted_score += match * weight
            total_weight += weight

        return round((weighted_score / total_weight) * 100, 1) if total_weight > 0 else 0.0


# Singleton
_detector_instance: Optional[GapDetector] = None


def get_detector() -> GapDetector:
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = GapDetector()
    return _detector_instance
