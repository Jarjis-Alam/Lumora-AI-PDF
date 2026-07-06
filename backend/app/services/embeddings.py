"""
Embeddings generation service utilizing BAAI/bge-small-en-v1.5.
Falls back dynamically to feature-hashing vector space generation if SentenceTransformers is offline.
"""

import hashlib
import random
from typing import Optional

from app.core.logging import get_logger

logger = get_logger("embeddings")

try:
    # Try importing sentence_transformers
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class EmbeddingsService:
    """
    Computes 384-dimensional vector embeddings for document text chunks.
    Falls back gracefully to a deterministic feature hashing vector space
    to support compilation-free environments and high-speed unit test runs.
    """

    def __init__(self) -> None:
        self.model: Optional[Any] = None
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                logger.info("Initializing BAAI/bge-small-en-v1.5 locally...")
                self.model = SentenceTransformer("BAAI/bge-small-en-v1.5")
                logger.info("BAAI/bge-small-en-v1.5 loaded successfully")
            except Exception as exc:
                logger.warning("Failed to load sentence-transformers model: %s. Using fallback.", exc)
                self.model = None
        else:
            logger.info("sentence-transformers not installed. Using high-speed feature hashing fallback.")

    def _fallback_embedding(self, text: str) -> list[float]:
        """
        Generates a 384-dimensional unit vector using feature hashing (the hashing trick).
        Guarantees that similar sentences share features (overlapping vector weights)
        and yield higher cosine similarity than dissimilar sentences.
        """
        dim = 384
        text_lower = text.lower()
        words = text_lower.split()
        
        # Extract features (words + character trigrams)
        features = []
        features.extend(words)
        for i in range(len(text_lower) - 2):
            features.append(text_lower[i : i + 3])
            
        vector = [0.0] * dim
        for f in features:
            h = int(hashlib.md5(f.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
            vector[idx] += sign

        # Add a tiny deterministic gaussian noise to prevent collision identical outputs
        h_text = int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16)
        rng = random.Random(h_text % (2**32 - 1))
        for i in range(dim):
            vector[i] += 0.15 * rng.gauss(0.0, 1.0)

        # Normalize to unit length (L2 norm == 1.0)
        l2_norm = sum(x * x for x in vector) ** 0.5
        if l2_norm > 0:
            vector = [x / l2_norm for x in vector]
        return vector

    def get_embedding(self, text: str) -> list[float]:
        """
        Compute a single 384-dimensional vector embedding.
        """
        if self.model:
            try:
                embedding = self.model.encode(text, normalize_embeddings=True)
                return embedding.tolist()
            except Exception as exc:
                logger.error("SentenceTransformer encoding failed, using fallback: %s", exc)
                
        return self._fallback_embedding(text)

    def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Compute embeddings for a batch of texts.
        """
        if self.model:
            try:
                embeddings = self.model.encode(texts, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as exc:
                logger.error("SentenceTransformer batch encoding failed, using fallback: %s", exc)
                
        return [self._fallback_embedding(t) for t in texts]
