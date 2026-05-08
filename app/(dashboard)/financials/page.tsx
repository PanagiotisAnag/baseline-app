import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinancialsClient } from "@/components/financials/FinancialsClient";

export default async function FinancialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(100);

  return <FinancialsClient userId={user.id} initialTransactions={transactions ?? []} />;
}
