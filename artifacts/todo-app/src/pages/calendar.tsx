import { useState } from "react";
import {
  useListTodos,
  getListTodosQueryKey,
  getGetTodoStatsQueryKey,
  useCreateTodo,
  useToggleTodoComplete,
  useDeleteTodo,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Trash2,
  X,
} from "lucide-react";
import type { Todo } from "@workspace/api-client-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function isSameDay(a: Date, b: Date) {
  return toDateStr(a) === toDateStr(b);
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

export function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [newTitle, setNewTitle] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todos = [] } = useListTodos(
    {},
    { query: { queryKey: getListTodosQueryKey() } }
  );

  const createTodo = useCreateTodo({
    mutation: {
      onSuccess: () => {
        setNewTitle("");
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not add task.", variant: "destructive" });
      },
    },
  });

  const toggleComplete = useToggleTodoComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      },
    },
  });

  const deleteTodo = useDeleteTodo({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
      },
    },
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function todosForDate(date: Date): Todo[] {
    const str = toDateStr(date);
    return todos.filter((t) => t.dueDate === str);
  }

  const selectedDateStr = toDateStr(selectedDate);
  const selectedTodos = todos.filter((t) => t.dueDate === selectedDateStr);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || createTodo.isPending) return;
    createTodo.mutate({
      data: { title: trimmed, priority: "medium", dueDate: selectedDateStr },
    });
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-foreground">Calendar</h2>
        <p className="text-muted-foreground mt-1">Pin major tasks to specific days.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-base font-semibold text-foreground">
              {MONTHS[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border/40 last:border-r-0" />;
              }

              const dayTodos = todosForDate(date);
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentMonth = date.getMonth() === month;
              const col = i % 7;
              const isLastCol = col === 6;

              return (
                <button
                  key={toDateStr(date)}
                  onClick={() => selectDay(date)}
                  className={`min-h-[80px] p-2 border-b border-r border-border/40 text-left flex flex-col gap-1 transition-colors
                    ${isLastCol ? "border-r-0" : ""}
                    ${isSelected ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "hover:bg-accent/50"}
                    ${!isCurrentMonth ? "opacity-40" : ""}
                  `}
                >
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full leading-none
                      ${isToday ? "bg-primary text-primary-foreground" : isSelected ? "text-primary" : "text-foreground"}
                    `}
                  >
                    {date.getDate()}
                  </span>

                  <div className="flex flex-wrap gap-1 mt-auto">
                    {dayTodos.slice(0, 3).map((todo) => (
                      <span
                        key={todo.id}
                        className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[todo.priority]}`}
                        title={todo.title}
                      />
                    ))}
                    {dayTodos.length > 3 && (
                      <span className="text-[10px] text-muted-foreground leading-none self-end">
                        +{dayTodos.length - 3}
                      </span>
                    )}
                  </div>

                  {dayTodos.slice(0, 2).map((todo) => (
                    <span
                      key={todo.id}
                      className={`hidden sm:block text-[11px] leading-tight px-1.5 py-0.5 rounded-sm truncate max-w-full
                        ${todo.completed
                          ? "line-through text-muted-foreground/60 bg-muted/50"
                          : todo.priority === "high"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : todo.priority === "medium"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    >
                      {todo.title}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {isSelectedToday(selectedDate, today) ? "Today" : DAYS[selectedDate.getDay()]}
            </p>
            <h4 className="text-xl font-serif font-bold text-foreground">
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {selectedTodos.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tasks pinned to this day.
              </div>
            ) : (
              selectedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-start gap-2 p-3 rounded-lg border transition-colors
                    ${todo.completed ? "bg-muted/30 border-border/50 opacity-60" : "bg-background border-border hover:border-primary/30"}
                  `}
                >
                  <button
                    onClick={() => toggleComplete.mutate({ id: todo.id })}
                    className={`shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${todo.completed ? "bg-primary border-primary text-primary-foreground" : "border-input hover:border-primary/50"}
                    `}
                  >
                    {todo.completed && <Check size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {todo.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[10px] font-normal px-1.5 py-0
                        ${todo.priority === "high" ? "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900" :
                          todo.priority === "medium" ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" :
                          "text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}
                    >
                      {todo.priority}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deleteTodo.mutate({ id: todo.id })}
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add task form */}
          <div className="px-4 pb-4 pt-2 border-t border-border mt-auto">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <Input
                type="text"
                placeholder="Add task for this day..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={createTodo.isPending}
                className="flex-1 text-sm bg-background"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newTitle.trim() || createTodo.isPending}
                className="shrink-0 rounded-lg"
              >
                <Plus size={16} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function isSelectedToday(selected: Date, today: Date) {
  return (
    selected.getFullYear() === today.getFullYear() &&
    selected.getMonth() === today.getMonth() &&
    selected.getDate() === today.getDate()
  );
}
