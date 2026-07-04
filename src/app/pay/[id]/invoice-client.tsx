"use client";

import { useState } from "react";
import { PawPrint, CheckCircle2, ShieldCheck, CreditCard, QrCode, Smartphone, X, Loader2 } from "lucide-react";
import styles from "./page.module.css";
import { markAdmissionAsPaid } from "@/app/actions";

interface Admission {
  id: string;
  registration_id: string;
  entry_date: string;
  exit_date?: string | null;
  payment_status?: string | null;
  invoice_no?: string | null;
  billed_amount?: number | null;
  advance_amount?: number | null;
  [key: string]: unknown;
}

interface Registration {
  id: string;
  owner_name: string;
  phone: string;
  email?: string;
  dog_name: string;
  breed?: string;
  address?: string;
  city?: string;
  per_day_hostel_charges?: string;
  [key: string]: unknown;
}

export default function InvoicePaymentClient({
  admission,
  registration,
}: {
  admission: Admission;
  registration: Registration;
}) {
  const [isPaid, setIsPaid] = useState(admission.payment_status === "PAID");
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState<"UPI" | "CARD" | "NET">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate days
  const calculateDays = (start: string, end?: string | null) => {
    if (!start) return 1;
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = end ? new Date(end) : new Date();
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  const days = calculateDays(admission.entry_date, admission.exit_date);
  const rate = Number(registration.per_day_hostel_charges) || 500;
  const totalBill = Number(admission.billed_amount) || days * rate;
  const advance = Number(admission.advance_amount) || 0;
  const amountDue = Math.max(0, totalBill - advance);
  const invoiceNo = admission.invoice_no || `INV-${admission.id.slice(0, 8).toUpperCase()}`;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 1500));
    const result = await markAdmissionAsPaid(admission.id, "PAID");
    setIsProcessing(false);
    if (result.error) {
      alert(result.error);
    } else {
      setIsPaid(true);
      setShowModal(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.invoiceCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.schoolInfo}>
            <h1>
              <PawPrint size={24} />
              Prakash Dog Training School
            </h1>
            <p>Dog Training & Hostel Services</p>
          </div>
          <div className={styles.invoiceMeta}>
            <div className={styles.invoiceNo}>{invoiceNo}</div>
            <div className={styles.date}>
              Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.infoBlock}>
              <div className={styles.sectionTitle}>Billed To (Owner)</div>
              <h3>{registration.owner_name}</h3>
              <p>Phone: {registration.phone}</p>
              {registration.email && <p>Email: {registration.email}</p>}
              {registration.city && <p>{registration.address}, {registration.city}</p>}
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.sectionTitle}>Dog Details</div>
              <h3>{registration.dog_name}</h3>
              <p>Breed: {registration.breed || "Not specified"}</p>
              <p>Service: Hostel / Boarding Stay</p>
            </div>
          </div>

          <div className={styles.sectionTitle}>Stay Breakdown</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Duration</th>
                <th className={styles.right}>Rate/Day</th>
                <th className={styles.right}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Hostel Boarding Stay<br />
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    ({admission.entry_date} &rarr; {admission.exit_date || "Present"})
                  </span>
                </td>
                <td>{days} Day(s)</td>
                <td className={styles.right}>&#8377;{rate.toLocaleString("en-IN")}</td>
                <td className={styles.right}>&#8377;{totalBill.toLocaleString("en-IN")}</td>
              </tr>
              {advance > 0 && (
                <tr style={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
                  <td colSpan={3} style={{ fontWeight: 600, color: "#10b981" }}>
                    Advance Payment Already Made
                  </td>
                  <td className={styles.right} style={{ fontWeight: 600, color: "#10b981" }}>
                    &minus;&#8377;{advance.toLocaleString("en-IN")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className={styles.totalRow}>
            <div>
              <div className={styles.totalLabel}>Remaining Amount Due</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {advance > 0 ? `Total: ₹${totalBill} | Advance: ₹${advance}` : "Inclusive of all taxes"}
              </div>
            </div>
            <div className={`${styles.totalValue} ${isPaid || amountDue === 0 ? styles.statusPaid : styles.statusUnpaid}`}>
              &#8377;{amountDue.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Payment Action */}
          {isPaid || amountDue === 0 ? (
            <div className={styles.paidBanner}>
              <CheckCircle2 size={24} />
              <span>{amountDue === 0 && !isPaid ? "ADVANCE COVERED FULL AMOUNT &mdash; PAID!" : "INVOICE PAID &mdash; THANK YOU!"}</span>
            </div>
          ) : (
            <div>
              <button className={styles.payBtn} onClick={() => setShowModal(true)}>
                <ShieldCheck size={20} />
                Pay Online Now (&#8377;{amountDue.toLocaleString("en-IN")})
              </button>
              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
                Secure 256-bit encrypted payment gateway. Supports UPI, Cards, and NetBanking.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Select Payment Method</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.paymentMethods}>
              <button
                className={`${styles.methodBtn} ${method === "UPI" ? styles.methodBtnActive : ""}`}
                onClick={() => setMethod("UPI")}
              >
                <QrCode size={18} style={{ margin: "0 auto 4px" }} />
                UPI / QR
              </button>
              <button
                className={`${styles.methodBtn} ${method === "CARD" ? styles.methodBtnActive : ""}`}
                onClick={() => setMethod("CARD")}
              >
                <CreditCard size={18} style={{ margin: "0 auto 4px" }} />
                Card
              </button>
              <button
                className={`${styles.methodBtn} ${method === "NET" ? styles.methodBtnActive : ""}`}
                onClick={() => setMethod("NET")}
              >
                <Smartphone size={18} style={{ margin: "0 auto 4px" }} />
                NetBanking
              </button>
            </div>

            {method === "UPI" && (
              <div className={styles.qrContainer}>
                <div className={styles.qrCode} />
                <span className={styles.qrText}>Scan with GPay, PhonePe, or Paytm</span>
              </div>
            )}

            {method === "CARD" && (
              <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Card Number (4242 ...)"
                  defaultValue="4242 4242 4242 4242"
                  style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-primary)", background: "var(--bg-primary)", color: "white" }}
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-primary)", background: "var(--bg-primary)", color: "white" }}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    defaultValue="123"
                    style={{ width: "80px", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-primary)", background: "var(--bg-primary)", color: "white" }}
                  />
                </div>
              </div>
            )}

            {method === "NET" && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-primary)", borderRadius: "0.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Select Bank: HDFC / ICICI / SBI / Axis (Simulated)
              </div>
            )}

            <button className={styles.confirmPayBtn} onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Loader2 size={18} className="animate-spin" /> Processing Payment...
                </span>
              ) : (
                `Complete Payment (Rs. ${amountDue.toLocaleString("en-IN")})`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
