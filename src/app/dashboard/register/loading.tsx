import React from "react";
import { PawPrint, Loader2 } from "lucide-react";

export default function RegisterLoading() {
  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border-primary)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div style={{ width: "200px", height: "24px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.4rem", marginBottom: "0.5rem" }} />
          <div style={{ width: "140px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
        </div>
      </div>

      <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border-primary)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ width: "120px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
            <div style={{ width: "100%", height: "44px", backgroundColor: "var(--bg-primary)", borderRadius: "0.5rem", border: "1px solid var(--border-primary)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
