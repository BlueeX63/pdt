"use server";

import { createClient } from "@/lib/supabase/server";
import { AdmissionValues } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createRegistration(payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  if (payload.serial_number && typeof payload.serial_number === "string" && payload.serial_number.trim() !== "") {
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

  if (payload.serial_number && typeof payload.serial_number === "string" && payload.serial_number.trim() !== "") {
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

  let { error } = await supabase
    .from("admissions")
    .insert([payload]);

  if (error && (error.message?.includes("entry_time") || error.message?.includes("exit_time") || error.code === "42703")) {
    const { entry_time, exit_time, ...basicPayload } = payload;
    const res = await supabase.from("admissions").insert([basicPayload]);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
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

  if (error && (error.message?.includes("entry_time") || error.message?.includes("exit_time") || error.code === "42703")) {
    const { entry_time, exit_time, ...basicPayload } = payload;
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
