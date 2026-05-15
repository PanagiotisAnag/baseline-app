"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

type ImportType = "workout" | "diet" | "transaction" | "todo" | "activity";

const placeholders: Record<ImportType, string> = {
  workout: `title,duration_minutes,calories_burned,logged_at
Morning run,45,400,2026-05-01
Gym session,60,500,2026-05-03`,
  diet: `meal_name,calories,protein_g,carbs_g,fat_g,logged_at
Oatmeal,350,12,60,8,2026-05-01
Chicken rice,550,45,60,10,2026-05-01`,
  transaction: `title,amount,type,category,date
Salary,2000,income,Work,2026-05-01
Groceries,80,expense,Food,2026-05-02`,
  todo: `title,priority
Buy groceries,medium
Read book,low
Finish project,high`,
  activity: `title,type,duration_minutes,logged_at
Evening walk,Walking,30,2026-05-01
Reading,Learning,45,2026-05-02`,
};

const tableMap: Record<ImportType, string> = {
  workout: "workout_logs",
  diet: "diet_logs",
  transaction: "transactions",
  todo: "todos",
  activity: "activities",
};

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export function BulkImportModal({ open, onClose, userId, onSuccess }: BulkImportModalProps) {
  const [type, setType] = useState<ImportType>("workout");
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleImport() {
    const rows = parseCSV(csv);
    if (rows.length === 0) {
      toast.error("No valid rows found");
      return;
    }

    setLoading(true);
    const records = rows.map(row => ({ user_id: userId, ...row }));
    const { error, count } = await supabase.from(tableMap[type]).insert(records);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Imported ${records.length} records!`);
      setCsv("");
      onSuccess();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Bulk Import
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Import type</Label>
            <Select value={type} onValueChange={(v) => { setType(v as ImportType); setCsv(""); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout">Workouts</SelectItem>
                <SelectItem value="diet">Diet logs</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="todo">Todos</SelectItem>
                <SelectItem value="activity">Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>CSV data</Label>
            <Textarea
              rows={8}
              placeholder={placeholders[type]}
              value={csv}
              onChange={e => setCsv(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">Paste CSV with headers on the first line.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={loading || !csv.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
