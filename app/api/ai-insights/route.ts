import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a personal stats coach. Analyze the user's past week data and give 3 short, actionable insights (1-2 sentences each). Be specific, positive, and motivating. Reply ONLY with a valid JSON array of 3 strings, no extra text.

Data: ${JSON.stringify(summary)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [text];
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: [text] });
  }
}
