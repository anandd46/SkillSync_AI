"""
Skill Normalizer: Maps raw skill text → canonical skill name.
Uses alias dict → fuzzy matching → embedding similarity.
"""
import re
import logging
from typing import Optional, Dict, List, Tuple
from rapidfuzz import fuzz, process
from app.ai.taxonomy import SKILL_TAXONOMY

logger = logging.getLogger(__name__)


class SkillNormalizer:
    """
    Normalizes raw skill strings to canonical skill names.
    Pipeline:
    1. Lowercase + clean
    2. Exact alias match
    3. Fuzzy match (rapidfuzz)
    4. Partial token match
    """

    def __init__(self):
        self.alias_map: Dict[str, str] = {}  # alias → canonical name
        self.skill_names: List[str] = []
        self._build_alias_map()

    def _build_alias_map(self):
        """Build alias → canonical name lookup from taxonomy."""
        for skill in SKILL_TAXONOMY:
            name = skill["name"]
            self.skill_names.append(name)
            # Map the canonical name itself
            self.alias_map[name.lower().strip()] = name
            # Map all aliases
            for alias in skill.get("aliases", []):
                self.alias_map[alias.lower().strip()] = name

    def _clean(self, text: str) -> str:
        """Clean and normalize raw text."""
        text = text.lower().strip()
        text = re.sub(r"[^\w\s\+\#\.]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def normalize(self, raw_skill: str, threshold: int = 75) -> Tuple[Optional[str], float]:
        """
        Normalize a raw skill string to canonical name.
        Returns (canonical_name, confidence) or (None, 0.0) if no match.
        """
        if not raw_skill or not raw_skill.strip():
            return None, 0.0

        cleaned = self._clean(raw_skill)

        # Step 1: Exact alias match
        if cleaned in self.alias_map:
            return self.alias_map[cleaned], 1.0

        # Step 2: Check if cleaned starts with or contains a known alias
        for alias, canonical in self.alias_map.items():
            if alias in cleaned or cleaned in alias:
                if len(alias) >= 3:  # avoid very short matches
                    return canonical, 0.9

        # Step 3: Fuzzy match against aliases
        all_aliases = list(self.alias_map.keys())
        result = process.extractOne(
            cleaned,
            all_aliases,
            scorer=fuzz.WRatio,
            score_cutoff=threshold,
        )
        if result:
            matched_alias, score, _ = result
            canonical = self.alias_map[matched_alias]
            confidence = score / 100.0
            return canonical, confidence

        # Step 4: Token set ratio for multi-word skills
        result = process.extractOne(
            cleaned,
            all_aliases,
            scorer=fuzz.token_set_ratio,
            score_cutoff=threshold,
        )
        if result:
            matched_alias, score, _ = result
            canonical = self.alias_map[matched_alias]
            confidence = score / 100.0
            return canonical, confidence

        return None, 0.0

    def normalize_batch(self, raw_skills: List[str]) -> List[Dict]:
        """Normalize a list of raw skill strings."""
        results = []
        for raw in raw_skills:
            canonical, confidence = self.normalize(raw)
            results.append({
                "raw": raw,
                "canonical": canonical,
                "confidence": confidence,
                "matched": canonical is not None,
            })
        return results

    def get_all_canonical_names(self) -> List[str]:
        return self.skill_names.copy()


# Singleton instance
_normalizer_instance: Optional[SkillNormalizer] = None


def get_normalizer() -> SkillNormalizer:
    global _normalizer_instance
    if _normalizer_instance is None:
        _normalizer_instance = SkillNormalizer()
        logger.info("SkillNormalizer initialized with %d aliases", len(_normalizer_instance.alias_map))
    return _normalizer_instance
