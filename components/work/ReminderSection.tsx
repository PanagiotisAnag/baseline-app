"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Trash2, BellOff } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

export function ReminderSection() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("work_reminders") ?? "[]");
    } catch { return []; }
  });
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("09:00");

  function save(updated: Reminder[]) {
    setReminders(updated);
    localStorage.setItem("work_reminders", JSON.stringify(updated));
  }

  function handleAdd() {
    if (!label.trim()) return;
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      label: label.trim(),
      time,
      enabled: true,
    };
    save([...reminders, newReminder]);
    setLabel("");
    toast.success("Reminder added");
  }

  function handleToggle(id: string) {
    save(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  function handleDelete(id: string) {
    save(reminders.filter(r => r.id !== id));
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-500" /> Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Deep work block"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <Input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-28"
          />
          <Button size="icon" onClick={handleAdd} disabled={!label.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {reminders.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No reminders yet.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <button onClick={() => handleToggle(r.id)} className="shrink-0">
                  {r.enabled
                    ? <Bell className="h-4 w-4 text-purple-500" />
                    : <BellOff className="h-4 w-4 text-muted-foreground" />
                  }
                </button>
                <span className={`flex-1 text-sm ${!r.enabled ? "line-through text-muted-foreground" : ""}`}>
                  {r.label}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{r.time}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(r.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
