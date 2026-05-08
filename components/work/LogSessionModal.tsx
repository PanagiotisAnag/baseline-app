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
import { workSessionSchema, type WorkSessionFormData } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

interface LogSessionModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export function LogSessionModal({ open, onClose, userId, onSuccess }: LogSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkSessionFormData>({
    resolver: zodResolver(workSessionSchema),
    defaultValues: { logged_at: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: WorkSessionFormData) {
    setLoading(true);
    const { error } = await supabase.from("work_sessions").insert({ user_id: userId, ...data });
    if (error) { toast.error(error.message); } else {
      toast.success("Session logged!");
      reset();
      onSuccess();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Work Session</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Deep work — project X" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" placeholder="90" {...register("duration_minutes")} />
              {errors.duration_minutes && <p className="text-xs text-destructive">{errors.duration_minutes.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("logged_at")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="What did you accomplish?" {...register("notes")} rows={2} />
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
