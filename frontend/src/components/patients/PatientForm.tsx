"use client";

import type { FormEvent } from "react";
import type { Patient } from "@/lib/api";

export type PatientFormValues = {
  full_name: string;
  date_of_birth: string;
  gender: Patient["gender"];
  phone: string;
  email: string;
  address: string;
};

type PatientFormProps = {
  form: PatientFormValues;
  editingPatient: Patient | null;
  saving: boolean;
  onFormChange: (form: PatientFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function PatientForm({
  form,
  editingPatient,
  saving,
  onFormChange,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "500px",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "20px", color: "#0f172a" }}>
          {editingPatient ? "Edit Patient Record" : "Register New Patient"}
        </h2>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "4px",
                color: "#334155",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(event) =>
                onFormChange({ ...form, full_name: event.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#334155",
                }}
              >
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={form.date_of_birth}
                onChange={(event) =>
                  onFormChange({ ...form, date_of_birth: event.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#334155",
                }}
              >
                Gender *
              </label>
              <select
                value={form.gender}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    gender: event.target.value as Patient["gender"],
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#334155",
                }}
              >
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) =>
                  onFormChange({ ...form, phone: event.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#334155",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  onFormChange({ ...form, email: event.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "4px",
                color: "#334155",
              }}
            >
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(event) =>
                onFormChange({ ...form, address: event.target.value })
              }
              rows={2}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 16px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 18px",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : editingPatient
                  ? "Update Patient"
                  : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
