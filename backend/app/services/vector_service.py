import os
from sentence_transformers import SentenceTransformer
from sqlalchemy import Column, String, Text, text
from pgvector.sqlalchemy import Vector

from app.core.database import Base, engine, SessionLocal

# =========================
# EMBEDDING MODEL
# =========================
EMBED_DIM = 384

model = SentenceTransformer("all-MiniLM-L6-v2")


# =========================
# PGVECTOR TABLE
# (replaces the old local ChromaDB persistent client so
# embeddings survive a free-tier backend restart, since they
# now live in the same Supabase Postgres as everything else)
# =========================
class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True)
    document_id = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(EMBED_DIM))


def init_vector_store():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    print("✅ pgvector store ready")


# =========================
# ADD CHUNKS
# =========================
def add_chunks(chunks, document_id):
    if not chunks:
        print("❌ NO CHUNKS")
        return

    print("🔥 ADDING CHUNKS:", len(chunks))

    embeddings = model.encode(chunks).tolist()

    db = SessionLocal()
    try:
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            db.merge(
                DocumentChunk(
                    id=f"{document_id}_{i}",
                    document_id=document_id,
                    content=chunk,
                    embedding=embedding,
                )
            )
        db.commit()
        print("✅ CHUNKS SAVED")
    finally:
        db.close()


# =========================
# QUERY
# =========================
def query_chunks(query, top_k=50):
    print("🔍 QUERY:", query)

    boosted_query = f"{query} {query} {query}"
    query_embedding = model.encode([boosted_query])[0].tolist()

    db = SessionLocal()
    try:
        rows = db.execute(
            text(
                "SELECT content FROM document_chunks "
                "ORDER BY embedding <=> (:qvec)::vector LIMIT :k"
            ),
            {"qvec": str(query_embedding), "k": top_k},
        ).fetchall()
    finally:
        db.close()

    docs = [row[0] for row in rows]

    print("📊 RESULTS:", len(docs))
    for i, doc in enumerate(docs[:5]):
        print(f"📄 RESULT {i+1}:", doc[:120])

    return {"documents": [docs]}


# =========================
# DELETE SINGLE
# =========================
def delete_chunks_by_document(document_id):
    db = SessionLocal()
    try:
        db.execute(
            text("DELETE FROM document_chunks WHERE document_id = :doc_id"),
            {"doc_id": document_id},
        )
        db.commit()
        print("🗑 DELETED:", document_id)
    except Exception as e:
        print("Delete error:", e)
        db.rollback()
    finally:
        db.close()


# =========================
# DELETE ALL
# =========================
def delete_all_chunks():
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM document_chunks"))
        db.commit()
        print("🧹 ALL VECTORS CLEARED")
    except Exception as e:
        print("Delete all error:", e)
        db.rollback()
    finally:
        db.close()
