"use client";

import type { Patient } from "@/lib/api";

type PatientTableProps = {
  patients: Patient[];
  loading: boolean;
  selectedIds: number[];
  allVisibleSelected: boolean;
  deletingId: number | null;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: number) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
};

export default function PatientTable({
  patients,
  loading,
  selectedIds,
  allVisibleSelected,
  deletingId,
  onSelectAll,
  onSelectRow,
  onView,
  onEdit,
  onDelete,
}: PatientTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            <th style={{ padding: "12px 16px", width: "40px" }}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => onSelectAll(event.target.checked)}
                aria-label="Select all rows on current page"
              />
            </th>
            <th style={{ padding: "12px 16px", fontWeight: "600" }}>Name</th>
            <th style={{ padding: "12px 16px", fontWeight: "600" }}>Gender</th>
            <th style={{ padding: "12px 16px", fontWeight: "600" }}>
              Date of Birth
            </th>
            <th style={{ padding: "12px 16px", fontWeight: "600" }}>Phone</th>
            <th style={{ padding: "12px 16px", fontWeight: "600" }}>Email</th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "right",
                fontWeight: "600",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading patient records...
              </td>
            </tr>
          ) : patients.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No patient records found matching your criteria.
              </td>
            </tr>
          ) : (
            patients.map((patient) => {
              const isSelected = selectedIds.includes(patient.id);
              const isDeleting = deletingId === patient.id;

              return (
                <tr
                  key={patient.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: isSelected ? "#f0fdf4" : "transparent",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(patient.id)}
                      aria-label={`Select patient ${patient.full_name}`}
                    />
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    {patient.full_name}
                  </td>

                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {patient.gender}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {patient.date_of_birth}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {patient.phone || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {patient.email || "—"}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onView(patient)}
                        style={{
                          padding: "6px 10px",
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(patient)}
                        style={{
                          padding: "6px 10px",
                          background: "#f0f9ff",
                          border: "1px solid #bae6fd",
                          color: "#0284c7",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(patient)}
                        disabled={isDeleting}
                        style={{
                          padding: "6px 10px",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#b91c1c",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: isDeleting ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDeleting ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
