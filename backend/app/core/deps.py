from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.core.database import get_db
from app.modules.users.models import User

bearer = HTTPBearer()

def get_current_user(
        credentials:HTTPAuthorizationCredentials = Depends(bearer),
        db:Session = Depends(get_db)
) -> User:
    payload = decode_token(credentials.credentials)

    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401,detail="Invalid token or Expired")
    
    user = db.query(User).filter(id=payload["sub"]).first()

    if not user or not  user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return user