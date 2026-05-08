import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [workouts, dietLogs, transactions, workSessions, todos] = await Promise.all([
    supabase.from("workout_logs").select("title, duration_minutes, calories_burned, logged_at").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("diet_logs").select("meal_name, calories, protein_g, logged_at").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("transactions").select("title, amount, type, category, date").eq("user_id", user.id).gte("date", weekAgo),
    supabase.from("work_sessions").select("title, duration_minutes, logged_at").eq("user_id", user.id).gte("logged_at", weekAgo),
    supabase.from("todos").select("title, completed, priority").eq("user_id", user.id),
  ]);

  const summary = {
    workouts: workouts.data ?? [],
    diet: dietLogs.data ?? [],
    transactions: transactions.data ?? [],
    work: workSessions.data ?? [],
    todos: { total: todos.data?.length ?? 0, completed: todos.data?.filter(t => t.completed).length ?? 0 },
  };

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a personal stats coach. Analyze the user's past week data and give 3 short, actionable insights (1-2 sentences each). Be specific, positive, and motivating. Format as a JSON array of strings.

Data: ${JSON.stringify(summary)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return NextResponse.json({ insights: [] });

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [content.text];
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: [content.text] });
  }
}
