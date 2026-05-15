"use client";

import { useState } from "react";
import { Plus, Dumbbell, Clock, Flame, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogWorkoutModal } from "./LogWorkoutModal";
import { BulkImportModal } from "@/components/shared/BulkImportModal";
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
  const [importOpen, setImportOpen] = useState(false);
  const supabase = createClient();

  async function handleDelete(id: string) {
    const { error } = await supabase.from("workout_logs").delete().eq("id", id);
    if (error) { toast.error(error.message); } else {
      setLogs(prev => prev.filter(l => l.id !== id));
      toast.success("Deleted");
    }
  }

  async function refreshLogs() {
    const { data } = await supabase.from("workout_logs").select("*").eq("user_id", userId).order("logged_at", { ascending: false }).limit(50);
    setLogs(data ?? []);
  }

  const totalThisWeek = logs.filter(l => new Date(l.logged_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{totalThisWeek} sessions this week</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log Workout
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No workouts yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Start logging to track your progress</p>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>Log your first workout</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
              <div className="rounded-md p-1.5 bg-orange-500/10 text-orange-400 shrink-0">
                <Dumbbell className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{log.logged_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="gap-1 text-xs h-5 px-2">
                  <Clock className="h-2.5 w-2.5" /> {log.duration_minutes}m
                </Badge>
                {log.calories_burned && (
                  <Badge variant="secondary" className="gap-1 text-xs h-5 px-2 text-orange-400">
                    <Flame className="h-2.5 w-2.5" /> {log.calories_burned}
                  </Badge>
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

      <LogWorkoutModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshLogs} />
      <BulkImportModal open={importOpen} onClose={() => setImportOpen(false)} userId={userId} onSuccess={refreshLogs} />
    </div>
  );
}
