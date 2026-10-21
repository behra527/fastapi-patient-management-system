
import pytest
from fastapi.testclient import TestClient

from app.auth.security import hash_password
from app.core import config
from app.database import connection as database_connection
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Provide an authenticated client using an isolated test database."""
    test_db = tmp_path / "test_patients.db"

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
                "testadmin",
                hash_password("Test-Admin-Password-123!"),
                "admin",
                1,
            ),
        )

    with TestClient(app) as test_client:
        login_response = test_client.post(
            "/auth/login",
            json={
                "username": "testadmin",
                "password": "Test-Admin-Password-123!",
            },
        )

        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        test_client.headers.update(
            {"Authorization": f"Bearer {token}"}
        )

        yield test_client
