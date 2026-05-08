"use client";

import { useState } from "react";
import { Plus, UtensilsCrossed, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Today&apos;s intake</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setGoalModalOpen(true)}>
            <Target className="h-4 w-4 mr-1" /> Set Goal
          </Button>
          <Button size="sm" onClick={() => setMealModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Log Meal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold">{totalCalories}</p>
            {goal && <p className="text-xs text-muted-foreground">/ {goal.daily_calories} kcal</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold">{totalProtein.toFixed(0)}g</p>
            {goal?.protein_g && <p className="text-xs text-muted-foreground">/ {goal.protein_g}g target</p>}
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Daily goal progress</p>
            {goal ? (
              <>
                <Progress value={calorieProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{calorieProgress.toFixed(0)}%</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No goal set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No meals logged today.</p>
          <Button className="mt-4" onClick={() => setMealModalOpen(true)}>Log your first meal</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg p-2 bg-emerald-500/10 text-emerald-500 shrink-0">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{log.meal_name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{log.calories} kcal</Badge>
                  {log.protein_g && <Badge variant="secondary" className="text-blue-500">{log.protein_g}g protein</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LogMealModal open={mealModalOpen} onClose={() => setMealModalOpen(false)} userId={userId} onSuccess={refreshLogs} />
      <SetGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} userId={userId} goal={goal} onSuccess={refreshGoal} />
    </div>
  );
}
