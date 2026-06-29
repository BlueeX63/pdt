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
  [key: string]: unknown;
}

export default function DashboardTable({ initialData }: { initialData: Registration[] }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Registration | null>(null);
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
                    <strong>{item.dog_name}</strong>
                  </td>
                  <td className={styles.td}>{item.owner_name}</td>
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
    </>
  );
}
