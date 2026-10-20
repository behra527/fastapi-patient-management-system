# Patient Record Management System

A full-stack web application for managing patient records, built with a FastAPI backend and a Next.js frontend using TypeScript. The system uses SQLite for data storage and Pydantic for validating patient information.

## Badges

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logoColor=white)

## Overview

The Patient Record Management System is designed to manage patient information through a web interface connected to a REST API. The backend handles data validation, business logic, and database operations, while the frontend will provide the interface for interacting with patient records.

## Features

- Create and store patient records.
- Retrieve all patient records.
- Search for an individual patient by ID.
- Validate patient information using Pydantic.
- Reject future dates of birth through service-layer validation.
- Update and delete patient records as part of the ongoing CRUD implementation.
- Store records in an SQLite database.
- Provide API documentation through FastAPI Swagger UI.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| Pydantic | Data validation |
| SQLite | Database storage |
| Next.js | Frontend framework |
| TypeScript | Frontend development |
| Uvicorn | ASGI application server |
| Pytest / Python test scripts | Testing |

## Project Structure

```text
patient-record-management-system/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── patient_records.db
└── frontend/
    └── Next.js application
```

*The structure represents the planned project organization. Files and folders may change as development progresses.*

## Backend Setup

### 1. Navigate to the backend directory

```powershell
cd backend
```

### 2. Create a virtual environment

```powershell
python -m venv .venv
```

### 3. Activate the environment on Windows

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
pip install fastapi uvicorn pydantic email-validator
```

Ensure `requirements.txt` contains the project's actual dependencies before using it for a reproducible installation.

### 5. Run the API

```powershell
python -m uvicorn app.main:app --reload
```

### 6. Open API documentation

Visit:

`http://127.0.0.1:8000/docs`

The Swagger UI can be used to inspect and test registered API endpoints.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/patients/` | Create a patient |
| GET | `/patients/` | Retrieve all patients |
| GET | `/patients/{patient_id}` | Retrieve a patient by ID |
| PUT | `/patients/{patient_id}` | Update a patient |
| DELETE | `/patients/{patient_id}` | Delete a patient |

The complete endpoint list depends on the controller implementation and should be verified in Swagger UI.

## Testing

Repository and service-layer tests have passed for the implemented patient creation and retrieval operations, along with the reported business-rule checks.

Update and delete operations, complete API functionality, and frontend integration require further verification.

## Development Status

**Backend:** Core database, validation, repository, and service functionality implemented.

**Frontend:** Next.js and TypeScript frontend planned for API integration.

**Integration:** Ongoing development.

## Future Improvements

- Complete and test all CRUD endpoints.
- Build the patient management interface using Next.js and TypeScript.
- Connect frontend forms and patient search to the FastAPI backend.
- Add automated API and frontend integration tests.
- Implement authentication, authorization, audit logging, and protection for sensitive patient information before handling real patient data.

