import { useState } from "react";
import { useCreateTodo, getListTodosQueryKey, getGetTodoStatsQueryKey, TodoInputPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateTodo() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const createTodo = useCreateTodo({
    mutation: {
      onSuccess: () => {
        setTitle("");
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || createTodo.isPending) return;

    createTodo.mutate({
      data: {
        title: title.trim(),
        priority: "medium" as TodoInputPriority,
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
        <Plus size={18} className="group-focus-within:text-primary transition-colors" />
      </div>
      <Input
        data-testid="input-create-todo"
        type="text"
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={createTodo.isPending}
        className="pl-11 pr-24 py-6 text-base bg-card border-border shadow-sm focus-visible:ring-primary/20 rounded-xl"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <Button 
          data-testid="button-create-todo"
          type="submit" 
          disabled={!title.trim() || createTodo.isPending}
          size="sm"
          className="rounded-lg font-medium transition-all"
        >
          Add Task
        </Button>
      </div>
    </form>
  );
}
