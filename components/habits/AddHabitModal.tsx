"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Habit } from "@/lib/types";

const COLORS = [
  "#22c55e", "#f97316", "#3b82f6", "#a78bfa",
  "#f43f5e", "#06b6d4", "#eab308", "#ec4899",
];

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onAdded: (habit: Habit) => void;
}

export function AddHabitModal({ open, onClose, userId, onAdded }: AddHabitModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, title: title.trim(), color })
      .select()
      .single();
    if (error) { toast.error(error.message); setLoading(false); return; }
    onAdded(data as Habit);
    toast.success("Habit added");
    setTitle("");
    setColor(COLORS[0]);
    onClose();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input
              className="h-9 text-sm"
              placeholder="e.g. Read for 20 min"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-9 text-sm cursor-pointer" disabled={loading || !title.trim()}>
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
