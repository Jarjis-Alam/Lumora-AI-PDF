# Lumora — AI-Powered PDF Research Workspace

Lumora is an advanced document intelligence platform designed to turn static PDFs into an interactive research workspace. Upload research papers, textbooks, manuals, or financial reports and use state-of-the-art AI to query, visualize, summarize, and study them.

---

## 🚀 Key Features

*   **⚡ Scanned PDF OCR Support**: Integrates an advanced OCR fallback pipeline. If a document page has no digital text (e.g. scanned sheets or image-only documents), it renders to image dynamically and runs verbatim transcription via Groq's multimodal `meta-llama/llama-4-scout-17b-16e-instruct` vision model.
*   **💻 Streamlined 2-Panel Workspace**: Side-by-side view featuring a full-width PDF viewer on the left and an intelligent AI Chat Panel on the right, providing direct inline citations linked to specific paragraphs of your document.
*   **📊 Live Ingestion Tracking**: When opening a document that is currently processing in the background, a live status screen with a dynamic progress bar and completion percentage appears inside the viewer.
*   **📈 Knowledge Graph Visualization**: Interactively explore concepts, key terms, and semantic relationship networks extracted from your documents using a dynamic graph layout powered by React Flow.
*   **📝 Automated Study Mode**: Auto-generates high-quality summaries, recall flashcards, and quizzes tailored to the text, accessible as full-page views from the sidebar navigation.
*   **📂 Drag-and-Drop Library Dashboard**: Upload files easily, manage metadata, delete documents, and navigate your library in a clean dashboard.

---

## 🛠️ Technology Stack

Lumora is built as a decoupled monorepo containing a modern React frontend and a FastAPI backend.

### Frontend
*   **Framework**: React 18, TypeScript, Vite
*   **State Management**: Zustand
*   **Styling & UI**: TailwindCSS, Lucide React icons, Framer Motion
*   **Interactive Components**: React Flow (for Knowledge Graphs), React PDF (for PDF rendering)

### Backend
*   **Framework**: FastAPI (Python 3.12+)
*   **Database**: SQLite with `aiosqlite` async driver (easily switchable to PostgreSQL/pgvector for production)
*   **ORM**: SQLAlchemy 2.0 (Async)
*   **OCR & AI Services**: Groq API (using Llama 3/4 scout models)
*   **Testing**: Pytest & HTTPX (for unit and API testing)

---

## 📁 Repository Structure

```text
├── backend/                # FastAPI Application
│   ├── alembic/            # Database schema migration files
│   ├── app/                # Application source code
│   │   ├── api/            # API endpoints (Documents, health, etc.)
│   │   ├── core/           # Configuration, logging, and DB engine
│   │   ├── models/         # SQLAlchemy DB models
│   │   ├── repositories/   # Repository patterns for DB access (UOW)
│   │   ├── schemas/        # Pydantic schemas for request/response validation
│   │   └── services/       # Core business logic (AI, OCR, PDF parsing)
│   └── tests/              # Pytest test suite
├── public/                 # Static frontend assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable React UI components
│   ├── lib/                # Resizing utilities and API helpers
│   ├── pages/              # App views (Dashboard, Workspace, Graph, etc.)
│   └── store.ts            # Zustand client state
└── package.json            # Frontend package manifest
```

---

## ⚡ Getting Started

Follow the steps below to run both the backend and frontend locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (3.12+)

---

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    *   **Windows (PowerShell)**:
        ```powershell
        python -m venv .venv
        .venv\Scripts\Activate.ps1
        ```
    *   **macOS / Linux**:
        ```bash
        python -m venv .venv
        source .venv/bin/activate
        ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables**:
    Copy `.env.example` to `.env` and fill in your connection details and Groq API key:
    ```bash
    cp .env.example .env
    ```
    *By default, the backend configures an asynchronous SQLite local database file (`lumora.db`)*.

5.  **Run database migrations**:
    Initialize and upgrade the database schema using Alembic:
    ```bash
    alembic upgrade head
    ```

6.  **Start the development server**:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    Access the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Frontend Setup

1.  **Navigate to the root directory**:
    ```bash
    cd ..
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Tests

### Backend Tests
You can run backend unit and integration tests using `pytest` from the `backend/` directory:
```bash
cd backend
pytest tests/ -v
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
