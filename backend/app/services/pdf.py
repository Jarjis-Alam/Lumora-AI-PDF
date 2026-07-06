"""
PDF processing service powered by PyMuPDF (fitz) extracting paragraph blocks.
"""

import fitz


class PDFProcessor:
    """
    Service for parsing PDF files and extracting structured paragraph blocks.
    """

    @staticmethod
    def extract_pages_and_chunks(file_bytes: bytes) -> tuple[int, list[dict]]:
        """
        Parses raw PDF bytes and extracts text blocks page-by-page.

        Returns:
            A tuple of (total_pages, list of paragraph chunk dictionaries).
            Each chunk dictionary matches:
            {
                "page": int (1-indexed page number),
                "paragraph": int (0-indexed block order index on that page),
                "text": str (cleaned text of the paragraph)
            }

        Raises:
            ValueError: If the file is not a valid PDF or is corrupted.
        """
        if not file_bytes:
            raise ValueError("PDF content is empty")

        try:
            # Open PDF from memory byte stream
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as exc:
            raise ValueError(f"Failed to open PDF file: {exc}") from exc

        num_pages = len(doc)
        if num_pages == 0:
            raise ValueError("PDF document contains no pages")

        chunks = []

        for page_idx in range(num_pages):
            page = doc[page_idx]
            # Use PyMuPDF block-extraction to capture paragraphs natively
            # Each block tuple has format: (x0, y0, x1, y1, "text", block_no, block_type)
            # block_type is 0 for text, 1 for image.
            blocks = page.get_text("blocks")

            for block_idx, block in enumerate(blocks):
                x0, y0, x1, y1, text, block_no, block_type = block
                if block_type == 0:  # Text block
                    cleaned_text = text.strip()
                    if cleaned_text:
                        chunks.append({
                            "page": page_idx + 1,  # 1-indexed for frontend
                            "paragraph": block_idx,
                            "text": cleaned_text,
                        })

        doc.close()
        return num_pages, chunks
