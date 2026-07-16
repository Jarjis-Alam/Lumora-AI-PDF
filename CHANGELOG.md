# Changelog

All notable changes to the Lumora document intelligence workspace will be documented in this file.

## [1.1.0] - 2026-07-14

### Added
- Created dedicated user interface pages and routes for `/docs`, `/license`, `/changelog`, `/privacy`, and `/terms`.
- Added dynamic active-section highlighting in the navigation bar using an `IntersectionObserver`.
- Added smooth scrolling behavior globally across all main viewport navigations and logo brand clicks.

### Changed
- Refactored `EmbeddingsService` to load the local sentence-transformers model lazily, checking the `ENABLE_LOCAL_EMBEDDINGS` config variable. By default, it falls back to a deterministic, high-speed feature hashing vector space to save memory.
- Updated `vercel.json` to revert auto-generated backend service configurations and restore standard static Single Page Application (SPA) hosting, resolving the Vercel 404 deployment error.
- Updated the "Inside Lumora" landing page section ID from `inside-lumora` to `workspace` to align landing-page routing links.

### Removed
- Removed the heavyweight `sentence-transformers` dependency from `backend/requirements.txt` to eliminate PyTorch and CUDA installations during the Render build phase. This reduces production startup memory usage from >512 MB to ~80 MB, ensuring compatibility with Render's free tier.

---

## [1.0.0] - 2026-07-10

### Added
- Initial release of Lumora.
- Core document intelligence workspace supporting PDF uploads and rendering.
- Real-time cited streaming AI Chat integration using Groq API.
- Automatic document summarization and key concepts extraction.
- Study flashcards generator with study recall animations.
- Dynamic interactive quizzes generator.
- Zoomable interactive knowledge graph showing concept connections.
- Vector-based semantic searching across text segments.
- PostgreSQL and pgvector database schema migrations.
