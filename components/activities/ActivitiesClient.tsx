"use client";

import { useState } from "react";
import { Plus, Activity, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogActivityModal } from "./LogActivityModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Activity as ActivityType } from "@/lib/types";

interface ActivitiesClientProps {
  userId: string;
  initialActivities: ActivityType[];
}

export function ActivitiesClient({ userId, initialActivities }: ActivitiesClientProps) {
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [modalOpen, setModalOpen] = useState(false);
  const supabase = createClient();

  async function handleDelete(id: string) {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success("Deleted");
  }

  async function refreshActivities() {
    const { data } = await supabase.from("activities").select("*").eq("user_id", userId).order("logged_at", { ascending: false }).limit(50);
    setActivities(data ?? []);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{activities.length} activities logged</p>
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Log Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Activity className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No activities yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Log anything you do — sports, hobbies, habits</p>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>Log your first activity</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <div key={a.id} className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
              <div className="rounded-md p-1.5 bg-blue-500/10 text-blue-400 shrink-0">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.type} · {a.logged_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.duration_minutes && (
                  <Badge variant="secondary" className="gap-1 text-xs h-5 px-2">
                    <Clock className="h-2.5 w-2.5" /> {a.duration_minutes}m
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LogActivityModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshActivities} />
    </div>
  );
}
