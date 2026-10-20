
from datetime import date

from app.repositories import patient_repository


def _validate_date_of_birth(patient_data: dict) -> None:
    """Reject a date of birth that is in the future."""
    date_of_birth = date.fromisoformat(
        str(patient_data["date_of_birth"])
    )

    if date_of_birth > date.today():
        raise ValueError("Date of birth cannot be in the future")


def _validate_patient_id(patient_id: int) -> None:
    """Ensure the patient ID is positive."""
    if patient_id <= 0:
        raise ValueError("Patient ID must be a positive integer")


def create_patient(patient_data: dict) -> dict:
    """Validate business rules and create a patient."""
    _validate_date_of_birth(patient_data)

    return patient_repository.create_patient(patient_data)


def get_all_patients() -> list[dict]:
    """Return all patient records."""
    return patient_repository.get_all_patients()


def get_patient_by_id(patient_id: int) -> dict | None:
    """Return a patient by ID, or None if not found."""
    _validate_patient_id(patient_id)

    return patient_repository.get_patient_by_id(patient_id)


def update_patient(
    patient_id: int,
    patient_data: dict,
) -> dict | None:
    """Validate business rules and update a patient."""
    _validate_patient_id(patient_id)
    _validate_date_of_birth(patient_data)

    return patient_repository.update_patient(
        patient_id,
        patient_data,
    )


def delete_patient(patient_id: int) -> bool:
    """Delete a patient and report whether a record was deleted."""
    _validate_patient_id(patient_id)

    return patient_repository.delete_patient(patient_id)
