import { createClient } from "@/lib/supabase/server";
import DashboardTable from "@/components/dashboard-table";
import DashboardStats from "@/components/dashboard-stats";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { Plus } from "lucide-react";
import { resequenceSerialNumbers } from "@/app/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  await resequenceSerialNumbers(supabase);
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: admissions } = await supabase
    .from("admissions")
    .select("*");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Registrations</h1>
          <p className={styles.subtitle}>
            Manage all dog training and hostel registrations.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard/register" className={styles.buttonPrimary}>
            <Plus size={16} strokeWidth={2.5} />
            New Registration
          </Link>
        </div>
      </div>

      <DashboardStats registrations={registrations || []} admissions={admissions || []} />

      <div className={styles.tableCard}>
        <DashboardTable initialData={registrations || []} initialAdmissions={admissions || []} />
      </div>
    </div>
  );
}
