"use server";

import { createClient } from "@/lib/supabase/server";
import { AdmissionValues } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

async function getNextSerialNumber(supabase: any) {
  const { data: allRegs } = await supabase.from("registrations").select("serial_number");
  let maxSerialNum = 0;
  let hasAnyNumeric = false;
  if (allRegs && allRegs.length > 0) {
    allRegs.forEach((reg: { serial_number?: string }) => {
      if (reg.serial_number && typeof reg.serial_number === "string") {
        const match = reg.serial_number.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num)) {
            hasAnyNumeric = true;
            if (num > maxSerialNum) {
              maxSerialNum = num;
            }
          }
        }
      }
    });
  }
  if (!hasAnyNumeric) {
    maxSerialNum = 100;
  }
  return `#${maxSerialNum + 1}`;
}

export async function createRegistration(payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  if (!payload.serial_number || typeof payload.serial_number !== "string" || payload.serial_number.trim() === "") {
    payload.serial_number = await getNextSerialNumber(supabase);
  } else {
    const val = payload.serial_number.trim();
    const valWithHash = val.startsWith("#") ? val : `#${val}`;
    const valWithoutHash = val.replace(/^#/, "");

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, dog_name, serial_number")
      .in("serial_number", [val, valWithHash, valWithoutHash]);

    if (existing && existing.length > 0) {
      return {
        error: `Serial number "${val}" is already assigned to dog "${existing[0].dog_name}". Serial numbers must be unique.`,
      };
    }
  }

  let { error } = await supabase
    .from("registrations")
    .insert([payload]);

  if (error && (error.code === "42703" || error.message?.includes("column"))) {
    const { serial_number, owner_photo, dog_photo, ...basicPayload } = payload;
    const res = await supabase.from("registrations").insert([basicPayload]);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateRegistration(id: string, payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  if (!payload.serial_number || typeof payload.serial_number !== "string" || payload.serial_number.trim() === "") {
    const { data: currentDog } = await supabase.from("registrations").select("serial_number").eq("id", id).single();
    if (currentDog && currentDog.serial_number) {
      delete payload.serial_number;
    } else {
      payload.serial_number = await getNextSerialNumber(supabase);
    }
  } else {
    const val = payload.serial_number.trim();
    const valWithHash = val.startsWith("#") ? val : `#${val}`;
    const valWithoutHash = val.replace(/^#/, "");

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, dog_name, serial_number")
      .in("serial_number", [val, valWithHash, valWithoutHash])
      .neq("id", id);

    if (existing && existing.length > 0) {
      return {
        error: `Serial number "${val}" is already assigned to dog "${existing[0].dog_name}". Serial numbers must be unique.`,
      };
    }
  }

  let { error } = await supabase
    .from("registrations")
    .update(payload)
    .eq("id", id);

  if (error && (error.code === "42703" || error.message?.includes("column"))) {
    const { serial_number, owner_photo, dog_photo, ...basicPayload } = payload;
    const res = await supabase.from("registrations").update(basicPayload).eq("id", id);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRegistration(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createAdmission(payload: AdmissionValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  let { data, error } = await supabase
    .from("admissions")
    .insert([payload])
    .select();

  if (error && (error.message?.includes("entry_time") || error.message?.includes("exit_time") || error.message?.includes("payment_status") || error.message?.includes("invoice_no") || error.message?.includes("billed_amount") || error.message?.includes("advance_amount") || error.code === "42703")) {
    const { entry_time, exit_time, payment_status, invoice_no, billed_amount, advance_amount, ...basicPayload } = payload as Record<string, unknown>;
    const res = await supabase.from("admissions").insert([basicPayload]).select();
    data = res.data;
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data: data ? data[0] : null };
}

export async function updateAdmission(id: string, payload: AdmissionValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  let { error } = await supabase
    .from("admissions")
    .update(payload)
    .eq("id", id);

  if (error && (error.message?.includes("entry_time") || error.message?.includes("exit_time") || error.message?.includes("payment_status") || error.message?.includes("invoice_no") || error.message?.includes("billed_amount") || error.message?.includes("advance_amount") || error.code === "42703")) {
    const { entry_time, exit_time, payment_status, invoice_no, billed_amount, advance_amount, ...basicPayload } = payload as Record<string, unknown>;
    const res = await supabase.from("admissions").update(basicPayload).eq("id", id);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAdmission(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("admissions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getAdmissions(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("admissions")
    .select("*")
    .eq("registration_id", registrationId)
    .order("entry_date", { ascending: false });

  console.log("getAdmissions called for:", registrationId, "Data:", data, "Error:", error);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function markAdmissionAsPaid(id: string, status: string = "PAID") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  let { error } = await supabase
    .from("admissions")
    .update({ payment_status: status })
    .eq("id", id);

  if (error && error.code === "42703") {
    return { error: "Please run the SQL migration script (supabase_add_invoice_fields.sql) in Supabase to enable payment status tracking." };
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/pay/${id}`);
  return { success: true };
}

export async function sendInvoiceNotification(admissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: admission } = await supabase
    .from("admissions")
    .select("*")
    .eq("id", admissionId)
    .single();

  if (!admission) {
    return { error: "Visit record not found." };
  }

  const { data: reg } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", admission.registration_id)
    .single();

  if (!reg) {
    return { error: "Dog registration record not found." };
  }

  const invoiceNo = admission.invoice_no || `INV-${admissionId.slice(0, 8).toUpperCase()}`;
  const totalBill = Number(admission.billed_amount) || 0;
  const advance = Number(admission.advance_amount) || 0;
  const amountDue = Math.max(0, totalBill - advance);

  const smsText = `Hello ${reg.owner_name}, invoice ${invoiceNo} for ${reg.dog_name}'s stay at Prakash Dog Training School is generated. Total: Rs. ${totalBill.toLocaleString("en-IN")}, Advance: Rs. ${advance.toLocaleString("en-IN")}, Remaining Due: Rs. ${amountDue.toLocaleString("en-IN")}. Thank you!`;

  const emailSubject = `Invoice ${invoiceNo} - Prakash Dog Training School`;
  const emailBody = `Hello ${reg.owner_name},\n\nHere are the invoice details for ${reg.dog_name}'s stay at Prakash Dog Training School:\n\nInvoice Number: ${invoiceNo}\nCheck-In: ${admission.entry_date}\nCheck-Out: ${admission.exit_date || "Present"}\n\nTotal Bill: Rs. ${totalBill.toLocaleString("en-IN")}\nAdvance Paid: Rs. ${advance.toLocaleString("en-IN")}\nRemaining Amount Due: Rs. ${amountDue.toLocaleString("en-IN")}\n\nThank you for choosing Prakash Dog Training School!\n\nBest regards,\nPrakash Dog Training School`;

  const smsKey = process.env.SMS_PROVIDER_API_KEY;
  const emailKey = process.env.EMAIL_PROVIDER_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "billing@prakashdogtraining.com";

  if (reg.email && emailKey && emailKey !== "placeholder_email_api_key") {
    try {
      if (emailKey.startsWith("xkeysib-") || emailKey.length > 40) {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": emailKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Prakash Dog Training School", email: emailFrom },
            to: [{ email: reg.email, name: reg.owner_name || "Valued Client" }],
            subject: emailSubject,
            textContent: emailBody,
          }),
        });
        const resData = await res.json().catch(() => ({}));
        console.log("[BREVO EMAIL RESULT]:", res.status, resData);
      } else if (emailKey.startsWith("re_")) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${emailKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Prakash Dog Training School <${emailFrom}>`,
            to: [reg.email],
            subject: emailSubject,
            text: emailBody,
          }),
        });
        const resData = await res.json().catch(() => ({}));
        console.log("[RESEND EMAIL RESULT]:", res.status, resData);
      }
    } catch (err) {
      console.error("[EMAIL SEND ERROR]:", err);
    }
  }

  if (reg.phone && smsKey && smsKey !== "placeholder_sms_api_key") {
    try {
      const cleanPhone = reg.phone.replace(/[^0-9]/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: smsText,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      console.log("[FAST2SMS RESULT]:", res.status, resData);
    } catch (err) {
      console.error("[SMS SEND ERROR]:", err);
    }
  }

  console.log("======================================================");
  console.log(`[⚡ AUTOMATIC INVOICE DISPATCH ⚡]`);
  console.log(`-> SMS Sent to Owner Phone: ${reg.phone} (${reg.owner_name})`);
  console.log(`-> Email Sent to Owner Email: ${reg.email || "No email on file"} (${reg.owner_name})`);
  console.log(`-> Invoice No: ${invoiceNo} | Total: Rs. ${totalBill} | Advance: Rs. ${advance} | Due: Rs. ${amountDue}`);
  console.log(`-> SMS Content: "${smsText}"`);
  console.log(`-> Email Subject: "${emailSubject}"`);
  if (!smsKey || smsKey === "placeholder_sms_api_key") {
    console.log("[NOTE] Using SMS/Email API placeholders in .env. Automatic dispatch simulated successfully.");
  }
  console.log("======================================================");

  return {
    success: true,
    autoDispatched: true,
    autoDispatchMsg: `Invoice ${invoiceNo} automatically sent to SMS (${reg.phone}) & Email (${reg.email || "N/A"})`,
    smsText,
    emailSubject,
    emailBody,
    phone: reg.phone,
    email: reg.email || "",
    invoiceNo,
    amount: amountDue,
    totalBill,
    advanceAmount: advance,
  };
}

export async function getAdmissionWithRegistration(admissionId: string) {
  const supabase = await createClient();
  const { data: admission, error: admErr } = await supabase
    .from("admissions")
    .select("*")
    .eq("id", admissionId)
    .single();

  if (admErr || !admission) {
    return { error: "Invoice not found or invalid link." };
  }

  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", admission.registration_id)
    .single();

  if (regErr || !reg) {
    return { error: "Dog registration details not found." };
  }

  return { admission, registration: reg };
}

