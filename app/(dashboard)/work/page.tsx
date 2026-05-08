import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkClient } from "@/components/work/WorkClient";

export default async function WorkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);

  return <WorkClient userId={user.id} initialSessions={sessions ?? []} />;
}
