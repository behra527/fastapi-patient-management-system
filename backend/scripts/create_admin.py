
import getpass
import sqlite3
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.auth.security import hash_password
from app.database.connection import get_connection, initialize_database


def main() -> None:
    initialize_database()

    with get_connection() as connection:
        existing_admin = connection.execute(
            "SELECT 1 FROM users WHERE role = 'admin' LIMIT 1"
        ).fetchone()

    if existing_admin:
        print(
            "An admin account already exists. "
            "Use the authenticated account-management workflow."
        )
        raise SystemExit(1)

    username = input("Admin username: ").strip()

    if not 3 <= len(username) <= 50:
        print("Username must contain 3 to 50 characters.")
        raise SystemExit(1)

    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if len(password) < 12:
        print("Password must be at least 12 characters long.")
        raise SystemExit(1)

    if password != confirm_password:
        print("Passwords do not match.")
        raise SystemExit(1)

    hashed_password = hash_password(password)

    try:
        with get_connection() as connection:
            # Recheck inside the write transaction to reduce race risk.
            connection.execute("BEGIN IMMEDIATE")

            existing_admin = connection.execute(
                "SELECT 1 FROM users WHERE role = 'admin' LIMIT 1"
            ).fetchone()

            if existing_admin:
                print("An admin account already exists.")
                raise SystemExit(1)

            connection.execute(
                """
                INSERT INTO users (username, hashed_password, role)
                VALUES (?, ?, 'admin')
                """,
                (username, hashed_password),
            )
    except sqlite3.IntegrityError:
        print("Could not create admin: username may already exist.")
        raise SystemExit(1) from None

    print(f"Admin account '{username}' created successfully.")


if __name__ == "__main__":
    main()
