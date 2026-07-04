"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import {
  getAdmissions,
  createAdmission,
  deleteAdmission,
  updateAdmission,
  markAdmissionAsPaid,
  sendInvoiceNotification,
} from "@/app/actions";
import { AdmissionValues } from "@/lib/schemas";
import { Plus, Trash2, Calendar, Loader2, Edit2, LogOut, LogIn, Clock, CheckCircle2, X, Share2, ShieldCheck, Copy, Check, MessageSquare, Mail, ExternalLink } from "lucide-react";

interface Admission {
  id: string;
  registration_id: string;
  entry_date: string;
  entry_time?: string | null;
  exit_date?: string | null;
  exit_time?: string | null;
  notes?: string | null;
  payment_status?: string | null;
  invoice_no?: string | null;
  billed_amount?: number | null;
  advance_amount?: number | null;
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
  const [advanceInput, setAdvanceInput] = useState("");
  const [newStatusVal, setNewStatusVal] = useState("UNPAID");
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [checkoutAdvance, setCheckoutAdvance] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("UNPAID");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editEntryTime, setEditEntryTime] = useState("");
  const [editExitDate, setEditExitDate] = useState("");
  const [editExitTime, setEditExitTime] = useState("");
  const [editAdvance, setEditAdvance] = useState("");
  const [editStatus, setEditStatus] = useState("UNPAID");

  const [advanceModalVisit, setAdvanceModalVisit] = useState<Admission | null>(null);
  const [quickAdvanceVal, setQuickAdvanceVal] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingAuto, setResendingAuto] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<{
    id: string;
    invoiceNo: string;
    amount: number;
    smsText: string;
    emailSubject: string;
    emailBody: string;
    phone: string;
    email: string;
    autoDispatched?: boolean;
    autoDispatchMsg?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
      payment_status: newStatusVal,
      advance_amount: Number(advanceInput) || 0,
    };

    const res = await createAdmission(payload);
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to save stay: " + res.error);
      return;
    }

    if (exitDate && res?.data?.id) {
      const notif = await sendInvoiceNotification(res.data.id);
      if (notif.success) {
        setInvoiceModalData({
          id: res.data.id,
          invoiceNo: notif.invoiceNo || `INV-${res.data.id.slice(0, 8).toUpperCase()}`,
          amount: notif.amount !== undefined ? notif.amount : 0,
          smsText: notif.smsText || "",
          emailSubject: notif.emailSubject || "",
          emailBody: notif.emailBody || "",
          phone: notif.phone || "",
          email: notif.email || "",
          autoDispatched: notif.autoDispatched || true,
          autoDispatchMsg: notif.autoDispatchMsg || `Invoice automatically sent to SMS (${notif.phone}) and Email (${notif.email || "N/A"})`,
        });
      }
    }

    setIsAdding(false);
    setEntryDate("");
    setEntryTime("");
    setExitDate("");
    setExitTime("");
    setAdvanceInput("");
    setNewStatusVal("UNPAID");
    fetchAdmissions();
  };

  const handleQuickCheckOut = async (visit: Admission) => {
    if (!checkoutDate) return;

    setIsSubmitting(true);
    const days = calculateDays(visit.entry_date, checkoutDate);
    const amount = days * perDayCharges;
    const adv = Number(checkoutAdvance) || 0;
    const amountDue = Math.max(0, amount - adv);
    const invNo = visit.invoice_no || `INV-${visit.id.slice(0, 8).toUpperCase()}`;
    const newStatus = checkoutStatus;

    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: visit.entry_date,
      entry_time: visit.entry_time || null,
      exit_date: checkoutDate,
      exit_time: checkoutTime || null,
      notes: visit.notes || null,
      payment_status: newStatus,
      invoice_no: invNo,
      billed_amount: amount,
      advance_amount: adv,
    };

    const res = await updateAdmission(visit.id, payload);
    if (res?.error) {
      setIsSubmitting(false);
      alert("Failed to record check-out: " + res.error);
      return;
    }

    const notif = await sendInvoiceNotification(visit.id);
    setIsSubmitting(false);

    setIsCheckingOut(false);
    setCheckoutDate("");
    setCheckoutTime("");
    setCheckoutAdvance("");
    setCheckoutStatus("UNPAID");
    fetchAdmissions();

    if (notif.success) {
      setInvoiceModalData({
        id: visit.id,
        invoiceNo: notif.invoiceNo || invNo,
        amount: notif.amount !== undefined ? notif.amount : amountDue,
        smsText: notif.smsText || "",
        emailSubject: notif.emailSubject || "",
        emailBody: notif.emailBody || "",
        phone: notif.phone || "",
        email: notif.email || "",
        autoDispatched: notif.autoDispatched || true,
        autoDispatchMsg: notif.autoDispatchMsg || `Invoice automatically sent to SMS (${notif.phone}) and Email (${notif.email || "N/A"})`,
      });
    }
  };

  const handleUpdateEdit = async (id: string) => {
    if (!editEntryDate) return;

    setIsSubmitting(true);
    const days = calculateDays(editEntryDate, editExitDate);
    const amount = days * perDayCharges;
    const adv = Number(editAdvance) || 0;
    const visit = admissions.find((a) => a.id === id);
    const invNo = visit?.invoice_no || `INV-${id.slice(0, 8).toUpperCase()}`;
    const newStatus = editStatus;

    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: editEntryDate,
      entry_time: editEntryTime || null,
      exit_date: editExitDate || null,
      exit_time: editExitTime || null,
      notes: visit?.notes || null,
      payment_status: newStatus,
      invoice_no: invNo,
      billed_amount: amount,
      advance_amount: adv,
    };

    const res = await updateAdmission(id, payload);
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to update visit: " + res.error);
      return;
    }

    if (!visit?.exit_date && editExitDate) {
      const notif = await sendInvoiceNotification(id);
      if (notif.success) {
        setInvoiceModalData({
          id: id,
          invoiceNo: notif.invoiceNo || invNo,
          amount: notif.amount !== undefined ? notif.amount : Math.max(0, amount - adv),
          smsText: notif.smsText || "",
          emailSubject: notif.emailSubject || "",
          emailBody: notif.emailBody || "",
          phone: notif.phone || "",
          email: notif.email || "",
          autoDispatched: notif.autoDispatched || true,
          autoDispatchMsg: notif.autoDispatchMsg || `Invoice automatically sent to SMS (${notif.phone}) and Email (${notif.email || "N/A"})`,
        });
      }
    }

    setEditingId(null);
    fetchAdmissions();
  };

  const handleSaveAdvance = async () => {
    if (!advanceModalVisit) return;
    setIsSubmitting(true);
    const newAdvance = Number(quickAdvanceVal) || 0;
    const days = calculateDays(advanceModalVisit.entry_date, advanceModalVisit.exit_date);
    const totalBill = Number(advanceModalVisit.billed_amount) || days * perDayCharges;
    const newStatus = advanceModalVisit.payment_status || "UNPAID";

    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: advanceModalVisit.entry_date,
      entry_time: advanceModalVisit.entry_time || null,
      exit_date: advanceModalVisit.exit_date || null,
      exit_time: advanceModalVisit.exit_time || null,
      notes: advanceModalVisit.notes || null,
      payment_status: newStatus,
      invoice_no: advanceModalVisit.invoice_no || `INV-${advanceModalVisit.id.slice(0, 8).toUpperCase()}`,
      billed_amount: totalBill,
      advance_amount: newAdvance,
    };

    const res = await updateAdmission(advanceModalVisit.id, payload);
    setIsSubmitting(false);
    if (res?.error) {
      alert("Failed to update advance payment: " + res.error);
    } else {
      setAdvanceModalVisit(null);
      fetchAdmissions();
    }
  };

  const handleShareInvoice = async (visit: Admission) => {
    setIsSubmitting(true);
    const notif = await sendInvoiceNotification(visit.id);
    setIsSubmitting(false);
    if (notif.success) {
      const days = calculateDays(visit.entry_date, visit.exit_date);
      const totalBill = Number(visit.billed_amount) || days * perDayCharges;
      const adv = Number(visit.advance_amount) || 0;
      const amountDue = Math.max(0, totalBill - adv);
      const invNo = visit.invoice_no || `INV-${visit.id.slice(0, 8).toUpperCase()}`;
      setInvoiceModalData({
        id: visit.id,
        invoiceNo: notif.invoiceNo || invNo,
        amount: notif.amount !== undefined ? notif.amount : amountDue,
        smsText: notif.smsText || "",
        emailSubject: notif.emailSubject || "",
        emailBody: notif.emailBody || "",
        phone: notif.phone || "",
        email: notif.email || "",
        autoDispatched: notif.autoDispatched || true,
        autoDispatchMsg: notif.autoDispatchMsg || `Invoice automatically sent to SMS (${notif.phone}) and Email (${notif.email || "N/A"})`,
      });
    } else {
      alert("Failed to generate notification: " + notif.error);
    }
  };

  const handleTogglePayment = async (visit: Admission) => {
    const newStatus = visit.payment_status === "PAID" ? "UNPAID" : "PAID";
    setIsSubmitting(true);
    const res = await markAdmissionAsPaid(visit.id, newStatus);
    setIsSubmitting(false);
    if (res?.error) {
      alert(res.error);
    } else {
      fetchAdmissions();
    }
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
    setEditAdvance(String(admission.advance_amount || 0));
    setEditStatus(admission.payment_status || "UNPAID");
  };

  const renderStayCard = (visit: Admission, isActive: boolean) => {
    const days = calculateDays(visit.entry_date, visit.exit_date);
    const totalBill = Number(visit.billed_amount) || days * perDayCharges;
    const advance = Number(visit.advance_amount) || 0;
    const amountDue = Math.max(0, totalBill - advance);
    const isPaid = visit.payment_status === "PAID";

    return (
      <div
        key={visit.id}
        style={{
          border: isActive ? "2px solid var(--success)" : "1px solid var(--border-secondary)",
          borderRadius: "var(--radius-md)",
          backgroundColor: isActive ? "var(--success-light)" : "var(--bg-primary)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          boxShadow: "var(--shadow-sm)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                backgroundColor: isActive ? "var(--success)" : "var(--bg-tertiary)",
                color: isActive ? "white" : "var(--text-secondary)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {formatDate(visit.entry_date)} {visit.entry_time ? `(${formatTime(visit.entry_time)})` : ""}
                {" → "}
                {visit.exit_date ? (
                  `${formatDate(visit.exit_date)} ${visit.exit_time ? `(${formatTime(visit.exit_time)})` : ""}`
                ) : (
                  <span style={{ color: "var(--success)", fontWeight: 800 }}>Currently at School</span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <span>Duration: <strong style={{ color: "var(--text-primary)" }}>{days} Day(s)</strong></span>
                <span>Rate: <strong style={{ color: "var(--text-primary)" }}>₹{perDayCharges}/day</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <button
              className={styles.actionButton}
              onClick={() => handleShareInvoice(visit)}
              title="Share Invoice & Pay Link"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", width: "auto", backgroundColor: "var(--bg-tertiary)" }}
            >
              <Share2 size={14} className="text-indigo-500" />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>Invoice</span>
            </button>
            <button className={styles.actionButton} onClick={() => startEdit(visit)} title="Edit Stay Details">
              <Edit2 size={14} />
            </button>
            <button className={`${styles.actionButton} ${styles.actionButtonDelete}`} onClick={() => handleDelete(visit.id)} title="Delete Stay">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Middle Financial Breakdown Grid */}
        <div
          style={{
            backgroundColor: isActive ? "rgba(255, 255, 255, 0.7)" : "var(--bg-secondary)",
            border: "1px solid var(--border-secondary)",
            borderRadius: "var(--radius-sm)",
            padding: "0.85rem 1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Total Bill</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.15rem" }}>
              ₹{totalBill.toLocaleString("en-IN")}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Advance Paid</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: advance > 0 ? "#10b981" : "var(--text-muted)" }}>
                ₹{advance.toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => {
                  setAdvanceModalVisit(visit);
                  setQuickAdvanceVal(String(advance || ""));
                }}
                title="Edit Advance Payment"
                style={{
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.7rem",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontWeight: 700,
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {advance > 0 ? "Edit" : "+ Add Advance"}
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Remaining Due</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isPaid ? "#10b981" : "#ef4444", marginTop: "0.15rem" }}>
              ₹{amountDue.toLocaleString("en-IN")}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => handleTogglePayment(visit)}
              title={isPaid ? "Click to Mark Unpaid" : "Click to Mark Paid"}
              style={{
                backgroundColor: isPaid ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: isPaid ? "#10b981" : "#f59e0b",
                border: "1.5px solid",
                borderColor: isPaid ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              {isPaid ? "✓ PAID (Click to change)" : "• UNPAID (Click to change)"}
            </button>
          </div>
        </div>

        {/* Edit Form (If editing this visit) */}
        {editingId === visit.id && (
          <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>Edit Stay Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
              <div>
                <label className={styles.detailLabel}>In Date</label>
                <input type="date" value={editEntryDate} onChange={(e) => setEditEntryDate(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className={styles.detailLabel}>In Time</label>
                <input type="time" value={editEntryTime} onChange={(e) => setEditEntryTime(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className={styles.detailLabel}>Out Date</label>
                <input type="date" value={editExitDate} onChange={(e) => setEditExitDate(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className={styles.detailLabel}>Out Time</label>
                <input type="time" value={editExitTime} onChange={(e) => setEditExitTime(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className={styles.detailLabel}>Advance Paid (₹)</label>
                <input type="number" value={editAdvance} onChange={(e) => setEditAdvance(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className={styles.detailLabel}>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: "100%", padding: "0.35rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem", marginTop: "0.2rem" }}>
              <button className={styles.buttonGhost} onClick={() => setEditingId(null)} style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>Cancel</button>
              <button className={styles.buttonAccent} onClick={() => handleUpdateEdit(visit.id)} disabled={isSubmitting} style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>Save Changes</button>
            </div>
          </div>
        )}

        {/* Check-Out Action Box (Only for Active Stay when not editing) */}
        {isActive && editingId !== visit.id && (
          !isCheckingOut ? (
            <button
              onClick={() => {
                setIsCheckingOut(true);
                setCheckoutDate(todayStr);
                setCheckoutTime(getCurrentTimeStr());
                setCheckoutAdvance(String(visit.advance_amount || 0));
                setCheckoutStatus(visit.payment_status || "UNPAID");
              }}
              style={{
                padding: "0.6rem 1rem",
                backgroundColor: "var(--bg-primary)",
                border: "1.5px solid var(--success)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={16} className="text-emerald-600" />
              Record Check-Out (Dog Picked Up) &amp; Generate Invoice
            </button>
          ) : (
            <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <CheckCircle2 size={16} className="text-emerald-600" />
                Confirm Check-Out &amp; Finalize Bill
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Check-Out Date *</label>
                  <input
                    type="date"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", marginTop: "0.2rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Check-Out Time</label>
                  <input
                    type="time"
                    value={checkoutTime}
                    onChange={(e) => setCheckoutTime(e.target.value)}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", marginTop: "0.2rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Advance Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={checkoutAdvance}
                    onChange={(e) => setCheckoutAdvance(e.target.value)}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", marginTop: "0.2rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Status</label>
                  <select
                    value={checkoutStatus}
                    onChange={(e) => setCheckoutStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", marginTop: "0.2rem" }}
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.2rem" }}>
                <button onClick={() => setIsCheckingOut(false)} className={styles.buttonGhost} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
                  Cancel
                </button>
                <button
                  onClick={() => handleQuickCheckOut(visit)}
                  disabled={!checkoutDate || isSubmitting}
                  style={{
                    padding: "0.4rem 0.85rem",
                    backgroundColor: "var(--success)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {isSubmitting ? "Processing..." : <><CheckCircle2 size={14} /> Complete Check-Out</>}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    );
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
          {activeVisit && renderStayCard(activeVisit, true)}

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
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
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
                <div>
                  <label className={styles.detailLabel}>Advance Paid (₹ - Optional)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={advanceInput}
                    onChange={(e) => setAdvanceInput(e.target.value)}
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
                  <label className={styles.detailLabel}>Status</label>
                  <select
                    value={newStatusVal}
                    onChange={(e) => setNewStatusVal(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
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

          {/* Completed Stays List */}
          {pastVisits.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
                Completed Stays ({pastVisits.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {pastVisits.map((visit) => renderStayCard(visit, false))}
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

      {/* Quick Advance Edit Modal */}
      {advanceModalVisit && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "1rem", width: "100%", maxWidth: "400px", padding: "1.5rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Update Advance Payment
              </h3>
              <button onClick={() => setAdvanceModalVisit(null)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Enter any advance amount paid by the owner for this stay. The remaining balance and payment status will be updated automatically.
            </p>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className={styles.detailLabel}>Advance Amount Paid (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={quickAdvanceVal}
                onChange={(e) => setQuickAdvanceVal(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "1rem", fontWeight: 600, marginTop: "0.25rem" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setAdvanceModalVisit(null)} className={styles.buttonGhost} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                Cancel
              </button>
              <button onClick={handleSaveAdvance} disabled={isSubmitting} className={styles.buttonAccent} style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem", fontWeight: 600 }}>
                {isSubmitting ? "Saving..." : "Save Advance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generated & Share Modal */}
      {invoiceModalData && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "1rem", width: "100%", maxWidth: "460px", padding: "1.75rem", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={22} className="text-emerald-500" />
                Share Invoice
              </h3>
              <button onClick={() => setInvoiceModalData(null)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: "var(--bg-primary)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border-primary)", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Invoice No:</span>
                <strong style={{ color: "var(--text-primary)" }}>{invoiceModalData.invoiceNo}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Amount Due:</span>
                <strong style={{ color: "#10b981" }}>&#8377;{invoiceModalData.amount.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <button
                onClick={async () => {
                  setResendingAuto(true);
                  await sendInvoiceNotification(invoiceModalData.id);
                  setResendingAuto(false);
                  setResendSuccess(true);
                  setTimeout(() => setResendSuccess(false), 3000);
                }}
                disabled={resendingAuto}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.85rem", backgroundColor: "var(--accent)", color: "#ffffff", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", boxShadow: "var(--shadow-sm)" }}
              >
                {resendingAuto ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending Email...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle2 size={18} style={{ color: "#ffffff" }} />
                    <span>Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    Send Automatic Email
                  </>
                )}
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
                <a
                  href={`sms:${invoiceModalData.phone}?body=${encodeURIComponent(invoiceModalData.smsText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.75rem 0.5rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  <MessageSquare size={15} className="text-blue-500" />
                  SMS App
                </a>

                <a
                  href={invoiceModalData.email ? `mailto:${invoiceModalData.email}?subject=${encodeURIComponent(invoiceModalData.emailSubject)}&body=${encodeURIComponent(invoiceModalData.emailBody)}` : `mailto:?subject=${encodeURIComponent(invoiceModalData.emailSubject)}&body=${encodeURIComponent(invoiceModalData.emailBody)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.75rem 0.5rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  <Mail size={15} className="text-indigo-500" />
                  Email App
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${invoiceModalData.emailSubject}\n\n${invoiceModalData.emailBody}`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  style={{ padding: "0.75rem 0.5rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "0.5rem", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  {copiedLink ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  {copiedLink ? "Copied!" : "Copy Text"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-primary)", paddingTop: "1rem" }}>
              <button onClick={() => setInvoiceModalData(null)} style={{ padding: "0.5rem 1.25rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", borderRadius: "0.5rem", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
