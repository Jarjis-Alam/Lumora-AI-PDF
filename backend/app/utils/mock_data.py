"""
Python port of frontend mockData.ts to generate structured mock contents.
"""

import time
import random

ACCENTS = ["#C0392B", "#4A6FA5", "#6B8E6F", "#B8893A", "#7A5C8F", "#2C7A7B"]


def pick_accent() -> str:
    return random.choice(ACCENTS)


def make_summary(name: str, pages: int) -> dict:
    return {
        "overall": f"{name} presents a comprehensive treatment of its subject matter across {pages} pages. The document establishes core theoretical foundations before progressing to applied techniques, balancing rigor with accessibility. Central themes include the relationship between structure and behavior, the role of abstraction in managing complexity, and the practical trade-offs that govern real-world decisions.",
        "readingTime": max(5, round(pages * 2.5)),
        "chapters": [
            {
                "heading": "Chapter 1 — Foundations",
                "body": "Introduces the fundamental vocabulary and motivating problems. Establishes notation and reviews prior work, situating the contribution within a broader intellectual tradition.",
            },
            {
                "heading": "Chapter 2 — Core Method",
                "body": "Develops the central technique step by step. Each building block is motivated before it is introduced, and the chapter culminates in a worked example.",
            },
            {
                "heading": "Chapter 3 — Applications & Results",
                "body": "Applies the method to several representative settings and reports empirical results. Discusses where the approach excels and where it struggles.",
            },
            {
                "heading": "Chapter 4 — Discussion",
                "body": "Reflects on limitations, open questions, and directions for future work. Connects the contribution back to the broader literature.",
            },
        ],
        "keyTakeaways": [
            "The central insight is that structure and behavior are co-determined.",
            "Abstraction is the primary tool for managing complexity, but every abstraction leaks.",
            "Empirical results are most meaningful when compared against a strong baseline.",
            "The method trades a small amount of generality for substantial gains in clarity.",
            "Open questions remain at the boundary of theory and practice.",
        ],
        "concepts": [
            {"term": "Attention Mechanism", "definition": "A technique that lets a model focus on the most relevant parts of its input."},
            {"term": "Embedding", "definition": "A learned mapping from discrete tokens into a continuous vector space."},
            {"term": "Transformer", "definition": "A neural architecture built entirely on attention mechanisms."},
            {"term": "Self-Attention", "definition": "Attention applied within a single sequence to capture dependencies."},
            {"term": "Positional Encoding", "definition": "Signals injected into inputs to give the model token order info."},
        ],
        "bulletSummary": [
            "Paradigmatic shift away from sequential processing toward parallel computation.",
            "Introduces a novel architecture achieving state-of-the-art results.",
            "Empirical evaluation spans translation, parsing, and language modeling.",
            "Scaling and data quality identified as primary levers for improvement.",
            "Limitations include quadratic cost growth with sequence length.",
        ],
    }


def make_flashcards(seed: int) -> list[dict]:
    base = [
        {"front": "What is the main advantage of attention over recurrence?", "back": "Attention allows parallel computation across the entire sequence, whereas recurrence forces sequential processing."},
        {"front": "Define 'self-attention' in one sentence.", "back": "Self-attention is an attention mechanism relating different positions of a single sequence to compute a representation of that sequence."},
        {"front": "Why are positional encodings necessary in a Transformer?", "back": "Because attention is permutation-invariant, the model has no inherent notion of order; positional encodings inject order information."},
        {"front": "What is multi-head attention?", "back": "Running several attention operations in parallel with different learned projections, then concatenating them."},
        {"front": "Name the two main components of the Transformer encoder block.", "back": "A multi-head self-attention sub-layer and a position-wise feed-forward network, each followed by residual connection and layer normalization."},
        {"front": "What trade-off does the document identify at long sequence lengths?", "back": "Attention cost grows quadratically with sequence length, which limits applicability to very long inputs."},
    ]
    count = 4 + (seed % 3)
    cards = []
    for i, c in enumerate(base[:count]):
        cards.append({
            "id": f"fc-{int(time.time())}-{i}",
            "front": c["front"],
            "back": c["back"],
        })
    return cards


def make_quiz(seed: int) -> list[dict]:
    base = [
        {
            "type": "mcq",
            "question": "Which property of attention makes it suitable for parallel training?",
            "options": ["It is sequential by nature", "It is permutation-invariant and has no recurrence", "It requires labeled data", "It only works on images"],
            "answer": "It is permutation-invariant and has no recurrence",
            "explanation": "Because attention relates all positions simultaneously, computation can be parallelized.",
            "difficulty": "medium",
        },
        {
            "type": "truefalse",
            "question": "Positional encodings are required because attention has no notion of order.",
            "options": ["True", "False"],
            "answer": "True",
            "explanation": "Attention processes all tokens simultaneously, making it permutation-invariant; positional encodings are required to preserve sequence order.",
            "difficulty": "easy",
        },
        {
            "type": "short",
            "question": "In one sentence, what does multi-head attention enable?",
            "answer": "It allows the model to jointly attend to information from different representation subspaces at different positions.",
            "explanation": "By running multiple attention operations in parallel, the model can capture different context dimensions.",
            "difficulty": "hard",
        },
    ]
    count = 2 + (seed % 2)
    questions = []
    for i, q in enumerate(base[:count]):
        questions.append({
            "id": f"q-{int(time.time())}-{i}",
            **q
        })
    return questions


def make_graph() -> dict:
    return {
        "nodes": [
            {"id": "n1", "label": "Transformer", "type": "concept", "page": 1, "paragraph": 1},
            {"id": "n2", "label": "Attention", "type": "concept", "page": 2, "paragraph": 3},
            {"id": "n3", "label": "Embedding", "type": "concept", "page": 2, "paragraph": 4},
            {"id": "n4", "label": "Neural Network", "type": "topic", "page": 1, "paragraph": 2},
            {"id": "n5", "label": "Encoder", "type": "entity", "page": 3, "paragraph": 1},
        ],
        "edges": [
            {"id": "e1", "source": "n1", "target": "n2", "label": "uses"},
            {"id": "e2", "source": "n1", "target": "n3", "label": "utilizes"},
            {"id": "e3", "source": "n4", "target": "n1", "label": "defines"},
            {"id": "e4", "source": "n1", "target": "n5", "label": "contains"},
        ],
    }
