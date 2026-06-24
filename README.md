# Docsy
live:-https://docsyy-chi.vercel.app/

A secure, scalable, and production-inspired digital document signing platform built with Python and FastAPI.

This application allows users to upload PDF documents, place digital signatures, share signing links, track document status, and generate immutable signed PDFs with complete audit trails.

Designed to simulate real-world SaaS platforms like DocuSign, this project emphasizes backend architecture, security, and compliance while remaining approachable for developers building enterprise-level portfolio projects.

## 🧠 Introduction

The Document Signature App streamlines document approval workflows by replacing traditional paper-based signing processes with secure digital signatures.

The application focuses on:

Secure PDF uploads
Digital signature placement
Shareable signing links
Signed PDF generation
Complete audit logging
Authentication and role-based access control

This project demonstrates practical implementation of backend security, file processing, and business workflow automation using modern Python technologies.

## 🎯 Project Goals

The primary objectives of this project are to:

Build a DocuSign-inspired digital signature platform
Learn enterprise-grade backend architecture
Implement secure authentication and authorization
Manipulate and modify PDF documents programmatically
Create audit-ready document workflows
Develop a job-ready portfolio project that goes beyond basic CRUD operations
❗ Problem Statement

Traditional document signing processes suffer from several challenges:

Manual signing delays business workflows
Paper documents are difficult to track
Lack of audit logs for compliance verification
Increased risk of document tampering
No real-time visibility into document status
✅ Solution

This application addresses these issues by providing:

Secure PDF uploads
Digital signature embedding
Controlled document access
Shareable signing links
Immutable signed document generation
Comprehensive audit trails
Real-time document status tracking
## 🏗️ Tech Stack
### 🔹 Backend
Python 3.10+
FastAPI
Uvicorn
SQLAlchemy / Prisma ORM
PostgreSQL / Supabase / SQLite
JWT Authentication (python-jose / PyJWT)
Passlib (bcrypt)
### 🔹 File & PDF Processing
PyMuPDF (fitz)
ReportLab (optional PDF generation)
Pillow (signature image handling)
### 🔹 Frontend
React.js / Next.js
Tailwind CSS
react-pdf
dnd-kit (drag-and-drop signature placement)
## ✨ Features
Authentication
User registration
Secure login
JWT-based authentication
Password hashing with bcrypt
Document Management
Upload PDF documents
Store document metadata
View uploaded documents
Delete documents
Signature Workflow
Drag-and-drop signature placement
Upload signature image
Generate signed PDFs
Multiple signer support (future enhancement)
Sharing
Generate secure signing links
Link expiration support
Public signing interface
Audit Trail
Record upload events
Track document access
Log signing actions
Timestamp all activities
Security
JWT authorization
Protected API routes
Password encryption
Secure file handling
Role-based access control (optional extension)

## 🚀 Getting Started
1. Clone the Repository
git clone https://github.com/your-username/signature-app.git

cd signature-app
2. Create Virtual Environment
Windows
python -m venv venv

venv\Scripts\activate
Linux / macOS
python3 -m venv venv

source venv/bin/activate
3. Install Dependencies
pip install -r requirements.txt
4. Configure Environment Variables

Create a .env file:

DATABASE_URL=postgresql://username:password@localhost/signature_db

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60
5. Run the Backend Server
uvicorn main:app --reload

API documentation will be available at:

http://localhost:8000/docs
## 📌 Core API Modules
Module	Description
Auth	User registration & login
Users	User profile management
Documents	Upload and manage PDFs
Signatures	Place and generate signatures
Sharing	Generate signing links
Audit Logs	Track document activities
## 🔒 Security Features
Password hashing using bcrypt
JWT token authentication
Protected API endpoints
Secure PDF processing
Immutable audit logs
Environment variable configuration
Database abstraction layer
## 📈 Future Improvements
Email notifications
Multiple signer workflow
OTP verification
Cloud storage integration (AWS S3)
Digital certificate signing
Organization workspaces
Admin dashboard
WebSocket live status updates
Electronic signature compliance features
