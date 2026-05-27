import { useState } from "react";
import { useCreateTodo, getListTodosQueryKey, getGetTodoStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Priority = "low" | "medium" | "high";

export function CreateTodo() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTodo = useCreateTodo({
    mutation: {
      onSuccess: () => {
        setTitle("");
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
        toast({ title: "Task added", description: "Your task has been created." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add task. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || createTodo.isPending) return;
    createTodo.mutate({ data: { title: trimmed, priority } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createTodo.isPending}
          className="flex-1 py-5 text-base bg-card border-border shadow-sm focus-visible:ring-primary/20 rounded-xl"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="w-full sm:w-36 bg-card border-border shadow-sm rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={!title.trim() || createTodo.isPending}
          className="rounded-xl font-medium px-6"
        >
          {createTodo.isPending ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
}
