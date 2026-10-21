
from app.database.connection import get_connection


def get_user_by_username(username: str) -> dict | None:
    """Find a user by username, without returning unnecessary fields."""
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                id,
                username,
                hashed_password,
                role,
                is_active,
                created_at
            FROM users
            WHERE username = ? COLLATE NOCASE
            """,
            (username.strip(),),
        ).fetchone()

        return dict(row) if row else None


def get_user_by_id(user_id: int) -> dict | None:
    """Find a user by ID, without returning the password hash."""
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                id,
                username,
                role,
                is_active,
                created_at
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        return dict(row) if row else None
