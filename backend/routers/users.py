import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from config.database import get_db
from config.settings import get_settings
from auth.dependencies import get_current_user
from models.user import User
from models.farmer_document import FarmerDocument

settings = get_settings()

router = APIRouter(prefix="/users", tags=["Users & Documents"])

ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "documents")

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{farmer_id}/documents")
async def upload_farmer_document(
    farmer_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload farmers' verification documents."""
    # Auth/Admin checks
    if current_user.id != farmer_id and current_user.role not in ["officer", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    farmer = db.query(User).filter(User.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")
        
    # File save logic
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > MAX_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large")
        buffer.write(content)
        
    doc = FarmerDocument(
        farmer_id=farmer_id,
        document_type=document_type,
        file_path=file_path,
        uploaded_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return {"message": "Document uploaded successfully", "document_id": doc.id}
