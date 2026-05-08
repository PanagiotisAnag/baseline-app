"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface WorkTimerProps {
  userId: string;
  onSessionSaved: () => void;
}

export function WorkTimer({ userId, onSessionSaved }: WorkTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionTitle, setSessionTitle] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function format(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  async function handleStop() {
    setRunning(false);
    if (elapsed < 60) {
      toast.error("Session too short (min 1 minute)");
      setElapsed(0);
      return;
    }
    const duration_minutes = Math.round(elapsed / 60);
    const { error } = await supabase.from("work_sessions").insert({
      user_id: userId,
      title: sessionTitle || "Work session",
      duration_minutes,
      logged_at: new Date().toISOString().split("T")[0],
    });
    if (error) { toast.error(error.message); } else {
      toast.success(`Saved: ${duration_minutes}m session`);
      onSessionSaved();
    }
    setElapsed(0);
    setSessionTitle("");
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Work Timer</span>
          </div>
          <span className="text-5xl font-mono font-bold tabular-nums">{format(elapsed)}</span>
          <Input
            placeholder="What are you working on?"
            value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
            className="max-w-xs text-center"
            disabled={running}
          />
          <div className="flex gap-2">
            <Button
              variant={running ? "outline" : "default"}
              onClick={() => setRunning(r => !r)}
            >
              {running ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Start</>}
            </Button>
            {elapsed > 0 && (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="h-4 w-4 mr-1" /> Stop & Save
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
