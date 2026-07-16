import * as z from "zod";

export const formSchema = z.object({
  owner_name: z.string().min(2, "Name is required"),
  appointment_time: z.string().optional().nullable(),
  appointment_date: z.string().optional().nullable(),
  address: z.string().min(2, "Address is required"),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  emergency_contact: z.string().optional().nullable(),
  email: z.string().email("Invalid email").or(z.literal("")).optional().nullable(),
  aadhar_card_no: z.string().optional().nullable(),
  owner_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional().nullable(),
  aadhar_card_front_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional().nullable(),
  aadhar_card_back_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional().nullable(),
  other_info: z.string().optional().nullable(),

  status: z.enum(["NEW", "OLD"]).optional().nullable(),
  serial_number: z.string().optional().nullable(),
  dog_name: z.string().min(1, "Dog name is required"),
  dog_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional().nullable(),
  breed: z.string().optional().nullable(),
  dog_gender: z.enum(["Male", "Female", ""]).optional().nullable(),
  age: z.string().optional().nullable(),
  colour: z.string().optional().nullable(),
  dog_nature: z.enum(["Green", "Orange", "Red", ""]).optional().nullable(),
  requires_hostel: z.boolean().default(false).optional().nullable(),
  requires_training: z.boolean().default(false).optional().nullable(),
  vaccination_card: z.string().optional().nullable(),
  main_issue: z.string().optional().nullable(),
  what_to_learn: z.string().optional().nullable(),
  pick_and_drop: z.string().optional().nullable(),

  advance_amount: z.union([z.string(), z.number()]).optional().nullable(),
  due_amount: z.union([z.string(), z.number()]).optional().nullable(),
  total_amount: z.union([z.string(), z.number()]).optional().nullable(),
  per_day_hostel_charges: z.union([z.string(), z.number()]).optional().nullable(),
});

export type FormValues = z.infer<typeof formSchema>;

export const admissionSchema = z.object({
  registration_id: z.string().uuid(),
  entry_date: z.string().min(1, "Entry date is required"),
  entry_time: z.string().optional().nullable(),
  exit_date: z.string().optional().nullable(),
  exit_time: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  payment_status: z.string().optional().nullable(),
  invoice_no: z.string().optional().nullable(),
  billed_amount: z.union([z.string(), z.number()]).optional().nullable(),
  advance_amount: z.union([z.string(), z.number()]).optional().nullable(),
});

export type AdmissionValues = z.infer<typeof admissionSchema>;
