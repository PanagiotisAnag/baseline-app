"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Trash2, Plus, Timer, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTimers, type TimerMode } from "@/lib/TimerContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatCountdown(elapsed: number, total: number) {
  const remaining = Math.max(0, total - elapsed);
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface TimerManagerProps {
  userId: string;
  onSessionSaved: () => void;
}

export function TimerManager({ userId, onSessionSaved }: TimerManagerProps) {
  const { timers, addTimer, removeTimer, toggleTimer, resetTimer, updateLabel } = useTimers();
  const [newLabel, setNewLabel] = useState("");
  const [newMode, setNewMode] = useState<TimerMode>("stopwatch");
  const [newMinutes, setNewMinutes] = useState(25);
  const supabase = createClient();

  async function saveSession(timerId: string) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;
    const minutes = timer.mode === "stopwatch"
      ? Math.round(timer.elapsed / 60)
      : Math.round(timer.countdownFrom / 60);
    if (minutes < 1) { toast.error("Session too short (min 1 minute)"); return; }
    const { error } = await supabase.from("work_sessions").insert({
      user_id: userId,
      title: timer.label || "Work session",
      duration_minutes: minutes,
      logged_at: new Date().toISOString().split("T")[0],
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Saved: ${minutes}m session`);
    removeTimer(timerId);
    onSessionSaved();
  }

  function handleAdd() {
    const label = newLabel.trim() || (newMode === "stopwatch" ? "Stopwatch" : `${newMinutes}min session`);
    addTimer(label, newMode, newMinutes);
    setNewLabel("");
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium">Timers</span>
      </div>

      {/* Add new timer */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Session label"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="h-8 text-xs flex-1 min-w-32"
        />
        <div className="flex gap-1">
          <button
            onClick={() => setNewMode("stopwatch")}
            className={`h-8 px-3 rounded-md text-xs border transition-colors cursor-pointer ${newMode === "stopwatch" ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            <Timer className="h-3 w-3 inline mr-1" />SW
          </button>
          <button
            onClick={() => setNewMode("countdown")}
            className={`h-8 px-3 rounded-md text-xs border transition-colors cursor-pointer ${newMode === "countdown" ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            <Hourglass className="h-3 w-3 inline mr-1" />CD
          </button>
        </div>
        {newMode === "countdown" && (
          <Input
            type="number"
            min={1}
            max={480}
            value={newMinutes}
            onChange={e => setNewMinutes(Number(e.target.value))}
            className="h-8 text-xs w-20"
          />
        )}
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Timer list */}
      {timers.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No timers. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {timers.map(t => {
            const display = t.mode === "stopwatch"
              ? formatTime(t.elapsed)
              : formatCountdown(t.elapsed, t.countdownFrom);
            const pct = t.mode === "countdown" ? Math.min(100, (t.elapsed / t.countdownFrom) * 100) : null;
            return (
              <div key={t.id} className={`rounded-lg border px-3 py-2.5 space-y-2 ${t.finished ? "border-purple-500/40 bg-purple-500/5" : "bg-muted/30"}`}>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 bg-transparent text-xs font-medium outline-none min-w-0"
                    value={t.label}
                    onChange={e => updateLabel(t.id, e.target.value)}
                    disabled={t.running}
                  />
                  <Badge variant="secondary" className={`text-xs h-5 px-2 tabular-nums font-mono ${t.finished ? "text-purple-400" : ""}`}>
                    {display}
                  </Badge>
                  {t.mode === "countdown" && (
                    <span className="text-xs text-muted-foreground">{Math.round(t.countdownFrom / 60)}m</span>
                  )}
                </div>

                {pct !== null && (
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${t.finished ? "bg-purple-500" : "bg-purple-400/60"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {!t.finished && (
                    <button
                      onClick={() => toggleTimer(t.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {t.running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => resetTimer(t.id)}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                  {(t.mode === "stopwatch" ? t.elapsed >= 60 : true) && (
                    <button
                      onClick={() => saveSession(t.id)}
                      className="h-6 px-2 rounded-md text-xs text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer ml-auto"
                    >
                      Save session
                    </button>
                  )}
                  <button
                    onClick={() => removeTimer(t.id)}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {t.finished && (
                  <p className="text-xs text-purple-400 font-medium">Timer finished!</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
