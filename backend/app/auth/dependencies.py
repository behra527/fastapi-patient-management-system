
from typing import Annotated, Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_access_token
from app.repositories.user_repository import get_user_by_id


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> dict:
    """Validate the bearer token and return the current active user."""

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError:
        raise unauthorized from None

    subject = payload.get("sub")

    # The token subject must contain a valid database user ID.
    if not isinstance(subject, str) or not subject.isdecimal():
        raise unauthorized

    user = get_user_by_id(int(subject))

    # Check current account status in the database on every request.
    if user is None or not user["is_active"]:
        raise unauthorized

    return user


def require_roles(*allowed_roles: str) -> Callable:
    """Create a dependency that permits only specified user roles."""

    valid_roles = {"admin", "doctor", "receptionist"}

    if not allowed_roles or not set(allowed_roles).issubset(valid_roles):
        raise ValueError("One or more allowed roles are invalid.")

    def role_checker(
        current_user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_checker
