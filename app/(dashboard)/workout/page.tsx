import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkoutClient } from "@/components/workout/WorkoutClient";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);

  return <WorkoutClient userId={user.id} initialLogs={logs ?? []} />;
}
