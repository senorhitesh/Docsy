from fastapi import FastAPI
from core.database import engine,SessionLocal
from sqlalchemy.orm import Session


app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

