
from fastapi import status

from app.auth.security import hash_password
from app.database import connection as database_connection


TEST_PASSWORD = "Test-Role-Password-123!"


def login_as_role(client, username: str, role: str) -> None:
    """Create a test user, log in, and set the bearer token."""
    with database_connection.get_connection() as connection:
        connection.execute(
            """
            INSERT INTO users (
                username,
                hashed_password,
                role,
                is_active
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                username,
                hash_password(TEST_PASSWORD),
                role,
                1,
            ),
        )

    response = client.post(
        "/auth/login",
        json={
            "username": username,
            "password": TEST_PASSWORD,
        },
    )

    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    client.headers.update(
        {"Authorization": f"Bearer {token}"}
    )


def test_patient_list_requires_authentication(client):
    client.headers.pop("Authorization", None)

    response = client.get("/patients/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_patient_list_rejects_invalid_token(client):
    client.headers.update(
        {"Authorization": "Bearer invalid.token.value"}
    )

    response = client.get("/patients/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_doctor_can_read_patients(client):
    login_as_role(client, "testdoctor", "doctor")

    response = client.get("/patients/")

    assert response.status_code == status.HTTP_200_OK


def test_doctor_cannot_create_patient(client):
    login_as_role(client, "testdoctor", "doctor")

    response = client.post(
        "/patients/",
        json={
            "full_name": "Unauthorized Test Patient",
            "date_of_birth": "1998-04-12",
            "gender": "Male",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_doctor_cannot_delete_patient(client):
    # The shared fixture starts with an authenticated admin.
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Delete Permission Test",
            "date_of_birth": "1998-04-12",
            "gender": "Male",
        },
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    patient_id = create_response.json()["id"]

    login_as_role(client, "testdoctor", "doctor")

    response = client.delete(f"/patients/{patient_id}")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_receptionist_cannot_delete_patient(client):
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Receptionist Permission Test",
            "date_of_birth": "1998-04-12",
            "gender": "Female",
        },
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    patient_id = create_response.json()["id"]

    login_as_role(client, "testreceptionist", "receptionist")

    response = client.delete(f"/patients/{patient_id}")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_receptionist_can_create_patient(client):
    login_as_role(client, "testreceptionist", "receptionist")

    response = client.post(
        "/patients/",
        json={
            "full_name": "Authorized Receptionist Patient",
            "date_of_birth": "1998-04-12",
            "gender": "Female",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert (
        response.json()["full_name"]
        == "Authorized Receptionist Patient"
    )
