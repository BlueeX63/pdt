"use client";

import React from "react";
import { IndianRupee, TrendingUp, Home, Clock, Wallet } from "lucide-react";

interface Admission {
  id: string;
  registration_id: string;
  entry_date: string;
  exit_date?: string | null;
  payment_status?: string | null;
  billed_amount?: number | null;
  advance_amount?: number | null;
  [key: string]: unknown;
}

interface Registration {
  id: string;
  created_at: string;
  advance_amount?: number;
  due_amount?: number | string;
  total_amount?: number;
  [key: string]: unknown;
}

export default function DashboardStats({
  registrations,
  admissions,
}: {
  registrations: Registration[];
  admissions: Admission[];
}) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("default", { month: "long" });

  let thisMonthRevenue = 0;
  let allTimeRevenue = 0;
  let activeDogsCount = 0;
  let totalPendingDues = 0;

  const regIdsWithAdmissions = new Set(admissions.map((a) => a.registration_id));

  // Calculate from Admissions
  admissions.forEach((a) => {
    if (!a.exit_date) {
      activeDogsCount++;
    }

    const isPaid = a.payment_status === "Paid" || a.payment_status?.toLowerCase() === "paid";
    const billed = Number(a.billed_amount) || 0;
    const advance = Number(a.advance_amount) || 0;
    
    // Amount paid to us for this visit
    const paidForVisit = isPaid ? (billed > 0 ? billed : advance) : advance;
    allTimeRevenue += paidForVisit;

    // Check if admission is in current month
    if (a.entry_date) {
      const entryDate = new Date(a.entry_date);
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        thisMonthRevenue += paidForVisit;
      }
    }

    // Unpaid due
    if (!isPaid && billed > advance) {
      totalPendingDues += (billed - advance);
    }
  });

  // Calculate from Registrations without admissions (initial registrations)
  registrations.forEach((r) => {
    if (!regIdsWithAdmissions.has(r.id)) {
      const advance = Number(r.advance_amount) || 0;
      allTimeRevenue += advance;

      if (r.created_at) {
        const regDate = new Date(r.created_at);
        if (regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear) {
          thisMonthRevenue += advance;
        }
      }
    }

    const due = Number(r.due_amount) || 0;
    if (due > 0) {
      totalPendingDues += due;
    }
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "0.5rem" }}>
      {/* Card 1: This Month's Revenue */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "1rem",
          padding: "1.25rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {monthName} Revenue
          </span>
          <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
            <IndianRupee size={18} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            ₹{thisMonthRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#10b981", fontWeight: 600, marginTop: "0.25rem" }}>
            <TrendingUp size={14} />
            <span>Amount paid in {monthName} {currentYear}</span>
          </div>
        </div>
      </div>

      {/* Card 2: All-Time Revenue */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "1rem",
          padding: "1.25rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            All-Time Collection
          </span>
          <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", backgroundColor: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <Wallet size={18} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            ₹{allTimeRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "0.25rem" }}>
            Total fees &amp; advance received
          </div>
        </div>
      </div>

      {/* Card 3: Currently Staying */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "1rem",
          padding: "1.25rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Active Dogs
          </span>
          <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
            <Home size={18} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {activeDogsCount} {activeDogsCount === 1 ? "Dog" : "Dogs"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "0.25rem" }}>
            Currently staying in hostel/training
          </div>
        </div>
      </div>

      {/* Card 4: Pending Dues */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "1rem",
          padding: "1.25rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Pending Dues
          </span>
          <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <Clock size={18} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: totalPendingDues > 0 ? "#ef4444" : "var(--text-primary)", letterSpacing: "-0.03em" }}>
            ₹{totalPendingDues.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "0.25rem" }}>
            Total unpaid remaining amount
          </div>
        </div>
      </div>
    </div>
  );
}
