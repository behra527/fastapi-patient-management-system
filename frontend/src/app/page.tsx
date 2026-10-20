"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createPatient,
  deletePatient as deletePatientRecord,
  getPatients,
  updatePatient,
  type Patient,
  type PatientPayload,
} from "@/lib/api";

export default function Home() {
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "Male" as Patient["gender"],
    phone: "",
    email: "",
    address: "",
  });

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setError("");

        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to patient database.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPatients();
  }, []);

  // Search & Filter Logic
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

  // Reset page position on query change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter]);

  // Paginated Slicing
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

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
        const updatedPatient = await updatePatient(editingPatient.id, payload);
        setPatients((current) =>
          current.map((patient) =>
            patient.id === updatedPatient.id ? updatedPatient : patient,
          ),
        );
        showNotification(`Updated profile for ${updatedPatient.full_name}`);
      } else {
        const createdPatient = await createPatient(payload);
        setPatients((current) => [createdPatient, ...current]);
        showNotification(`Successfully registered ${createdPatient.full_name}`);
      }

      resetForm();
      setEditingPatient(null);
      setShowForm(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : `Failed to ${editingPatient ? "update" : "register"} patient.`;
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
      setPatients((current) => current.filter((item) => item.id !== patient.id));
      showNotification(`Deleted record for ${patient.full_name}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unable to delete record.";
      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const exportToCSV = () => {
    if (filteredPatients.length === 0) return;
    const headers = ["ID", "Full Name", "Gender", "Date of Birth", "Phone", "Email", "Address"];
    const rows = filteredPatients.map(p => [
      p.id,
      `"${p.full_name.replace(/"/g, '""')}"`,
      p.gender,
      p.date_of_birth,
      `"${p.phone || ""}"`,
      `"${p.email || ""}"`,
      `"${(p.address || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aurahealth_patient_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Exported records to CSV successfully");
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedPatients.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="dashboard">
      {/* Toast Notification Banner */}
      {toast && (
        <div style={{
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
          border: toast.type === "success" ? "1px solid #38bdf8" : "1px solid #f87171"
        }}>
          <span style={{ color: toast.type === "success" ? "#38bdf8" : "#f87171", fontWeight: "bold" }}>
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <a href="/" className="brand">
          <div className="brand-icon-wrapper" style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            padding: "10px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.02em", color: "#ffffff", lineHeight: "1.2" }}>
              AuraHealth
            </span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#38bdf8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Clinical Intelligence
            </span>
          </div>
        </a>

        <div className="nav-label" style={{ color: "#94a3b8" }}>WORKSPACE</div>

        <nav className="navigation">
          <a href="/" className="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </a>

          <button
            className="nav-item"
            onClick={() =>
              document
                .getElementById("patient-records")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Patient Directory
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              HIPAA Compliant
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>Encrypted end-to-end medical records.</p>
          </div>

          <div className="profile" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
            <div className="avatar" style={{ background: "#38bdf8", color: "#0f172a", fontWeight: "700", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>AD</div>
            <div>
              <strong style={{ fontSize: "13px", color: "#ffffff", display: "block" }}>Dr. Alexander Vance</strong>
              <small style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Chief Medical Officer</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Clinical Workspace <span>/</span> <strong>Patients & Directory</strong>
          </div>

          <div className="status" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#15803d" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }} />
            FastAPI Live Connected
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow" style={{ color: "#0284c7", fontWeight: "700", letterSpacing: "0.06em", fontSize: "11px" }}>PATIENT MANAGEMENT SYSTEM</div>
              <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>Patient Directory & Registry</h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Manage records, filter demographics, and update patient profiles.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={exportToCSV}
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
                  cursor: "pointer"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>

              <button
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
                  cursor: "pointer"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Register New Patient
              </button>
            </div>
          </div>

          {error && (
            <div className="notice" role="alert" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0 }}><strong>System Warning:</strong> {error}</p>
              <button className="secondary-button" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}

          {/* Metric Cards */}
          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>Total Active Patients</span>
                <span className="stat-icon blue" style={{ background: "#e0f2fe", color: "#0284c7", padding: "6px", borderRadius: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </span>
              </div>
              <div className="stat-number">{loading ? "—" : patients.length}</div>
              <div className="stat-caption">Registered clinical profiles</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Male Demographics</span>
                <span className="stat-icon purple" style={{ background: "#f3e8ff", color: "#9333ea", padding: "6px", borderRadius: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><line x1="19" y1="5" x2="13.6" y2="10.4"/><polyline points="19 10 19 5 14 5"/></svg>
                </span>
              </div>
              <div className="stat-number">{loading ? "—" : patients.filter((p) => p.gender === "Male").length}</div>
              <div className="stat-caption">Male patients on record</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Female Demographics</span>
                <span className="stat-icon pink" style={{ background: "#fce7f3", color: "#db2777", padding: "6px", borderRadius: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                </span>
              </div>
              <div className="stat-number">{loading ? "—" : patients.filter((p) => p.gender === "Female").length}</div>
              <div className="stat-caption">Female patients on record</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Other / Unspecified</span>
                <span className="stat-icon green" style={{ background: "#dcfce7", color: "#16a34a", padding: "6px", borderRadius: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                </span>
              </div>
              <div className="stat-number">{loading ? "—" : patients.filter((p) => p.gender === "Other").length}</div>
              <div className="stat-caption">Unspecified / non-binary records</div>
            </article>
          </section>

          {/* Table Container */}
          <section className="records-card" id="patient-records" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div className="records-heading">
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Directory Registry</h2>
                <p style={{ color: "#64748b", fontSize: "13px", margin: "2px 0 0 0" }}>Filter, search, and manage patient profiles.</p>
              </div>

              <span className="record-count" style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                {loading ? "Loading..." : `${filteredPatients.length} Total Records`}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="table-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              {/* Single Border Container Fix */}
              <div
                style={{
                  flex: "1",
                  minWidth: "280px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#ffffff",
                  padding: "0 12px",
                  height: "40px"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", color: "#94a3b8", marginRight: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  type="search"
                  placeholder="Search name, email, phone or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "14px",
                    color: "#0f172a",
                    boxShadow: "none",
                    padding: 0
                  }}
                  disabled={loading}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  style={{ height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "13px", color: "#334155" }}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "13px", color: "#334155" }}
                >
                  <option value={5}>5 / page</option>
                  <option value={8}>8 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                </select>

                {(search || genderFilter !== "All") && (
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setGenderFilter("All");
                    }}
                    style={{ height: "40px", padding: "0 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "13px" }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Main Data Table */}
            <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 16px", width: "40px" }}>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={paginatedPatients.length > 0 && selectedIds.length === paginatedPatients.length}
                      />
                    </th>
                    <th style={{ padding: "12px 20px" }}>Patient Profile</th>
                    <th style={{ padding: "12px 16px" }}>Gender</th>
                    <th style={{ padding: "12px 16px" }}>Date of Birth</th>
                    <th style={{ padding: "12px 16px" }}>Contact Number</th>
                    <th style={{ padding: "12px 16px" }}>Address</th>
                    <th style={{ padding: "12px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading &&
                    paginatedPatients.map((patient) => {
                      const isSelected = selectedIds.includes(patient.id);
                      return (
                        <tr
                          key={patient.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: isSelected ? "#f0f9ff" : "transparent"
                          }}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(patient.id)}
                            />
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div className="patient-cell" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div className="patient-avatar" style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "700", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
                                {patient.full_name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{patient.full_name}</strong>
                                <small style={{ fontSize: "12px", color: "#64748b" }}>
                                  {patient.email || "No email linked"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <span className="gender-tag" style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: patient.gender === "Male" ? "#f3e8ff" : patient.gender === "Female" ? "#fce7f3" : "#f1f5f9",
                              color: patient.gender === "Male" ? "#7e22ce" : patient.gender === "Female" ? "#be185d" : "#475569"
                            }}>
                              {patient.gender}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>{patient.date_of_birth}</td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>{patient.phone || "—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>{patient.address || "—"}</td>
                          <td style={{ padding: "14px 20px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                title="View Details"
                                onClick={() => setViewingPatient(patient)}
                                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "13px", cursor: "pointer" }}
                              >
                                👁
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditForm(patient)}
                                disabled={deletingId === patient.id || saving}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer" }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void removePatient(patient)}
                                disabled={deletingId === patient.id || saving}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", fontSize: "13px", fontWeight: "500", color: "#dc2626", cursor: "pointer" }}
                              >
                                {deletingId === patient.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {loading && (
                <div className="empty-state" style={{ padding: "40px", textAlign: "center" }}>
                  <h3 style={{ color: "#334155", fontSize: "15px" }}>Syncing clinical registry...</h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>Fetching latest records securely from backend service.</p>
                </div>
              )}

              {!loading && !error && filteredPatients.length === 0 && (
                <div className="empty-state" style={{ padding: "40px", textAlign: "center" }}>
                  <h3 style={{ color: "#334155", fontSize: "15px" }}>
                    {search || genderFilter !== "All"
                      ? "No records matched your query"
                      : "No patients currently registered"}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>
                    {search || genderFilter !== "All"
                      ? "Try revising your search filters or clearing parameter tags."
                      : "Use the 'Register New Patient' button above to create a profile."}
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Pagination Controls */}
            {!loading && filteredPatients.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                  <strong>{Math.min(currentPage * pageSize, filteredPatients.length)}</strong> of{" "}
                  <strong>{filteredPatients.length}</strong> patients
                </div>

                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px" }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: currentPage === page ? "#0284c7" : "#ffffff",
                        color: currentPage === page ? "#ffffff" : "#334155",
                        fontWeight: currentPage === page ? "700" : "500",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="page-footer" style={{ marginTop: "32px", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
            AuraHealth Enterprise EHR System • Version 2.4 Secure Engine
          </footer>
        </section>
      </main>

      {/* Patient Profile View Modal */}
      {viewingPatient && (
        <div className="modal-backdrop">
          <section className="patient-modal" style={{ maxWidth: "500px" }}>
            <div className="modal-heading">
              <div>
                <h2>Clinical Record Summary</h2>
                <p>Patient Unique ID: #{viewingPatient.id}</p>
              </div>
              <button className="close-button" type="button" onClick={() => setViewingPatient(null)}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0" }}>
              <div><strong>Full Name:</strong> {viewingPatient.full_name}</div>
              <div><strong>Gender:</strong> {viewingPatient.gender}</div>
              <div><strong>Date of Birth:</strong> {viewingPatient.date_of_birth}</div>
              <div><strong>Phone Number:</strong> {viewingPatient.phone || "N/A"}</div>
              <div><strong>Email Address:</strong> {viewingPatient.email || "N/A"}</div>
              <div><strong>Residential Address:</strong> {viewingPatient.address || "N/A"}</div>
            </div>
            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={() => setViewingPatient(null)} style={{ background: "#0284c7" }}>Close Profile</button>
            </div>
          </section>
        </div>
      )}

      {/* Register / Edit Modal Form */}
      {showForm && (
        <div className="modal-backdrop">
          <section className="patient-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2 id="modal-title">{editingPatient ? "Edit Patient Record" : "Register New Patient"}</h2>
                <p>
                  {editingPatient
                    ? "Update medical and personal identification data."
                    : "Enter details below to establish a new clinical profile."}
                </p>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                  resetForm();
                }}
                disabled={saving}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={savePatient}>
              <label>
                Full Name
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  placeholder="e.g. Eleanor Vance"
                />
              </label>

              <div className="form-row">
                <label>
                  Date of Birth
                  <input
                    required
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.date_of_birth}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Gender
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender: e.target.value as Patient["gender"],
                      })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <label>
                Phone Number (optional)
                <input
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </label>

              <label>
                Email Address (optional)
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="patient@example.com"
                />
              </label>

              <label>
                Residential Address (optional)
                <input
                  maxLength={250}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Street address, City, Country"
                />
              </label>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                  style={{ background: "#0284c7" }}
                >
                  {saving
                    ? editingPatient
                      ? "Updating..."
                      : "Saving Record..."
                    : editingPatient
                      ? "Save Changes"
                      : "Register Patient"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}