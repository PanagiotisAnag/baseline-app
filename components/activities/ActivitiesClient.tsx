"use client";

import { useState } from "react";
import { Plus, Activity, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{activities.length} activities logged</p>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No activities logged yet.</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>Log your first activity</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <Card key={a.id} className="group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg p-2 bg-blue-500/10 text-blue-500 shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {a.logged_at}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.duration_minutes && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> {a.duration_minutes}m
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LogActivityModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshActivities} />
    </div>
  );
}
