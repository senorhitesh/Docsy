from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # Ensures models are loaded before create_all
from routers import auth, documents

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Docsy API",
    description="Secure document signature platform backend API",
    version="1.0.0"
)

import os

# Configure CORS to allow access from frontend (localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://docsyy-chi.vercel.app",
]

# Allow additional origins from environment variables if specified
additional_origins = os.getenv("CORS_ORIGINS")
if additional_origins:
    origins.extend([o.strip() for o in additional_origins.split(",") if o.strip()])


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(documents.router)

@app.get("/")
def read_root():
    return {
        "name": "Docsy API",
        "version": "1.0.0",
        "status": "healthy",
        "docs_url": "/docs"
    }
