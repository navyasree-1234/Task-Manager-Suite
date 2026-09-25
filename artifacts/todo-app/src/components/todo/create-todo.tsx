import { useState } from "react";
import {
  useCreateTask,
  getListTasksQueryKey,
  getGetTaskStatsQueryKey,
  getListTodosQueryKey,
  getGetTodoStatsQueryKey,
  TaskInputStatus,
  TaskInputPriority,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronDown, ChevronUp, Calendar, AlertCircle } from "lucide-react";

export function CreateTodo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskInputStatus>("todo");
  const [priority, setPriority] = useState<TaskInputPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setDueDate("");
        setShowDetails(false);

        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });

        toast({ title: "Task added", description: "Your task has been created successfully." });
      },
      onError: (err: any) => {
        const msg = err?.data?.error || err?.message || "Failed to add task.";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || createTask.isPending) return;

    createTask.mutate({
      data: {
        title: trimmed,
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
      },
    });
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden p-4 md:p-5 transition-all">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createTask.isPending}
            className="flex-1 text-base bg-background border-border/80 shadow-none focus-visible:ring-primary/20 rounded-xl py-5"
          />

          <Select value={status} onValueChange={(v) => setStatus(v as TaskInputStatus)}>
            <SelectTrigger className="w-full sm:w-36 bg-background border-border/80 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(v) => setPriority(v as TaskInputPriority)}>
            <SelectTrigger className="w-full sm:w-32 bg-background border-border/80 rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={!title.trim() || createTask.isPending}
            className="rounded-xl font-medium px-6 gap-2"
          >
            <Plus size={18} />
            <span>{createTask.isPending ? "Adding..." : "Add Task"}</span>
          </Button>
        </div>

        {/* Toggle Details (Description & Due Date) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 hover:text-foreground font-medium transition-colors"
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{showDetails ? "Hide additional details" : "+ Add description and due date"}</span>
          </button>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-border/40 animate-in fade-in duration-200">
            <div>
              <Textarea
                placeholder="Add task description or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-border/80 rounded-xl text-sm min-h-[70px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={14} />
                <span>Due Date:</span>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-auto bg-background border-border/80 rounded-xl text-sm h-9"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
