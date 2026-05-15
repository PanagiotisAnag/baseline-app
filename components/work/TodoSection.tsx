"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface WorkTodo {
  id: string;
  task: string;
  is_completed: boolean;
}

interface TodoSectionProps {
  userId: string;
}

export function TodoSection({ userId }: TodoSectionProps) {
  const [todos, setTodos] = useState<WorkTodo[]>([]);
  const [input, setInput] = useState("");
  const supabase = createClient();

  useEffect(() => {
    load();
  }, [userId]);

  async function load() {
    const { data } = await supabase
      .from("work_todos")
      .select("id, task, is_completed")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setTodos(data ?? []);
  }

  async function addTodo() {
    const task = input.trim();
    if (!task) return;
    const { data, error } = await supabase
      .from("work_todos")
      .insert({ user_id: userId, task, is_completed: false })
      .select("id, task, is_completed")
      .single();
    if (error) { toast.error(error.message); return; }
    setTodos(prev => [...prev, data]);
    setInput("");
  }

  async function toggleTodo(id: string, current: boolean) {
    const { error } = await supabase
      .from("work_todos")
      .update({ is_completed: !current })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !current } : t));
  }

  async function deleteTodo(id: string) {
    await supabase.from("work_todos").delete().eq("id", id);
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  const pending = todos.filter(t => !t.is_completed);
  const done = todos.filter(t => t.is_completed);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium">Session Tasks</span>
        {todos.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {done.length}/{todos.length} done
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a task for this session"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
          className="h-8 text-xs flex-1"
        />
        <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={addTodo} disabled={!input.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {todos.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-1">No tasks for this session.</p>
      ) : (
        <div className="space-y-1">
          {pending.map(t => (
            <div key={t.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors">
              <button onClick={() => toggleTodo(t.id, t.is_completed)} className="shrink-0 cursor-pointer">
                <Square className="h-3.5 w-3.5 text-muted-foreground hover:text-purple-400 transition-colors" />
              </button>
              <span className="flex-1 text-xs">{t.task}</span>
              <button
                onClick={() => deleteTodo(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {done.length > 0 && (
            <>
              {done.length > 0 && pending.length > 0 && <div className="border-t border-border/50 my-1" />}
              {done.map(t => (
                <div key={t.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors">
                  <button onClick={() => toggleTodo(t.id, t.is_completed)} className="shrink-0 cursor-pointer">
                    <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                  </button>
                  <span className="flex-1 text-xs line-through text-muted-foreground">{t.task}</span>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {todos.length > 0 && (
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-400/60 transition-all duration-300"
            style={{ width: `${Math.round((done.length / todos.length) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
