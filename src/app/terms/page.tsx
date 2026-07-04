"use client";

import React from "react";
import { PawPrint, ShieldCheck, AlertTriangle, FileText, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-primary)", paddingBottom: "1.25rem" }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <button
            onClick={() => window.print()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "0.5rem", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
          >
            <Printer size={16} />
            Print Agreement
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "1rem", backgroundColor: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            Terms &amp; Conditions of Boarding and Training
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "600px", margin: 0 }}>
            Official legal agreement and policy guidelines for dog owners enrolling their pets at Prakash Dog Training School.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#d97706", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.5rem" }}>
            <AlertTriangle size={14} />
            MANDATORY ACCEPTANCE REQUIRED PRIOR TO ADMISSION
          </div>
        </div>

        {/* Document Body */}
        <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1.25rem", border: "1px solid var(--border-primary)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem", boxShadow: "var(--shadow-md)", lineHeight: "1.7" }}>
          
          {/* Section 1 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>1.</span> Health, Sudden Illness &amp; Natural Death Disclaimer
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0 0 0.75rem 0" }}>
              Prakash Dog Training School, its trainers, management, and staff maintain the highest standards of hygiene, safety, nutrition, and daily care for all dogs admitted for hostel boarding and training. However, the dog owner explicitly acknowledges and accepts that animals are susceptible to sudden medical conditions, viral infections, age-related complications, cardiac arrest, gastric torsion (bloat), and unforeseen natural health events.
            </p>
            <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.08)", borderLeft: "4px solid #ef4444", borderRadius: "0 0.5rem 0.5rem 0", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
              Under no circumstances shall Prakash Dog Training School, its faculty, trainers, or management be held legally, financially, or morally liable or responsible for any sudden illness, natural death, accidental injury, or unforeseen medical casualty occurring during the training or boarding period.
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>2.</span> Vaccination &amp; Medical Responsibility
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0 0 0.75rem 0" }}>
              Maintaining up-to-date vaccinations (including Anti-Rabies, DHLPPi, Parvovirus, Distemper, and Kennel Cough) as well as regular deworming and tick/flea prevention is the **sole and exclusive responsibility of the dog owner**.
            </p>
            <ul style={{ color: "var(--text-secondary)", fontSize: "0.95rem", paddingLeft: "1.5rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Owners must submit valid proof of vaccination upon admission.</li>
              <li>If any veterinary care, emergency medication, or diagnostic treatment becomes necessary during the dog&apos;s stay, the school will make reasonable attempts to notify the owner. All veterinary clinic charges, medication costs, and transportation fees must be reimbursed in full by the dog owner.</li>
              <li>The school reserves the right to refuse admission to any dog showing signs of contagious disease, severe parasitic infestation, or extreme illness.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>3.</span> Payment Terms &amp; Recurring Fee Schedule
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0 0 0.75rem 0" }}>
              Boarding and training charges are calculated strictly on a per-day or agreed package basis. To ensure uninterrupted care and training:
            </p>
            <div style={{ padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.08)", borderLeft: "4px solid #10b981", borderRadius: "0 0.5rem 0.5rem 0", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
              For all long-term training and hostel programs, boarding and training fees MUST be paid in advance every 20 days. Failure to clear recurring dues on time will result in immediate suspension of training activities and accumulation of daily standard boarding charges.
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>4.</span> Dog Abandonment, Unresponsive Owners &amp; Relocation Rights
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0 0 0.75rem 0" }}>
              Prakash Dog Training School is a professional training and boarding facility, not a permanent sanctuary. The dog owner agrees to pick up their dog promptly upon completion of the agreed training or hostel boarding period.
            </p>
            <div style={{ padding: "1.25rem", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "0.75rem", color: "var(--text-primary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ fontWeight: 700, color: "#d97706", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <AlertTriangle size={18} />
                CRITICAL ABANDONMENT POLICY:
              </div>
              <span>
                If a dog owner fails to take their dog back after the completed boarding/training period, and remains unresponsive to phone calls, SMS, WhatsApp, or emails for a period exceeding **7 days** (or fails to clear outstanding boarding dues for over 15 days), the dog shall be legally deemed as **ABANDONED**.
              </span>
              <span style={{ fontWeight: 700, marginTop: "0.3rem" }}>
                In all such instances of abandonment, Prakash Dog Training School reserves the full legal right and authority to transfer the dog to an NGO / animal rescue shelter, rehome, or sell the dog to recover unpaid maintenance, feeding, and boarding expenses, without any further notice or legal liability to the original owner.
              </span>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>5.</span> Behavioral Disclosure &amp; Safety
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              The owner must truthfully disclose any history of biting, extreme aggression, destructive behavior, or phobias prior to registration. If a dog exhibits severe unprovoked aggression that poses an immediate hazard to facility trainers or other animals, the school reserves the right to terminate the training contract and request immediate pickup.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>6.</span> Agreement &amp; Jurisdiction
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              By ticking the mandatory acceptance checkbox on the registration form and submitting the admission details, the dog owner certifies that they have read, understood, and voluntarily agreed to all terms and conditions stated herein. All disputes are subject to the local legal jurisdiction where Prakash Dog Training School is established.
            </p>
          </section>

        </div>

        {/* Footer Note */}
        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-tertiary)", paddingBottom: "2rem" }}>
          © {new Date().getFullYear()} Prakash Dog Training School. All rights reserved.
        </div>

      </div>
    </div>
  );
}
