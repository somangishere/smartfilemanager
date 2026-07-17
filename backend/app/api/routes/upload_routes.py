import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document

from pypdf import PdfReader
from app.services.chunk_service import chunk_text
from app.services.vector_service import add_chunks

router = APIRouter()

UPLOAD_FOLDER = "uploads"


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # 1. Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # 2. Save file
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # 3. READ PDF PER PAGE (🔥 FIX UTAMA)
        reader = PdfReader(file_path)

        chunks = []

        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""

            # skip halaman kosong
            if not page_text.strip():
                continue

            page_chunks = chunk_text(page_text)

            for chunk in page_chunks:
                chunks.append({
                    "text": chunk,
                    "page": i + 1   # 🔥 penting untuk debug & future improvement
                })

        print("TOTAL CHUNKS:", len(chunks))

        # 4. Insert ke vector DB
        add_chunks(chunks, file_id)

        # 5. Save metadata
        doc = Document(
            id=file_id,
            file_name=file.filename,
            file_path=file_path
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)

        return {
            "message": "File uploaded & processed successfully",
            "document_id": doc.id,
            "chunks": len(chunks)
        }

    except Exception as e:
        return {"error": str(e)}