"use client";

import { useState } from "react";
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionModal } from "./AddTransactionModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FinancialsClientProps {
  userId: string;
  initialTransactions: Transaction[];
}

export function FinancialsClient({ userId, initialTransactions }: FinancialsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const supabase = createClient();

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success("Deleted");
  }

  async function refreshTransactions() {
    const { data } = await supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(100);
    setTransactions(data ?? []);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">All time overview</p>
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-xl font-bold tabular-nums text-emerald-500">+€{totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold tabular-nums text-red-400">-€{totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={cn("text-xl font-bold tabular-nums", balance >= 0 ? "text-emerald-500" : "text-red-400")}>
              €{balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-6 cursor-pointer">All</TabsTrigger>
          <TabsTrigger value="income" className="text-xs h-6 cursor-pointer">Income</TabsTrigger>
          <TabsTrigger value="expense" className="text-xs h-6 cursor-pointer">Expenses</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Start tracking your income and expenses</p>
          <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>Add your first transaction</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
              <div className={cn("rounded-md p-1.5 shrink-0", t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                {t.type === "income" ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.date}{t.category ? ` · ${t.category}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-sm font-semibold tabular-nums", t.type === "income" ? "text-emerald-500" : "text-red-400")}>
                  {t.type === "income" ? "+" : "-"}€{t.amount.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} onSuccess={refreshTransactions} />
    </div>
  );
}
