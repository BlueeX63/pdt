import * as z from "zod";

export const formSchema = z.object({
  owner_name: z.string().min(2, "Name is required"),
  appointment_time: z.string().optional(),
  appointment_date: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  emergency_contact: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")),
  aadhar_card_no: z.string().optional(),
  owner_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional(),
  other_info: z.string().optional(),

  status: z.enum(["NEW", "OLD"]),
  serial_number: z.string().optional(),
  dog_name: z.string().min(1, "Dog name is required"),
  dog_photo: z.string().max(5000000, "Image size exceeds 5MB limit").refine(val => !val || val.startsWith("data:image/") || val.startsWith("http"), "Invalid image format").optional(),
  breed: z.string().optional(),
  dog_gender: z.enum(["Male", "Female", ""]),
  age: z.string().optional(),
  colour: z.string().optional(),
  dog_nature: z.enum(["Green", "Orange", "Red", ""]),
  requires_hostel: z.boolean().default(false),
  requires_training: z.boolean().default(false),
  vaccination_card: z.string().optional(),
  main_issue: z.string().optional(),
  what_to_learn: z.string().optional(),
  pick_and_drop: z.string().optional(),

  advance_amount: z.string().optional(),
  due_amount: z.string().optional(),
  total_amount: z.string().optional(),
  per_day_hostel_charges: z.string().optional(),
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
  billed_amount: z.number().optional().nullable(),
  advance_amount: z.number().optional().nullable(),
});

export type AdmissionValues = z.infer<typeof admissionSchema>;
