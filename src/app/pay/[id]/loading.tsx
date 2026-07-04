import React from "react";
import { PawPrint, Loader2 } from "lucide-react";

export default function InvoiceLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-secondary)", borderRadius: "1.25rem", border: "1px solid var(--border-primary)", padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", boxShadow: "var(--shadow-xl)" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ width: "220px", height: "24px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.4rem" }} />
          <div style={{ width: "160px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
        </div>
        <div style={{ width: "100%", height: "200px", backgroundColor: "var(--bg-primary)", borderRadius: "0.75rem", border: "1px solid var(--border-primary)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "120px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
              <div style={{ width: "80px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
