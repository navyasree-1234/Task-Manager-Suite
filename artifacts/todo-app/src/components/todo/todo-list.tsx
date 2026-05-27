import { Todo } from "@workspace/api-client-react";
import { TodoItem } from "./todo-item";
import { FileCheck } from "lucide-react";

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card/50">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
          <FileCheck size={32} />
        </div>
        <h3 className="text-lg font-serif font-medium text-foreground">All caught up</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
          You don't have any tasks here. Take a break or add a new task above.
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
