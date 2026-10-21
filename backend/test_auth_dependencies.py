
import pytest
from fastapi import HTTPException

from app.auth.dependencies import require_roles


@pytest.mark.parametrize(
    "role",
    ["admin", "doctor", "receptionist"],
)
def test_allowed_role_is_accepted(role):
    checker = require_roles(role)
    user = {
        "id": 1,
        "username": "testuser",
        "role": role,
        "is_active": 1,
    }

    result = checker(current_user=user)

    assert result == user


def test_disallowed_role_is_rejected():
    checker = require_roles("admin")
    doctor = {
        "id": 2,
        "username": "doctor1",
        "role": "doctor",
        "is_active": 1,
    }

    with pytest.raises(HTTPException) as exc_info:
        checker(current_user=doctor)

    assert exc_info.value.status_code == 403


@pytest.mark.parametrize(
    "roles",
    [
        (),
        ("superuser",),
        ("admin", "superuser"),
    ],
)
def test_invalid_role_configuration_is_rejected(roles):
    with pytest.raises(ValueError):
        require_roles(*roles)


def test_multiple_allowed_roles_are_supported():
    checker = require_roles("doctor", "receptionist")
    receptionist = {
        "id": 3,
        "username": "reception1",
        "role": "receptionist",
        "is_active": 1,
    }

    assert checker(current_user=receptionist) == receptionist
