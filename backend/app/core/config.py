
from pathlib import Path

# Backend directory: .../patient-record-management/backend
BASE_DIR = Path(__file__).resolve().parents[2]

# SQLite database file
DATABASE_PATH = BASE_DIR / "patient_records.db"
