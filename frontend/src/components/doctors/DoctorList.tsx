"use client";

import { useMemo, useState } from "react";

export type Doctor = {
  id: number;
  full_name: string;
  specialty: string;
  email: string;
  phone: string;
  license_number?: string;
  status: "Active" | "Inactive" | "On Leave";
};

type DoctorListProps = {
  doctors: Doctor[];
  loading?: boolean;
  error?: string | null;
  onView?: (doctor: Doctor) => void;
  onEdit?: (doctor: Doctor) => void;
};

export default function DoctorList({
  doctors,
  loading = false,
  error = null,
  onView,
  onEdit,
}: DoctorListProps) {
  const [search, setSearch] = useState("");

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      [
        doctor.full_name,
        doctor.specialty,
        doctor.email,
        doctor.phone,
        doctor.license_number ?? "",
        doctor.status,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [doctors, search]);

  return (
    <section className="records-card">
      <div className="records-heading">
        <div>
          <h2>Doctor Directory</h2>
          <p>View and manage registered healthcare professionals.</p>
        </div>

        <span className="record-count">
          {filteredDoctors.length} doctors
        </span>
      </div>

      <div className="table-toolbar">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, specialty, email or license..."
            aria-label="Search doctors"
          />
        </label>
      </div>

      {error && (
        <div className="empty-state" role="alert">
          <h3>Unable to load doctors</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && loading && (
        <div className="empty-state" role="status">
          <h3>Loading doctors...</h3>
          <p>Please wait while doctor records are loaded.</p>
        </div>
      )}

      {!error && !loading && filteredDoctors.length === 0 && (
        <div className="empty-state">
          <h3>
            {search.trim() ? "No matching doctors" : "No doctors available"}
          </h3>
          <p>
            {search.trim()
              ? "Try a different search term."
              : "Doctor records will appear here when they are available."}
          </p>
        </div>
      )}

      {!error && !loading && filteredDoctors.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>DOCTOR</th>
                <th>SPECIALTY</th>
                <th>CONTACT</th>
                <th>LICENSE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className="patient-cell">
                      <div className="patient-avatar" aria-hidden="true">
                        {doctor.full_name
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join("")}
                      </div>

                      <div>
                        <strong>{doctor.full_name}</strong>
                        <small>ID: {doctor.id}</small>
                      </div>
                    </div>
                  </td>

                  <td>{doctor.specialty}</td>

                  <td>
                    <div>
                      {doctor.email}
                      <small>{doctor.phone}</small>
                    </div>
                  </td>

                  <td>{doctor.license_number || "Not provided"}</td>

                  <td>
                    <span className="gender-tag">{doctor.status}</span>
                  </td>

                  <td>
                    <div className="doctor-actions">
                      {onView && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onView(doctor)}
                        >
                          View
                        </button>
                      )}

                      {onEdit && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onEdit(doctor)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && !loading && filteredDoctors.length > 0 && (
        <div className="table-footer">
          Showing {filteredDoctors.length} of {doctors.length} doctor records
        </div>
      )}
    </section>
  );
}
