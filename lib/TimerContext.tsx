"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export type TimerMode = "stopwatch" | "countdown";

export interface Timer {
  id: string;
  label: string;
  mode: TimerMode;
  elapsed: number;
  countdownFrom: number;
  running: boolean;
  finished: boolean;
}

interface TimerContextValue {
  timers: Timer[];
  addTimer: (label: string, mode: TimerMode, countdownMinutes?: number) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateLabel: (id: string, label: string) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimers(prev =>
      prev.map(t => {
        if (!t.running || t.finished) return t;
        if (t.mode === "stopwatch") {
          return { ...t, elapsed: t.elapsed + 1 };
        } else {
          const next = t.elapsed + 1;
          if (next >= t.countdownFrom) {
            return { ...t, elapsed: t.countdownFrom, running: false, finished: true };
          }
          return { ...t, elapsed: next };
        }
      })
    );
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick]);

  function addTimer(label: string, mode: TimerMode, countdownMinutes = 25) {
    const newTimer: Timer = {
      id: crypto.randomUUID(),
      label,
      mode,
      elapsed: 0,
      countdownFrom: countdownMinutes * 60,
      running: false,
      finished: false,
    };
    setTimers(prev => [...prev, newTimer]);
  }

  function removeTimer(id: string) {
    setTimers(prev => prev.filter(t => t.id !== id));
  }

  function toggleTimer(id: string) {
    setTimers(prev =>
      prev.map(t => t.id === id && !t.finished ? { ...t, running: !t.running } : t)
    );
  }

  function resetTimer(id: string) {
    setTimers(prev =>
      prev.map(t => t.id === id ? { ...t, elapsed: 0, running: false, finished: false } : t)
    );
  }

  function updateLabel(id: string, label: string) {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, label } : t));
  }

  return (
    <TimerContext.Provider value={{ timers, addTimer, removeTimer, toggleTimer, resetTimer, updateLabel }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimers must be used within TimerProvider");
  return ctx;
}
