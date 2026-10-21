
import tempfile
from datetime import date, timedelta
from pathlib import Path

import pytest

from app.core import config
from app.database import connection as database_connection
from app.services import patient_service


@pytest.fixture
def service():
    """Use an isolated temporary database for each test."""
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db = Path(temp_dir) / "test_patients.db"

        original_config_path = config.DATABASE_PATH
        original_connection_path = database_connection.DATABASE_PATH

        try:
            # Redirect database connections to the temporary database.
            config.DATABASE_PATH = test_db
            database_connection.DATABASE_PATH = test_db

            database_connection.initialize_database()

            yield patient_service

        finally:
            # Restore the original database paths.
            config.DATABASE_PATH = original_config_path
            database_connection.DATABASE_PATH = original_connection_path


@pytest.fixture
def patient_data():
    """Provide valid patient data for service tests."""
    return {
        "full_name": "Service Test Patient",
        "date_of_birth": "1998-04-12",
        "gender": "Male",
        "phone": "03001234567",
        "email": "service.test@example.com",
        "address": "Gujranwala, Pakistan",
    }


def test_create_patient(service, patient_data):
    created = service.create_patient(patient_data)

    assert created["id"] > 0
    assert created["full_name"] == patient_data["full_name"]
    assert created["gender"] == patient_data["gender"]


def test_get_patient_by_id(service, patient_data):
    created = service.create_patient(patient_data)

    found = service.get_patient_by_id(created["id"])

    assert found is not None
    assert found["id"] == created["id"]
    assert found["full_name"] == patient_data["full_name"]


def test_get_all_patients(service, patient_data):
    created = service.create_patient(patient_data)

    patients = service.get_all_patients()

    assert any(
        patient["id"] == created["id"]
        for patient in patients
    )


def test_create_patient_rejects_future_date(service, patient_data):
    patient_data["date_of_birth"] = (
        date.today() + timedelta(days=1)
    ).isoformat()

    with pytest.raises(ValueError, match="(?i)future"):
        service.create_patient(patient_data)


def test_update_patient(service, patient_data):
    created = service.create_patient(patient_data)

    updated_data = {
        **patient_data,
        "full_name": "Updated Service Patient",
        "phone": "03009998888",
    }

    updated = service.update_patient(
        created["id"],
        updated_data,
    )

    assert updated is not None
    assert updated["full_name"] == "Updated Service Patient"
    assert updated["phone"] == "03009998888"


def test_patch_patient_preserves_other_fields(service, patient_data):
    created = service.create_patient(patient_data)

    updated = service.patch_patient(
        created["id"],
        {"phone": "03009998888"},
    )

    assert updated is not None
    assert updated["phone"] == "03009998888"
    assert updated["full_name"] == patient_data["full_name"]
    assert updated["email"] == patient_data["email"]


def test_patch_patient_rejects_empty_data(service, patient_data):
    created = service.create_patient(patient_data)

    with pytest.raises(
        ValueError,
        match="(?i)at least one field",
    ):
        service.patch_patient(created["id"], {})


def test_delete_patient(service, patient_data):
    created = service.create_patient(patient_data)

    deleted = service.delete_patient(created["id"])

    assert deleted is True
    assert service.get_patient_by_id(created["id"]) is None


def test_get_missing_patient_returns_none(service):
    assert service.get_patient_by_id(999999) is None
