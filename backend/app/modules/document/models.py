from app.core.database import engine
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String , Column 
import uuid

class Base(DeclarativeBase):
    pass

class Documents(Base):
    __tablename__="documents"
    id = Column(UUID(as_uuid=True), primary_key=True , default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True),ForigenKey="users.id",nullable=False)
    title = Column(String,nullable=False)
    original_path = Column(String,nullable=False)
    signed_path = Column(String,nullable=True)
    status= Column(String, default="draft")
    
    owner= relationship("User",back_populates="documents")
    signature_request = relationship("SignatureRequest",back_populates="document")

     

def create_table():
    Base.metadata.create_all(bind=engine)