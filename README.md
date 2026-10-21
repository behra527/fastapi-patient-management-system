# FastAPI Patient Management System

![Python](https://img.shields.io/badge/Python-3.13%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-REST_API-009688?logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-4051B5)
![Pydantic](https://img.shields.io/badge/Pydantic-Validation-E92063)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-Testing-0A9EDC?logo=pytest&logoColor=white)

A practical healthcare application built to learn FastAPI concepts through a Patient Management System.

## Features

- Patient registration and directory
- Search, filtering, pagination, and CSV export
- REST API with GET and POST operations
- Pydantic request validation
- SQLite database integration
- Interactive Swagger documentation
- Modular backend architecture

## Tech Stack

Python · FastAPI · Uvicorn · Pydantic · SQLite · Pytest · Next.js · React · TypeScript

## Project Structure

```text
backend/
├── app/
│   ├── core/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   └── main.py
├── tests/
└── requirements.txt

frontend/
└── src/
    ├── app/
    ├── components/
    └── lib/
```

## Setup

```powershell
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open Swagger documentation:

**http://127.0.0.1:8000/docs**

Run the frontend in a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Testing

```powershell
# Backend tests
python -m pytest -v

# Frontend checks (run inside frontend/)
npx tsc --noEmit
npm run lint
npm run build
```

## Learning Objectives

- Understand REST API fundamentals.
- Validate request data with Pydantic.
- Test endpoints through Swagger UI.
- Connect frontend, backend, and database concepts.
- Apply API development to a practical healthcare workflow.

## Future Improvements

Doctor management, appointments, medical records, prescriptions, billing, laboratory, pharmacy, and analytics modules.

