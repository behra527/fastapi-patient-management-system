
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.controllers.patient_controller import router as patient_router
from app.database.connection import initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    initialize_database()
    yield


app = FastAPI(
    title="Patient Record Management API",
    description="API for managing patient records.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(patient_router)


@app.get("/", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Patient Record Management API",
    }
