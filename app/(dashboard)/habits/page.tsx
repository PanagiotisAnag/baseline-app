import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HabitsClient } from "@/components/habits/HabitsClient";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  const { data: completions } = await supabase
    .from("habit_completions")
    .select("id, habit_id, user_id, completed_on")
    .eq("user_id", user.id)
    .gte("completed_on", thirtyDaysAgo);

  return (
    <HabitsClient
      userId={user.id}
      initialHabits={habits ?? []}
      initialCompletions={completions ?? []}
      today={today}
    />
  );
}
