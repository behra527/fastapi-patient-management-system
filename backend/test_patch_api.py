
def test_patch_updates_only_supplied_field(client):
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Patch Test Patient",
            "date_of_birth": "1998-04-12",
            "gender": "Male",
            "phone": "03001112222",
            "email": "patch.test@example.com",
            "address": "Gujranwala, Pakistan",
        },
    )

    assert create_response.status_code == 201
    original = create_response.json()
    patient_id = original["id"]

    patch_response = client.patch(
        f"/patients/{patient_id}",
        json={"phone": "03009998888"},
    )

    assert patch_response.status_code == 200
    updated = patch_response.json()

    assert updated["phone"] == "03009998888"
    assert updated["full_name"] == original["full_name"]
    assert updated["date_of_birth"] == original["date_of_birth"]
    assert updated["gender"] == original["gender"]
    assert updated["email"] == original["email"]
    assert updated["address"] == original["address"]


def test_patch_can_clear_email(client):
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Email Clear Test",
            "date_of_birth": "1997-06-10",
            "gender": "Female",
            "email": "clear.test@example.com",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    response = client.patch(
        f"/patients/{patient_id}",
        json={"email": None},
    )

    assert response.status_code == 200
    assert response.json()["email"] is None


def test_patch_rejects_empty_body(client):
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Empty Patch Test",
            "date_of_birth": "1999-01-20",
            "gender": "Other",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    response = client.patch(
        f"/patients/{patient_id}",
        json={},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == (
        "At least one field must be provided"
    )


def test_patch_returns_404_for_missing_patient(client):
    response = client.patch(
        "/patients/999999",
        json={"phone": "03001234567"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"


def test_patch_rejects_future_date(client):
    create_response = client.post(
        "/patients/",
        json={
            "full_name": "Future Date Test",
            "date_of_birth": "2000-01-01",
            "gender": "Male",
        },
    )

    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    response = client.patch(
        f"/patients/{patient_id}",
        json={"date_of_birth": "2999-01-01"},
    )

    assert response.status_code == 422
    assert "future" in response.json()["detail"].lower()
