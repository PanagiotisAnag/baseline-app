"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Pencil } from "lucide-react";
import { GoalModal } from "@/components/goals/GoalModal";
import type { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GoalWithProgress extends Goal {
  current: number;
}

interface GoalsProps {
  initialGoals: GoalWithProgress[];
  userId: string;
}

const categoryColors: Record<string, string> = {
  workout: "text-orange-400",
  diet: "text-emerald-400",
  work: "text-purple-400",
  finance: "text-blue-400",
};

export function Goals({ initialGoals, userId }: GoalsProps) {
  const [goals, setGoals] = useState<GoalWithProgress[]>(initialGoals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  function handleSaved(goal: Goal) {
    setGoals(prev => {
      const exists = prev.find(g => g.id === goal.id);
      if (exists) return prev.map(g => g.id === goal.id ? { ...g, ...goal } : g);
      return [...prev, { ...goal, current: 0 }];
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Weekly Goals
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => { setEditing(null); setModalOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-3">No goals set yet</p>
              <Button size="sm" className="h-7 text-xs cursor-pointer" onClick={() => { setEditing(null); setModalOpen(true); }}>
                <Plus className="h-3 w-3" /> Set a goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const pct = Math.min((goal.current / goal.target_value) * 100, 100);
                const done = pct >= 100;
                return (
                  <div key={goal.id} className="space-y-1.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium capitalize", categoryColors[goal.category])}>
                          {goal.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{goal.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs tabular-nums font-medium", done ? "text-primary" : "text-muted-foreground")}>
                          {goal.current}/{goal.target_value} {goal.unit}
                        </span>
                        <button
                          onClick={() => { setEditing(goal); setModalOpen(true); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <Progress value={pct} className={cn("h-1.5", done && "[&>div]:bg-primary")} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        existing={editing}
        onSaved={handleSaved}
      />
    </>
  );
}
