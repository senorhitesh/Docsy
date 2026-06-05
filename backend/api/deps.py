from fastapi import Depends ,Depends,HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
from .database import SessionLocal

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")