"use client";

import { useState } from "react";
import { Plus, Repeat, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddHabitModal } from "./AddHabitModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { calcStreak } from "@/lib/streaks";
import type { Habit, HabitCompletion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitsClientProps {
  userId: string;
  initialHabits: Habit[];
  initialCompletions: HabitCompletion[];
  today: string;
}

// Last 7 days as YYYY-MM-DD strings
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().split("T")[0];
  });
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function HabitsClient({ userId, initialHabits, initialCompletions, today }: HabitsClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [completions, setCompletions] = useState<HabitCompletion[]>(initialCompletions);
  const [modalOpen, setModalOpen] = useState(false);
  const supabase = createClient();
  const last7 = getLast7Days();

  function isDone(habitId: string, date: string) {
    return completions.some(c => c.habit_id === habitId && c.completed_on === date);
  }

  async function toggleToday(habit: Habit) {
    const done = isDone(habit.id, today);
    if (done) {
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habit.id)
        .eq("completed_on", today);
      if (error) { toast.error(error.message); return; }
      setCompletions(prev => prev.filter(c => !(c.habit_id === habit.id && c.completed_on === today)));
    } else {
      const { data, error } = await supabase
        .from("habit_completions")
        .insert({ habit_id: habit.id, user_id: userId, completed_on: today })
        .select()
        .single();
      if (error) { toast.error(error.message); return; }
      setCompletions(prev => [...prev, data as HabitCompletion]);
    }
  }

  async function archiveHabit(id: string) {
    const { error } = await supabase.from("habits").update({ archived: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success("Habit removed");
  }

  function getStreak(habitId: string) {
    const dates = completions.filter(c => c.habit_id === habitId).map(c => c.completed_on);
    return calcStreak(dates);
  }

  const completedToday = habits.filter(h => isDone(h.id, today)).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {completedToday}/{habits.length} done today
        </p>
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Repeat className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No habits yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Build streaks by checking off daily habits</p>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
            Add your first habit
          </Button>
        </div>
      ) : (
        <>
          {/* Header row — day labels */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] border-b px-4 py-2">
              <span className="text-xs text-muted-foreground">Habit</span>
              <div className="flex gap-3">
                {last7.map((date, i) => (
                  <div key={date} className="w-7 text-center">
                    <span className="text-xs text-muted-foreground">
                      {DAY_LABELS[new Date(date).getDay()]}
                    </span>
                  </div>
                ))}
                <div className="w-12 text-center">
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </div>
            </div>

            {habits.map((habit, idx) => {
              const streak = getStreak(habit.id);
              const todayDone = isDone(habit.id, today);
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "group grid grid-cols-[1fr_auto] px-4 py-3 transition-colors",
                    idx !== habits.length - 1 && "border-b",
                    todayDone && "bg-primary/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                    <p className="text-sm font-medium truncate">{habit.title}</p>
                    {streak > 0 && (
                      <span className="text-xs text-muted-foreground shrink-0">{streak}🔥</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Past 6 days (read-only dots) */}
                    {last7.slice(0, 6).map((date) => (
                      <div key={date} className="w-7 flex justify-center">
                        <div className={cn(
                          "h-5 w-5 rounded-full border transition-colors",
                          isDone(habit.id, date)
                            ? "border-transparent"
                            : "border-muted bg-transparent"
                        )}
                          style={isDone(habit.id, date) ? { backgroundColor: habit.color, opacity: 0.6 } : {}}
                        />
                      </div>
                    ))}

                    {/* Today — interactive */}
                    <div className="w-12 flex justify-center gap-1">
                      <button
                        onClick={() => toggleToday(habit)}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                          todayDone
                            ? "border-transparent text-white"
                            : "border-muted hover:border-primary/50"
                        )}
                        style={todayDone ? { backgroundColor: habit.color } : {}}
                      >
                        {todayDone && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => archiveHabit(habit.id)}
                        className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">Weekly completion</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${habits.length > 0 ? (completedToday / habits.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </>
      )}

      <AddHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        onAdded={(h) => setHabits(prev => [...prev, h])}
      />
    </div>
  );
}
