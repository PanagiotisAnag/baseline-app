"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const REMINDERS = [
  { id: "workout", label: "Log your workout", hour: 19 },
  { id: "diet", label: "Log your meals", hour: 20 },
  { id: "work", label: "Log your work session", hour: 18 },
];

export function NotificationBell() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("baseline_reminders");
    if (saved) setEnabled(JSON.parse(saved));
  }, []);

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "denied") toast.error("Notifications blocked. Enable in browser settings.");
  }

  function scheduleReminder(id: string, label: string, hour: number) {
    const next = new Date();
    next.setHours(hour, 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - Date.now();

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Baseline", {
          body: label,
          icon: "/favicon.ico",
          tag: id,
        });
      }
      // Re-schedule for next day
      scheduleReminder(id, label, hour);
    }, delay);
  }

  function toggleReminder(id: string, label: string, hour: number) {
    if (permission !== "granted") { requestPermission(); return; }

    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    localStorage.setItem("baseline_reminders", JSON.stringify(next));

    if (next[id]) {
      scheduleReminder(id, label, hour);
      toast.success(`Reminder set for ${hour}:00`);
    } else {
      toast.success("Reminder removed");
    }
  }

  const anyEnabled = Object.values(enabled).some(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          role="button"
          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground relative flex items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label="Reminders"
        >
          {anyEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          {anyEnabled && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <p className="text-xs font-semibold mb-3">Daily Reminders</p>
        {permission === "denied" && (
          <p className="text-xs text-destructive mb-2">Notifications are blocked. Enable in browser settings.</p>
        )}
        <div className="space-y-2">
          {REMINDERS.map((r) => (
            <div key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.hour}:00 daily</p>
              </div>
              <button
                onClick={() => toggleReminder(r.id, r.label, r.hour)}
                className={`h-5 w-9 rounded-full transition-colors cursor-pointer relative ${
                  enabled[r.id] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  enabled[r.id] ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
        {permission === "default" && (
          <Button size="sm" className="w-full mt-3 h-7 text-xs cursor-pointer" onClick={requestPermission}>
            Enable Notifications
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
