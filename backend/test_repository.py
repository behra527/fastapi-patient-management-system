from app.database.connection import initialize_database
from app.repositories.patient_repository import (
    create_patient,
    get_all_patients,
    get_patient_by_id,
)

initialize_database()

patient_data = {
    "full_name": "Repository Test Patient",
    "date_of_birth": "1995-08-20",
    "gender": "Female",
    "phone": "03001234567",
    "email": "repository.test@example.com",
    "address": "Lahore, Pakistan",
}

created = create_patient(patient_data)
print("Created patient:", created)

found = get_patient_by_id(created["id"])
assert found is not None
assert found["full_name"] == "Repository Test Patient"
print("Get by ID test: PASSED")

patients = get_all_patients()
assert any(patient["id"] == created["id"] for patient in patients)
print("Get all patients test: PASSED")

print("Repository tests passed.")