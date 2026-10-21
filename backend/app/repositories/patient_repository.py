
from app.database.connection import get_connection


def create_patient(patient_data: dict) -> dict:
    """Insert a patient and return the created record."""
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
    """Return all patients ordered by ID."""
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM patients ORDER BY id"
        ).fetchall()

        return [dict(row) for row in rows]


def get_patient_by_id(patient_id: int) -> dict | None:
    """Return one patient by ID, or None if not found."""
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
    """Replace all editable patient fields."""
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


def patch_patient(
    patient_id: int,
    patient_data: dict,
) -> dict | None:
    """Update only supplied fields and preserve all others."""
    allowed_fields = {
        "full_name",
        "date_of_birth",
        "gender",
        "phone",
        "email",
        "address",
    }

    fields = {
        key: value
        for key, value in patient_data.items()
        if key in allowed_fields
    }

    if not fields:
        return None

    assignments = ", ".join(
        f"{field} = ?" for field in fields
    )
    values = list(fields.values())

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

        if existing is None:
            return None

        connection.execute(
            f"""
            UPDATE patients
            SET {assignments},
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE id = ?
            """,
            (*values, patient_id),
        )

        row = connection.execute(
            "SELECT * FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

        return dict(row) if row else None


def delete_patient(patient_id: int) -> bool:
    """Delete a patient and report whether a record was deleted."""
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM patients WHERE id = ?",
            (patient_id,),
        )

        return cursor.rowcount > 0
