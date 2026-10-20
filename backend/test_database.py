
from app.core.config import DATABASE_PATH
from app.database.connection import initialize_database, get_connection

initialize_database()

with get_connection() as connection:
    result = connection.execute(
        "SELECT name FROM sqlite_master "
        "WHERE type = 'table' AND name = 'patients'"
    ).fetchone()

assert result is not None, "Patients table was not created"

print(f"Database: {DATABASE_PATH}")
print(f"Patients table exists: {result['name']}")
print("Database initialization test passed.")
