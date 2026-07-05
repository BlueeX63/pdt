import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRegistrationPDFBuffer } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: reg, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !reg) {
      return NextResponse.json(
        { error: "Registration record not found" },
        { status: 404 }
      );
    }

    const pdfBuffer = generateRegistrationPDFBuffer(reg);
    const cleanDogName = (reg.dog_name || "Dog").replace(/[^a-zA-Z0-9]/g, "_");

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Registration-Form-${cleanDogName}.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error("Error generating Registration Form PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate Registration Form PDF" },
      { status: 500 }
    );
  }
}
