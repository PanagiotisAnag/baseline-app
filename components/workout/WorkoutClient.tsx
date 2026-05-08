"use client";

import { useState } from "react";
import { Plus, Dumbbell, Clock, Flame, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogWorkoutModal } from "./LogWorkoutModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { WorkoutLog } from "@/lib/types";

interface WorkoutClientProps {
  userId: string;
  initialLogs: WorkoutLog[];
}

export function WorkoutClient({ userId, initialLogs }: WorkoutClientProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>(initialLogs);
  const [modalOpen, setModalOpen] = useState(false);
  const supabase = createClient();

  async function handleDelete(id: string) {
    const { error } = await supabase.from("workout_logs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setLogs(prev => prev.filter(l => l.id !== id));
      toast.success("Deleted");
    }
  }

  async function refreshLogs() {
    const { data } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(50);
    setLogs(data ?? []);
  }

  const totalThisWeek = logs.filter(l => {
    const date = new Date(l.logged_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{totalThisWeek} sessions this week</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Log Workout
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No workouts logged yet.</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>
            Log your first workout
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg p-2 bg-orange-500/10 text-orange-500 shrink-0">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{log.title}</p>
                  <p className="text-xs text-muted-foreground">{log.logged_at}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" /> {log.duration_minutes}m
                  </Badge>
                  {log.calories_burned && (
                    <Badge variant="secondary" className="gap-1 text-orange-500">
                      <Flame className="h-3 w-3" /> {log.calories_burned}
                    </Badge>
                  )}
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

      <LogWorkoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        onSuccess={refreshLogs}
      />
    </div>
  );
}
