import { useState } from "react";
import {
  Task,
  useToggleTaskComplete,
  useDeleteTask,
  useUpdateTaskPatch,
  useUpdateTaskStatus,
  getListTasksQueryKey,
  getGetTaskStatsQueryKey,
  getListTodosQueryKey,
  getGetTodoStatsQueryKey,
  TaskStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Calendar, Edit2, X, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TodoItem({ todo, index }: { todo: any; index: number }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title || "");
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState(todo.priority || "medium");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
  };

  const toggleComplete = useToggleTaskComplete({
    mutation: {
      onSuccess: invalidateAll,
    },
  });

  const updateStatus = useUpdateTaskStatus({
    mutation: {
      onSuccess: invalidateAll,
    },
  });

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: invalidateAll,
    },
  });

  const updateTask = useUpdateTaskPatch({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        setIsEditing(false);
      },
    },
  });

  const handleToggle = () => {
    toggleComplete.mutate({ id: todo.id });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({
      id: todo.id,
      data: { status: newStatus as any },
    });
  };

  const handleDelete = () => {
    deleteTask.mutate({ id: todo.id });
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateTask.mutate({
      id: todo.id,
      data: {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: editPriority as any,
        dueDate: editDueDate || null,
      },
    });
  };

  const statusIcons = {
    todo: <Clock className="w-3.5 h-3.5 text-slate-500" />,
    "in-progress": <PlayCircle className="w-3.5 h-3.5 text-amber-500" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900",
  };

  const currentStatus = todo.status || (todo.completed ? "completed" : "todo");
  const isDone = currentStatus === "completed" || todo.completed;

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 md:p-5 bg-card border border-border/80 rounded-2xl shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both
        ${isDone ? "opacity-65 bg-muted/20" : "hover:shadow-md hover:border-primary/30"}
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <button
        onClick={handleToggle}
        disabled={toggleComplete.isPending}
        className={`shrink-0 w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border transition-all ${
          isDone
            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
            : "border-input hover:border-primary/50 text-transparent"
        }`}
      >
        <Check size={14} className={isDone ? "animate-in zoom-in duration-200" : ""} />
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-3 bg-background/50 p-3 rounded-xl border border-border">
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Task title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px]"
              placeholder="Description (optional)"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v)}>
                  <SelectTrigger className="w-28 h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="h-8 text-xs bg-background border border-input rounded-lg px-2"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(todo.title);
                    setEditDescription(todo.description || "");
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateTask.isPending}
                  className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-base font-semibold transition-colors ${
                  isDone ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {todo.title}
              </h3>
            </div>

            {todo.description && (
              <p
                className={`text-sm mt-1 line-clamp-2 ${
                  isDone ? "text-muted-foreground/70" : "text-muted-foreground"
                }`}
              >
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {/* Status Select Badge */}
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-6 text-[11px] px-2.5 py-0 rounded-md border-border/60 bg-muted/40 font-medium">
                  <div className="flex items-center gap-1.5">
                    {statusIcons[currentStatus as keyof typeof statusIcons]}
                    <span className="capitalize">{currentStatus.replace("-", " ")}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Badge */}
              <Badge variant="outline" className={`text-[11px] font-medium py-0 px-2 rounded-md ${priorityColors[todo.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
                {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : "Medium"}
              </Badge>

              {/* Due Date */}
              {todo.dueDate && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
                  <Calendar size={11} />
                  <span>{todo.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Edit Task"
          >
            <Edit2 size={15} />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleteTask.isPending}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Delete Task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
