import { TodoItem } from "./todo-item";
import { FileCheck } from "lucide-react";

export function TodoList({ todos }: { todos: any[] }) {
  if (todos.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border/80 rounded-2xl bg-card/40">
        <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
          <FileCheck size={28} />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">No tasks found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
          You don't have any tasks matching this filter. Take a break or create a new task above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo, index) => (
        <TodoItem key={todo.id} todo={todo} index={index} />
      ))}
    </div>
  );
}
