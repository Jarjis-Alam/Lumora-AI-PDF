"""
Unit tests for the EmbeddingsService, verifying vector dimensions and cosine similarity checks.
"""

import pytest

from app.services.embeddings import EmbeddingsService


def compute_cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculates cosine similarity of two unit-normalized vectors."""
    # Since EmbeddingsService normalizes both outputs to unit length,
    # cosine similarity is simply the dot product!
    return sum(x * y for x, y in zip(v1, v2))


def test_embedding_dimensions():
    """Verify that returned vectors are exactly 384 floats."""
    service = EmbeddingsService()
    
    # 1. Single text
    vector = service.get_embedding("Attention is all you need.")
    assert len(vector) == 384
    assert all(isinstance(x, float) for x in vector)
    
    # Verify vector has L2 norm equal to 1.0 (normalized)
    l2_norm = sum(x*x for x in vector) ** 0.5
    assert pytest.approx(l2_norm) == 1.0

    # 2. Batch texts
    batch_vectors = service.get_embeddings(["Sentence A", "Sentence B"])
    assert len(batch_vectors) == 2
    assert len(batch_vectors[0]) == 384
    assert len(batch_vectors[1]) == 384


def test_semantic_similarity_relative_ordering():
    """Verify that similar sentences show higher similarity than dissimilar ones."""
    service = EmbeddingsService()
    
    v_base = service.get_embedding("I love neural networks and machine learning.")
    v_similar = service.get_embedding("I enjoy deep learning and artificial intelligence.")
    v_dissimilar = service.get_embedding("The weather in London is quite rainy today.")

    sim_similar = compute_cosine_similarity(v_base, v_similar)
    sim_dissimilar = compute_cosine_similarity(v_base, v_dissimilar)
    
    # Assert similar sentences have higher cosine similarity score
    assert sim_similar > sim_dissimilar
    
    # The dot product of a vector with itself must be exactly 1.0
    sim_self = compute_cosine_similarity(v_base, v_base)
    assert pytest.approx(sim_self) == 1.0
