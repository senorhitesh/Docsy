from app.core.database import engine
from sqlalchemy.orm import DeclarativeBase, relationship 
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String , Column , DateTime , Text , ForeignKey , Integer , Float , func
import uuid



class Base(DeclarativeBase):
    pass

class SignatureRequest(Base):
    __tablename__    ="signature_requests"
    id               = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    document_id      = Column(UUID(as_uuid=True), ForeginKey="documents.id" , nullable=False)
    signer_mail      = Column(String, nullable=False)
    token            = Column(String,unique=True,nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=False)
    status           = Column(String,default="pending") # pending | completed | expired
    completed_at     = Column(DateTime(timezone=True),nullable=True)


class Signature(Base):
    __tablename__ = "signatures"

    id                   = Column(UUID(as_uuid=True),default=uuid.uuid4 , primary_key=True)
    request_id           =  Column(UUID(as_uuid=True), ForeignKey("signature_requests.id"))
    signer_name          = Column(String,nullable=False)
    signer_email         = Column(String, nullable=False)
    signature_image_b64  = Column(Text,nullable=False)
    page_number          = Column(Integer,nullable=False)
    width                = Column(Float,nullable=False)
    height               = Column(Float, nullable=False)
    x_position           = Column(Float,nullable=False)
    y_position           = Column(Float, nullable=False)
    ip_address           = Column(String, nullable=False)
    signed_at            = Column(DateTime(timezone=True),server_default=func.now())

def create_table():
    Base.metadata.create_all(bind=engine)