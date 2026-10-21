
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.auth.dependencies import get_current_user, require_roles
from app.schemas.patient import (
    PatientCreate,
    PatientPatch,
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
    dependencies=[Depends(require_roles("admin", "receptionist"))],
)
def create_patient(patient: PatientCreate) -> dict:
    """Create a patient record for an authorized user."""
    try:
        return patient_service.create_patient(
            patient.model_dump(mode="json")
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error


@router.get(
    "/",
    response_model=list[PatientResponse],
    dependencies=[
        Depends(require_roles("admin", "doctor", "receptionist"))
    ],
)
def get_all_patients() -> list[dict]:
    """Return all patient records to an authorized user."""
    return patient_service.get_all_patients()


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    dependencies=[
        Depends(require_roles("admin", "doctor", "receptionist"))
    ],
)
def get_patient(patient_id: PositivePatientId) -> dict:
    """Return a patient by ID to an authorized user."""
    try:
        patient = patient_service.get_patient_by_id(patient_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
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
    dependencies=[Depends(require_roles("admin", "receptionist"))],
)
def update_patient(
    patient_id: PositivePatientId,
    patient: PatientUpdate,
) -> dict:
    """Replace patient fields for an authorized user."""
    try:
        updated_patient = patient_service.update_patient(
            patient_id,
            patient.model_dump(mode="json"),
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    if updated_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return updated_patient


@router.patch(
    "/{patient_id}",
    response_model=PatientResponse,
    dependencies=[Depends(require_roles("admin", "receptionist"))],
)
def patch_patient(
    patient_id: PositivePatientId,
    patient: PatientPatch,
) -> dict:
    """Update supplied patient fields for an authorized user."""
    patient_data = patient.model_dump(
        mode="json",
        exclude_unset=True,
    )

    if not patient_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="At least one field must be provided",
        )

    try:
        updated_patient = patient_service.patch_patient(
            patient_id,
            patient_data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
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
    dependencies=[Depends(require_roles("admin"))],
)
def delete_patient(patient_id: PositivePatientId) -> Response:
    """Delete a patient record; admin role required."""
    try:
        deleted = patient_service.delete_patient(patient_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
