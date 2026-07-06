"""
Unit tests for the AIService utilizing unittest.mock to prevent real network calls.
"""

import json
import pytest
from unittest.mock import MagicMock, patch

from app.services.ai import AIService


@pytest.fixture
def mock_groq_client():
    """Provides a fully mocked Groq API client."""
    mock_client = MagicMock()
    
    # Mock return value for client.chat.completions.create
    mock_completion = MagicMock()
    mock_choice = MagicMock()
    mock_message = MagicMock()
    
    # Set up deep values
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_completion
    
    return mock_client, mock_message


def test_ai_service_constructor_no_key():
    """Verify AIService warns and sets client to None if GROQ_API_KEY is empty."""
    with patch("app.services.ai.get_settings") as mock_settings:
        mock_settings.return_value.groq_api_key = ""
        mock_settings.return_value.groq_model = "llama-model"
        
        service = AIService()
        assert service.client is None
        
        with pytest.raises(ValueError, match="Groq API Key is not configured"):
            service.generate_summary("Some text")


def test_generate_summary_success(mock_groq_client):
    """Verify generate_summary builds correct prompts and returns parsed JSON summaries."""
    mock_client, mock_message = mock_groq_client
    
    mock_summary_payload = {
        "overall": "This is a document overview.",
        "readingTime": 5,
        "chapters": [{"heading": "Chapter 1", "body": "Overview description"}],
        "keyTakeaways": ["Point 1", "Point 2"],
        "concepts": [{"term": "T1", "definition": "D1"}],
        "bulletSummary": ["Point A", "Point B"]
    }
    mock_message.content = json.dumps(mock_summary_payload)

    with patch("app.services.ai.get_settings") as mock_settings:
        mock_settings.return_value.groq_api_key = "test_gsk_key"
        mock_settings.return_value.groq_model = "llama-model"
        
        with patch("app.services.ai.Groq") as mock_groq_class:
            mock_groq_class.return_value = mock_client
            
            service = AIService()
            summary = service.generate_summary("Attention is all you need.")
            
            assert summary["overall"] == "This is a document overview."
            assert summary["readingTime"] == 5
            assert len(summary["chapters"]) == 1
            assert summary["keyTakeaways"] == ["Point 1", "Point 2"]
            
            # Assert correct completion parameters were sent
            mock_client.chat.completions.create.assert_called_once()
            args, kwargs = mock_client.chat.completions.create.call_args
            assert kwargs["model"] == "llama-model"
            assert kwargs["response_format"] == {"type": "json_object"}
            assert kwargs["temperature"] == 0.2
            assert "overall" in kwargs["messages"][0]["content"]


def test_generate_flashcards_success(mock_groq_client):
    """Verify flashcard parsing handles standard list extraction formats."""
    mock_client, mock_message = mock_groq_client
    
    mock_payload = {
        "flashcards": [
            {"front": "What is attention?", "back": "A dynamic weighting mechanism."},
            {"front": "Who created it?", "back": "Vaswani et al."}
        ]
    }
    mock_message.content = json.dumps(mock_payload)

    with patch("app.services.ai.get_settings") as mock_settings:
        mock_settings.return_value.groq_api_key = "test_gsk_key"
        mock_settings.return_value.groq_model = "llama-model"
        
        with patch("app.services.ai.Groq") as mock_groq_class:
            mock_groq_class.return_value = mock_client
            
            service = AIService()
            cards = service.generate_flashcards("Attention details.")
            
            assert len(cards) == 2
            assert cards[0]["front"] == "What is attention?"
            assert cards[1]["back"] == "Vaswani et al."


def test_generate_chat_response_success(mock_groq_client):
    """Verify chat responder runs context formatting and returns text alongside mapped citations."""
    mock_client, mock_message = mock_groq_client
    
    mock_payload = {
        "answer": "This is the answer [1] explaining things.",
        "citations": [1]
    }
    mock_message.content = json.dumps(mock_payload)

    with patch("app.services.ai.get_settings") as mock_settings:
        mock_settings.return_value.groq_api_key = "test_gsk_key"
        mock_settings.return_value.groq_model = "llama-model"
        
        with patch("app.services.ai.Groq") as mock_groq_class:
            mock_groq_class.return_value = mock_client
            
            service = AIService()
            
            context_chunks = [
                {"page": 3, "paragraph": 2, "text": "This is source text context that is matched."}
            ]
            
            answer, citations = service.generate_chat_response(
                question="What is the answer?",
                chat_history=[],
                context_chunks=context_chunks
            )
            
            assert "explaining things" in answer
            assert len(citations) == 1
            assert citations[0]["page"] == 3
            assert citations[0]["text"].startswith("This is source text")
