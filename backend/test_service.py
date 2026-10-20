
from datetime import date, timedelta

from app.database.connection import initialize_database
from app.services.patient_service import (
    create_patient,
    get_all_patients,
    get_patient_by_id,
)

initialize_database()

patient_data = {
    "full_name": "Service Test Patient",
    "date_of_birth": "1998-04-12",
    "gender": "Male",
    "phone": "03001112222",
    "email": "service.test@example.com",
    "address": "Gujranwala, Pakistan",
}

created = create_patient(patient_data)
assert created["full_name"] == "Service Test Patient"
print("Create patient through service: PASSED")

found = get_patient_by_id(created["id"])
assert found is not None
print("Get patient by ID through service: PASSED")

patients = get_all_patients()
assert any(p["id"] == created["id"] for p in patients)
print("Get all patients through service: PASSED")

future_date = (date.today() + timedelta(days=1)).isoformat()
invalid_patient = {
    **patient_data,
    "date_of_birth": future_date,
}

try:
    create_patient(invalid_patient)
except ValueError as error:
    assert "future" in str(error).lower()
    print("Future date rejection: PASSED")
else:
    raise AssertionError("Future date was not rejected")

print("All service tests passed.")
