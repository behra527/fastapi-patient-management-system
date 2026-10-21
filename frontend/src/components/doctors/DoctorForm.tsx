"use client";

import { useState, type FormEvent } from "react";
import type { Doctor } from "./DoctorList";

type DoctorFormData = Omit<Doctor, "id">;

type DoctorFormProps = {
  initialDoctor?: Doctor | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (data: DoctorFormData) => void | Promise<void>;
  onCancel?: () => void;
};

const EMPTY_FORM: DoctorFormData = {
  full_name: "",
  specialty: "",
  email: "",
  phone: "",
  license_number: "",
  status: "Active",
};

export default function DoctorForm({
  initialDoctor = null,
  saving = false,
  error = null,
  onSubmit,
  onCancel,
}: DoctorFormProps) {
  const [form, setForm] = useState<DoctorFormData>(() => ({
    ...EMPTY_FORM,
    ...(initialDoctor
      ? {
          full_name: initialDoctor.full_name,
          specialty: initialDoctor.specialty,
          email: initialDoctor.email,
          phone: initialDoctor.phone,
          license_number: initialDoctor.license_number ?? "",
          status: initialDoctor.status,
        }
      : {}),
  }));

  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof DoctorFormData>(
    field: K,
    value: DoctorFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    const normalized: DoctorFormData = {
      ...form,
      full_name: form.full_name.trim(),
      specialty: form.specialty.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      license_number: form.license_number?.trim() ?? "",
    };

    if (
      !normalized.full_name ||
      !normalized.specialty ||
      !normalized.email ||
      !normalized.phone
    ) {
      setValidationError("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalized.email)) {
      setValidationError("Enter a valid email address.");
      return;
    }

    try {
      await onSubmit(normalized);
    } catch {
      setValidationError("Unable to submit the doctor form. Please try again.");
    }
  }

  return (
    <section className="records-card doctor-form-card">
      <div className="records-heading">
        <div>
          <h2>{initialDoctor ? "Edit Doctor" : "Register Doctor"}</h2>
          <p>
            {initialDoctor
              ? "Update the doctor's professional information."
              : "Enter the details of the healthcare professional."}
          </p>
        </div>
      </div>

      <form className="doctor-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label className="doctor-field">
            Full Name <span aria-hidden="true">*</span>
            <input
              type="text"
              autoComplete="name"
              value={form.full_name}
              onChange={(event) =>
                updateField("full_name", event.target.value)
              }
              placeholder="Enter full name"
              required
              disabled={saving}
            />
          </label>

          <label className="doctor-field">
            Specialty <span aria-hidden="true">*</span>
            <input
              type="text"
              value={form.specialty}
              onChange={(event) =>
                updateField("specialty", event.target.value)
              }
              placeholder="e.g. Cardiology"
              required
              disabled={saving}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="doctor-field">
            Email Address <span aria-hidden="true">*</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="doctor@example.com"
              required
              disabled={saving}
            />
          </label>

          <label className="doctor-field">
            Phone Number <span aria-hidden="true">*</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Enter phone number"
              required
              disabled={saving}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="doctor-field">
            Medical License Number
            <input
              type="text"
              value={form.license_number ?? ""}
              onChange={(event) =>
                updateField("license_number", event.target.value)
              }
              placeholder="Enter license number"
              disabled={saving}
            />
          </label>

          <label className="doctor-field">
            Professional Status
            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as DoctorFormData["status"],
                )
              }
              disabled={saving}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </label>
        </div>

        {(validationError || error) && (
          <p className="doctor-form-error" role="alert">
            {validationError || error}
          </p>
        )}

        <div className="doctor-form-actions">
          {onCancel && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : initialDoctor
                ? "Update Doctor"
                : "Register Doctor"}
          </button>
        </div>
      </form>
    </section>
  );
}
