from core.database import engine,SessionLocal
from sqlalchemy.orm import Session , DeclarativeBase

class Base(DeclarativeBase):
    pass

class Auth(Base):

    __tablename__="Auth"



def create_tables():
    Base.metadata.create_all(bind=engine)
