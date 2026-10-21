
def create_test_patient(client):
    """Create a reusable test patient."""
    response = client.post(
        "/patients/",
        json={
            "full_name": "API Test Patient",
            "date_of_birth": "1998-04-12",
            "gender": "Male",
            "phone": "03001234567",
            "email": "api.test@example.com",
            "address": "Gujranwala, Pakistan",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_create_patient(client):
    response = client.post(
        "/patients/",
        json={
            "full_name": "Create Test Patient",
            "date_of_birth": "1998-04-12",
            "gender": "Male",
        },
    )

    assert response.status_code == 201
    assert response.json()["full_name"] == "Create Test Patient"
    assert "id" in response.json()


def test_get_all_patients(client):
    created = create_test_patient(client)

    response = client.get("/patients/")

    assert response.status_code == 200
    assert any(
        patient["id"] == created["id"]
        for patient in response.json()
    )


def test_get_patient_by_id(client):
    created = create_test_patient(client)

    response = client.get(f"/patients/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]
    assert response.json()["full_name"] == "API Test Patient"


def test_get_missing_patient_returns_404(client):
    response = client.get("/patients/999999")

    assert response.status_code == 404


def test_put_replaces_patient_fields(client):
    created = create_test_patient(client)

    response = client.put(
        f"/patients/{created['id']}",
        json={
            "full_name": "Updated API Patient",
            "date_of_birth": "1997-05-10",
            "gender": "Female",
            "phone": "03009998888",
            "email": "updated@example.com",
            "address": "Lahore, Pakistan",
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["full_name"] == "Updated API Patient"
    assert updated["date_of_birth"] == "1997-05-10"
    assert updated["gender"] == "Female"
    assert updated["phone"] == "03009998888"


def test_put_missing_patient_returns_404(client):
    response = client.put(
        "/patients/999999",
        json={
            "full_name": "Missing Patient",
            "date_of_birth": "1997-05-10",
            "gender": "Female",
        },
    )

    assert response.status_code == 404


def test_delete_patient(client):
    created = create_test_patient(client)

    response = client.delete(f"/patients/{created['id']}")

    assert response.status_code in (200, 204)

    get_response = client.get(f"/patients/{created['id']}")
    assert get_response.status_code == 404


def test_delete_missing_patient_returns_404(client):
    response = client.delete("/patients/999999")

    assert response.status_code == 404
