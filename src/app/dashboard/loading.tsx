import React from "react";
import { PawPrint, Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border-primary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <div style={{ width: "220px", height: "24px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.4rem", marginBottom: "0.5rem" }} />
            <div style={{ width: "140px", height: "16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border-primary)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <div style={{ width: "250px", height: "36px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.5rem" }} />
          <div style={{ width: "120px", height: "36px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.5rem" }} />
        </div>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "var(--bg-primary)", borderRadius: "0.75rem", border: "1px solid var(--border-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)" }} />
              <div>
                <div style={{ width: "140px", height: "18px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem", marginBottom: "0.3rem" }} />
                <div style={{ width: "90px", height: "14px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.3rem" }} />
              </div>
            </div>
            <div style={{ width: "100px", height: "24px", backgroundColor: "var(--bg-tertiary)", borderRadius: "1rem" }} />
            <div style={{ width: "90px", height: "32px", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.5rem" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
