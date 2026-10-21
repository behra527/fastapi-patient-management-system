
from fastapi import APIRouter, HTTPException, status

from app.auth.security import (
    create_access_token,
    verify_password,
)
from app.repositories.user_repository import get_user_by_username
from app.schemas.auth import LoginRequest, TokenResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest) -> TokenResponse:
    """Authenticate a user and return a JWT access token."""
    user = get_user_by_username(credentials.username)

    # Use the same public error for an unknown username or wrong password.
    if user is None or not verify_password(
        credentials.password,
        user["hashed_password"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    access_token = create_access_token(
        subject=str(user["id"]),
        role=user["role"],
    )

    return TokenResponse(access_token=access_token)
