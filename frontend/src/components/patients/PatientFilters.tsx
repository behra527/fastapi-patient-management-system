"use client";

type PatientFiltersProps = {
  search: string;
  genderFilter: string;
  onSearchChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onReset: () => void;
};

export default function PatientFilters({
  search,
  genderFilter,
  onSearchChange,
  onGenderChange,
  onReset,
}: PatientFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search patients..."
          aria-label="Search patients"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            width: "220px",
          }}
        />

        <select
          aria-label="Filter patients by gender"
          value={genderFilter}
          onChange={(event) => onGenderChange(event.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {(search || genderFilter !== "All") && (
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "8px 12px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
