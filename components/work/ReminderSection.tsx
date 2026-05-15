"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAudio } from "@/lib/useAudio";
import { toast } from "sonner";
import { formatDistanceToNow, isPast } from "date-fns";

interface Reminder {
  id: string;
  title: string;
  remind_at: string;
  is_completed: boolean;
}

interface ReminderSectionProps {
  userId: string;
}

const QUICK_MINUTES = [1, 5, 10, 30];

export function ReminderSection({ userId }: ReminderSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [label, setLabel] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [, setTick] = useState(0);
  const supabase = createClient();
  const { playAlarm } = useAudio();

  useEffect(() => {
    load();
  }, [userId]);

  // Re-render every 10s to update countdown display
  useEffect(() => {
    const interval = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Check for due reminders every 30s
  const checkDue = useCallback(() => {
    reminders.forEach(r => {
      if (!r.is_completed && isPast(new Date(r.remind_at))) {
        playAlarm();
        toast.info(`Reminder: ${r.title}`, { duration: 8000 });
        markComplete(r.id);
      }
    });
  }, [reminders, playAlarm]);

  useEffect(() => {
    const interval = setInterval(checkDue, 30000);
    return () => clearInterval(interval);
  }, [checkDue]);

  async function load() {
    const { data } = await supabase
      .from("work_reminders")
      .select("id, title, remind_at, is_completed")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("remind_at", { ascending: true });
    setReminders(data ?? []);
  }

  async function addReminder(mins: number, titleOverride?: string) {
    const title = (titleOverride ?? label).trim();
    if (!title) { toast.error("Enter a reminder title"); return; }
    const remind_at = new Date(Date.now() + mins * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("work_reminders")
      .insert({ user_id: userId, title, remind_at, is_completed: false })
      .select("id, title, remind_at, is_completed")
      .single();
    if (error) { toast.error(error.message); return; }
    setReminders(prev => [...prev, data]);
    setLabel("");
    toast.success(`Reminder in ${mins}m`);
  }

  async function markComplete(id: string) {
    await supabase.from("work_reminders").update({ is_completed: true }).eq("id", id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  async function deleteReminder(id: string) {
    await supabase.from("work_reminders").delete().eq("id", id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  const activeReminders = reminders.filter(r => !isPast(new Date(r.remind_at)));
  const overdueReminders = reminders.filter(r => isPast(new Date(r.remind_at)));

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium">Reminders</span>
        {reminders.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{reminders.length} active</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g. Take a break"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addReminder(minutes)}
          className="h-8 text-xs flex-1"
        />
        <Input
          type="number"
          min={1}
          max={480}
          value={minutes}
          onChange={e => setMinutes(Number(e.target.value))}
          className="h-8 text-xs w-16"
        />
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => addReminder(minutes)} disabled={!label.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {label.trim() && (
        <div className="flex gap-1">
          {QUICK_MINUTES.map(m => (
            <button
              key={m}
              onClick={() => addReminder(m)}
              className="h-6 px-2 rounded-md text-xs border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              +{m}m
            </button>
          ))}
        </div>
      )}

      {overdueReminders.length > 0 && (
        <div className="space-y-1">
          {overdueReminders.map(r => (
            <div key={r.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-destructive/10 border border-destructive/20">
              <BellOff className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="flex-1 text-xs text-destructive line-through">{r.title}</span>
              <span className="text-xs text-destructive/70">overdue</span>
              <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeReminders.length === 0 && overdueReminders.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-1">No reminders set.</p>
      ) : (
        <div className="space-y-1">
          {activeReminders.map(r => (
            <div key={r.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/30">
              <Bell className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span className="flex-1 text-xs">{r.title}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDistanceToNow(new Date(r.remind_at), { addSuffix: true })}
              </span>
              <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
