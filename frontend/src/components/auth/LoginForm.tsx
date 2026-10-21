"use client";

import type { FormEvent } from "react";

type LoginFormProps = {
  username: string;
  password: string;
  loading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <main
      className="dashboard"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px",
            color: "#0f172a",
          }}
        >
          AuraHealth
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#64748b",
          }}
        >
          Sign in to manage patient records.
        </p>

        <label
          htmlFor="login-username"
          style={{
            display: "block",
            marginBottom: "6px",
            color: "#334155",
          }}
        >
          Username
        </label>

        <input
          id="login-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
          }}
        />

        <label
          htmlFor="login-password"
          style={{
            display: "block",
            marginBottom: "6px",
            color: "#334155",
          }}
        >
          Password
        </label>

        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              color: "#b91c1c",
              fontSize: "14px",
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: 0,
            borderRadius: "8px",
            background: "#0f766e",
            color: "#ffffff",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
