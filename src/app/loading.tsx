import React from "react";
import { PawPrint, Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        gap: "1.25rem",
        padding: "2rem",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Loader2
          size={56}
          style={{
            position: "absolute",
            color: "var(--accent)",
            animation: "spin 1.5s linear infinite",
          }}
        />
        <PawPrint size={28} style={{ color: "var(--accent)" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            margin: "0 0 0.4rem 0",
            letterSpacing: "-0.01em",
          }}
        >
          Prakash Dog Training School
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          Loading application...
        </p>
      </div>
    </div>
  );
}
