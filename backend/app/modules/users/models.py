from backend.app.core.database import engine
from sqlalchemy.orm import DeclarativeBase,relationship
from sqlalchemy import String , Column , Boolean , DateTime , func
from sqlalchemy.dialects.postgresql import UUID
import uuid
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__="users"

    id              = Column(UUID(as_uuid=True) , primary_key=True, default=uuid.uuid4)
    full_name       = Column(String,nullable=False)
    email           = Column(String, unique=True, nullable=False , index=True)
    hashed_password = Column(String,nullable=False)
    is_active       = Column(Boolean,default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    documents= relationship("Document",back_populates="owner")
    audit_logs = relationship("Auditog",back_populates="user")



def create_table():
    Base.metadata.create_all(bind=engine)