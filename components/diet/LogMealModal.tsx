"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dietLogSchema, type DietLogFormData } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

interface LogMealModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export function LogMealModal({ open, onClose, userId, onSuccess }: LogMealModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DietLogFormData>({
    resolver: zodResolver(dietLogSchema) as Resolver<DietLogFormData>,
    defaultValues: { logged_at: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: DietLogFormData) {
    setLoading(true);
    const { error } = await supabase.from("diet_logs").insert({ user_id: userId, ...data });
    if (error) { toast.error(error.message); } else {
      toast.success("Meal logged!");
      reset();
      onSuccess();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Meal</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Meal name</Label>
            <Input placeholder="e.g. Chicken & rice" {...register("meal_name")} />
            {errors.meal_name && <p className="text-xs text-destructive">{errors.meal_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input type="number" placeholder="400" {...register("calories")} />
              {errors.calories && <p className="text-xs text-destructive">{errors.calories.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" placeholder="30" {...register("protein_g")} />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input type="number" placeholder="50" {...register("carbs_g")} />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input type="number" placeholder="10" {...register("fat_g")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("logged_at")} />
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
