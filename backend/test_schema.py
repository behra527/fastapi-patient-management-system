from pydantic import ValidationError

from app.schemas.patient import PatientCreate


patient = PatientCreate(
    full_name="Ali Khan",
    date_of_birth="2000-05-15",
    gender="Male",
    phone="03001234567",
    email="ali@example.com",
    address="Lahore, Pakistan",
)

print("Valid patient data:")
print(patient.model_dump(mode="json"))

try:
    PatientCreate(
        full_name="Ali Khan",
        date_of_birth="2000-05-15",
        gender="Invalid",
        email="not-an-email",
    )
except ValidationError as error:
    print("\nInvalid patient data rejected:")
    print(error.errors(include_url=False))

print("\nSchema validation test passed.")