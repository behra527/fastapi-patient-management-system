
import sys
from pathlib import Path

# Add the backend directory to Python's import path.
BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Patient Record Management API",
    }


def test_create_patient():
    patient_data = {
        "full_name": "Automated Test Patient",
        "date_of_birth": "1990-05-15",
        "gender": "Male",
        "phone": "03001234567",
        "email": "automated.test@example.com",
        "address": "Lahore, Pakistan",
    }

    response = client.post("/patients/", json=patient_data)

    assert response.status_code == 201

    result = response.json()

    assert result["full_name"] == patient_data["full_name"]
    assert result["date_of_birth"] == patient_data["date_of_birth"]
    assert result["gender"] == patient_data["gender"]
    assert result["email"] == patient_data["email"]
    assert isinstance(result["id"], int)
    assert result["id"] > 0
    assert "created_at" in result
    assert "updated_at" in result


def test_get_all_patients():
    response = client.get("/patients/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)

    assert any(
        patient["full_name"] == "Automated Test Patient"
        and patient["email"] == "automated.test@example.com"
        for patient in response.json()
    )


def test_create_patient_with_invalid_email():
    patient_data = {
        "full_name": "Invalid Email Patient",
        "date_of_birth": "1990-05-15",
        "gender": "Male",
        "phone": "03001234567",
        "email": "not-an-email",
        "address": "Lahore, Pakistan",
    }

    response = client.post("/patients/", json=patient_data)

    assert response.status_code == 422


def test_get_patient_by_id():
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Get By ID Test",
            "date_of_birth": "1995-03-10",
            "gender": "Female",
            "email": "getbyid.test@example.com",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    response = client.get(f"/patients/{patient_id}")

    assert response.status_code == 200
    assert response.json()["id"] == patient_id
    assert response.json()["full_name"] == "Get By ID Test"


def test_update_patient():
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Before Update",
            "date_of_birth": "1992-06-15",
            "gender": "Male",
            "email": "update.test@example.com",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    updated_data = {
        "full_name": "After Update",
        "date_of_birth": "1992-06-15",
        "gender": "Male",
        "phone": "03009998877",
        "email": "update.test@example.com",
        "address": "Gujranwala, Pakistan",
    }

    response = client.put(
        f"/patients/{patient_id}",
        json=updated_data,
    )

    assert response.status_code == 200
    assert response.json()["id"] == patient_id
    assert response.json()["full_name"] == "After Update"
    assert response.json()["phone"] == "03009998877"
    assert response.json()["address"] == "Gujranwala, Pakistan"


def test_delete_patient():
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Delete Test Patient",
            "date_of_birth": "1990-01-20",
            "gender": "Other",
            "email": "delete.test@example.com",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    delete_response = client.delete(f"/patients/{patient_id}")

    assert delete_response.status_code == 204

    get_response = client.get(f"/patients/{patient_id}")

    assert get_response.status_code == 404


def test_get_nonexistent_patient():
    response = client.get("/patients/999999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"


def test_get_patient_with_zero_id():
    response = client.get("/patients/0")

    assert response.status_code == 422


def test_delete_nonexistent_patient():
    response = client.delete("/patients/999999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"
