# Lumora

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-gi8kaqn6)

Lumora is an advanced, AI-powered document intelligence platform that transforms static PDFs into an interactive, multi-dimensional research workspace. Upload research papers, textbook chapters, documentation, or financial reports and use state-of-the-art AI to summarize, query, visualize, and study them.

---

## 🚀 Key Features

*   **Interactive PDF & AI Workspace**: Open PDFs side-by-side with an intelligent AI chat panel that answers queries and provides direct inline citations mapping to specific sections of the document.
*   **Knowledge Graph Visualization**: Interactively explore concepts, entities, and relationship networks extracted from your documents using a dynamic graph layout powered by React Flow.
*   **AI Summarization**: Generate structured, key-insight summaries of entire documents or specific sections to rapidly digest information.
*   **Study Mode (Flashcards & Quizzes)**: Automatically generate study tools (quizzes and flashcards) tailored to the content of your documents to practice active recall.
*   **Semantic Library Search**: Perform deep, hybrid semantic searches across your entire document repository using PGVector embeddings.
*   **Drag-and-Drop Library Dashboard**: Manage your PDF library, track ingestion pipeline statuses, and search metadata easily.

---

## 🛠️ Technology Stack

Lumora is built as a decoupled monorepo containing a modern React frontend and a FastAPI backend.

### Frontend
*   **Core**: React 18, TypeScript, Vite
*   **State Management**: Zustand
*   **Data Fetching**: TanStack React Query (v5)
*   **Styling & UI**: TailwindCSS, Lucide React, Framer Motion
*   **Interactive Components**: React Flow (for Knowledge Graphs), React PDF (for PDF rendering)

### Backend
*   **Framework**: FastAPI (Python 3.12+)
*   **Database & ORM**: PostgreSQL with `pgvector` extension, SQLAlchemy 2.0 (Async)
*   **Migrations**: Alembic
*   **Testing**: Pytest & HTTPX (for integration and unit testing)

---

## 📁 Repository Structure

```text
├── .bolt/                  # Bolt development configuration
├── backend/                # FastAPI Application
│   ├── alembic/            # Database schema migration files
│   ├── app/                # Application source code
│   │   ├── api/            # API endpoints (Documents, health, etc.)
│   │   ├── core/           # Configuration, logging, and DB engine
│   │   ├── models/         # SQLAlchemy DB models
│   │   ├── repositories/   # Repository patterns for DB access (UOW)
│   │   ├── schemas/        # Pydantic schemas for request/response validation
│   │   └── services/       # Core business logic (AI, Embeddings, PDF parsing)
│   └── tests/              # Pytest test suite
├── public/                 # Static frontend assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable React UI components
│   ├── lib/                # Utility and API helper files
│   ├── pages/              # App views (Landing, Dashboard, Workspace, Graph, etc.)
│   └── store.ts            # Zustand client state
└── package.json            # Frontend package manifest
```

---

## ⚡ Getting Started

Follow the steps below to run both the backend and frontend locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (3.12+)
*   [PostgreSQL](https://www.postgresql.org/) database with the `pgvector` extension installed and enabled

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
    Copy `.env.example` to `.env` and fill in your connection details and API keys:
    ```bash
    cp .env.example .env
    ```
    *Make sure the `DATABASE_URL` uses the asyncpg driver: `postgresql+asyncpg://user:password@localhost:5432/dbname`*

5.  **Run migrations**:
    Initialize and upgrade the database schema using Alembic:
    ```bash
    alembic upgrade head
    ```

6.  **Start the server**:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    Access the interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Frontend Setup

1.  **Navigate to the root directory** (if you are in `backend`):
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

This project is licensed under the MIT License. See the [LICENSE](file:///p:/Lumora/LICENSE) file for details.
