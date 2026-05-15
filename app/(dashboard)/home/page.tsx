import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Dumbbell, UtensilsCrossed, Wallet, BriefcaseBusiness, CheckSquare, Repeat } from "lucide-react";
import { StatsCard } from "@/components/home/StatsCard";
import { HomeCharts } from "@/components/home/HomeCharts";
import { HomeProfile } from "@/components/home/HomeProfile";
import { AIInsights } from "@/components/home/AIInsights";
import { Streaks } from "@/components/home/Streaks";
import { Goals } from "@/components/home/Goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calcStreak, calcLongestStreak } from "@/lib/streaks";
import type { Goal } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const allTime = "2020-01-01";

  const [workouts, allWorkouts, dietLogs, allDiet, transactions, workSessions, allWork, todos, dietGoal, goals] = await Promise.all([
    supabase.from("workout_logs").select("duration_minutes, calories_burned, logged_at").eq("user_id", userId).gte("logged_at", weekAgo),
    supabase.from("workout_logs").select("logged_at").eq("user_id", userId).gte("logged_at", allTime),
    supabase.from("diet_logs").select("calories, logged_at").eq("user_id", userId).gte("logged_at", weekAgo),
    supabase.from("diet_logs").select("logged_at").eq("user_id", userId).gte("logged_at", allTime),
    supabase.from("transactions").select("amount, type, date").eq("user_id", userId).gte("date", weekAgo),
    supabase.from("work_sessions").select("duration_minutes, logged_at").eq("user_id", userId).gte("logged_at", weekAgo),
    supabase.from("work_sessions").select("logged_at").eq("user_id", userId).gte("logged_at", allTime),
    supabase.from("todos").select("id, completed").eq("user_id", userId),
    supabase.from("diet_goals").select("daily_calories").eq("user_id", userId).single(),
    supabase.from("goals").select("*").eq("user_id", userId),
  ]);

  const weeklyWorkouts = workouts.data?.length ?? 0;
  const todayCalories = dietLogs.data?.filter(l => l.logged_at === today).reduce((sum, l) => sum + l.calories, 0) ?? 0;
  const weeklyIncome = transactions.data?.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const weeklyExpenses = transactions.data?.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const weeklyWorkHours = Math.round((workSessions.data?.reduce((sum, s) => sum + s.duration_minutes, 0) ?? 0) / 60 * 10) / 10;
  const pendingTodos = todos.data?.filter(t => !t.completed).length ?? 0;
  const dailyCalorieGoal = dietGoal.data?.daily_calories ?? 2000;

  // Streaks
  const workoutDates = allWorkouts.data?.map(w => w.logged_at) ?? [];
  const dietDates = allDiet.data?.map(d => d.logged_at) ?? [];
  const workDates = allWork.data?.map(w => w.logged_at) ?? [];

  // Goals with current progress
  const goalsWithProgress = (goals.data ?? []).map((goal: Goal) => {
    let current = 0;
    if (goal.category === "workout") current = workouts.data?.length ?? 0;
    else if (goal.category === "diet") current = dietLogs.data?.filter(l => l.logged_at === today).reduce((s, l) => s + l.calories, 0) ?? 0;
    else if (goal.category === "work") current = weeklyWorkHours;
    else if (goal.category === "finance") current = weeklyIncome - weeklyExpenses;
    return { ...goal, current };
  });

  // Chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });

  const workoutData = last7.map(date => ({
    day: DAYS[new Date(date).getDay()],
    sessions: workouts.data?.filter(w => w.logged_at === date).length ?? 0,
    minutes: workouts.data?.filter(w => w.logged_at === date).reduce((s, w) => s + w.duration_minutes, 0) ?? 0,
  }));

  const calorieData = last7.map(date => ({
    day: DAYS[new Date(date).getDay()],
    calories: dietLogs.data?.filter(l => l.logged_at === date).reduce((s, l) => s + l.calories, 0) ?? 0,
    goal: dailyCalorieGoal,
  }));

  const financeData = last7.map(date => ({
    day: DAYS[new Date(date).getDay()],
    income: transactions.data?.filter(t => t.type === "income" && t.date === date).reduce((s, t) => s + t.amount, 0) ?? 0,
    expenses: transactions.data?.filter(t => t.type === "expense" && t.date === date).reduce((s, t) => s + t.amount, 0) ?? 0,
  }));

  return {
    weeklyWorkouts, todayCalories, weeklyIncome, weeklyExpenses, weeklyWorkHours, pendingTodos,
    workoutData, calorieData, financeData,
    streaks: {
      workout: calcStreak(workoutDates), workoutLongest: calcLongestStreak(workoutDates),
      diet: calcStreak(dietDates), dietLongest: calcLongestStreak(dietDates),
      work: calcStreak(workDates), workLongest: calcLongestStreak(workDates),
    },
    goalsWithProgress,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stats = await getDashboardData(user.id);
  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your weekly snapshot</p>
        </div>
        <HomeProfile
          name={name}
          email={user.email ?? ""}
          avatarUrl={user.user_metadata?.avatar_url}
          joinedAt={user.created_at}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard title="Workouts" value={stats.weeklyWorkouts} subtitle="this week" iconName="dumbbell" color="orange" />
        <StatsCard title="Calories" value={stats.todayCalories} subtitle="today" iconName="utensils" color="green" />
        <StatsCard title="Income" value={`€${stats.weeklyIncome.toFixed(0)}`} subtitle="this week" iconName="wallet" color="blue" />
        <StatsCard title="Expenses" value={`€${stats.weeklyExpenses.toFixed(0)}`} subtitle="this week" iconName="trending" color="red" />
        <StatsCard title="Work" value={stats.weeklyWorkHours} subtitle="hours" iconName="briefcase" color="purple" />
        <StatsCard title="Todos" value={stats.pendingTodos} subtitle="pending" iconName="check" color="orange" />
      </div>

      {/* Streaks + Goals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Streaks
          workoutStreak={stats.streaks.workout}
          workoutLongest={stats.streaks.workoutLongest}
          dietStreak={stats.streaks.diet}
          dietLongest={stats.streaks.dietLongest}
          workStreak={stats.streaks.work}
          workLongest={stats.streaks.workLongest}
        />
        <Goals initialGoals={stats.goalsWithProgress} userId={user.id} />
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Charts */}
      <section className="space-y-3">
        <p className="section-label px-0.5">Activity Trends</p>
        <HomeCharts workoutData={stats.workoutData} calorieData={stats.calorieData} financeData={stats.financeData} />
      </section>

      {/* Quick Actions + Balance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href="/workout">
              <Badge variant="secondary" className="cursor-pointer hover:bg-orange-500/15 hover:text-orange-400 transition-all duration-150 py-1.5 px-3 gap-1.5">
                <Dumbbell className="h-3 w-3" /> Log Workout
              </Badge>
            </a>
            <a href="/diet">
              <Badge variant="secondary" className="cursor-pointer hover:bg-emerald-500/15 hover:text-emerald-400 transition-all duration-150 py-1.5 px-3 gap-1.5">
                <UtensilsCrossed className="h-3 w-3" /> Log Meal
              </Badge>
            </a>
            <a href="/financials">
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-500/15 hover:text-blue-400 transition-all duration-150 py-1.5 px-3 gap-1.5">
                <Wallet className="h-3 w-3" /> Add Transaction
              </Badge>
            </a>
            <a href="/work">
              <Badge variant="secondary" className="cursor-pointer hover:bg-purple-500/15 hover:text-purple-400 transition-all duration-150 py-1.5 px-3 gap-1.5">
                <BriefcaseBusiness className="h-3 w-3" /> Work Session
              </Badge>
            </a>
            <a href="/habits">
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/15 hover:text-primary transition-all duration-150 py-1.5 px-3 gap-1.5">
                <Repeat className="h-3 w-3" /> Habits
              </Badge>
            </a>
            <a href="/todos">
              <Badge variant="secondary" className="cursor-pointer hover:bg-orange-500/15 hover:text-orange-400 transition-all duration-150 py-1.5 px-3 gap-1.5">
                <CheckSquare className="h-3 w-3" /> Add Todo
              </Badge>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Weekly Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold tabular-nums ${stats.weeklyIncome - stats.weeklyExpenses >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                €{(stats.weeklyIncome - stats.weeklyExpenses).toFixed(2)}
              </span>
              <span className="text-muted-foreground text-xs">net this week</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-emerald-500/8 px-3 py-2">
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-sm font-semibold text-emerald-500 tabular-nums mt-0.5">+€{stats.weeklyIncome.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-red-500/8 px-3 py-2">
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-sm font-semibold text-red-400 tabular-nums mt-0.5">-€{stats.weeklyExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
