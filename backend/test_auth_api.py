
import pytest
from fastapi.testclient import TestClient

from app.auth.security import hash_password
from app.core import config
from app.database import connection as database_connection
from app.main import app


TEST_USERNAME = "testuser"
TEST_PASSWORD = "Test-Password-123!"


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Create an isolated database and a test account for each test."""
    test_db = tmp_path / "test_auth.db"

    monkeypatch.setattr(config, "DATABASE_PATH", test_db)
    monkeypatch.setattr(database_connection, "DATABASE_PATH", test_db)

    database_connection.initialize_database()

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
                TEST_USERNAME,
                hash_password(TEST_PASSWORD),
                "admin",
                1,
            ),
        )

    with TestClient(app) as test_client:
        yield test_client


def test_login_with_valid_credentials_returns_token(client):
    response = client.post(
        "/auth/login",
        json={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password_returns_401(client):
    response = client.post(
        "/auth/login",
        json={
            "username": TEST_USERNAME,
            "password": "Wrong-Password-123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password."


def test_login_with_unknown_username_returns_401(client):
    response = client.post(
        "/auth/login",
        json={
            "username": "unknownuser",
            "password": TEST_PASSWORD,
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password."


def test_login_with_inactive_account_returns_403(client):
    with database_connection.get_connection() as connection:
        connection.execute(
            "UPDATE users SET is_active = 0 WHERE username = ?",
            (TEST_USERNAME,),
        )

    response = client.post(
        "/auth/login",
        json={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD,
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "This account is inactive."
