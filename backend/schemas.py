from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Document Schemas
class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    storage_path: str
    user_id: int

class DocumentOut(DocumentBase):
    id: int
    status: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# Signature Signing Schemas
from typing import List

class SignaturePlacement(BaseModel):
    pageNum: int
    x: float
    y: float
    width: float
    height: float
    clientWidth: float
    clientHeight: float
    image: str  # Base64 data URL

class DocumentSignInput(BaseModel):
    signatures: List[SignaturePlacement]

