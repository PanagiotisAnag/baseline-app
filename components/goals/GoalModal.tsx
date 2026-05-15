"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Goal } from "@/lib/types";

const schema = z.object({
  category: z.enum(["workout", "diet", "work", "finance"]),
  label: z.string().min(1, "Required"),
  target_value: z.coerce.number().positive("Must be positive"),
  unit: z.string().min(1, "Required"),
  period: z.enum(["daily", "weekly"]),
});

type FormData = z.infer<typeof schema>;

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  existing: Goal | null;
  onSaved: (goal: Goal) => void;
}

export function GoalModal({ open, onClose, userId, existing, onSaved }: GoalModalProps) {
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { category: "workout", period: "weekly", label: "", unit: "", target_value: 0 },
  });

  useEffect(() => {
    if (existing) {
      reset({
        category: existing.category,
        label: existing.label,
        target_value: existing.target_value,
        unit: existing.unit,
        period: existing.period,
      });
    } else {
      reset({ category: "workout", period: "weekly", label: "", unit: "", target_value: 0 });
    }
  }, [existing, reset]);

  async function onSubmit(data: FormData) {
    if (existing) {
      const { data: updated, error } = await supabase
        .from("goals")
        .update(data)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) { toast.error(error.message); return; }
      onSaved(updated as Goal);
      toast.success("Goal updated");
    } else {
      const { data: created, error } = await supabase
        .from("goals")
        .upsert({ ...data, user_id: userId }, { onConflict: "user_id, category" })
        .select()
        .single();
      if (error) { toast.error(error.message); return; }
      onSaved(created as Goal);
      toast.success("Goal saved");
    }
    onClose();
  }

  const categoryPresets: Record<string, { label: string; unit: string }> = {
    workout: { label: "Sessions per week", unit: "sessions" },
    diet: { label: "Calories per day", unit: "kcal" },
    work: { label: "Hours per week", unit: "hours" },
    finance: { label: "Save per week", unit: "€" },
  };

  const category = watch("category");

  function applyPreset(cat: string) {
    const p = categoryPresets[cat];
    if (p) { setValue("label", p.label); setValue("unit", p.unit); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{existing ? "Edit Goal" : "Set a Goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => { setValue("category", v as FormData["category"]); if (v) applyPreset(v); }}
            >
              <SelectTrigger className="h-9 text-sm cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout" className="cursor-pointer">Workout</SelectItem>
                <SelectItem value="diet" className="cursor-pointer">Diet</SelectItem>
                <SelectItem value="work" className="cursor-pointer">Work</SelectItem>
                <SelectItem value="finance" className="cursor-pointer">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Label</Label>
            <Input className="h-9 text-sm" placeholder="e.g. Sessions per week" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target</Label>
              <Input className="h-9 text-sm" type="number" step="any" {...register("target_value")} />
              {errors.target_value && <p className="text-xs text-destructive">{errors.target_value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Unit</Label>
              <Input className="h-9 text-sm" placeholder="sessions" {...register("unit")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Period</Label>
            <Select value={watch("period")} onValueChange={(v) => setValue("period", v as FormData["period"])}>
              <SelectTrigger className="h-9 text-sm cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily" className="cursor-pointer">Daily</SelectItem>
                <SelectItem value="weekly" className="cursor-pointer">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-9 text-sm cursor-pointer" disabled={isSubmitting}>
              {existing ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
