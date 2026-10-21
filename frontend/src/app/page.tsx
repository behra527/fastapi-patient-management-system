"use client";

import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import LoginForm from "@/components/auth/LoginForm";
import PatientFilters from "@/components/patients/PatientFilters";
import PatientPagination from "@/components/patients/PatientPagination";
import PatientTable from "@/components/patients/PatientTable";
import PatientDetailsModal from "@/components/patients/PatientDetailsModal";
import PatientForm from "@/components/patients/PatientForm";
import { useEffect, useMemo, useState } from "react";
import {
  createPatient,
  deletePatient as deletePatientRecord,
  getPatients,
  login,
  hasAccessToken,
  clearAccessToken,
  updatePatient,
  type Patient,
  type PatientPayload,
} from "@/lib/api";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "Male" as Patient["gender"],
    phone: "",
    email: "",
    address: "",
  });

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await login(loginUsername.trim(), loginPassword);
      setLoginPassword("");
      setPatients([]);
      setIsAuthenticated(true);
      setError("");
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setIsAuthenticated(false);
    setAuthChecking(false);
    setLoading(false);
    setPatients([]);
    setSelectedIds([]);
    setViewingPatient(null);
    setShowForm(false);
    setEditingPatient(null);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setError("");
    setToast(null);
    resetForm();
  }

  function showNotification(
    message: string,
    type: "success" | "error" = "success",
  ) {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  // Fix 1: Authentication effect updated with setTimeout
  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;

      setIsAuthenticated(hasAccessToken());
      setAuthChecking(false);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadPatients() {
      try {
        setLoading(true);
        setError("");

        const data = await getPatients();

        if (!cancelled) {
          setPatients(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to connect to patient database.";

          setError(message);

          // Fix 2: Improved invalid token detection
          const normalizedMessage = message.toLowerCase();

          if (
            normalizedMessage.includes("authentication") ||
            normalizedMessage.includes("not authenticated") ||
            normalizedMessage.includes("unauthorized") ||
            normalizedMessage.includes("credentials") ||
            normalizedMessage.includes("token") ||
            normalizedMessage.includes("401")
          ) {
            clearAccessToken();
            setIsAuthenticated(false);
            setPatients([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch = [
        patient.full_name,
        patient.email ?? "",
        patient.phone ?? "",
        patient.address ?? "",
      ].some((value) => value.toLowerCase().includes(query));

      const matchesGender =
        genderFilter === "All" || patient.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, search, genderFilter]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPatients = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, effectivePage, pageSize]);

  const selectedVisibleCount = paginatedPatients.filter((patient) =>
    selectedIds.includes(patient.id),
  ).length;

  const allVisibleSelected =
    paginatedPatients.length > 0 &&
    selectedVisibleCount === paginatedPatients.length;

  function resetForm() {
    setForm({
      full_name: "",
      date_of_birth: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
    });
  }

  function openAddForm() {
    resetForm();
    setEditingPatient(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(patient: Patient) {
    setForm({
      full_name: patient.full_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      phone: patient.phone ?? "",
      email: patient.email ?? "",
      address: patient.address ?? "",
    });

    setEditingPatient(patient);
    setError("");
    setShowForm(true);
  }

  async function savePatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload: PatientPayload = {
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
    };

    try {
      setSaving(true);

      if (editingPatient) {
        const updatedPatient = await updatePatient(
          editingPatient.id,
          payload,
        );

        setPatients((current) =>
          current.map((patient) =>
            patient.id === updatedPatient.id ? updatedPatient : patient,
          ),
        );

        showNotification(`Updated profile for ${updatedPatient.full_name}`);
      } else {
        const createdPatient = await createPatient(payload);

        setPatients((current) => [createdPatient, ...current]);
        setCurrentPage(1);

        showNotification(
          `Successfully registered ${createdPatient.full_name}`,
        );
      }

      resetForm();
      setEditingPatient(null);
      setShowForm(false);
    } catch (err) {
      const action = editingPatient ? "update" : "register";
      const errMsg =
        err instanceof Error
          ? err.message
          : `Failed to ${action} patient.`;

      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removePatient(patient: Patient) {
    const confirmed = window.confirm(
      `Permanently remove ${patient.full_name} from clinical registry?`,
    );

    if (!confirmed) return;

    setError("");

    try {
      setDeletingId(patient.id);

      await deletePatientRecord(patient.id);

      setPatients((current) =>
        current.filter((item) => item.id !== patient.id),
      );

      setSelectedIds((current) =>
        current.filter((id) => id !== patient.id),
      );

      if (viewingPatient?.id === patient.id) {
        setViewingPatient(null);
      }

      showNotification(`Deleted record for ${patient.full_name}`);
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Unable to delete record.";

      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setDeletingId(null);
    }
  }

  function escapeCSV(value: string | number | null | undefined) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportToCSV() {
    if (filteredPatients.length === 0) {
      showNotification("No patient records available to export.", "error");
      return;
    }

    const headers = [
      "ID",
      "Full Name",
      "Gender",
      "Date of Birth",
      "Phone",
      "Email",
      "Address",
    ];

    const rows = filteredPatients.map((patient) =>
      [
        patient.id,
        patient.full_name,
        patient.gender,
        patient.date_of_birth,
        patient.phone,
        patient.email,
        patient.address,
      ]
        .map(escapeCSV)
        .join(","),
    );

    const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `aurahealth_patient_directory_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showNotification("Exported records to CSV successfully");
  }

  function handleSelectAll(checked: boolean) {
    const visibleIds = paginatedPatients.map((patient) => patient.id);

    if (checked) {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...visibleIds])),
      );
    } else {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
    }
  }

  function handleSelectRow(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function resetFilters() {
    setSearch("");
    setGenderFilter("All");
    setCurrentPage(1);
  }

  if (authChecking) {
    return (
      <main className="dashboard" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p>Checking authentication...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        username={loginUsername}
        password={loginPassword}
        loading={loginLoading}
        error={loginError}
        onUsernameChange={setLoginUsername}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
      />
    );
  }
  return (
    <div className="dashboard">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "10px",
            background: toast.type === "success" ? "#0f172a" : "#7f1d1d",
            color: "#ffffff",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "500",
            border:
              toast.type === "success"
                ? "1px solid #38bdf8"
                : "1px solid #f87171",
          }}
        >
          <span
            style={{
              color: toast.type === "success" ? "#38bdf8" : "#f87171",
              fontWeight: "bold",
            }}
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {toast.message}
        </div>
      )}

      <AppSidebar
        onNavigateToPatients={() =>
          document
            .getElementById("patient-records")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <main className="main-content">
        <AppHeader
          error={error}
          loading={loading}
          onLogout={handleLogout}
        />

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div
                className="eyebrow"
                style={{
                  color: "#0284c7",
                  fontWeight: "700",
                  letterSpacing: "0.06em",
                  fontSize: "11px",
                }}
              >
                PATIENT MANAGEMENT SYSTEM
              </div>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: "4px 0",
                }}
              >
                Patient Directory &amp; Registry
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Manage records, filter demographics, and update patient
                profiles.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={exportToCSV}
                disabled={loading || filteredPatients.length === 0}
                style={{
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor:
                    loading || filteredPatients.length === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    loading || filteredPatients.length === 0 ? 0.6 : 1,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={openAddForm}
                style={{
                  background: "#0284c7",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Register New Patient
              </button>
            </div>
          </div>

          {error && (
            <div
              className="notice"
              role="alert"
              style={{
                borderColor: "#fecaca",
                background: "#fef2f2",
                color: "#991b1b",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <p style={{ margin: 0, overflowWrap: "anywhere" }}>
                <strong>System Warning:</strong> {error}
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </button>
            </div>
          )}

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>Total Active Patients</span>
                <span
                  className="stat-icon blue"
                  style={{
                    background: "#e0f2fe",
                    color: "#0284c7",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </span>
              </div>
              <div className="stat-number">{loading ? "—" : patients.length}</div>
              <div className="stat-caption">Registered clinical profiles</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Male Demographics</span>
                <span
                  className="stat-icon purple"
                  style={{
                    background: "#f3e8ff",
                    color: "#9333ea",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="10" cy="14" r="5" />
                    <line x1="19" y1="5" x2="13.6" y2="10.4" />
                    <polyline points="19 10 19 5 14 5" />
                  </svg>
                </span>
              </div>
              <div className="stat-number">
                {loading
                  ? "—"
                  : patients.filter((patient) => patient.gender === "Male")
                      .length}
              </div>
              <div className="stat-caption">Male patients on record</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Female Demographics</span>
                <span
                  className="stat-icon pink"
                  style={{
                    background: "#fce7f3",
                    color: "#db2777",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="9" r="5" />
                    <line x1="12" y1="14" x2="12" y2="21" />
                    <line x1="9" y1="18" x2="15" y2="18" />
                  </svg>
                </span>
              </div>
              <div className="stat-number">
                {loading
                  ? "—"
                  : patients.filter((patient) => patient.gender === "Female")
                      .length}
              </div>
              <div className="stat-caption">Female patients on record</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Other / Unspecified</span>
                <span
                  className="stat-icon green"
                  style={{
                    background: "#dcfce7",
                    color: "#16a34a",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                  </svg>
                </span>
              </div>
              <div className="stat-number">
                {loading
                  ? "—"
                  : patients.filter((patient) => patient.gender === "Other")
                      .length}
              </div>
              <div className="stat-caption">
                Unspecified / non-binary records
              </div>
            </article>
          </section>

          <section
            className="records-card"
            id="patient-records"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="records-heading">
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Directory Registry
                </h2>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "2px 0 0",
                  }}
                >
                  Filter, search, and manage patient profiles.
                </p>
              </div>

                            <PatientFilters
                search={search}
                genderFilter={genderFilter}
                onSearchChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                onGenderChange={(value) => {
                  setGenderFilter(value);
                  setCurrentPage(1);
                }}
                onReset={resetFilters}
              />            </div>

                        <PatientTable
              patients={paginatedPatients}
              loading={loading}
              selectedIds={selectedIds}
              allVisibleSelected={allVisibleSelected}
              deletingId={deletingId}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onView={setViewingPatient}
              onEdit={openEditForm}
              onDelete={removePatient}
            />

                        <PatientPagination
              currentPage={effectivePage}
              totalPages={totalPages}
              pageSize={pageSize}
              visibleCount={paginatedPatients.length}
              totalEntries={filteredPatients.length}
              onPageChange={setCurrentPage}
            />
          </section>
        </section>
      </main>

      {/* Add / Edit Patient Modal */}
      {showForm && (
        <PatientForm
          form={form}
          editingPatient={editingPatient}
          saving={saving}
          onFormChange={setForm}
          onSubmit={savePatient}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
            resetForm();
            setError("");
          }}
        />
      )}
      {/* View Patient Modal */}
      <PatientDetailsModal
        patient={viewingPatient}
        onClose={() => setViewingPatient(null)}
      />
    </div>
  );
}
