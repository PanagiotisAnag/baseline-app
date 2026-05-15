"use client";

import { useState } from "react";
import { Plus, CheckSquare, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TodosClientProps {
  userId: string;
  initialTodos: Todo[];
}

const priorityConfig = {
  low: { badge: "secondary" as const, dot: "bg-slate-400" },
  medium: { badge: "secondary" as const, dot: "bg-yellow-400" },
  high: { badge: "destructive" as const, dot: "bg-red-400" },
};

export function TodosClient({ userId, initialTodos }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  const pending = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);

  async function handleAdd() {
    if (!title.trim()) return;
    setAdding(true);
    const { data, error } = await supabase.from("todos").insert({
      user_id: userId,
      title: title.trim(),
      priority,
      completed: false,
    }).select().single();

    if (error) { toast.error(error.message); } else {
      setTodos(prev => [data, ...prev]);
      setTitle("");
    }
    setAdding(false);
  }

  async function handleToggle(todo: Todo) {
    const { error } = await supabase.from("todos").update({ completed: !todo.completed }).eq("id", todo.id);
    if (error) { toast.error(error.message); return; }
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function TodoItem({ todo }: { todo: Todo }) {
    const config = priorityConfig[todo.priority];
    return (
      <div className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all duration-150 hover:bg-card/80">
        <button
          onClick={() => handleToggle(todo)}
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          {todo.completed
            ? <CheckCircle2 className="h-4 w-4 text-primary" />
            : <Circle className="h-4 w-4" />
          }
        </button>
        <p className={cn("flex-1 text-sm", todo.completed && "line-through text-muted-foreground/60")}>{todo.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
          <Badge variant={config.badge} className="capitalize text-xs h-5 px-2">
            {todo.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
            onClick={() => handleDelete(todo.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="flex-1 h-9 text-sm"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
          <SelectTrigger className="w-28 h-9 text-xs cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low" className="text-xs cursor-pointer">Low</SelectItem>
            <SelectItem value="medium" className="text-xs cursor-pointer">Medium</SelectItem>
            <SelectItem value="high" className="text-xs cursor-pointer">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={adding || !title.trim()} size="sm" className="h-9 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CheckSquare className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">No todos yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first task above</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="section-label">Pending ({pending.length})</p>
              {pending.map(todo => <TodoItem key={todo.id} todo={todo} />)}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="section-label">Completed ({completed.length})</p>
              {completed.map(todo => <TodoItem key={todo.id} todo={todo} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
