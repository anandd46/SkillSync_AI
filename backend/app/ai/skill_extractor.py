"""
NLP Skill Extractor: Extracts skills from free text (resumes, JDs, curriculum).
Uses taxonomy keyword matching + NLP patterns.
"""
import re
import logging
from typing import List, Dict, Optional
from app.ai.taxonomy import SKILL_TAXONOMY
from app.ai.skill_normalizer import get_normalizer

logger = logging.getLogger(__name__)


class SkillExtractor:
    """
    Extracts skills from unstructured text.
    Pipeline:
    1. Text cleaning + sentence segmentation
    2. Keyword/alias matching against taxonomy
    3. Pattern-based extraction (skill indicators)
    4. Deduplication + confidence scoring
    """

    SKILL_INDICATORS = [
        r"experience (?:with|in|using) ([^,\.;]+)",
        r"proficient (?:in|with) ([^,\.;]+)",
        r"knowledge of ([^,\.;]+)",
        r"familiar (?:with|in) ([^,\.;]+)",
        r"working knowledge of ([^,\.;]+)",
        r"expertise in ([^,\.;]+)",
        r"skilled in ([^,\.;]+)",
        r"(?:developed|built|implemented|deployed|used|utilized) (?:using|with|in)? ?([^,\.;]+)",
        r"technologies?[:\-]\s*([^\.;]+)",
        r"skills?[:\-]\s*([^\.;]+)",
        r"tools?[:\-]\s*([^\.;]+)",
        r"languages?[:\-]\s*([^\.;]+)",
        r"frameworks?[:\-]\s*([^\.;]+)",
    ]

    def __init__(self):
        self.normalizer = get_normalizer()
        self._build_keyword_set()

    def _build_keyword_set(self):
        """Build a set of all known skill terms for fast lookup."""
        self.known_terms = set()
        for skill in SKILL_TAXONOMY:
            self.known_terms.add(skill["name"].lower())
            for alias in skill.get("aliases", []):
                self.known_terms.add(alias.lower())

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for extraction."""
        # Remove excessive whitespace
        text = re.sub(r'\r\n|\r', '\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def _tokenize_candidates(self, text: str) -> List[str]:
        """Extract candidate skill terms from text."""
        candidates = []
        text_lower = text.lower()

        # Direct taxonomy term matching (1-4 word ngrams)
        words = re.findall(r'\b\w[\w\+\#\.]*\b', text_lower)
        for n in range(1, 5):  # 1 to 4 grams
            for i in range(len(words) - n + 1):
                ngram = " ".join(words[i:i+n])
                if ngram in self.known_terms:
                    candidates.append(ngram)

        # Pattern-based extraction
        for pattern in self.SKILL_INDICATORS:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters
                parts = re.split(r'[,;/&|]+', match)
                for part in parts:
                    part = part.strip()
                    if 2 < len(part) < 60:
                        candidates.append(part)

        return candidates

    def extract(self, text: str, source: str = "unknown") -> List[Dict]:
        """
        Extract and normalize skills from text.
        Returns list of {skill_name, confidence, evidence_text, source}
        """
        if not text or not text.strip():
            return []

        cleaned = self._clean_text(text)
        candidates = self._tokenize_candidates(cleaned)

        # Deduplicate candidates
        seen_canonicals = {}
        results = []

        for candidate in candidates:
            canonical, confidence = self.normalizer.normalize(candidate)
            if canonical and confidence >= 0.65:
                if canonical not in seen_canonicals or seen_canonicals[canonical] < confidence:
                    seen_canonicals[canonical] = confidence

        for canonical, confidence in seen_canonicals.items():
            # Find evidence text (surrounding context)
            evidence = self._find_evidence(cleaned, canonical)
            results.append({
                "skill_name": canonical,
                "confidence": round(confidence, 3),
                "source": source,
                "evidence_text": evidence,
            })

        # Sort by confidence descending
        results.sort(key=lambda x: x["confidence"], reverse=True)
        logger.info("Extracted %d skills from %s text", len(results), source)
        return results

    def _find_evidence(self, text: str, skill_name: str) -> Optional[str]:
        """Find sentence context around a skill mention."""
        text_lower = text.lower()
        skill_lower = skill_name.lower()
        idx = text_lower.find(skill_lower)
        if idx == -1:
            return None
        start = max(0, idx - 100)
        end = min(len(text), idx + len(skill_name) + 100)
        return text[start:end].strip()

    def extract_from_jd(self, jd_text: str) -> List[Dict]:
        return self.extract(jd_text, source="job_description")

    def extract_from_resume(self, resume_text: str) -> List[Dict]:
        return self.extract(resume_text, source="resume")

    def extract_from_curriculum(self, curriculum_text: str) -> List[Dict]:
        return self.extract(curriculum_text, source="curriculum")


# Singleton instance
_extractor_instance: Optional[SkillExtractor] = None


def get_extractor() -> SkillExtractor:
    global _extractor_instance
    if _extractor_instance is None:
        _extractor_instance = SkillExtractor()
        logger.info("SkillExtractor initialized")
    return _extractor_instance
