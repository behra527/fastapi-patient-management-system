
from datetime import date, datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


Gender = Literal["Male", "Female", "Other"]


class PatientCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    date_of_birth: date
    gender: Gender
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=250)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty")
        return value


class PatientUpdate(BaseModel):
    """Full replacement schema used by PUT."""

    full_name: str = Field(min_length=2, max_length=100)
    date_of_birth: date
    gender: Gender
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=250)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty")
        return value


class PatientPatch(BaseModel):
    """Partial update schema used by PATCH."""

    full_name: str | None = Field(
        default=None, min_length=2, max_length=100
    )
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=250)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty")
        return value


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    date_of_birth: date
    gender: Gender
    phone: str | None
    email: EmailStr | None
    address: str | None
    created_at: datetime
    updated_at: datetime
