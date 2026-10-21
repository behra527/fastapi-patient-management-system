"use client";

type PatientPaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  visibleCount: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
};

export default function PatientPagination({
  currentPage,
  totalPages,
  pageSize,
  visibleCount,
  totalEntries,
  onPageChange,
}: PatientPaginationProps) {
  const effectivePage = Math.min(currentPage, totalPages);
  const startEntry =
    visibleCount > 0 ? (effectivePage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(effectivePage * pageSize, totalEntries);
  const isFirstPage = effectivePage <= 1;
  const isLastPage = effectivePage >= totalPages;

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <span style={{ fontSize: "13px", color: "#64748b" }}>
        Showing {startEntry} to {endEntry} of {totalEntries} entries
      </span>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(effectivePage - 1, 1))}
          style={{
            padding: "6px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            background: "#ffffff",
            cursor: isFirstPage ? "not-allowed" : "pointer",
            opacity: isFirstPage ? 0.5 : 1,
          }}
        >
          Previous
        </button>

        <span style={{ fontSize: "13px", color: "#334155" }}>
          Page {effectivePage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={isLastPage}
          onClick={() =>
            onPageChange(Math.min(effectivePage + 1, totalPages))
          }
          style={{
            padding: "6px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            background: "#ffffff",
            cursor: isLastPage ? "not-allowed" : "pointer",
            opacity: isLastPage ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
