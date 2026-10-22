# Smart File Manager

An AI-powered document manager that lets you upload PDFs and ask questions about them in natural language. Answers are grounded in the documents themselves through Retrieval-Augmented Generation (RAG), so the model answers from your files instead of guessing.

Built as my undergraduate final project (Information Systems, Universitas Ciputra Surabaya, 2026): *"Rancang Bangun File Manager Lokal Dilengkapi Agen AI untuk Pencarian dan Manajemen Dokumen Semantik"*.

## What it does

- **Upload and manage documents.** Drag-and-drop PDF upload, document list, detail view, and delete.
- **Semantic search.** Find content by meaning, not just keywords.
- **Ask questions across documents.** Factual, summary, and multi-document questions answered from retrieved context, with the source chunks returned alongside each answer.
- **Desktop or web.** Runs as an Electron desktop app or as a web frontend against a deployed API.

## How the RAG pipeline works

```
PDF ──► text extraction (pypdf) ──► cleaning + chunking (300 chars, 60 overlap)
                                            │
                                            ▼
                         embeddings (sentence-transformers, all-MiniLM-L6-v2, 384-dim)
                                            │
                                            ▼
                                 vector store (Postgres + pgvector)
                                            │
question ──► query normalization ──► top-k similarity search ──► context (max 5 chunks)
                                                                       │
                                                                       ▼
                                   LLM (Groq, Llama 3.1 8B, temperature 0) with a
                                   context-only prompt ──► answer + source chunks
```

The prompt instructs the model to answer only from the retrieved context and to say so when the answer is not in the documents. This reduces hallucinated answers.

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, slowapi (rate limiting) |
| Retrieval | sentence-transformers, pgvector (originally ChromaDB) |
| LLM | Groq API (Llama 3.1 8B Instant) |
| Database | PostgreSQL (Supabase) |
| Frontend | React, Vite, React Router, Framer Motion, react-dropzone |
| Desktop | Electron |
| Deployment | Docker (backend), environment-based API URL (frontend) |

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a PDF, extract, chunk, embed, and index it (10/min per IP) |
| `GET` | `/documents` | List documents |
| `GET` | `/documents/{doc_id}` | Document details |
| `DELETE` | `/documents/{doc_id}` | Delete a document and its chunks |
| `DELETE` | `/documents/delete-all` | Delete all documents |
| `POST` | `/ask` | Ask a question; returns an answer and source chunks (15/min per IP) |

## Evaluation

The system was evaluated through internal functional testing and a user study with five university students, using factual, summary, and multi-document questions on academic and business documents. All documented functional tests passed, and the answers were judged relevant to the questions asked.

Known limitations found during evaluation, and the next steps they suggest:

- **No conversational memory** between prompts. Follow-up questions need full context.
- **Weak extraction from slide-converted PDFs** (for example, PowerPoint exported to PDF).
- **Limited cross-language understanding** between Indonesian and English documents.

## Running locally

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set GROQ_API_KEY and DATABASE_URL (Postgres with pgvector)
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**Desktop app**

```bash
cd electron
npm install
npm start
```

## Author

Valent Rafael Somangkey · [LinkedIn](https://www.linkedin.com/in/valentrafaels/)
