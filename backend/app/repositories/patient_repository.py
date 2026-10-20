
from app.database.connection import get_connection


def create_patient(patient_data: dict) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO patients (
                full_name,
                date_of_birth,
                gender,
                phone,
                email,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                patient_data["full_name"],
                patient_data["date_of_birth"],
                patient_data["gender"],
                patient_data.get("phone"),
                patient_data.get("email"),
                patient_data.get("address"),
            ),
        )

        patient_id = cursor.lastrowid

        row = connection.execute(
            "SELECT * FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

        return dict(row)


def get_all_patients() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM patients ORDER BY id"
        ).fetchall()

        return [dict(row) for row in rows]


def get_patient_by_id(patient_id: int) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

        return dict(row) if row else None


def update_patient(
    patient_id: int,
    patient_data: dict,
) -> dict | None:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE patients
            SET
                full_name = ?,
                date_of_birth = ?,
                gender = ?,
                phone = ?,
                email = ?,
                address = ?,
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE id = ?
            """,
            (
                patient_data["full_name"],
                patient_data["date_of_birth"],
                patient_data["gender"],
                patient_data.get("phone"),
                patient_data.get("email"),
                patient_data.get("address"),
                patient_id,
            ),
        )

        if cursor.rowcount == 0:
            return None

        row = connection.execute(
            "SELECT * FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

        return dict(row) if row else None


def delete_patient(patient_id: int) -> bool:
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM patients WHERE id = ?",
            (patient_id,),
        )

        return cursor.rowcount > 0
