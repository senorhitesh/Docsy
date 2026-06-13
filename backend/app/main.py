from fastapi import FastAPI
from app.core.database import engine,SessionLocal
from sqlalchemy.orm import Session
from app.modules.auth.routers import router as auth_router
from contextlib import asynccontextmanager
from app.init_db import create_tables

@asynccontextmanager
async def lifespan(app:FastAPI):
    create_tables()
    yield
app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello World"}
