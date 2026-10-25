# IntelliCRM AI — Setup & Local Execution Guide

This document describes how to configure, run, and develop the IntelliCRM AI platform.

---

## 1. Prerequisites

- **Python 3.11+** (Tested on Python 3.14)
- **Node.js 18+** (LTS v20+ recommended)
- **Docker & Docker Compose** (Optional for local PostgreSQL)

---

## 2. Quick Start

### Backend Setup (FastAPI)

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Copy the environment configuration:
   ```powershell
   cp ..\.env.example .env
   ```
5. Run the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
6. Verify endpoints:
   - Interactive Swagger Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/api/v1/health`

### Frontend Setup (Next.js)

1. Open a new PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
4. Open the application in your browser:
   `http://localhost:3000`

---

## 3. Database & Migrations

For quick local development without Docker, IntelliCRM AI defaults to SQLite (`sqlite+aiosqlite:///./intellicrm.db`).

To run with PostgreSQL using Docker:
```powershell
docker compose up -d
```
Update `.env`:
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/intellicrm_db
```
Apply migrations:
```powershell
alembic upgrade head
```

---

## 4. Google Gemini API Configuration

1. Obtain an API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Set your API key in `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
*(Note: If `GEMINI_API_KEY` is omitted, the platform uses deterministic rule-based algorithms for lead scoring, sentiment estimation, and meeting summarization to ensure 100% operational continuity).*
