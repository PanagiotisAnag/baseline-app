"use client";

import { useState } from "react";
import { Plus, BriefcaseBusiness, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkTimer } from "./WorkTimer";
import { LogSessionModal } from "./LogSessionModal";
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{(weeklyMinutes / 60).toFixed(1)}h this week</p>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Manual Log
        </Button>
      </div>

      <WorkTimer userId={userId} onSessionSaved={refreshSessions} />

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BriefcaseBusiness className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No sessions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.id} className="group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg p-2 bg-purple-500/10 text-purple-500 shrink-0">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.logged_at}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" /> {s.duration_minutes}m
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LogSessionModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshSessions} />
    </div>
  );
}
