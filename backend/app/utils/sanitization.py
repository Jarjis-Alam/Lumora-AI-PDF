"""
Utility functions for user input validation and sanitization.
"""

import re
import html
import os

def strip_html_tags(text: str) -> str:
    """Removes HTML tags and their script/style blocks from a string."""
    if not text:
        return ""
    # Remove script blocks and their contents
    cleaned = re.sub(r'<script\b[^>]*>([\s\S]*?)<\/script>', '', text, flags=re.IGNORECASE)
    # Remove style blocks and their contents
    cleaned = re.sub(r'<style\b[^>]*>([\s\S]*?)<\/style>', '', cleaned, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    cleaned = re.sub(r'<[^>]*>', '', cleaned)
    # Also strip comments
    cleaned = re.sub(r'<!--.*?-->', '', cleaned, flags=re.DOTALL)
    return cleaned

def sanitize_text(text: str, max_length: int, field_name: str = "field") -> str:
    """
    Sanitizes a text input:
    - Strips HTML tags
    - Trims leading/trailing whitespace
    - Rejects if empty/whitespace-only (raises ValueError)
    - Rejects if length exceeds max_length (raises ValueError)
    """
    if not isinstance(text, str):
        raise ValueError(f"{field_name} must be a string")
    
    cleaned = strip_html_tags(text).strip()
    
    if not cleaned:
        raise ValueError(f"{field_name} cannot be empty or contain only whitespace/HTML tags")
        
    if len(cleaned) > max_length:
        raise ValueError(f"{field_name} exceeds the maximum length of {max_length} characters")
        
    return cleaned

def sanitize_filename(name: str, max_length: int = 100) -> str:
    """
    Sanitizes a filename:
    - Verifies it is not empty
    - Strips HTML tags and trims whitespace first
    - Rejects path traversals on the cleaned name (contains '..', '/', or '\\')
    - Ensures it ends with '.pdf' (case-insensitive)
    - Rejects if length exceeds max_length
    - Filters out invalid filename characters: : * ? " < > |
    """
    if not name or not isinstance(name, str):
        raise ValueError("Filename is required and must be a string")
        
    cleaned = strip_html_tags(name).strip()
    
    # Check for path traversals on the HTML-stripped name
    if ".." in cleaned or "/" in cleaned or "\\" in cleaned:
        raise ValueError("Filename contains invalid path characters or traversal attempts")
        
    if not cleaned.lower().endswith(".pdf"):
        raise ValueError("File must be a PDF document (.pdf)")
        
    # Remove invalid characters for Windows/Linux filesystems
    cleaned = re.sub(r'[:*?"<>|]', '', cleaned)
    
    # After stripping, does it still end with .pdf?
    if not cleaned.lower().endswith(".pdf"):
        cleaned += ".pdf"
        
    if not cleaned or cleaned == ".pdf":
        raise ValueError("Filename is invalid or empty after sanitization")
        
    if len(cleaned) > max_length:
        raise ValueError(f"Filename exceeds the maximum length of {max_length} characters")
        
    return cleaned
