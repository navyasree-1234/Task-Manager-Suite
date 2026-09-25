import { useState } from "react";
import {
  useListTasks,
  getListTasksQueryKey,
  useGetTaskStats,
  getGetTaskStatsQueryKey,
  useClearCompletedTasks,
  ListTasksStatus,
  ListTasksPriority,
  ListTasksSortBy,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TodoList } from "../components/todo/todo-list";
import { CreateTodo } from "../components/todo/create-todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Filter, ArrowUpDown } from "lucide-react";

export function HomePage() {
  const [status, setStatus] = useState<ListTasksStatus>("all");
  const [priority, setPriority] = useState<ListTasksPriority | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ListTasksSortBy>("createdAt");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    ...(status !== "all" ? { status } : {}),
    ...(priority !== "all" ? { priority } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    sortBy,
  };

  const { data: tasks, isLoading, isError } = useListTasks(queryParams, {
    query: { queryKey: getListTasksQueryKey(queryParams) }
  });

  const { data: stats } = useGetTaskStats({
    query: { queryKey: getGetTaskStatsQueryKey() }
  });

  const clearCompleted = useClearCompletedTasks({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        toast({
          title: "Tasks cleared",
          description: `${data.deleted} completed task${data.deleted !== 1 ? "s" : ""} removed.`,
        });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not clear tasks.", variant: "destructive" });
      },
    },
  });

  const allDone = stats && stats.total > 0 && stats.active === 0;

  return (
    <div className="p-6 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Task Dashboard</h2>
          <p className="text-muted-foreground mt-1">Organize, track, and accomplish your daily tasks</p>
        </div>
        {stats && (
          <div className="flex items-center gap-3 bg-card border border-border/80 px-4 py-2.5 rounded-2xl shadow-sm text-sm">
            <div className="text-center px-2">
              <span className="block font-bold text-foreground">{stats.total}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center px-2">
              <span className="block font-bold text-amber-500">{stats.inProgress}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">In Progress</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center px-2">
              <span className="block font-bold text-emerald-500">{stats.completed}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Done</span>
            </div>
          </div>
        )}
      </header>

      {allDone && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-8 py-7 text-primary-foreground shadow-lg animate-in fade-in duration-300">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-90 mb-1">
                <Sparkles size={14} />
                <span>All tasks complete</span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-1">Fantastic job!</h3>
              <p className="text-sm opacity-90">You've completed every task on your list. Enjoy your day!</p>
            </div>
            <Button
              variant="outline"
              onClick={() => clearCompleted.mutate()}
              disabled={clearCompleted.isPending}
              className="shrink-0 bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20 rounded-xl"
            >
              {clearCompleted.isPending ? "Clearing..." : "Clear completed"}
            </Button>
          </div>
        </div>
      )}

      <CreateTodo />

      {/* Search, Filtering, and Sorting */}
      <div className="space-y-6 pt-4 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl bg-card border-border shadow-sm"
            />
          </div>

          {/* Priority filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground shrink-0" />
            <Select value={priority} onValueChange={(v) => setPriority(v as ListTasksPriority | "all")}>
              <SelectTrigger className="w-full bg-card border-border rounded-xl shadow-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort order */}
          <div className="md:col-span-3 flex items-center gap-2">
            <ArrowUpDown size={16} className="text-muted-foreground shrink-0" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as ListTasksSortBy)}>
              <SelectTrigger className="w-full bg-card border-border rounded-xl shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center justify-between overflow-x-auto pb-1">
          <Tabs value={status} onValueChange={(v) => setStatus(v as ListTasksStatus)}>
            <TabsList className="bg-card border border-border shadow-sm p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
              <TabsTrigger value="todo" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">To Do</TabsTrigger>
              <TabsTrigger value="in-progress" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {stats && stats.completed > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCompleted.mutate()}
              disabled={clearCompleted.isPending}
              className="text-xs text-muted-foreground hover:text-destructive shrink-0"
            >
              Clear completed ({stats.completed})
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
            <p className="font-semibold text-base mb-1">Failed to load tasks</p>
            <p className="text-xs opacity-80">Please check your connection or backend server status.</p>
          </div>
        ) : (
          <TodoList todos={tasks || []} />
        )}
      </div>
    </div>
  );
}
