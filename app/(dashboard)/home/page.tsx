import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Dumbbell, UtensilsCrossed, Wallet, BriefcaseBusiness, CheckSquare, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/home/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [workouts, dietLogs, transactions, workSessions, todos] = await Promise.all([
    supabase.from("workout_logs").select("id, duration_minutes, logged_at").eq("user_id", userId).gte("logged_at", weekAgo),
    supabase.from("diet_logs").select("calories, logged_at").eq("user_id", userId).gte("logged_at", today),
    supabase.from("transactions").select("amount, type").eq("user_id", userId).gte("date", weekAgo),
    supabase.from("work_sessions").select("duration_minutes, logged_at").eq("user_id", userId).gte("logged_at", weekAgo),
    supabase.from("todos").select("id, completed").eq("user_id", userId),
  ]);

  const weeklyWorkouts = workouts.data?.length ?? 0;
  const todayCalories = dietLogs.data?.reduce((sum, l) => sum + l.calories, 0) ?? 0;
  const weeklyIncome = transactions.data?.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const weeklyExpenses = transactions.data?.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const weeklyWorkHours = Math.round((workSessions.data?.reduce((sum, s) => sum + s.duration_minutes, 0) ?? 0) / 60 * 10) / 10;
  const pendingTodos = todos.data?.filter(t => !t.completed).length ?? 0;

  return { weeklyWorkouts, todayCalories, weeklyIncome, weeklyExpenses, weeklyWorkHours, pendingTodos };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getDashboardData(user.id);
  const name = user.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">{greeting}, {name} 👋</h2>
        <p className="text-muted-foreground mt-1">Here&apos;s your weekly snapshot</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard
          title="Workouts this week"
          value={stats.weeklyWorkouts}
          subtitle="sessions"
          icon={Dumbbell}
          color="orange"
        />
        <StatsCard
          title="Calories today"
          value={stats.todayCalories}
          subtitle="kcal"
          icon={UtensilsCrossed}
          color="green"
        />
        <StatsCard
          title="Weekly income"
          value={`€${stats.weeklyIncome.toFixed(0)}`}
          icon={Wallet}
          color="blue"
        />
        <StatsCard
          title="Weekly expenses"
          value={`€${stats.weeklyExpenses.toFixed(0)}`}
          icon={TrendingUp}
          color="red"
        />
        <StatsCard
          title="Work hours"
          value={stats.weeklyWorkHours}
          subtitle="this week"
          icon={BriefcaseBusiness}
          color="purple"
        />
        <StatsCard
          title="Pending todos"
          value={stats.pendingTodos}
          subtitle="tasks"
          icon={CheckSquare}
          color="orange"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href="/workout">
              <Badge variant="secondary" className="cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-colors py-1.5 px-3">
                <Dumbbell className="h-3 w-3 mr-1" /> Log Workout
              </Badge>
            </a>
            <a href="/diet">
              <Badge variant="secondary" className="cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors py-1.5 px-3">
                <UtensilsCrossed className="h-3 w-3 mr-1" /> Log Meal
              </Badge>
            </a>
            <a href="/financials">
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-500/20 hover:text-blue-500 transition-colors py-1.5 px-3">
                <Wallet className="h-3 w-3 mr-1" /> Add Transaction
              </Badge>
            </a>
            <a href="/work">
              <Badge variant="secondary" className="cursor-pointer hover:bg-purple-500/20 hover:text-purple-500 transition-colors py-1.5 px-3">
                <BriefcaseBusiness className="h-3 w-3 mr-1" /> Start Work Session
              </Badge>
            </a>
            <a href="/todos">
              <Badge variant="secondary" className="cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-colors py-1.5 px-3">
                <CheckSquare className="h-3 w-3 mr-1" /> Add Todo
              </Badge>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${stats.weeklyIncome - stats.weeklyExpenses >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                €{(stats.weeklyIncome - stats.weeklyExpenses).toFixed(2)}
              </span>
              <span className="text-muted-foreground text-sm mb-1">net this week</span>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <div>
                <span className="text-emerald-500 font-medium">+€{stats.weeklyIncome.toFixed(2)}</span>
                <span className="text-muted-foreground ml-1">income</span>
              </div>
              <div>
                <span className="text-red-500 font-medium">-€{stats.weeklyExpenses.toFixed(2)}</span>
                <span className="text-muted-foreground ml-1">expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
