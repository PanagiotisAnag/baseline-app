"use client";

import { useState } from "react";
import { Plus, CheckSquare, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const priorityColors = {
  low: "text-slate-400",
  medium: "text-yellow-500",
  high: "text-red-500",
};

const priorityBadge = {
  low: "secondary" as const,
  medium: "secondary" as const,
  high: "destructive" as const,
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
    return (
      <Card className="group">
        <CardContent className="p-3 flex items-center gap-3">
          <button onClick={() => handleToggle(todo)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
            {todo.completed
              ? <CheckCircle2 className="h-5 w-5 text-primary" />
              : <Circle className="h-5 w-5" />
            }
          </button>
          <p className={cn("flex-1 text-sm", todo.completed && "line-through text-muted-foreground")}>{todo.title}</p>
          <Badge variant={priorityBadge[todo.priority]} className="shrink-0 capitalize text-xs">
            {todo.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => handleDelete(todo.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={adding || !title.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No todos yet. Add your first task above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Pending ({pending.length})</p>
              {pending.map(todo => <TodoItem key={todo.id} todo={todo} />)}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Completed ({completed.length})</p>
              {completed.map(todo => <TodoItem key={todo.id} todo={todo} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
