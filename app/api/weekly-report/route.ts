import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [workouts, dietLogs, transactions, workSessions, todos] = await Promise.all([
    supabase.from("workout_logs").select("title, duration_minutes, calories_burned").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("diet_logs").select("calories, protein_g").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("transactions").select("amount, type").eq("user_id", user.id).gte("date", weekAgo),
    supabase.from("work_sessions").select("duration_minutes").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("todos").select("completed").eq("user_id", user.id),
  ]);

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
  const workoutCount = workouts.data?.length ?? 0;
  const totalCalories = dietLogs.data?.reduce((s, l) => s + l.calories, 0) ?? 0;
  const avgCalories = dietLogs.data && dietLogs.data.length > 0 ? Math.round(totalCalories / 7) : 0;
  const workHours = ((workSessions.data?.reduce((s, w) => s + w.duration_minutes, 0) ?? 0) / 60).toFixed(1);
  const income = transactions.data?.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0;
  const expenses = transactions.data?.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0;
  const completedTodos = todos.data?.filter(t => t.completed).length ?? 0;
  const totalTodos = todos.data?.length ?? 0;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
      <div style="background:#22c55e;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;">⚡</div>
      <span style="font-weight:600;font-size:15px;">Baseline</span>
    </div>

    <h1 style="font-size:22px;font-weight:600;margin:0 0 4px;">Hey ${name},</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;">Here's your weekly summary.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
      <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Workouts</p>
        <p style="font-size:26px;font-weight:700;margin:0;color:#f97316;">${workoutCount}</p>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">sessions this week</p>
      </div>
      <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Avg Calories</p>
        <p style="font-size:26px;font-weight:700;margin:0;color:#22c55e;">${avgCalories}</p>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">kcal/day</p>
      </div>
      <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Work</p>
        <p style="font-size:26px;font-weight:700;margin:0;color:#a78bfa;">${workHours}h</p>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">logged this week</p>
      </div>
      <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Net Balance</p>
        <p style="font-size:26px;font-weight:700;margin:0;color:${income - expenses >= 0 ? "#22c55e" : "#f87171"};">€${(income - expenses).toFixed(0)}</p>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">income - expenses</p>
      </div>
    </div>

    <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;margin-bottom:28px;">
      <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">Todos</p>
      <p style="font-size:14px;color:#e2e8f0;margin:0;">${completedTodos} of ${totalTodos} tasks completed</p>
      <div style="background:#1e1e1e;border-radius:4px;height:6px;margin-top:10px;">
        <div style="background:#22c55e;height:6px;border-radius:4px;width:${totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%;"></div>
      </div>
    </div>

    <p style="color:#334155;font-size:12px;text-align:center;margin:0;">
      Baseline · <a href="https://baseline.app" style="color:#22c55e;text-decoration:none;">Open app</a>
    </p>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "Baseline <reports@baseline-app.com>",
    to: user.email!,
    subject: `Your weekly summary — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    html,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
