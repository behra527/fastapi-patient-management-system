
type AppHeaderProps = {
  error: string;
  loading: boolean;
  onLogout: () => void;
};

export default function AppHeader({
  error,
  loading,
  onLogout,
}: AppHeaderProps) {
  const statusColor = error
    ? "#b91c1c"
    : loading
      ? "#a16207"
      : "#15803d";

  const statusDotColor = error
    ? "#ef4444"
    : loading
      ? "#eab308"
      : "#22c55e";

  const statusText = error
    ? "Backend Connection Error"
    : loading
      ? "Connecting to FastAPI..."
      : "FastAPI Connected";

  return (
    <header className="topbar">
      <div className="breadcrumb">
        Clinical Workspace <span>/</span>{" "}
        <strong>Patients &amp; Directory</strong>
      </div>

      <div
        className="status"
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: 500,
          color: statusColor,
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            flexShrink: 0,
            borderRadius: "50%",
            background: statusDotColor,
            boxShadow: error
              ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
              : undefined,
          }}
          aria-hidden="true"
        />
        {statusText}
      </div>

      <button
        type="button"
        onClick={onLogout}
        style={{
          padding: "9px 14px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          background: "#ffffff",
          color: "#b91c1c",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </header>
  );
}
