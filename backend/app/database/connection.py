
import sqlite3
from contextlib import contextmanager
from typing import Iterator

from app.core.config import DATABASE_PATH


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    """Provide a SQLite connection and manage its lifecycle."""
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    """Create the patients table if it does not exist."""
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL
                    CHECK (length(trim(full_name)) > 0),
                date_of_birth TEXT NOT NULL,
                gender TEXT NOT NULL
                    CHECK (gender IN ('Male', 'Female', 'Other')),
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                ),
                updated_at TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                )
            )
            """
        )
