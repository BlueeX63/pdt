"use client";

import { useState } from "react";
import { Search, Edit2, Trash2, PawPrint, X, Eye } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { deleteRegistration } from "@/app/actions";
import VisitHistory from "./visit-history";

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
  dog_name: string;
  owner_name: string;
  status: string;
  breed?: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  landmark?: string | null;
  emergency_contact?: string | null;
  aadhar_card_no?: string | null;
  vaccination_card?: string | null;
  other_info?: string | null;
  appointment_time?: string | null;
  appointment_date?: string | null;
  city?: string;
  state?: string;
  dog_gender?: string;
  age?: string;
  colour?: string;
  dog_nature?: string;
  advance_amount?: number;
  due_amount?: number | string;
  total_amount?: number;
  per_day_hostel_charges?: number | string;
  owner_photo?: string;
  dog_photo?: string;
  serial_number?: string;
  requires_hostel?: boolean;
  requires_training?: boolean;
  what_to_learn?: string;
  main_issue?: string;
  pick_and_drop?: string;
  [key: string]: unknown;
}

export default function DashboardTable({
  initialData,
  initialAdmissions = [],
}: {
  initialData: Registration[];
  initialAdmissions?: Admission[];
}) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE">("ALL");
  const [selectedItem, setSelectedItem] = useState<Registration | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const activeRegistrationIds = new Set(
    initialAdmissions.filter((a) => !a.exit_date).map((a) => a.registration_id)
  );

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      item.dog_name?.toLowerCase().includes(term) ||
      item.owner_name?.toLowerCase().includes(term) ||
      item.serial_number?.toLowerCase().includes(term) ||
      item.phone?.toLowerCase().includes(term) ||
      item.breed?.toLowerCase().includes(term);
    if (!matchesSearch) return false;
    if (filterMode === "ACTIVE") {
      return activeRegistrationIds.has(item.id);
    }
    return true;
  });

  const calculateDogStayStats = (regId: string, perDayCharges: number = 0) => {
    const dogAdmissions = initialAdmissions.filter((a) => a.registration_id === regId);
    let totalDays = 0;
    dogAdmissions.forEach((a) => {
      if (!a.entry_date) return;
      const startDate = new Date(a.entry_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = a.exit_date ? new Date(a.exit_date) : new Date();
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      totalDays += Math.max(1, diffDays + 1);
    });
    const totalAmount = totalDays * perDayCharges;
    return { totalDays, totalAmount, stayCount: dogAdmissions.length };
  };

  const calculateTotalDue = (reg: Registration) => {
    const baseDue = Number(reg.due_amount) || 0;
    const dogAdmissions = initialAdmissions.filter((a) => a.registration_id === reg.id);
    let unpaidStaysDue = 0;
    dogAdmissions.forEach((a) => {
      if (a.payment_status !== "PAID") {
        const adv = Number(a.advance_amount) || 0;
        if (a.billed_amount && Number(a.billed_amount) > 0) {
          unpaidStaysDue += Math.max(0, Number(a.billed_amount) - adv);
        } else if (a.exit_date) {
          const startDate = new Date(a.entry_date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(a.exit_date);
          endDate.setHours(0, 0, 0, 0);
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
          const rate = Number(reg.per_day_hostel_charges) || 500;
          unpaidStaysDue += Math.max(0, diffDays * rate - adv);
        }
      }
    });
    return baseDue + unpaidStaysDue;
  };

  const handleDelete = (item: Registration) => {
    setDeleteModalItem(item);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteRegistration(deleteModalItem.id);
    setIsDeleting(false);
    if (res?.error) {
      setDeleteError(res.error);
    } else {
      const remaining = data.filter((d) => d.id !== deleteModalItem.id);
      const sortedAsc = [...remaining].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      const serialMap = new Map<string, string>();
      sortedAsc.forEach((item, idx) => {
        serialMap.set(item.id, `#${idx + 1}`);
      });
      const reindexed = remaining.map((item) => ({
        ...item,
        serial_number: serialMap.get(item.id) || item.serial_number,
      }));
      setData(reindexed);
      setDeleteModalItem(null);
      if (selectedItem?.id === deleteModalItem.id) {
        setSelectedItem(null);
      }
    }
  };

  return (
    <>
      <div className={styles.tableHeader}>
        <div className={styles.search}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by serial #, dog, owner, phone, breed…"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", margin: "1rem 0", padding: "0.85rem 1.25rem", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-primary)" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterMode("ALL")}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: filterMode === "ALL" ? "var(--accent)" : "transparent",
              color: filterMode === "ALL" ? "white" : "var(--text-secondary)",
              boxShadow: filterMode === "ALL" ? "var(--shadow-sm)" : "none",
            }}
          >
            All Dogs ({data.length})
          </button>
          <button
            onClick={() => setFilterMode("ACTIVE")}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: filterMode === "ACTIVE" ? "var(--success)" : "transparent",
              color: filterMode === "ACTIVE" ? "white" : "var(--text-secondary)",
              boxShadow: filterMode === "ACTIVE" ? "var(--shadow-sm)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: filterMode === "ACTIVE" ? "white" : "var(--success)" }} />
            Active Dogs (In School) ({activeRegistrationIds.size})
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Dog</th>
              <th className={styles.th}>Owner</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Due Amount</th>
              <th className={styles.th}>Breed</th>
              <th className={styles.th}>Contact</th>
              <th className={styles.th}>Added</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <PawPrint size={28} />
                    </div>
                    <p className={styles.emptyTitle}>No registrations yet</p>
                    <p className={styles.emptySubtitle}>
                      Create your first registration to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className={styles.tr}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.03,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <td className={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      {item.dog_photo ? (
                        <img
                          src={String(item.dog_photo)}
                          alt={item.dog_name}
                          style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-primary)" }}
                        />
                      ) : null}
                      <strong>
                        {item.serial_number ? (
                          <span style={{ color: "var(--accent)", marginRight: "0.35rem" }}>
                            {item.serial_number.startsWith("#") ? item.serial_number : `#${item.serial_number}`}
                          </span>
                        ) : null}
                        {item.dog_name}
                      </strong>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      {item.owner_photo ? (
                        <img
                          src={String(item.owner_photo)}
                          alt={item.owner_name}
                          style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-primary)" }}
                        />
                      ) : null}
                      <span>{item.owner_name}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.badge} ${
                        item.status === "NEW"
                          ? styles.badgeNew
                          : styles.badgeOld
                      }`}
                    >
                      {item.status || "—"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {(() => {
                      const totalDue = calculateTotalDue(item);
                      return totalDue > 0 ? (
                        <span style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, display: "inline-block" }}>
                          &#8377;{totalDue.toLocaleString("en-IN")} Due
                        </span>
                      ) : (
                        <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600, display: "inline-block" }}>
                          No Due
                        </span>
                      );
                    })()}
                  </td>
                  <td className={styles.td}>{item.breed || "—"}</td>
                  <td className={styles.td}>{item.phone}</td>
                  <td className={styles.td}>
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        title="View Details"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className={styles.actionButton}
                        title="Edit"
                        onClick={() => router.push(`/dashboard/edit/${item.id}`)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                        title="Delete"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════ SIDE DRAWER ═══════ */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className={styles.drawerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className={styles.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                <h2 className={styles.drawerTitle}>
                  {selectedItem.dog_name} — Details
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className={styles.actionButton}
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.drawerContent}>
                {/* Official Registration PDF Button */}
                <div style={{ marginBottom: "1rem" }}>
                  <a
                    href={`/api/registration/${selectedItem.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: "var(--accent)",
                      color: "white",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      boxShadow: "var(--shadow-md)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    📄 View / Print Official Registration Form PDF
                  </a>
                </div>

                {/* Photo Previews */}
                {selectedItem.dog_photo || selectedItem.owner_photo ? (
                  <div style={{ display: "grid", gridTemplateColumns: selectedItem.dog_photo && selectedItem.owner_photo ? "1fr 1fr" : "1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    {selectedItem.dog_photo ? (
                      <div
                        onClick={() => setLightboxImg(String(selectedItem.dog_photo))}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", cursor: "pointer" }}
                        title="Click to view full screen"
                      >
                        <img src={String(selectedItem.dog_photo)} alt={selectedItem.dog_name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent)" }} />
                        <div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>Dog Photo</div>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{selectedItem.dog_name}</div>
                        </div>
                      </div>
                    ) : null}
                    {selectedItem.owner_photo ? (
                      <div
                        onClick={() => setLightboxImg(String(selectedItem.owner_photo))}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", cursor: "pointer" }}
                        title="Click to view full screen"
                      >
                        <img src={String(selectedItem.owner_photo)} alt={selectedItem.owner_name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-hover)" }} />
                        <div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>Owner Photo</div>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{selectedItem.owner_name}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Owner Section */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Owner</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name</span>
                    <span className={styles.detailValue}>
                      {selectedItem.owner_name}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>
                      {selectedItem.phone}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>City</span>
                    <span className={styles.detailValue}>
                      {selectedItem.city || "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>State</span>
                    <span className={styles.detailValue}>
                      {selectedItem.state || "—"}
                    </span>
                  </div>
                </div>

                {/* Dog Section */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Dog</h3>
                  {selectedItem.serial_number ? (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Serial Number</span>
                      <span className={styles.detailValue} style={{ fontWeight: 700, color: "var(--accent)" }}>
                        {selectedItem.serial_number.startsWith("#") ? selectedItem.serial_number : `#${selectedItem.serial_number}`}
                      </span>
                    </div>
                  ) : null}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name</span>
                    <span className={styles.detailValue}>
                      {selectedItem.dog_name}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.detailValue}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Breed</span>
                    <span className={styles.detailValue}>
                      {selectedItem.breed || "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Gender</span>
                    <span className={styles.detailValue}>
                      {selectedItem.dog_gender || "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Age</span>
                    <span className={styles.detailValue}>
                      {selectedItem.age || "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Colour</span>
                    <span className={styles.detailValue}>
                      {selectedItem.colour || "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nature</span>
                    <span className={styles.detailValue}>
                      {selectedItem.dog_nature || "—"}
                    </span>
                  </div>
                </div>

                {/* Services & Requirements Section */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Services Required</h3>
                  <div className={styles.detailRow} style={{ alignItems: "center" }}>
                    <span className={styles.detailLabel}>Requested</span>
                    <span className={styles.detailValue}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {selectedItem.requires_hostel ? (
                          <span style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600 }}>
                            🏨 Hostel Stay
                          </span>
                        ) : null}
                        {selectedItem.requires_training ? (
                          <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600 }}>
                            🐕 Dog Training
                          </span>
                        ) : null}
                        {!selectedItem.requires_hostel && !selectedItem.requires_training ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>General / None</span>
                        ) : null}
                      </div>
                    </span>
                  </div>
                  {selectedItem.what_to_learn ? (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>What to Learn</span>
                      <span className={styles.detailValue}>{selectedItem.what_to_learn}</span>
                    </div>
                  ) : null}
                  {selectedItem.main_issue ? (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Main Issue</span>
                      <span className={styles.detailValue}>{selectedItem.main_issue}</span>
                    </div>
                  ) : null}
                  {selectedItem.pick_and_drop ? (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Pick & Drop</span>
                      <span className={styles.detailValue}>{selectedItem.pick_and_drop}</span>
                    </div>
                  ) : null}
                </div>

                {/* Payment Section */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Payment</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Advance</span>
                    <span className={styles.detailValue}>
                      {selectedItem.advance_amount
                        ? `₹${selectedItem.advance_amount}`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Total</span>
                    <span className={styles.detailValue}>
                      {selectedItem.total_amount
                        ? `₹${selectedItem.total_amount}`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Hostel Stay Charges</span>
                    <span className={styles.detailValue} style={{ fontWeight: 600, color: "var(--success)" }}>
                      {(() => {
                        const stats = calculateDogStayStats(selectedItem.id, Number(selectedItem.per_day_hostel_charges) || 0);
                        return `₹${stats.totalAmount.toLocaleString("en-IN")} (${stats.totalDays} day${stats.totalDays > 1 ? "s" : ""})`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Visit History Section */}
                <VisitHistory
                  registrationId={selectedItem.id}
                  perDayCharges={Number(selectedItem.per_day_hostel_charges) || 0}
                  ownerName={selectedItem.owner_name}
                  dogName={selectedItem.dog_name}
                  phone={selectedItem.phone}
                  email={selectedItem.email || ""}
                />
              </div>

              <div className={styles.drawerFooter}>
                <button
                  className={styles.buttonGhost}
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
                <button
                  className={styles.buttonAccent}
                  onClick={() => {
                    setSelectedItem(null);
                    router.push(`/dashboard/edit/${selectedItem.id}`);
                  }}
                >
                  Edit Registration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "1rem", width: "100%", maxWidth: "420px", padding: "1.75rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Delete Registration?
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, marginTop: "0.15rem" }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.5", marginBottom: "1.25rem", backgroundColor: "var(--bg-primary)", padding: "0.85rem", borderRadius: "0.5rem", border: "1px solid var(--border-secondary)" }}>
              Are you sure you want to delete the registration for dog <strong style={{ color: "#ef4444" }}>{deleteModalItem.dog_name}</strong> (Owner: {deleteModalItem.owner_name})?
              <br />
              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", display: "block", marginTop: "0.4rem" }}>
                All associated stay records and billing history for this pet will also be removed.
              </span>
            </p>

            {deleteError && (
              <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button
                onClick={() => {
                  setDeleteModalItem(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className={styles.buttonGhost}
                style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: "0.55rem 1.25rem",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.3)",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImg}
              alt="Full Screen"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                backgroundColor: "var(--danger)",
                color: "white",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                cursor: "pointer",
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
