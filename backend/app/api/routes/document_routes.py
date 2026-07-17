from fastapi import APIRouter, Depends, UploadFile, File, Query, Request, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.document import Document

# SERVICES
from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import chunk_text
from app.services.vector_service import (
    add_chunks,
    delete_chunks_by_document,
    delete_all_chunks
)
from app.services.rag_service import generate_answer

# UTILS
from app.utils.format import (
    format_size,
    format_date,
    short_summary
)

router=APIRouter()

UPLOAD_DIR="uploads"

os.makedirs(
 UPLOAD_DIR,
 exist_ok=True
)

# 🔥 DEMO SAFETY LIMITS (public-facing free deployment)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB per file
MAX_TOTAL_DOCUMENTS = 50                 # workspace-wide cap



# =========================
# UPLOAD
# =========================
@router.post("/upload")
@limiter.limit("10/minute")
async def upload_document(
 request:Request,
 file:UploadFile=File(...),
 mode:str=Query("ask"),
 new_name:str=Query(None),
 db:Session=Depends(get_db)
):

 try:

  total_docs=db.query(Document).count()

  if total_docs>=MAX_TOTAL_DOCUMENTS:
   raise HTTPException(
    status_code=429,
    detail=f"Demo workspace is full ({MAX_TOTAL_DOCUMENTS} documents max). Delete some documents first."
   )

  existing=db.query(
   Document
  ).filter(
   Document.file_name==file.filename
  ).first()


  if existing:

   if mode=="ask":

    return{
      "status":"duplicate",
      "file_name":file.filename
    }


   elif mode=="replace":

    if os.path.exists(
      existing.file_path
    ):
      os.remove(
       existing.file_path
      )

    delete_chunks_by_document(
      existing.id
    )

    db.delete(existing)
    db.commit()



   elif mode=="rename":

    if not new_name:
      return{
       "error":"new_name required"
      }

    new_name=new_name.strip()

    if not new_name.endswith(
      ".pdf"
    ):
      new_name+=".pdf"

    file.filename=new_name




  file_id=str(
    uuid.uuid4()
  )

  file_path=f"{UPLOAD_DIR}/{file_id}_{file.filename}"


  content=await file.read()

  if len(content)>MAX_FILE_SIZE_BYTES:
   raise HTTPException(
    status_code=413,
    detail=f"File too large. Max size is {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
   )

  with open(
   file_path,
   "wb"
  ) as f:
   f.write(content)


  file_size=len(content)


  text=extract_text_from_pdf(
    file_path
  )

  chunks=chunk_text(text)


  add_chunks(
    chunks,
    file_id
  )



  doc=Document(
   id=file_id,
   file_name=file.filename,
   file_path=file_path,
   file_size=file_size,
   created_at=datetime.utcnow(),
   summary=text
  )


  db.add(doc)
  db.commit()
  db.refresh(doc)


  return{
   "status":"success",
   "document_id":doc.id,
   "chunks":len(chunks)
  }


 except HTTPException:
  raise

 except Exception as e:

  print(
   "UPLOAD ERROR:",
   str(e)
  )

  return{
   "error":str(e)
  }




# =========================
# GET DOCUMENTS
# =========================
@router.get("/documents")
def get_documents(
 db:Session=Depends(get_db)
):

 docs=db.query(
   Document
 ).all()


 return[
  {
   "id":d.id,
   "file_name":d.file_name,
   "size":format_size(
      d.file_size
   ),
   "created_at":format_date(
      d.created_at
   ),
   "summary":short_summary(
      d.summary
   )
  }

  for d in docs
 ]




# =========================
# DETAIL
# =========================
@router.get("/documents/{doc_id}")
def get_document_detail(
 doc_id:str,
 db:Session=Depends(get_db)
):

 doc=db.query(
   Document
 ).filter(
   Document.id==doc_id
 ).first()


 if not doc:
   return{
    "error":"Document not found"
   }


 return{
   "summary":doc.summary,
   "extracted_text":doc.summary
 }




# =========================
# DELETE ALL
# MUST STAY ABOVE /{doc_id}
# =========================
@router.delete("/documents/delete-all")
def delete_all_documents(
 db:Session=Depends(get_db)
):

 try:

  docs=db.query(
    Document
  ).all()


  if not docs:
   return{
    "success":True,
    "deleted":0,
    "message":"No documents found"
   }


  deleted_count=len(docs)



  # delete uploaded files
  for doc in docs:

   try:

    if (
      doc.file_path and
      os.path.exists(
       doc.file_path
      )
    ):
      os.remove(
       doc.file_path
      )

   except Exception as e:

    print(
     "file warning:",
     e
    )



  # delete all rows
  db.query(
    Document
  ).delete()

  db.commit()



  # wipe chroma fully
  try:
    delete_all_chunks()

  except Exception as e:

    print(
      "chroma warning:",
      e
    )



  # clean orphan uploads
  try:

   if os.path.exists(
      UPLOAD_DIR
   ):

     for f in os.listdir(
        UPLOAD_DIR
     ):

       fp=os.path.join(
         UPLOAD_DIR,
         f
       )

       if os.path.isfile(fp):
         os.remove(fp)

  except Exception as e:

    print(
      "upload cleanup warning:",
      e
    )



  return{
   "success":True,
   "deleted":deleted_count,
   "message":"All documents deleted"
  }


 except Exception as e:

  db.rollback()

  return{
   "success":False,
   "error":str(e)
  }




# =========================
# DELETE SINGLE
# =========================
@router.delete("/documents/{doc_id}")
def delete_document(
 doc_id:str,
 db:Session=Depends(get_db)
):

 doc=db.query(
   Document
 ).filter(
   Document.id==doc_id
 ).first()


 if not doc:
   return{
    "error":"Document not found"
   }



 try:

  if os.path.exists(
    doc.file_path
  ):
    os.remove(
      doc.file_path
    )


  delete_chunks_by_document(
     doc_id
  )


  db.delete(doc)
  db.commit()


  return{
    "message":
    "Deleted completely"
  }


 except Exception as e:

  db.rollback()

  return{
    "error":str(e)
  }




# =========================
# ASK
# =========================
@router.post("/ask")
@limiter.limit("15/minute")
def ask_question(
 request:Request,
 query:str=Query(...)
):

 print(
  "USER QUERY:",
  query
 )


 result=generate_answer(
   query
 )


 print(
  "AI RESULT:",
  result
 )


 return result