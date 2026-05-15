"use client";

import { useRef, useCallback } from "react";

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  const playBeep = useCallback((frequency = 880, duration = 0.3, volume = 0.4) => {
    try {
      const ctx = getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext not available
    }
  }, []);

  const playAlarm = useCallback(() => {
    playBeep(880, 0.2, 0.5);
    setTimeout(() => playBeep(660, 0.2, 0.5), 250);
    setTimeout(() => playBeep(880, 0.3, 0.5), 500);
  }, [playBeep]);

  return { playBeep, playAlarm };
}
