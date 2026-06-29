import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RegistrationForm from "@/components/registration-form";

export default async function EditRegistrationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <RegistrationForm initialData={data} registrationId={resolvedParams.id} />;
}
