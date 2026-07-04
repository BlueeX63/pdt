"use client";

import React, { useState } from "react";
import { IndianRupee, TrendingUp, Home, Clock, Wallet, PawPrint, Eye, X, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showFinancials, setShowFinancials] = useState(false);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("default", { month: "long" });

  let thisMonthRevenue = 0;
  let thisYearRevenue = 0;
  let allTimeRevenue = 0;
  let activeDogsCount = 0;
  let totalPendingDues = 0;

  const regIdsWithAdmissions = new Set(admissions.map((a) => a.registration_id));
  const dogsAdmittedThisYearSet = new Set<string>();

  // Calculate from Admissions
  admissions.forEach((a) => {
    if (!a.exit_date) {
      activeDogsCount++;
    }

    if (a.entry_date) {
      const entryDate = new Date(a.entry_date);
      if (entryDate.getFullYear() === currentYear) {
        dogsAdmittedThisYearSet.add(a.registration_id);
      }
    }

    const isPaid = a.payment_status === "Paid" || a.payment_status?.toLowerCase() === "paid";
    const billed = Number(a.billed_amount) || 0;
    const advance = Number(a.advance_amount) || 0;
    
    // Amount paid to us for this visit
    const paidForVisit = isPaid ? (billed > 0 ? billed : advance) : advance;
    allTimeRevenue += paidForVisit;

    // Check if admission is in current month or year
    if (a.entry_date) {
      const entryDate = new Date(a.entry_date);
      if (entryDate.getFullYear() === currentYear) {
        thisYearRevenue += paidForVisit;
        if (entryDate.getMonth() === currentMonth) {
          thisMonthRevenue += paidForVisit;
        }
      }
    }

    // Unpaid due
    if (!isPaid && billed > advance) {
      totalPendingDues += (billed - advance);
    }
  });

  // Calculate from Registrations without admissions (initial registrations)
  registrations.forEach((r) => {
    if (r.created_at) {
      const regDate = new Date(r.created_at);
      if (regDate.getFullYear() === currentYear) {
        dogsAdmittedThisYearSet.add(r.id);
      }
    }

    if (!regIdsWithAdmissions.has(r.id)) {
      const advance = Number(r.advance_amount) || 0;
      allTimeRevenue += advance;

      if (r.created_at) {
        const regDate = new Date(r.created_at);
        if (regDate.getFullYear() === currentYear) {
          thisYearRevenue += advance;
          if (regDate.getMonth() === currentMonth) {
            thisMonthRevenue += advance;
          }
        }
      }
    }

    const due = Number(r.due_amount) || 0;
    if (due > 0) {
      totalPendingDues += due;
    }
  });

  const dogsAdmittedThisYearCount = dogsAdmittedThisYearSet.size;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Top action bar with Financial Overview button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PawPrint size={18} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Operational Overview
          </span>
        </div>

        <button
          onClick={() => setShowFinancials(true)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
            fontWeight: 500,
            fontSize: "0.8125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            boxShadow: "var(--shadow-xs)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.boxShadow = "var(--shadow-xs)";
          }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
            <IndianRupee size={13} />
          </div>
          <span>View Financial Stats</span>
          <Eye size={14} style={{ color: "var(--text-tertiary)", marginLeft: "0.15rem" }} />
        </button>
      </div>

      {/* 2 Operational Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {/* Card 1: Currently Staying */}
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xs)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Active Dogs
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <Home size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {activeDogsCount} {activeDogsCount === 1 ? "Dog" : "Dogs"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "0.25rem" }}>
              Currently staying in hostel/training
            </div>
          </div>
        </div>

        {/* Card 2: Admitted This Year */}
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xs)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Admitted in {currentYear}
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(99, 102, 241, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <Calendar size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {dogsAdmittedThisYearCount} {dogsAdmittedThisYearCount === 1 ? "Dog" : "Dogs"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "0.25rem" }}>
              Total dogs admitted in {currentYear}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats Modal */}
      <AnimatePresence>
        {showFinancials && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
            onClick={() => setShowFinancials(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "var(--bg-primary)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                width: "100%",
                maxWidth: "600px",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                position: "relative",
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                      <IndianRupee size={18} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      Financial Overview
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
                    Confidential revenue, annual collection, and pending fee records.
                  </p>
                </div>
                <button
                  onClick={() => setShowFinancials(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                  }}
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Financial Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                {/* 1. This Month's Revenue */}
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.125rem",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {monthName} {currentYear}
                    </span>
                    <TrendingUp size={16} style={{ color: "#10b981" }} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", letterSpacing: "-0.02em" }}>
                    ₹{thisMonthRevenue.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                    Revenue collected this month
                  </div>
                </div>

                {/* 2. One Year Collection */}
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.125rem",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {currentYear} Total Collection
                    </span>
                    <Calendar size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    ₹{thisYearRevenue.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                    Total revenue in {currentYear}
                  </div>
                </div>

                {/* 3. Pending Dues */}
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.125rem",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Pending Dues
                    </span>
                    <Clock size={16} style={{ color: "#ef4444" }} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: totalPendingDues > 0 ? "#ef4444" : "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    ₹{totalPendingDues.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                    Unpaid remaining balances
                  </div>
                </div>

                {/* 4. All-Time Collection */}
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.125rem",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      All-Time Collection
                    </span>
                    <Wallet size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    ₹{allTimeRevenue.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                    Cumulative fees &amp; advance
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                  <AlertCircle size={14} />
                  <span>Only visible to authorized administrators</span>
                </div>
                <button
                  onClick={() => setShowFinancials(false)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--accent)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
