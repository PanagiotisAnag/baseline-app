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
import { Textarea } from "@/components/ui/textarea";
import { activitySchema, type ActivityFormData } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

interface LogActivityModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export function LogActivityModal({ open, onClose, userId, onSuccess }: LogActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { logged_at: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: ActivityFormData) {
    setLoading(true);
    const { error } = await supabase.from("activities").insert({ user_id: userId, ...data });
    if (error) { toast.error(error.message); } else {
      toast.success("Activity logged!");
      reset();
      onSuccess();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Evening walk" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Input placeholder="e.g. Walking, Reading" {...register("type")} />
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" placeholder="30" {...register("duration_minutes")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("logged_at")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Any details..." {...register("notes")} rows={2} />
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
