import { useState } from "react";
import { Todo } from "@workspace/api-client-react";
import { useToggleTodoComplete, useDeleteTodo, useUpdateTodo, getListTodosQueryKey, getGetTodoStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Calendar, Edit2, X } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function TodoItem({ todo, index }: { todo: Todo, index: number }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const toggleComplete = useToggleTodoComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      }
    }
  });

  const deleteTodo = useDeleteTodo({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      }
    }
  });

  const updateTodo = useUpdateTodo({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        setIsEditing(false);
      }
    }
  });

  const handleToggle = () => {
    toggleComplete.mutate({ id: todo.id });
  };

  const handleDelete = () => {
    deleteTodo.mutate({ id: todo.id });
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      updateTodo.mutate({ id: todo.id, data: { title: editTitle } });
    } else {
      setIsEditing(false);
    }
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900"
  };

  return (
    <div 
      className={`group relative flex items-start gap-4 p-4 md:p-5 bg-card border border-border rounded-xl shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both
        ${todo.completed ? 'opacity-60 bg-muted/30' : 'hover:shadow-md hover:border-primary/30'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button 
        onClick={handleToggle}
        disabled={toggleComplete.isPending}
        className={`shrink-0 w-6 h-6 mt-0.5 rounded flex items-center justify-center border transition-colors
          ${todo.completed 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-input hover:border-primary/50 text-transparent'}
        `}
      >
        <Check size={14} className={todo.completed ? "animate-in zoom-in duration-200" : ""} />
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 bg-background border border-input rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button onClick={handleSave} className="p-1.5 text-primary hover:bg-primary/10 rounded-md">
              <Check size={16} />
            </button>
            <button onClick={() => { setIsEditing(false); setEditTitle(todo.title); }} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
              <X size={16} />
            </button>
          </div>
        ) : (
          <h3 className={`text-base font-medium transition-colors ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {todo.title}
          </h3>
        )}
        
        {todo.description && !isEditing && (
          <p className={`text-sm mt-1 line-clamp-2 ${todo.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Badge variant="outline" className={`text-xs font-normal ${priorityColors[todo.priority]}`}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
          </Badge>
          
          {todo.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={12} />
              <span>{format(new Date(todo.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {!todo.completed && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button 
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
