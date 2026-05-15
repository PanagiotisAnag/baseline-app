"use client";

import { useState } from "react";
import { Plus, UtensilsCrossed, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogMealModal } from "./LogMealModal";
import { SetGoalModal } from "./SetGoalModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { DietLog, DietGoal } from "@/lib/types";

interface DietClientProps {
  userId: string;
  initialLogs: DietLog[];
  goal: DietGoal | null;
}

export function DietClient({ userId, initialLogs, goal: initialGoal }: DietClientProps) {
  const [logs, setLogs] = useState<DietLog[]>(initialLogs);
  const [goal, setGoal] = useState<DietGoal | null>(initialGoal);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const supabase = createClient();

  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalProtein = logs.reduce((sum, l) => sum + (l.protein_g ?? 0), 0);
  const calorieProgress = goal ? Math.min((totalCalories / goal.daily_calories) * 100, 100) : 0;

  async function handleDelete(id: string) {
    const { error } = await supabase.from("diet_logs").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLogs(prev => prev.filter(l => l.id !== id));
    toast.success("Deleted");
  }

  async function refreshLogs() {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("diet_logs").select("*").eq("user_id", userId).gte("logged_at", today).order("created_at", { ascending: false });
    setLogs(data ?? []);
  }

  async function refreshGoal() {
    const { data } = await supabase.from("diet_goals").select("*").eq("user_id", userId).single();
    setGoal(data ?? null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Today&apos;s intake</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setGoalModalOpen(true)}>
            <Target className="h-3.5 w-3.5" /> Set Goal
          </Button>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setMealModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log Meal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold tabular-nums">{totalCalories}</p>
            {goal && <p className="text-xs text-muted-foreground">/ {goal.daily_calories} kcal</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold tabular-nums">{totalProtein.toFixed(0)}g</p>
            {goal?.protein_g && <p className="text-xs text-muted-foreground">/ {goal.protein_g}g target</p>}
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">Daily goal</p>
            {goal ? (
              <>
                <Progress value={calorieProgress} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1.5">{calorieProgress.toFixed(0)}% of daily target</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No goal set yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No meals today</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Log what you eat to track your nutrition</p>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setMealModalOpen(true)}>Log your first meal</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
              <div className="rounded-md p-1.5 bg-emerald-500/10 text-emerald-400 shrink-0">
                <UtensilsCrossed className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.meal_name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs h-5 px-2">{log.calories} kcal</Badge>
                {log.protein_g && (
                  <Badge variant="secondary" className="text-xs h-5 px-2 text-blue-400">{log.protein_g}g protein</Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => handleDelete(log.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LogMealModal open={mealModalOpen} onClose={() => setMealModalOpen(false)} userId={userId} onSuccess={refreshLogs} />
      <SetGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} userId={userId} goal={goal} onSuccess={refreshGoal} />
    </div>
  );
}
