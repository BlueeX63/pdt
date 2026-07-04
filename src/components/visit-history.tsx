"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Calendar, Loader2, Edit2, LogOut, LogIn, Clock, CheckCircle2, X } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import {
  getAdmissions,
  createAdmission,
  deleteAdmission,
  updateAdmission,
} from "@/app/actions";
import { AdmissionValues } from "@/lib/schemas";

interface Admission {
  id: string;
  registration_id: string;
  entry_date: string;
  entry_time?: string | null;
  exit_date?: string | null;
  exit_time?: string | null;
  notes?: string | null;
}

const calculateDays = (start: string, end?: string | null) => {
  if (!start) return 0;
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = end ? new Date(end) : new Date();
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeStr?: string | null) => {
  if (!timeStr) return "";
  try {
    const [partsHours, partsMins] = timeStr.split(":");
    let hours = parseInt(partsHours, 10);
    const mins = partsMins;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${mins} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export default function VisitHistory({
  registrationId,
  perDayCharges = 0,
}: {
  registrationId: string;
  perDayCharges?: number;
}) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [exitTime, setExitTime] = useState("");
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editEntryTime, setEditEntryTime] = useState("");
  const [editExitDate, setEditExitDate] = useState("");
  const [editExitTime, setEditExitTime] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentTimeStr = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await getAdmissions(registrationId);
    if (error) {
      console.error("Failed to fetch admissions:", error);
    } else if (data) {
      setAdmissions(data as Admission[]);
    }
    setIsLoading(false);
  }, [registrationId]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const activeVisit = admissions.find((a) => !a.exit_date);
  const pastVisits = admissions.filter((a) => !!a.exit_date);

  const totalDaysAllStays = admissions.reduce((acc, visit) => {
    return acc + calculateDays(visit.entry_date, visit.exit_date);
  }, 0);
  const totalAmountAllStays = totalDaysAllStays * perDayCharges;

  const handleCreateCheckIn = async () => {
    if (!entryDate) return;

    setIsSubmitting(true);
    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: entryDate,
      entry_time: entryTime || null,
      exit_date: exitDate || null,
      exit_time: exitTime || null,
      notes: null,
    };

    const res = await createAdmission(payload);
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to save stay: " + res.error);
      return;
    }

    setIsAdding(false);
    setEntryDate("");
    setEntryTime("");
    setExitDate("");
    setExitTime("");
    fetchAdmissions();
  };

  const handleQuickCheckOut = async (visit: Admission) => {
    if (!checkoutDate) return;

    setIsSubmitting(true);
    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: visit.entry_date,
      entry_time: visit.entry_time || null,
      exit_date: checkoutDate,
      exit_time: checkoutTime || null,
      notes: visit.notes || null,
    };

    const res = await updateAdmission(visit.id, payload);
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to record check-out: " + res.error);
      return;
    }

    setIsCheckingOut(false);
    setCheckoutDate("");
    setCheckoutTime("");
    fetchAdmissions();
  };

  const handleUpdateEdit = async (id: string) => {
    if (!editEntryDate) return;

    setIsSubmitting(true);
    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: editEntryDate,
      entry_time: editEntryTime || null,
      exit_date: editExitDate || null,
      exit_time: editExitTime || null,
      notes: null,
    };

    const res = await updateAdmission(id, payload);
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to update visit: " + res.error);
      return;
    }

    setEditingId(null);
    fetchAdmissions();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stay record?")) {
      await deleteAdmission(id);
      fetchAdmissions();
    }
  };

  const startEdit = (admission: Admission) => {
    setEditingId(admission.id);
    setEditEntryDate(admission.entry_date);
    setEditEntryTime(admission.entry_time || "");
    setEditExitDate(admission.exit_date || "");
    setEditExitTime(admission.exit_time || "");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.detailSection} style={{ borderTop: "2px solid var(--border-secondary)", paddingTop: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <h3 className={styles.detailSectionTitle} style={{ marginBottom: 0 }}>
          Dog School / Hostel Stays
        </h3>
        {!isAdding && (
          <button
            className={styles.buttonAccent}
            onClick={() => {
              setIsAdding(true);
              setEntryDate(todayStr);
              setEntryTime(getCurrentTimeStr());
              setExitDate("");
              setExitTime("");
            }}
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Plus size={14} /> Check In Dog
          </button>
        )}
      </div>

      {admissions.length > 0 && !isLoading && (
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.8rem",
            marginBottom: "0.85rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-tertiary)" }}>Total Stays:</span>{" "}
            <strong>{admissions.length}</strong>
            <span style={{ margin: "0 0.5rem", color: "var(--border-secondary)" }}>|</span>
            <span style={{ color: "var(--text-tertiary)" }}>Total Stay Days:</span>{" "}
            <strong>{totalDaysAllStays} day(s)</strong>
          </div>
          <div>
            <span style={{ color: "var(--text-tertiary)" }}>Rate/Day:</span>{" "}
            <strong>₹{perDayCharges.toLocaleString("en-IN")}</strong>
            <span style={{ margin: "0 0.5rem", color: "var(--border-secondary)" }}>|</span>
            <span style={{ color: "var(--text-tertiary)" }}>Total Stays Amount:</span>{" "}
            <strong style={{ color: "var(--success)", fontSize: "0.95rem" }}>
              ₹{totalAmountAllStays.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          
          {/* Active Stay Card */}
          {activeVisit && (
            <div
              style={{
                padding: "0.85rem",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--success)",
                backgroundColor: "var(--success-light)",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success)" }} />
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                    Currently at School
                  </strong>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button className={styles.actionButton} onClick={() => startEdit(activeVisit)} title="Edit Stay">
                    <Edit2 size={13} />
                  </button>
                  <button className={`${styles.actionButton} ${styles.actionButtonDelete}`} onClick={() => handleDelete(activeVisit.id)} title="Delete Stay">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <Clock size={13} className="text-emerald-600" />
                <span>
                  In: <strong>{formatDate(activeVisit.entry_date)}</strong>
                  {activeVisit.entry_time ? ` at ${formatTime(activeVisit.entry_time)}` : ""}
                </span>
                <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 600 }}>
                  Day {calculateDays(activeVisit.entry_date)}
                </span>
                <span style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 600 }}>
                  Amount: ₹{(calculateDays(activeVisit.entry_date) * perDayCharges).toLocaleString("en-IN")}
                </span>
              </div>

              {editingId === activeVisit.id ? (
                <div style={{ padding: "0.65rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <label className={styles.detailLabel}>In Date</label>
                      <input type="date" value={editEntryDate} onChange={(e) => setEditEntryDate(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label className={styles.detailLabel}>In Time</label>
                      <input type="time" value={editEntryTime} onChange={(e) => setEditEntryTime(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label className={styles.detailLabel}>Out Date</label>
                      <input type="date" value={editExitDate} onChange={(e) => setEditExitDate(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label className={styles.detailLabel}>Out Time</label>
                      <input type="time" value={editExitTime} onChange={(e) => setEditExitTime(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                    <button className={styles.buttonGhost} onClick={() => setEditingId(null)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Cancel</button>
                    <button className={styles.buttonAccent} onClick={() => handleUpdateEdit(activeVisit.id)} disabled={isSubmitting} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Save</button>
                  </div>
                </div>
              ) : !isCheckingOut ? (
                <button
                  onClick={() => {
                    setIsCheckingOut(true);
                    setCheckoutDate(todayStr);
                    setCheckoutTime(getCurrentTimeStr());
                  }}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--success)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  <LogOut size={14} className="text-emerald-600" />
                  Record Check-Out (Dog Picked Up)
                </button>
              ) : (
                <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Check-Out Date & Time:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.5rem" }}>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      style={{
                        padding: "0.35rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <input
                      type="time"
                      value={checkoutTime}
                      onChange={(e) => setCheckoutTime(e.target.value)}
                      style={{
                        padding: "0.35rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                    <button onClick={() => setIsCheckingOut(false)} className={styles.buttonGhost} style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}>
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuickCheckOut(activeVisit)}
                      disabled={!checkoutDate || isSubmitting}
                      style={{
                        padding: "0.35rem 0.75rem",
                        backgroundColor: "var(--success)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {isSubmitting ? "Saving..." : <><CheckCircle2 size={13} /> Confirm Check-Out</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Check-In Form Modal */}
          {isAdding && (
            <div
              style={{
                padding: "0.85rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--accent)",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <LogIn size={15} className="text-indigo-500" />
                New Stay Check-In
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label className={styles.detailLabel}>In Date *</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className={styles.detailLabel}>In Time</label>
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label className={styles.detailLabel}>Out Date (Optional)</label>
                  <input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className={styles.detailLabel}>Out Time</label>
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.2rem" }}>
                <button className={styles.buttonGhost} onClick={() => setIsAdding(false)} style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>
                  Cancel
                </button>
                <button className={styles.buttonAccent} onClick={handleCreateCheckIn} disabled={!entryDate || isSubmitting} style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>
                  {isSubmitting ? "Saving..." : "Save Stay"}
                </button>
              </div>
            </div>
          )}

          {/* Past Stays List */}
          {pastVisits.length > 0 && (
            <div style={{ marginTop: "0.25rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
                Completed Stays ({pastVisits.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {pastVisits.map((visit) => (
                  <div
                    key={visit.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      padding: "0.65rem",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    {editingId === visit.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                          <div>
                            <label className={styles.detailLabel}>In Date</label>
                            <input type="date" value={editEntryDate} onChange={(e) => setEditEntryDate(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                          </div>
                          <div>
                            <label className={styles.detailLabel}>In Time</label>
                            <input type="time" value={editEntryTime} onChange={(e) => setEditEntryTime(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                          </div>
                          <div>
                            <label className={styles.detailLabel}>Out Date</label>
                            <input type="date" value={editExitDate} onChange={(e) => setEditExitDate(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                          </div>
                          <div>
                            <label className={styles.detailLabel}>Out Time</label>
                            <input type="time" value={editExitTime} onChange={(e) => setEditExitTime(e.target.value)} style={{ width: "100%", padding: "0.3rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                          <button className={styles.buttonGhost} onClick={() => setEditingId(null)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Cancel</button>
                          <button className={styles.buttonAccent} onClick={() => handleUpdateEdit(visit.id)} disabled={isSubmitting} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", padding: "0.35rem", borderRadius: "50%" }}>
                            <Calendar size={13} />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)" }}>
                              {formatDate(visit.entry_date)} {visit.entry_time ? `(${formatTime(visit.entry_time)})` : ""}
                              {" → "}
                              {visit.exit_date ? `${formatDate(visit.exit_date)} ${visit.exit_time ? `(${formatTime(visit.exit_time)})` : ""}` : "Present"}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.75rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                              <span>Duration: <strong>{calculateDays(visit.entry_date, visit.exit_date)} day(s)</strong></span>
                              <span>Rate: <strong>₹{perDayCharges}/day</strong></span>
                              <span style={{ color: "var(--success)", fontWeight: 600 }}>Amount: ₹{(calculateDays(visit.entry_date, visit.exit_date) * perDayCharges).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionButton} onClick={() => startEdit(visit)} title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button className={`${styles.actionButton} ${styles.actionButtonDelete}`} onClick={() => handleDelete(visit.id)} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {admissions.length === 0 && !isAdding && (
            <div
              style={{
                textAlign: "center",
                padding: "1.25rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                border: "1px dashed var(--border-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              No stays recorded. Click &ldquo;Check In Dog&rdquo; above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
