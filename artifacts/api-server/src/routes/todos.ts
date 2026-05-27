import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, todosTable } from "@workspace/db";
import {
  ListTodosQueryParams,
  ListTodosResponse,
  CreateTodoBody,
  GetTodoParams,
  GetTodoResponse,
  UpdateTodoParams,
  UpdateTodoBody,
  UpdateTodoResponse,
  DeleteTodoParams,
  ToggleTodoCompleteParams,
  ToggleTodoCompleteResponse,
  GetTodoStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbTodo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function serializeTodo(todo: DbTodo) {
  return {
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

router.get("/todos/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

  const allTodos = await db.select().from(todosTable);

  const total = allTodos.length;
  const completed = allTodos.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = allTodos.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;
  const dueSoon = allTodos.filter(
    (t) => t.dueDate && t.dueDate <= sevenDaysStr && !t.completed
  ).length;

  res.json(
    GetTodoStatsResponse.parse({ total, completed, active, highPriority, dueSoon })
  );
});

router.get("/todos", async (req, res): Promise<void> => {
  const parsed = ListTodosQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, priority } = parsed.data;

  let todos = await db.select().from(todosTable);

  if (status === "active") {
    todos = todos.filter((t) => !t.completed);
  } else if (status === "completed") {
    todos = todos.filter((t) => t.completed);
  }

  if (priority) {
    todos = todos.filter((t) => t.priority === priority);
  }

  todos.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json(ListTodosResponse.parse(todos.map(serializeTodo)));
});

router.post("/todos", async (req, res): Promise<void> => {
  const parsed = CreateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [todo] = await db.insert(todosTable).values(parsed.data).returning();
  res.status(201).json(GetTodoResponse.parse(serializeTodo(todo)));
});

router.get("/todos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTodoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [todo] = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, params.data.id));

  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  res.json(GetTodoResponse.parse(serializeTodo(todo)));
});

router.patch("/todos/:id/complete", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ToggleTodoCompleteParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  const [todo] = await db
    .update(todosTable)
    .set({ completed: !existing.completed })
    .where(eq(todosTable.id, params.data.id))
    .returning();

  res.json(ToggleTodoCompleteResponse.parse(serializeTodo(todo)));
});

router.patch("/todos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTodoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [todo] = await db
    .update(todosTable)
    .set(parsed.data)
    .where(eq(todosTable.id, params.data.id))
    .returning();

  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  res.json(UpdateTodoResponse.parse(serializeTodo(todo)));
});

router.delete("/todos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTodoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [todo] = await db
    .delete(todosTable)
    .where(eq(todosTable.id, params.data.id))
    .returning();

  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
