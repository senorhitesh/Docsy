from datetime import datetime,timedelta
from app.core.config import settings
from jose import jwt ,JWTError
from passlib.context import CryptContext

pwd_context= CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = ""
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES =30

def hash_password(password:str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_pass:str, hashed_pass:str) -> bool:
    return pwd_context.verify(plain_pass,hashed_pass)

def create_access_token(subject:str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub":subject, "exp":expire , "type":"refresh"},
        settings.SECRET_KEY, algorithm="HS256"
    )
def create_refresh_token(subject:str) -> str:
    expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub":subject,"exp":expires,"type":"refresh"},settings.SECRET_KEY,algorithm="HS256")
def decode_token(token:str) -> dict:
    try:
        return jwt.decode(token,settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None
    
