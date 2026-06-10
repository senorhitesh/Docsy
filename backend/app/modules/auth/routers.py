from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.modules.auth import service
from app.modules.auth.schemas import (
    RegisterSchema, LoginSchema,
    TokenResponse, RefreshToken
)

router = APIRouter()

@router.post("/register",response_model =TokenResponse,status_code=201)
def register(data:RegisterSchema,db:Session = Depends(get_db)):
    return service.register(db,data)

@router.post("/login",response_model=TokenResponse)
def login(data:LoginSchema,db:Session = Depends(get_db)):
    return service.login(db, data)

@router.post("/refresh",response_model=TokenResponse)
def refresh(data:RefreshToken,db:Session = Depends(get_db)):
    return service.refresh(db,data)

@router.post("/logout", status_code=204)
def logout(data:RefreshToken ,db:Session = Depends(get_db)):
    service.logout(db, data.refresh_token)

