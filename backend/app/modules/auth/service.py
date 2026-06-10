from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.core.config import settings
from app.modules.users.models import User
from app.modules.auth.models import RefreshToken


def issue_token(db: Session, user: User):
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    db.add(RefreshToken(
        user_id=user.id,
        token=refresh,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    ))
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def register(db:Session , data):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400,detail="Email already registered !")
    
    user = User(
        full_name = data.full_name,
        email= data.email,
        hashed_password = hash_password(data.password)
    )


    db.add(user)
    db.commit()
    db.refresh(user)

    return issue_token(db,user)


def login(db:Session,data):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401,detail="Invaild credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403,detail="Account disabled")
    
    return issue_token(db,user)


def refresh(db:Session,data):
    payload = decode_token(data.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401,detail="Invalid Refresh Token")
    
    stored = db.query(RefreshToken).filter(token=data.refresh_token , revoked=False).first()

    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401,detail="Refresh token expired or revoked")
    
    stored.revoked = True
    db.commit()

    user = db.query(User).filter(id=payload["sub"]).first()
    return issue_token(db,user)

def logout(db:Session,refresh_token:str):
    stored = db.query(RefreshToken).filter(token=refresh_token).first()
    if stored:
        stored.revoked = True
        db.commit()
