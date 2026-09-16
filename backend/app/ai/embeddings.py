"""
Embeddings Module: Manages skill embeddings with caching.
Supports sentence-transformers (local) and TF-IDF fallback.
"""
import logging
import numpy as np
from typing import List, Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

_embedding_cache: Dict[str, List[float]] = {}
_model = None


def _get_model():
    """Lazy-load the sentence-transformer model."""
    global _model
    if _model is not None:
        return _model

    if settings.AI_PROVIDER == "mock":
        logger.info("Using mock embeddings (AI_PROVIDER=mock)")
        return None

    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Loaded sentence-transformers model: all-MiniLM-L6-v2")
        return _model
    except Exception as e:
        logger.warning("Failed to load sentence-transformers: %s. Using mock.", e)
        return None


def _mock_embedding(text: str) -> List[float]:
    """
    Deterministic mock embedding for demo mode.
    Creates a consistent vector based on text hash.
    """
    import hashlib
    h = hashlib.md5(text.lower().encode()).hexdigest()
    # Generate 384-dim vector from hash (same as all-MiniLM-L6-v2)
    rng = np.random.RandomState(int(h[:8], 16))
    vec = rng.randn(384).astype(np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def get_embedding(text: str) -> List[float]:
    """Get embedding for a text string, with caching."""
    cache_key = text.lower().strip()
    if cache_key in _embedding_cache:
        return _embedding_cache[cache_key]

    model = _get_model()
    if model is None:
        embedding = _mock_embedding(text)
    else:
        embedding = model.encode([text])[0].tolist()

    _embedding_cache[cache_key] = embedding
    return embedding


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Get embeddings for multiple texts efficiently."""
    results = []
    uncached = []
    uncached_indices = []

    for i, text in enumerate(texts):
        cache_key = text.lower().strip()
        if cache_key in _embedding_cache:
            results.append(_embedding_cache[cache_key])
        else:
            results.append(None)
            uncached.append(text)
            uncached_indices.append(i)

    if uncached:
        model = _get_model()
        if model is None:
            embeddings = [_mock_embedding(t) for t in uncached]
        else:
            embeddings = model.encode(uncached).tolist()

        for idx, text, emb in zip(uncached_indices, uncached, embeddings):
            _embedding_cache[text.lower().strip()] = emb
            results[idx] = emb

    return results


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a = np.array(vec1)
    b = np.array(vec2)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))
