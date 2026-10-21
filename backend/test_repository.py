
import tempfile
from pathlib import Path

import pytest

from app.core import config
from app.database import connection as database_connection
from app.repositories import patient_repository


@pytest.fixture
def repository():
    """Use an isolated temporary database for each repository test."""
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db = Path(temp_dir) / "test_patients.db"

        original_config_path = config.DATABASE_PATH
        original_connection_path = database_connection.DATABASE_PATH

        try:
            config.DATABASE_PATH = test_db
            database_connection.DATABASE_PATH = test_db

            database_connection.initialize_database()

            yield patient_repository

        finally:
            config.DATABASE_PATH = original_config_path
            database_connection.DATABASE_PATH = original_connection_path


@pytest.fixture
def patient_data():
    """Provide valid patient data for repository tests."""
    return {
        "full_name": "Repository Test Patient",
        "date_of_birth": "1998-04-12",
        "gender": "Male",
        "phone": "03001234567",
        "email": "repository.test@example.com",
        "address": "Gujranwala, Pakistan",
    }


def test_create_patient(repository, patient_data):
    created = repository.create_patient(patient_data)

    assert created is not None
    assert created["id"] > 0
    assert created["full_name"] == patient_data["full_name"]
    assert created["email"] == patient_data["email"]


def test_get_patient_by_id(repository, patient_data):
    created = repository.create_patient(patient_data)

    found = repository.get_patient_by_id(created["id"])

    assert found is not None
    assert found["id"] == created["id"]
    assert found["full_name"] == patient_data["full_name"]


def test_get_missing_patient_returns_none(repository):
    assert repository.get_patient_by_id(999999) is None


def test_get_all_patients(repository, patient_data):
    first = repository.create_patient(patient_data)

    second_data = {
        **patient_data,
        "full_name": "Second Repository Patient",
        "email": "second@example.com",
    }
    second = repository.create_patient(second_data)

    patients = repository.get_all_patients()
    patient_ids = [patient["id"] for patient in patients]

    assert first["id"] in patient_ids
    assert second["id"] in patient_ids


def test_update_patient(repository, patient_data):
    created = repository.create_patient(patient_data)

    updated_data = {
        **patient_data,
        "full_name": "Updated Repository Patient",
        "phone": "03009998888",
    }

    updated = repository.update_patient(
        created["id"],
        updated_data,
    )

    assert updated is not None
    assert updated["full_name"] == "Updated Repository Patient"
    assert updated["phone"] == "03009998888"


def test_update_missing_patient_returns_none(repository, patient_data):
    updated = repository.update_patient(999999, patient_data)

    assert updated is None


def test_patch_patient_updates_only_supplied_fields(
    repository,
    patient_data,
):
    created = repository.create_patient(patient_data)

    updated = repository.patch_patient(
        created["id"],
        {"phone": "03009998888"},
    )

    assert updated is not None
    assert updated["phone"] == "03009998888"
    assert updated["full_name"] == patient_data["full_name"]
    assert updated["email"] == patient_data["email"]


def test_patch_missing_patient_returns_none(repository):
    updated = repository.patch_patient(
        999999,
        {"phone": "03009998888"},
    )

    assert updated is None


def test_delete_patient(repository, patient_data):
    created = repository.create_patient(patient_data)

    deleted = repository.delete_patient(created["id"])

    assert deleted is True
    assert repository.get_patient_by_id(created["id"]) is None


def test_delete_missing_patient_returns_false(repository):
    deleted = repository.delete_patient(999999)

    assert deleted is False
