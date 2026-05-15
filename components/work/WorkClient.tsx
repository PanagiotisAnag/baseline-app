"use client";

import { useState } from "react";
import { Plus, BriefcaseBusiness, Clock, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkTimer } from "./WorkTimer";
import { LogSessionModal } from "./LogSessionModal";
import { ReminderSection } from "./ReminderSection";
import { BulkImportModal } from "@/components/shared/BulkImportModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { WorkSession } from "@/lib/types";

interface WorkClientProps {
  userId: string;
  initialSessions: WorkSession[];
}

export function WorkClient({ userId, initialSessions }: WorkClientProps) {
  const [sessions, setSessions] = useState<WorkSession[]>(initialSessions);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const supabase = createClient();

  const weeklyMinutes = sessions.filter(s => {
    const date = new Date(s.logged_at);
    return date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).reduce((sum, s) => sum + s.duration_minutes, 0);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("work_sessions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success("Deleted");
  }

  async function refreshSessions() {
    const { data } = await supabase.from("work_sessions").select("*").eq("user_id", userId).order("logged_at", { ascending: false }).limit(50);
    setSessions(data ?? []);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{(weeklyMinutes / 60).toFixed(1)}h this week</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Manual Log
          </Button>
        </div>
      </div>

      <WorkTimer userId={userId} onSessionSaved={refreshSessions} />

      <ReminderSection />

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BriefcaseBusiness className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No sessions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start the timer or log a session manually</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
              <div className="rounded-md p-1.5 bg-purple-500/10 text-purple-400 shrink-0">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.logged_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="gap-1 text-xs h-5 px-2">
                  <Clock className="h-2.5 w-2.5" /> {s.duration_minutes}m
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LogSessionModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshSessions} />
      <BulkImportModal open={importOpen} onClose={() => setImportOpen(false)} userId={userId} onSuccess={refreshSessions} />
    </div>
  );
}
