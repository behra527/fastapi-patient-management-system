import os
from pathlib import Path

from dotenv import load_dotenv

# Backend directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Load environment variables from backend/.env
load_dotenv(BASE_DIR / ".env")

# SQLite database
DATABASE_PATH = BASE_DIR / "patient_records.db"

# JWT authentication settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
except ValueError as exc:
    raise RuntimeError(
        "ACCESS_TOKEN_EXPIRE_MINUTES must be a valid integer."
    ) from exc

# Fail early if authentication configuration is unsafe or invalid.
if len(JWT_SECRET_KEY) < 32:
    raise RuntimeError(
        "JWT_SECRET_KEY is missing or too short. "
        "Configure a secure key in backend/.env."
    )

if JWT_ALGORITHM != "HS256":
    raise RuntimeError(
        "Only HS256 is currently supported by this application."
    )

if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
    raise RuntimeError(
        "ACCESS_TOKEN_EXPIRE_MINUTES must be greater than zero."
    )
