"""
Unit tests for the PDFProcessor service.
"""

import pytest
import fitz

from app.services.pdf import PDFProcessor


@pytest.fixture(scope="session")
def simple_pdf_bytes() -> bytes:
    """Dynamically creates a simple 2-page PDF in-memory for testing."""
    doc = fitz.open()
    
    # Page 1
    page1 = doc.new_page()
    page1.insert_text((50, 50), "First paragraph text on page one.")
    page1.insert_text((50, 150), "Second paragraph text on page one.")

    # Page 2
    page2 = doc.new_page()
    page2.insert_text((50, 50), "Only paragraph on page two.")
    
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_pdf_parsing_success(simple_pdf_bytes: bytes):
    """Verify that PyMuPDF block parser extracts page count and paragraphs."""
    pages, chunks = PDFProcessor.extract_pages_and_chunks(simple_pdf_bytes)
    
    assert pages == 2
    # Expecting 3 chunks across 2 pages
    assert len(chunks) == 3
    
    # Assert formatting/structure of chunks
    assert chunks[0]["page"] == 1
    assert chunks[0]["paragraph"] == 0
    assert chunks[0]["text"] == "First paragraph text on page one."
    
    assert chunks[1]["page"] == 1
    assert chunks[1]["paragraph"] == 1
    assert chunks[1]["text"] == "Second paragraph text on page one."

    assert chunks[2]["page"] == 2
    assert chunks[2]["paragraph"] == 0
    assert chunks[2]["text"] == "Only paragraph on page two."


def test_pdf_parsing_empty_fails():
    """Verify empty byte streams raise a ValueError."""
    with pytest.raises(ValueError, match="PDF content is empty"):
        PDFProcessor.extract_pages_and_chunks(b"")


def test_pdf_parsing_corrupt_fails():
    """Verify malformed bytes raise a ValueError."""
    with pytest.raises(ValueError, match="Failed to open PDF file"):
        PDFProcessor.extract_pages_and_chunks(b"INVALID_PDF_SIGNATURE_AND_MALFORMED_BYTES")
