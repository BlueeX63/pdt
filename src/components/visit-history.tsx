"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Calendar, Loader2, Edit2 } from "lucide-react";
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
  exit_date?: string | null;
  notes?: string | null;
}

export default function VisitHistory({
  registrationId,
}: {
  registrationId: string;
}) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await getAdmissions(registrationId);
    if (error) {
      console.error("Failed to fetch admissions:", error);
      // We won't alert here to avoid spamming, but we'll show it in console.
    } else if (data) {
      setAdmissions(data as Admission[]);
    }
    setIsLoading(false);
  }, [registrationId]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleSave = async () => {
    if (!entryDate) return;

    setIsSubmitting(true);
    const payload: AdmissionValues = {
      registration_id: registrationId,
      entry_date: entryDate,
      exit_date: exitDate || null,
      notes: null,
    };

    let res;
    if (editingId) {
      res = await updateAdmission(editingId, payload);
    } else {
      res = await createAdmission(payload);
    }
    
    setIsSubmitting(false);

    if (res?.error) {
      alert("Failed to save: " + res.error + "\n\nDid you run the SQL script in Supabase?");
      return;
    }

    setIsAdding(false);
    setEditingId(null);
    setEntryDate("");
    setExitDate("");
    fetchAdmissions();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this visit record?")) {
      await deleteAdmission(id);
      fetchAdmissions();
    }
  };

  const handleEdit = (admission: Admission) => {
    setEditingId(admission.id);
    setEntryDate(admission.entry_date);
    setExitDate(admission.exit_date || "");
    setIsAdding(true);
  };

  return (
    <div className={styles.detailSection}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={styles.detailSectionTitle} style={{ marginBottom: 0 }}>
          Visit History
        </h3>
        {!isAdding && (
          <button
            className={styles.actionButton}
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setEntryDate(new Date().toISOString().split("T")[0]);
              setExitDate("");
            }}
            title="Add New Visit"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {isAdding && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label className={styles.detailLabel}>Entry Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.detailLabel}>Exit Date</label>
              <input
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button
              className={styles.buttonGhost}
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
            >
              Cancel
            </button>
            <button
              className={styles.buttonAccent}
              onClick={handleSave}
              disabled={!entryDate || isSubmitting}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : admissions.length === 0 && !isAdding ? (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: "var(--text-muted)",
            fontSize: "0.8125rem",
          }}
        >
          No visit history found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {admissions.map((admission) => (
            <div
              key={admission.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                border: "1px solid var(--border-secondary)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    backgroundColor: "var(--info-light)",
                    color: "var(--info)",
                    padding: "0.4rem",
                    borderRadius: "50%",
                  }}
                >
                  <Calendar size={14} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)" }}>
                    {new Date(admission.entry_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                    {" "} - {" "}
                    {admission.exit_date ? (
                      new Date(admission.exit_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    ) : (
                      <span style={{ color: "var(--success)" }}>Present</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.actionButtons}>
                 <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(admission)}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                  onClick={() => handleDelete(admission.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
