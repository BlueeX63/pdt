"use client";

import { useState } from "react";
import { Search, Edit2, Trash2, PawPrint, X, Eye } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { deleteRegistration } from "@/app/actions";
import VisitHistory from "./visit-history";

interface Registration {
  id: string;
  created_at: string;
  dog_name: string;
  owner_name: string;
  status: string;
  breed?: string;
  phone: string;
  city?: string;
  state?: string;
  dog_gender?: string;
  age?: string;
  colour?: string;
  dog_nature?: string;
  advance_amount?: number;
  total_amount?: number;
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

export default function DashboardTable({ initialData }: { initialData: Registration[] }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Registration | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const router = useRouter();

  const filteredData = data.filter(
    (item) =>
      item.dog_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this registration?")) {
      const res = await deleteRegistration(id);
      if (res.error) {
        alert(res.error);
      } else {
        setData(data.filter((d) => d.id !== id));
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
            placeholder="Search registrations…"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Dog</th>
              <th className={styles.th}>Owner</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Breed</th>
              <th className={styles.th}>Contact</th>
              <th className={styles.th}>Added</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7}>
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
                        onClick={() => handleDelete(item.id)}
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
                </div>

                {/* Visit History Section */}
                <VisitHistory registrationId={selectedItem.id} />
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
