
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Credentials submitted to the login endpoint."""

    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """Access token returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"


class AuthenticatedUser(BaseModel):
    """Public details of the authenticated account."""

    id: int
    username: str
    role: str
