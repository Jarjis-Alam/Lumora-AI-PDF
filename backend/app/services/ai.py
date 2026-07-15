"""
Groq LLM completion service wrapping custom prompts and structured JSON mode.
"""

import json
from typing import Any, Optional
from groq import Groq

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("ai")


class AIService:
    """
    Integrates with Groq to execute LLM completion prompts in JSON mode.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        if not self.settings.groq_api_key:
            logger.warning("GROQ_API_KEY is not configured. LLM calls will fail.")
            self.client = None
        else:
            self.client = Groq(api_key=self.settings.groq_api_key)

    def _ensure_client(self) -> Groq:
        if not self.client:
            raise ValueError(
                "Groq API Key is not configured. Set GROQ_API_KEY in your .env file."
            )
        return self.client

    def _call_llm_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        """Execute chat completion with JSON mode forced."""
        client = self._ensure_client()
        try:
            response = client.chat.completions.create(
                model=self.settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Received empty completion from LLM.")
            return json.loads(content)
        except Exception as exc:
            logger.error("Groq API completion failure: %s", exc)
            raise RuntimeError(f"AI Generation failed: {exc}") from exc

    def generate_summary(self, document_text: str) -> dict[str, Any]:
        """
        Analyze PDF document text and return a structured summary object.
        """
        system_prompt = (
            "You are an expert document analyst. Analyze the provided document text and "
            "generate a smart summary in JSON format.\n"
            "The JSON object must match this schema EXACTLY:\n"
            "{\n"
            "  \"overall\": \"Concise overview of the document (2-3 paragraphs)\",\n"
            "  \"readingTime\": 10, // Integer estimate of reading time in minutes\n"
            "  \"chapters\": [\n"
            "     { \"heading\": \"Chapter/Section Title\", \"body\": \"Description\" }\n"
            "  ],\n"
            "  \"keyTakeaways\": [\"Takeaway 1\", \"Takeaway 2\"],\n"
            "  \"concepts\": [\n"
            "     { \"term\": \"Term\", \"definition\": \"Definition details\" }\n"
            "  ],\n"
            "  \"bulletSummary\": [\"Bullet point 1\", \"Bullet point 2\"]\n"
            "}"
        )
        user_prompt = f"Analyze and summarize this document:\n\n{document_text}"
        return self._call_llm_json(system_prompt, user_prompt)

    def generate_flashcards(self, document_text: str) -> list[dict[str, Any]]:
        """
        Generate flashcards from document text.
        """
        system_prompt = (
            "You are an expert study assistant. Generate active recall study flashcards "
            "from the document text in JSON format.\n"
            "The JSON object must match this schema EXACTLY:\n"
            "{\n"
            "  \"flashcards\": [\n"
            "     { \"front\": \"Clear conceptual question\", \"back\": \"Precise answer\" }\n"
            "  ]\n"
            "}"
        )
        user_prompt = f"Create flashcards based on this document:\n\n{document_text}"
        result = self._call_llm_json(system_prompt, user_prompt)
        return result.get("flashcards", [])

    def generate_quiz(self, document_text: str, difficulty: str = "medium") -> list[dict[str, Any]]:
        """
        Generate quiz questions from document text.
        """
        system_prompt = (
            "You are an expert test creator. Generate a conceptual quiz based on the document "
            "text in JSON format. Generate a mix of MCQ, truefalse, and short questions.\n"
            f"Set the difficulty level of questions to '{difficulty}'.\n"
            "The JSON object must match this schema EXACTLY:\n"
            "{\n"
            "  \"quiz\": [\n"
            "     {\n"
            "        \"type\": \"mcq\", // 'mcq' | 'truefalse' | 'short'\n"
            "        \"question\": \"The question text?\",\n"
            "        \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], // Include ONLY for MCQ\n"
            "        \"answer\": \"Correct answer choice or explanation\",\n"
            "        \"explanation\": \"Detailed logic explaining why the answer is correct\",\n"
            "        \"difficulty\": \"medium\" // 'easy' | 'medium' | 'hard'\n"
            "     }\n"
            "  ]\n"
            "}"
        )
        user_prompt = f"Create a quiz based on this document:\n\n{document_text}"
        result = self._call_llm_json(system_prompt, user_prompt)
        return result.get("quiz", [])

    def generate_graph(self, document_text: str) -> dict[str, Any]:
        """
        Extract concepts, entities, and topics and build a relationship graph.
        """
        system_prompt = (
            "You are a knowledge graph architect. Extract core concepts, entities, and "
            "their structural connections from the document text and output a graph in JSON.\n"
            "The JSON object must match this schema EXACTLY:\n"
            "{\n"
            "  \"nodes\": [\n"
            "     { \"id\": \"n1\", \"label\": \"Concept Name\", \"type\": \"concept\", \"page\": 1, \"paragraph\": 0 } // type: 'concept' | 'entity' | 'topic'\n"
            "  ],\n"
            "  \"edges\": [\n"
            "     { \"id\": \"e1\", \"source\": \"n1\", \"target\": \"n2\", \"label\": \"relationship type (e.g., defines, extends)\" }\n"
            "  ]\n"
            "}"
        )
        user_prompt = f"Extract a knowledge graph from this document:\n\n{document_text}"
        return self._call_llm_json(system_prompt, user_prompt)

    def generate_chat_response(
        self,
        question: str,
        chat_history: list[dict[str, Any]],
        context_chunks: list[dict[str, Any]],
    ) -> tuple[str, list[dict[str, Any]]]:
        """
        RAG Chat completions responder. Returns the response string and matching citations.
        """
        client = self._ensure_client()
        
        # Build prompt listing contexts
        context_str = ""
        for i, chunk in enumerate(context_chunks):
            context_str += f"[{i+1}] (Page {chunk['page']}): {chunk['text']}\n\n"

        system_prompt = (
            "You are an expert document assistant. Answer the user's question relying strictly on the "
            "provided contexts below. If the answer is not supported by context, say 'I cannot find the answer "
            "in the document.'\n"
            "Provide inline references mapping to the context numbers (e.g. [1], [2]).\n"
            "Format your final output as a JSON object containing the text answer and a list of citation indices.\n"
            "Schema:\n"
            "{\n"
            "  \"answer\": \"Detailed answer string with inline citation labels [1]...\",\n"
            "  \"citations\": [1, 2] // List of context numbers referenced\n"
            "}"
        )

        # Build list of prompt messages incorporating history
        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        user_content = (
            f"Contexts:\n{context_str}\n"
            f"Question: {question}"
        )
        messages.append({"role": "user", "content": user_content})

        try:
            response = client.chat.completions.create(
                model=self.settings.groq_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty completion from LLM.")
                
            payload = json.loads(content)
            answer = payload.get("answer", "I cannot find the answer.")
            
            # Map index references to the source chunk dictionary shapes
            citations = []
            citation_indices = payload.get("citations", [])
            for idx in citation_indices:
                try:
                    # Convert to 0-indexed list pointer
                    chunk_idx = int(idx) - 1
                    if 0 <= chunk_idx < len(context_chunks):
                        chunk = context_chunks[chunk_idx]
                        citations.append({
                            "page": chunk["page"],
                            "paragraph": chunk.get("paragraph", 0),
                            "text": chunk["text"][:120] + "..."  # Snippet
                        })
                except Exception:
                    continue
                    
            return answer, citations
        except Exception as exc:
            logger.error("Chat completion failure: %s", exc)
            return "I failed to process the document chat question.", []

    def perform_ocr(self, image_bytes: bytes) -> str:
        """
        Perform OCR on an image using Groq's multimodal model.
        """
        client = self._ensure_client()
        import base64
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        try:
            response = client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "You are an expert OCR engine. Extract and transcribe "
                                    "all text visible in this document page image exactly. "
                                    "Preserve paragraph breaks. Do not add any conversational "
                                    "filler, explanations, or formatting commentary. Output "
                                    "only the transcribed text verbatim."
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
                temperature=0.0,
            )
            content = response.choices[0].message.content
            return content.strip() if content else ""
        except Exception as exc:
            logger.error("OCR API completion failure: %s", exc)
            raise RuntimeError(f"OCR generation failed: {exc}") from exc
