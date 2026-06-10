from app.core.database import engine ,Base
from sqlalchemy.orm import  DeclarativeBase
import uuid
from sqlalchemy import Column,String,Boolean, DateTime , ForeignKey ,func
from sqlalchemy.dialects.postgresql import UUID


class RefreshToken(Base):
    __tablename__ = "refresh_token"

    id = Column(UUID(as_uuid=True), primary_key=True,default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False ,index=True)
    revoked =Column(Boolean,default=False)
    expires_at = Column(DateTime(timezone=True) , nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

def create_tables():
    Base.metadata.create_all(bind=engine)
