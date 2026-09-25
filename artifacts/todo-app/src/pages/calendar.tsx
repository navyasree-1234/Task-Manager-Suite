import { useState } from "react";
import {
  useListTasks,
  getListTasksQueryKey,
  getGetTaskStatsQueryKey,
  useCreateTask,
  useToggleTaskComplete,
  useDeleteTask,
  Task,
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
} from "lucide-react";

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

  const { data: tasks = [] } = useListTasks(
    {},
    { query: { queryKey: getListTasksQueryKey() } }
  );

  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        setNewTitle("");
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not add task.", variant: "destructive" });
      },
    },
  });

  const toggleComplete = useToggleTaskComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
      },
    },
  });

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
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

  function tasksForDate(date: Date): Task[] {
    const str = toDateStr(date);
    return tasks.filter((t: any) => t.dueDate === str);
  }

  const selectedDateStr = toDateStr(selectedDate);
  const selectedTasks = tasks.filter((t: any) => t.dueDate === selectedDateStr);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || createTask.isPending) return;
    createTask.mutate({
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
        <p className="text-muted-foreground mt-1">Pin tasks to specific due dates and track your schedule.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-base font-bold text-foreground">
              {MONTHS[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border/30 last:border-r-0" />;
              }

              const dayTasks = tasksForDate(date);
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
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full leading-none
                      ${isToday ? "bg-primary text-primary-foreground" : isSelected ? "text-primary" : "text-foreground"}
                    `}
                  >
                    {date.getDate()}
                  </span>

                  <div className="flex flex-wrap gap-1 mt-auto">
                    {dayTasks.slice(0, 3).map((task: any) => (
                      <span
                        key={task.id}
                        className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium}`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-muted-foreground leading-none self-end">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>

                  {dayTasks.slice(0, 2).map((task: any) => (
                    <span
                      key={task.id}
                      className={`hidden sm:block text-[11px] leading-tight px-1.5 py-0.5 rounded-md truncate max-w-full
                        ${task.completed || task.status === "completed"
                          ? "line-through text-muted-foreground/60 bg-muted/50"
                          : task.priority === "high"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : task.priority === "medium"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    >
                      {task.title}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {isSelectedToday(selectedDate, today) ? "Today" : DAYS[selectedDate.getDay()]}
            </p>
            <h4 className="text-lg font-serif font-bold text-foreground">
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {selectedTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tasks due on this day.
              </div>
            ) : (
              selectedTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-2 p-3 rounded-xl border transition-colors
                    ${task.completed || task.status === "completed" ? "bg-muted/30 border-border/50 opacity-60" : "bg-background border-border hover:border-primary/30"}
                  `}
                >
                  <button
                    onClick={() => toggleComplete.mutate({ id: task.id })}
                    className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${task.completed || task.status === "completed" ? "bg-primary border-primary text-primary-foreground" : "border-input hover:border-primary/50"}
                    `}
                  >
                    {(task.completed || task.status === "completed") && <Check size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${task.completed || task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[10px] font-medium px-1.5 py-0 rounded-md
                        ${task.priority === "high" ? "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900" :
                          task.priority === "medium" ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" :
                          "text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}
                    >
                      {task.priority || "medium"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deleteTask.mutate({ id: task.id })}
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add task form */}
          <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-muted/10">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <Input
                type="text"
                placeholder="Add task for this date..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={createTask.isPending}
                className="flex-1 text-sm bg-background rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newTitle.trim() || createTask.isPending}
                className="shrink-0 rounded-xl"
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
