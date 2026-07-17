from sqlalchemy import Column, String, Integer, DateTime, Text
from app.core.database import Base
import uuid
from datetime import datetime


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    # 🔥 METADATA (WAJIB)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔥 FULL TEXT / SUMMARY SOURCE
    summary = Column(Text, nullable=True)