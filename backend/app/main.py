from fastapi import FastAPI
from app.core.database import engine,SessionLocal
from sqlalchemy.orm import Session
from app.modules.auth.routers import router as auth_router

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(auth_router,prefix="/auth",tags=["Authentication"])