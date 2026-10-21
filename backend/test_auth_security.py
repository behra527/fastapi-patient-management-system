
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.auth.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY


def test_password_hash_does_not_store_plain_password():
    password = "Test-Password-123!"

    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("Wrong-Password!", hashed) is False


def test_password_hashes_are_salted():
    password = "Test-Password-123!"

    first_hash = hash_password(password)
    second_hash = hash_password(password)

    assert first_hash != second_hash
    assert verify_password(password, first_hash) is True
    assert verify_password(password, second_hash) is True


def test_empty_password_is_rejected():
    with pytest.raises(ValueError):
        hash_password("")


def test_access_token_contains_expected_claims():
    token = create_access_token(
        subject="test-user-1",
        role="admin",
    )

    payload = decode_access_token(token)

    assert payload["sub"] == "test-user-1"
    assert payload["role"] == "admin"
    assert "iat" in payload
    assert "exp" in payload


def test_tampered_token_is_rejected():
    token = create_access_token(
        subject="test-user-1",
        role="admin",
    )

    tampered_token = token[:-1] + (
        "a" if token[-1] != "a" else "b"
    )

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(tampered_token)


def test_expired_token_is_rejected():
    now = datetime.now(timezone.utc)

    expired_payload = {
        "sub": "test-user-1",
        "role": "admin",
        "iat": now - timedelta(minutes=10),
        "exp": now - timedelta(minutes=5),
    }

    expired_token = jwt.encode(
        expired_payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired_token)
