import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ActivitiesClient } from "@/components/activities/ActivitiesClient";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);

  return <ActivitiesClient userId={user.id} initialActivities={activities ?? []} />;
}
