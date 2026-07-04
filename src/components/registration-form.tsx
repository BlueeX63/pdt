"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Dog, IndianRupee, Save, Loader2, ArrowLeft, Camera, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/register/register.module.css";
import Link from "next/link";
import { formSchema, FormValues } from "@/lib/schemas";
import { createRegistration, updateRegistration } from "@/app/actions";

function PhotoUploadField({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  icon: React.ElementType;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onChange(dataUrl);
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`${styles.formGroup} ${styles.gridFull}`}>
      <label className={styles.label}>{label}</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          padding: "1rem",
          border: "1px dashed var(--border-hover)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        {value ? (
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <img
              src={value}
              alt="Preview"
              onClick={() => setIsFullscreen(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "var(--radius-sm)",
                border: "2px solid var(--border-primary)",
                cursor: "pointer",
              }}
              title="Click to open full screen"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                backgroundColor: "var(--danger)",
                color: "white",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
              }}
              title="Remove Photo"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-tertiary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Icon size={32} />}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
              width: "fit-content",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <Camera size={16} className="text-indigo-500" />
            {value ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          {value && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              Click thumbnail to view full screen.
            </span>
          )}
        </div>
      </div>

      {isFullscreen && value && (
        <div
          onClick={() => setIsFullscreen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "pointer",
          }}
        >
          <div
            style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={value}
              alt="Full Screen Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                backgroundColor: "var(--danger)",
                color: "white",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                cursor: "pointer",
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


interface Props {
  initialData?: Record<string, unknown>;
  registrationId?: string;
}

export default function RegistrationForm({ initialData, registrationId }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!registrationId;

  // Convert initialData from DB numbers back to strings for the form if editing
  const getInitialValues = (): Partial<FormValues> => {
    if (!initialData) {
      return {
        status: "NEW",
        requires_hostel: false,
        requires_training: false,
        dog_gender: "",
        dog_nature: "",
      };
    }

    return {
      ...initialData,
      serial_number: (initialData?.serial_number as string) || "",
      owner_photo: (initialData?.owner_photo as string) || "",
      dog_photo: (initialData?.dog_photo as string) || "",
      advance_amount: initialData.advance_amount ? String(initialData.advance_amount) : "",
      due_amount: initialData.due_amount ? String(initialData.due_amount) : "",
      total_amount: initialData.total_amount ? String(initialData.total_amount) : "",
      per_day_hostel_charges: initialData.per_day_hostel_charges ? String(initialData.per_day_hostel_charges) : "",
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    // @ts-expect-error mismatch with zodResolver typing
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...data,
      dog_gender: data.dog_gender || null,
      dog_nature: data.dog_nature || null,
      advance_amount: data.advance_amount ? parseFloat(data.advance_amount) : null,
      due_amount: data.due_amount ? parseFloat(data.due_amount) : null,
      total_amount: data.total_amount ? parseFloat(data.total_amount) : null,
      per_day_hostel_charges: data.per_day_hostel_charges ? parseFloat(data.per_day_hostel_charges) : null,
    };

    let res;

    if (isEditing && registrationId) {
      res = await updateRegistration(registrationId, payload);
    } else {
      res = await createRegistration(payload);
    }

    setIsSubmitting(false);

    if (res.error) {
      setSubmitError(
        res.error.includes("owner_photo") || res.error.includes("dog_photo") || res.error.includes("does not exist")
          ? `${res.error} — Did you run the SQL script in Supabase? Run: ALTER TABLE registrations ADD COLUMN IF NOT EXISTS owner_photo TEXT; ALTER TABLE registrations ADD COLUMN IF NOT EXISTS dog_photo TEXT;`
          : res.error
      );
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className={`${styles.title} text-title`}>
          {isEditing ? "Edit Registration" : "New Registration"}
        </h1>
        <p className={`${styles.subtitle} text-body`}>
          {isEditing ? `Editing details for ${initialData?.dog_name || 'dog'}` : "Register a new dog for training or hostel services."}
        </p>
      </div>

      <form 
        // @ts-expect-error type mismatch with hook form
        onSubmit={handleSubmit(onSubmit)} 
        className={styles.form}
      >
        
        {/* Owner Information Section */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={styles.sectionTitle}>
            <User size={20} className={styles.sectionIcon} />
            Information About You
          </h2>
          
          <div className={styles.grid}>
            <PhotoUploadField
              label="Owner Photo"
              value={watch("owner_photo")}
              onChange={(url) => setValue("owner_photo", url)}
              icon={User}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Name *</label>
              <input {...register("owner_name")} className={styles.input} placeholder="Full Name" />
              {errors.owner_name && <span className={styles.error}>{errors.owner_name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Time</label>
              <input {...register("appointment_time")} type="time" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <input {...register("appointment_date")} type="date" className={styles.input} />
            </div>

            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>Address *</label>
              <input {...register("address")} className={styles.input} placeholder="Complete address" />
              {errors.address && <span className={styles.error}>{errors.address.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Landmark</label>
              <input {...register("landmark")} className={styles.input} placeholder="Near..." />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>City *</label>
              <input {...register("city")} className={styles.input} placeholder="City" />
              {errors.city && <span className={styles.error}>{errors.city.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>State *</label>
              <input {...register("state")} className={styles.input} placeholder="State" />
              {errors.state && <span className={styles.error}>{errors.state.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone *</label>
              <input {...register("phone")} className={styles.input} placeholder="+91..." />
              {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Emergency Contact</label>
              <input {...register("emergency_contact")} className={styles.input} placeholder="+91..." />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>E-mail</label>
              <input {...register("email")} type="email" className={styles.input} placeholder="email@example.com" />
              {errors.email && <span className={styles.error}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Aadhar Card No</label>
              <input {...register("aadhar_card_no")} className={styles.input} placeholder="XXXX XXXX XXXX" />
            </div>

            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>Other Information</label>
              <textarea {...register("other_info")} className={styles.textarea} placeholder="Any additional details..." />
            </div>
          </div>
        </motion.div>

        {/* Dog Information Section */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center border-b pb-4 mb-6 border-[var(--border-secondary)]">
            <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <Dog size={20} className={styles.sectionIcon} />
              Information About Your Dog
            </h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="NEW" {...register("status")} className={styles.radioInput} />
                NEW
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="OLD" {...register("status")} className={styles.radioInput} />
                OLD
              </label>
            </div>
          </div>

          <div className={styles.grid}>
            <PhotoUploadField
              label="Dog Photo"
              value={watch("dog_photo")}
              onChange={(url) => setValue("dog_photo", url)}
              icon={Dog}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Dog&apos;s Name *</label>
              <input {...register("dog_name")} className={styles.input} placeholder="Max" />
              {errors.dog_name && <span className={styles.error}>{errors.dog_name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Breed</label>
              <input {...register("breed")} className={styles.input} placeholder="Golden Retriever" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select {...register("dog_gender")} className={styles.select}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Age</label>
              <input {...register("age")} className={styles.input} placeholder="2 years" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Colour</label>
              <input {...register("colour")} className={styles.input} placeholder="Golden" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Dog Nature</label>
              <select {...register("dog_nature")} className={styles.select}>
                <option value="">Select Nature</option>
                <option value="Green">Green (Friendly)</option>
                <option value="Orange">Orange (Cautious)</option>
                <option value="Red">Red (Aggressive)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Services Required</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" {...register("requires_hostel")} className={styles.checkboxInput} />
                  Dog Hostel
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" {...register("requires_training")} className={styles.checkboxInput} />
                  Dog Training
                </label>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>Vaccination Card Details</label>
              <input {...register("vaccination_card")} className={styles.input} placeholder="DHPPI / LEPTO etc." />
            </div>

            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>Dog&apos;s Main Issue</label>
              <textarea {...register("main_issue")} className={styles.textarea} placeholder="Potty training, biting, over-excitement..." />
            </div>

            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>What should dog learn?</label>
              <textarea {...register("what_to_learn")} className={styles.textarea} placeholder="Basic obedience..." />
            </div>
            
            <div className={`${styles.formGroup} ${styles.gridFull}`}>
              <label className={styles.label}>Pick & Drop Details</label>
              <input {...register("pick_and_drop")} className={styles.input} placeholder="Location details..." />
            </div>
          </div>
        </motion.div>

        {/* Payment Details Section */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={styles.sectionTitle}>
            <IndianRupee size={20} className={styles.sectionIcon} />
            Payment Details
          </h2>
          
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Advance Amount</label>
              <input {...register("advance_amount")} type="number" className={styles.input} placeholder="0.00" />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Due Amount</label>
              <input {...register("due_amount")} type="number" className={styles.input} placeholder="0.00" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Total Amount</label>
              <input {...register("total_amount")} type="number" className={styles.input} placeholder="0.00" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Per Day Dog Hostel Charges</label>
              <input {...register("per_day_hostel_charges")} type="number" className={styles.input} placeholder="0.00" />
            </div>
          </div>
        </motion.div>

        {submitError && (
          <div className={styles.submitError}>
            {submitError}
          </div>
        )}

        <div className={styles.footer}>
          {!isEditing && (
            <button type="button" className={styles.buttonSecondary} onClick={() => reset()}>
              Reset Form
            </button>
          )}
          <button type="submit" className={styles.buttonPrimary} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? "Update Registration" : "Save Registration"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
