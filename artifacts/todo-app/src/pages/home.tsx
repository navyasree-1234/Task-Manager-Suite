import { useState } from "react";
import { useListTodos, getListTodosQueryKey, useGetTodoStats, getGetTodoStatsQueryKey } from "@workspace/api-client-react";
import { TodoList } from "../components/todo/todo-list";
import { CreateTodo } from "../components/todo/create-todo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTodosStatus, ListTodosPriority } from "@workspace/api-client-react";

export function HomePage() {
  const [status, setStatus] = useState<ListTodosStatus>("all");
  const [priority, setPriority] = useState<ListTodosPriority | "all">("all");

  const queryParams = {
    ...(status !== "all" ? { status } : {}),
    ...(priority !== "all" ? { priority } : {})
  };

  const { data: todos, isLoading } = useListTodos(queryParams, {
    query: { queryKey: getListTodosQueryKey(queryParams) }
  });

  const { data: stats } = useGetTodoStats({
    query: { queryKey: getGetTodoStatsQueryKey() }
  });

  const allDone = stats && stats.total > 0 && stats.active === 0;

  return (
    <div className="p-6 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-serif font-bold text-foreground">Today's Tasks</h2>
        <p className="text-muted-foreground mt-2">What needs your attention today?</p>
      </header>

      {allDone && (
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-8 text-primary-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-2">All tasks complete</p>
            <h3 className="text-2xl font-serif font-bold mb-1">Well done!</h3>
            <p className="text-sm opacity-80">You've finished everything for today. Rest up and come back tomorrow.</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] leading-none select-none opacity-20 font-serif">
            ✓
          </div>
        </div>
      )}

      <CreateTodo />

      <div className="space-y-6 pt-4 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={status} onValueChange={(v) => setStatus(v as ListTodosStatus)}>
            <TabsList className="bg-card border border-border shadow-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={priority} onValueChange={(v) => setPriority(v as ListTodosPriority | "all")}>
            <SelectTrigger className="w-[140px] bg-card border-border shadow-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <TodoList todos={todos || []} />
        )}
      </div>
    </div>
  );
}
