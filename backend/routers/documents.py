import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, Document
from schemas import DocumentOut, DocumentSignInput
from auth import get_current_user

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

# Ensure upload directory exists
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate PDF content type or extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are allowed"
        )
    
    # Save the file locally with a unique name
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Save to database
    db_document = Document(
        filename=file.filename,
        storage_path=file_path,
        status="pending",
        user_id=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("", response_model=List[DocumentOut])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return documents

@router.get("/{document_id}", response_model=DocumentOut)
def get_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    return document

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this document"
        )
    
    if not os.path.exists(document.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(
        path=document.storage_path,
        filename=document.filename,
        media_type="application/pdf"
    )

import base64
import fitz # PyMuPDF

@router.post("/{document_id}/sign", response_model=DocumentOut)
def sign_document(
    document_id: int,
    sign_input: DocumentSignInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch document
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to sign this document"
        )
    
    if not os.path.exists(document.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    try:
        # Open PDF with PyMuPDF
        doc = fitz.open(document.storage_path)
        
        for sig in sign_input.signatures:
            # Validate page index
            if sig.pageNum < 1 or sig.pageNum > len(doc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid page number {sig.pageNum}"
                )
            
            # Decode base64 image bytes
            try:
                header, encoded = sig.image.split(",", 1)
                img_data = base64.b64decode(encoded)
            except Exception as decode_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to decode base64 signature image: {str(decode_err)}"
                )
            
            page = doc[sig.pageNum - 1]
            page_rect = page.rect
            
            # Calculate scale factors to convert client dimensions to original PDF coordinates
            scale_x = page_rect.width / sig.clientWidth
            scale_y = page_rect.height / sig.clientHeight
            
            pdf_x = sig.x * scale_x
            pdf_y = sig.y * scale_y
            pdf_w = sig.width * scale_x
            pdf_h = sig.height * scale_y
            
            # Create fitz Rect and overlay the image
            rect = fitz.Rect(pdf_x, pdf_y, pdf_x + pdf_w, pdf_y + pdf_h)
            page.insert_image(rect, stream=img_data)
        
        # Save the document (using a temporary path and replacing to avoid write locks or file corruption)
        temp_path = f"{document.storage_path}.tmp"
        doc.save(temp_path, deflate=True)
        doc.close()
        
        # Overwrite original file with the signed temp file
        if os.path.exists(temp_path):
            os.replace(temp_path, document.storage_path)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply signatures: {str(e)}"
        )
        
    # Update status in DB
    document.status = "signed"
    db.commit()
    db.refresh(document)
    return document
