
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Response, status

from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
    PatientUpdate,
)
from app.services import patient_service


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)

PositivePatientId = Annotated[int, Path(gt=0)]


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient(patient: PatientCreate) -> dict:
    """Create a new patient record."""
    try:
        return patient_service.create_patient(
            patient.model_dump(mode="json")
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error


@router.get(
    "/",
    response_model=list[PatientResponse],
)
def get_all_patients() -> list[dict]:
    """Return all patient records."""
    return patient_service.get_all_patients()


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
)
def get_patient(patient_id: PositivePatientId) -> dict:
    """Return a patient by ID."""
    try:
        patient = patient_service.get_patient_by_id(patient_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return patient


@router.put(
    "/{patient_id}",
    response_model=PatientResponse,
)
def update_patient(
    patient_id: PositivePatientId,
    patient: PatientUpdate,
) -> dict:
    """Update an existing patient record."""
    try:
        updated_patient = patient_service.update_patient(
            patient_id,
            patient.model_dump(mode="json"),
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    if updated_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return updated_patient


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_patient(patient_id: PositivePatientId) -> Response:
    """Delete an existing patient record."""
    try:
        deleted = patient_service.delete_patient(patient_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
