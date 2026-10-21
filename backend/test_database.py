
import tempfile
from pathlib import Path

import pytest

from app.core import config
from app.database import connection as database_connection


def test_initialize_database_creates_patients_table():
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db = Path(temp_dir) / "test_patients.db"

        original_config_path = config.DATABASE_PATH
        original_connection_path = database_connection.DATABASE_PATH

        try:
            config.DATABASE_PATH = test_db
            database_connection.DATABASE_PATH = test_db

            database_connection.initialize_database()

            with database_connection.get_connection() as connection:
                result = connection.execute(
                    """
                    SELECT name
                    FROM sqlite_master
                    WHERE type = 'table' AND name = 'patients'
                    """
                ).fetchone()

            assert result is not None
            assert result["name"] == "patients"

        finally:
            config.DATABASE_PATH = original_config_path
            database_connection.DATABASE_PATH = original_connection_path


def test_initialize_database_is_safe_to_repeat():
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db = Path(temp_dir) / "test_patients.db"

        original_config_path = config.DATABASE_PATH
        original_connection_path = database_connection.DATABASE_PATH

        try:
            config.DATABASE_PATH = test_db
            database_connection.DATABASE_PATH = test_db

            database_connection.initialize_database()
            database_connection.initialize_database()

            with database_connection.get_connection() as connection:
                tables = connection.execute(
                    """
                    SELECT name
                    FROM sqlite_master
                    WHERE type = 'table' AND name = 'patients'
                    """
                ).fetchall()

            assert len(tables) == 1

        finally:
            config.DATABASE_PATH = original_config_path
            database_connection.DATABASE_PATH = original_connection_path
