import { NextRequest, NextResponse } from "next/server";
import { getAdmissionWithRegistration } from "@/app/actions";
import { generateInvoicePDFArrayBuffer } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await getAdmissionWithRegistration(id);

    if (res.error || !res.admission || !res.registration) {
      return NextResponse.json(
        { error: res.error || "Invoice not found" },
        { status: 404 }
      );
    }

    const pdfArrayBuffer = generateInvoicePDFArrayBuffer(res.admission as any, res.registration as any);
    const invoiceNo = res.admission.invoice_no || `INV-${id.slice(0, 8).toUpperCase()}`;

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoiceNo}.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error("Error generating PDF invoice:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF invoice" },
      { status: 500 }
    );
  }
}
