"""
Semantic Matcher: Compares skills using embedding cosine similarity.
Industry skills ↔ Student skills ↔ Curriculum skills
"""
import logging
from typing import List, Dict, Optional, Tuple
from app.ai.embeddings import get_embedding, get_embeddings_batch, cosine_similarity
from app.ai.taxonomy import SEMANTIC_MATCH_THRESHOLD

logger = logging.getLogger(__name__)


class SemanticMatcher:
    """
    Semantically matches skill pairs using sentence embeddings.
    Supports: industry↔student, curriculum↔industry, student↔job
    """

    def __init__(self, threshold: float = SEMANTIC_MATCH_THRESHOLD):
        self.threshold = threshold

    def match_skill_pair(
        self,
        skill_a: str,
        skill_b: str,
        desc_a: str = "",
        desc_b: str = "",
    ) -> Dict:
        """
        Match two skills semantically.
        Returns similarity score and explanation.
        """
        # Create rich text for embedding (name + description)
        text_a = f"{skill_a} {desc_a}".strip()
        text_b = f"{skill_b} {desc_b}".strip()

        emb_a = get_embedding(text_a)
        emb_b = get_embedding(text_b)
        similarity = cosine_similarity(emb_a, emb_b)

        matched = similarity >= self.threshold

        # Generate explanation
        if similarity >= 0.9:
            reason = f"'{skill_a}' and '{skill_b}' are highly similar or synonymous skills."
        elif similarity >= 0.75:
            reason = f"'{skill_a}' and '{skill_b}' are closely related skills with significant overlap."
        elif similarity >= self.threshold:
            reason = f"'{skill_a}' and '{skill_b}' have semantic overlap above the matching threshold ({self.threshold})."
        else:
            reason = f"'{skill_a}' and '{skill_b}' do not have sufficient semantic similarity (score: {similarity:.2f}, threshold: {self.threshold})."

        return {
            "skill_a": skill_a,
            "skill_b": skill_b,
            "similarity_score": round(similarity, 4),
            "matched": matched,
            "reason": reason,
        }

    def find_best_match(
        self,
        target_skill: str,
        candidate_skills: List[str],
        target_desc: str = "",
    ) -> Optional[Dict]:
        """
        Find the best matching skill from a list of candidates.
        """
        if not candidate_skills:
            return None

        target_text = f"{target_skill} {target_desc}".strip()
        target_emb = get_embedding(target_text)

        candidate_texts = [s for s in candidate_skills]
        candidate_embs = get_embeddings_batch(candidate_texts)

        best_score = -1.0
        best_skill = None
        best_idx = -1

        for i, (skill, emb) in enumerate(zip(candidate_skills, candidate_embs)):
            if emb is None:
                continue
            score = cosine_similarity(target_emb, emb)
            if score > best_score:
                best_score = score
                best_skill = skill
                best_idx = i

        if best_skill is None or best_score < self.threshold:
            return None

        return {
            "matched_skill": best_skill,
            "similarity_score": round(best_score, 4),
            "matched": best_score >= self.threshold,
        }

    def match_skills_matrix(
        self,
        skills_a: List[str],
        skills_b: List[str],
    ) -> List[Dict]:
        """
        Compute pairwise matching between two skill lists.
        Returns list of matches above threshold.
        """
        if not skills_a or not skills_b:
            return []

        embs_a = get_embeddings_batch(skills_a)
        embs_b = get_embeddings_batch(skills_b)

        matches = []
        for i, (skill_a, emb_a) in enumerate(zip(skills_a, embs_a)):
            if emb_a is None:
                continue
            best_score = -1.0
            best_skill_b = None
            for j, (skill_b, emb_b) in enumerate(zip(skills_b, embs_b)):
                if emb_b is None:
                    continue
                score = cosine_similarity(emb_a, emb_b)
                if score > best_score:
                    best_score = score
                    best_skill_b = skill_b

            if best_skill_b and best_score >= self.threshold:
                matches.append({
                    "skill_a": skill_a,
                    "skill_b": best_skill_b,
                    "similarity_score": round(best_score, 4),
                    "matched": True,
                })

        return matches


# Singleton
_matcher_instance: Optional[SemanticMatcher] = None


def get_matcher() -> SemanticMatcher:
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = SemanticMatcher()
        logger.info("SemanticMatcher initialized with threshold=%.2f", SEMANTIC_MATCH_THRESHOLD)
    return _matcher_instance
