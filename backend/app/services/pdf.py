"""
PDF processing service powered by PyMuPDF (fitz) extracting paragraph blocks.
"""

import fitz
from app.core.logging import get_logger

logger = get_logger("pdf")

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False


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
        pages_to_ocr = []

        for page_idx in range(num_pages):
            page = doc[page_idx]
            # Use PyMuPDF block-extraction to capture paragraphs natively
            # Each block tuple has format: (x0, y0, x1, y1, "text", block_no, block_type)
            # block_type is 0 for text, 1 for image.
            blocks = page.get_text("blocks")

            page_has_text = False
            for block in blocks:
                x0, y0, x1, y1, text, block_no, block_type = block
                if block_type == 0 and text.strip():
                    page_has_text = True
                    break

            if not page_has_text:
                # Scanned page or image-only PDF page - schedule for OCR
                try:
                    pix = page.get_pixmap(dpi=150)
                    image_bytes = pix.tobytes("png")
                    pages_to_ocr.append((page_idx, image_bytes))
                except Exception as render_exc:
                    logger.warning("Failed to render page %d to image: %s", page_idx + 1, render_exc)
            else:
                for block_idx, block in enumerate(blocks):
                    x0, y0, x1, y1, text, block_no, block_type = block
                    if block_type == 0:  # Text block
                        cleaned_text = text.strip()
                        if cleaned_text:
                            chunks.append({
                                "page": page_idx + 1,
                                "paragraph": block_idx,
                                "text": cleaned_text,
                            })

        if pages_to_ocr:
            logger.info("Running parallel OCR on %d scanned pages...", len(pages_to_ocr))
            from concurrent.futures import ThreadPoolExecutor
            from app.services.ai import AIService
            ai_service = AIService()

            def process_single_page_ocr(item):
                page_idx, image_bytes = item
                ocr_text = ""
                confidence = 0.0
                
                # 1. Attempt local Tesseract OCR if available
                if PYTESSERACT_AVAILABLE:
                    try:
                        logger.info("Running local Tesseract OCR for page %d...", page_idx + 1)
                        import io
                        from PIL import Image
                        from pytesseract import Output
                        
                        img = Image.open(io.BytesIO(image_bytes))
                        ocr_text = pytesseract.image_to_string(img).strip()
                        
                        # Fetch confidences
                        data = pytesseract.image_to_data(img, output_type=Output.DICT)
                        confidences = [int(c) for c in data['conf'] if c != -1 and c != '-1']
                        confidence = (sum(confidences) / len(confidences)) / 100.0 if confidences else 0.0
                        logger.info("Local Tesseract OCR page %d confidence: %.2f", page_idx + 1, confidence)
                    except Exception as local_exc:
                        logger.warning("Local Tesseract OCR failed on page %d: %s", page_idx + 1, local_exc)
                        ocr_text = ""
                        confidence = 0.0
                
                # 2. Fall back to Groq Vision if local OCR is low confidence (< 70%) or failed
                if not ocr_text or confidence < 0.7:
                    try:
                        logger.info("Local OCR low confidence/unavailable for page %d. Running Groq Vision OCR...", page_idx + 1)
                        ocr_text = ai_service.perform_ocr(image_bytes)
                    except Exception as ocr_exc:
                        logger.warning("Groq Vision OCR failed on page %d: %s", page_idx + 1, ocr_exc)
                        ocr_text = ""
                        
                return page_idx, ocr_text

            with ThreadPoolExecutor(max_workers=5) as executor:
                ocr_results = list(executor.map(process_single_page_ocr, pages_to_ocr))

            # Add OCR chunks back in correct page order
            for page_idx, transcribed_text in sorted(ocr_results, key=lambda x: x[0]):
                if transcribed_text:
                    paragraphs = [p.strip() for p in transcribed_text.split("\n\n") if p.strip()]
                    for block_idx, para_text in enumerate(paragraphs):
                        chunks.append({
                            "page": page_idx + 1,
                            "paragraph": block_idx,
                            "text": para_text,
                        })

        doc.close()
        return num_pages, chunks
