
import pytest
from pydantic import ValidationError

from app.schemas.patient import PatientCreate, PatientPatch


def test_valid_patient_data():
    patient = PatientCreate(
        full_name="Ali Khan",
        date_of_birth="2000-05-15",
        gender="Male",
        phone="03001234567",
        email="ali@example.com",
        address="Lahore, Pakistan",
    )

    assert patient.full_name == "Ali Khan"
    assert patient.gender == "Male"
    assert patient.email == "ali@example.com"


def test_invalid_gender_is_rejected():
    with pytest.raises(ValidationError):
        PatientCreate(
            full_name="Ali Khan",
            date_of_birth="2000-05-15",
            gender="Invalid",
        )


def test_invalid_email_is_rejected():
    with pytest.raises(ValidationError):
        PatientCreate(
            full_name="Ali Khan",
            date_of_birth="2000-05-15",
            gender="Male",
            email="not-an-email",
        )


def test_full_name_is_trimmed():
    patient = PatientCreate(
        full_name="  Ali Khan  ",
        date_of_birth="2000-05-15",
        gender="Male",
    )

    assert patient.full_name == "Ali Khan"


def test_patch_preserves_only_supplied_fields():
    patch = PatientPatch(phone="03001234567")

    assert patch.model_dump(exclude_unset=True) == {
        "phone": "03001234567"
    }


def test_patch_can_explicitly_clear_email():
    patch = PatientPatch(email=None)

    assert patch.model_dump(exclude_unset=True) == {
        "email": None
    }


def test_patch_empty_body_has_no_supplied_fields():
    patch = PatientPatch()

    assert patch.model_dump(exclude_unset=True) == {}
