"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dietGoalSchema, type DietGoalFormData } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import type { DietGoal } from "@/lib/types";

interface SetGoalModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  goal: DietGoal | null;
  onSuccess: () => void;
}

export function SetGoalModal({ open, onClose, userId, goal, onSuccess }: SetGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<DietGoalFormData>({
    resolver: zodResolver(dietGoalSchema),
    defaultValues: {
      daily_calories: goal?.daily_calories ?? 2000,
      protein_g: goal?.protein_g,
      carbs_g: goal?.carbs_g,
      fat_g: goal?.fat_g,
    },
  });

  async function onSubmit(data: DietGoalFormData) {
    setLoading(true);
    const payload = { user_id: userId, ...data };
    const { error } = goal
      ? await supabase.from("diet_goals").update(data).eq("id", goal.id)
      : await supabase.from("diet_goals").insert(payload);

    if (error) { toast.error(error.message); } else {
      toast.success("Goal updated!");
      onSuccess();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Set Daily Goal</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Daily calories</Label>
            <Input type="number" placeholder="2000" {...register("daily_calories")} />
            {errors.daily_calories && <p className="text-xs text-destructive">{errors.daily_calories.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" placeholder="150" {...register("protein_g")} />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input type="number" placeholder="200" {...register("carbs_g")} />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input type="number" placeholder="60" {...register("fat_g")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
