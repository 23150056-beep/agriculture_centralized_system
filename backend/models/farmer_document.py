from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from config.database import Base

class FarmerDocument(Base):
    __tablename__ = "farmer_documents"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String(50), nullable=False) # ID, Lease, Insurance
    file_path = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farmer = relationship("User", foreign_keys=[farmer_id], backref="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])
