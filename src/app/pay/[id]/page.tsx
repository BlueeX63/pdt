import { getAdmissionWithRegistration } from "@/app/actions";
import InvoicePaymentClient from "./invoice-client";
import { notFound } from "next/navigation";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getAdmissionWithRegistration(id);

  if (res.error || !res.admission || !res.registration) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem", background: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Invoice Not Found</h2>
          <p style={{ color: "#94a3b8" }}>{res.error || "This payment link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <InvoicePaymentClient
      admission={res.admission}
      registration={res.registration}
    />
  );
}
