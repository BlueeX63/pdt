import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Admission {
  id: string;
  registration_id: string;
  entry_date: string;
  entry_time?: string | null;
  exit_date?: string | null;
  exit_time?: string | null;
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
  per_day_hostel_charges?: string | number;
  [key: string]: unknown;
}

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

export function generateInvoicePDFDoc(admission: Admission, registration: Registration): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const days = calculateDays(admission.entry_date, admission.exit_date);
  const rate = Number(registration.per_day_hostel_charges) || 500;
  const totalBill = Number(admission.billed_amount) || days * rate;
  const advance = Number(admission.advance_amount) || 0;
  const isPaid = admission.payment_status === "PAID" || admission.payment_status?.toLowerCase() === "paid";
  const amountDue = isPaid ? 0 : Math.max(0, totalBill - advance);
  const invoiceNo = admission.invoice_no || `INV-${admission.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // #0f172a Deep Slate/Navy
  const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748b Slate Gray
  const successColor: [number, number, number] = [16, 185, 129]; // #10b981 Emerald Green
  const dangerColor: [number, number, number] = [239, 68, 68]; // #ef4444 Red

  // --- Header Section ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Prakash Dog Training School", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225); // Light slate
  doc.text("Professional Dog Training & Boarding Hostel Services", 14, 26);
  doc.text("Bengaluru, India | Contact: +91 98765 43210", 14, 32);

  // Invoice Badge on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", 196, 18, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No: ${invoiceNo}`, 196, 26, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, 196, 32, { align: "right" });

  // --- Billing & Dog Details ---
  let currentY = 52;

  // Box 1: Billed To
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 88, 42, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("BILLED TO (OWNER)", 18, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(registration.owner_name || "Valued Client", 18, currentY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Phone: ${registration.phone || "N/A"}`, 18, currentY + 24);
  if (registration.email) {
    doc.text(`Email: ${registration.email}`, 18, currentY + 30);
  }
  const addressStr = [registration.address, registration.city].filter(Boolean).join(", ");
  if (addressStr) {
    doc.text(addressStr.slice(0, 38), 18, registration.email ? currentY + 36 : currentY + 30);
  }

  // Box 2: Dog Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, currentY, 88, 42, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("DOG DETAILS", 112, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(registration.dog_name || "Pet Guest", 112, currentY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Breed: ${registration.breed || "Not Specified"}`, 112, currentY + 24);
  doc.text("Service: Hostel / Boarding Stay", 112, currentY + 30);
  doc.text(`Check-In: ${admission.entry_date}`, 112, currentY + 36);

  // --- Table ---
  currentY = 104;

  const tableBody: (string | number)[][] = [
    [
      `Hostel Boarding Stay (${admission.entry_date} to ${admission.exit_date || "Present"})`,
      `${days} Day(s)`,
      `Rs. ${rate.toLocaleString("en-IN")}`,
      `Rs. ${totalBill.toLocaleString("en-IN")}`,
    ],
  ];

  if (advance > 0) {
    tableBody.push([
      "Advance Payment Already Made",
      "-",
      "-",
      `- Rs. ${advance.toLocaleString("en-IN")}`,
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [["Description", "Duration", "Rate / Day", "Amount"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "left",
      cellPadding: 4,
    },
    bodyStyles: {
      textColor: primaryColor,
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // --- Financial Summary & Payment Status ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, finalY, 86, 38, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text("Total Bill:", 116, finalY + 8);
  doc.text(`Rs. ${totalBill.toLocaleString("en-IN")}`, 190, finalY + 8, { align: "right" });

  doc.text("Advance Paid:", 116, finalY + 16);
  doc.text(`Rs. ${advance.toLocaleString("en-IN")}`, 190, finalY + 16, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(116, finalY + 20, 190, finalY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("Remaining Due:", 116, finalY + 28);
  
  if (isPaid || amountDue === 0) {
    doc.setTextColor(...successColor);
    doc.text("Rs. 0 (PAID)", 190, finalY + 28, { align: "right" });
  } else {
    doc.setTextColor(...dangerColor);
    doc.text(`Rs. ${amountDue.toLocaleString("en-IN")}`, 190, finalY + 28, { align: "right" });
  }

  // Left side: Status Badge
  const badgeY = finalY + 4;
  if (isPaid || amountDue === 0) {
    doc.setFillColor(209, 250, 229); // Light green
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(14, badgeY, 88, 28, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...successColor);
    doc.text("STATUS: PAID IN FULL", 58, badgeY + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for your payment!", 58, badgeY + 20, { align: "center" });
  } else {
    doc.setFillColor(254, 243, 199); // Light yellow/amber
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, badgeY, 88, 28, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text("STATUS: PAYMENT PENDING", 58, badgeY + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Due Amount: Rs. ${amountDue.toLocaleString("en-IN")}`, 58, badgeY + 19, { align: "center" });
  }

  // --- Footer Section ---
  const footerY = 265;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 8, 196, footerY - 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("Thank you for choosing Prakash Dog Training School!", 105, footerY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("Stay Connected: Instagram @dogloverprakash | YouTube @dogloverprakash | Facebook @dogloverprakash", 105, footerY + 6, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("This is a computer-generated invoice and requires no physical signature.", 105, footerY + 12, { align: "center" });

  return doc;
}

export function generateInvoicePDFBuffer(admission: Admission, registration: Registration): Buffer {
  const doc = generateInvoicePDFDoc(admission, registration);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export function generateInvoicePDFArrayBuffer(admission: Admission, registration: Registration): ArrayBuffer {
  const doc = generateInvoicePDFDoc(admission, registration);
  return doc.output("arraybuffer");
}

export function generateInvoicePDFBase64(admission: Admission, registration: Registration): string {
  const doc = generateInvoicePDFDoc(admission, registration);
  const dataUri = doc.output("datauristring");
  const base64 = dataUri.split(",")[1];
  return base64;
}
