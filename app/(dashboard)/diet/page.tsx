import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DietClient } from "@/components/diet/DietClient";

export default async function DietPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const [{ data: logs }, { data: goal }] = await Promise.all([
    supabase.from("diet_logs").select("*").eq("user_id", user.id).gte("logged_at", today).order("created_at", { ascending: false }),
    supabase.from("diet_goals").select("*").eq("user_id", user.id).single(),
  ]);

  return <DietClient userId={user.id} initialLogs={logs ?? []} goal={goal ?? null} />;
}
