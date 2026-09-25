import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, todosTable, type Todo as DbTodo } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskPatchBody,
  UpdateTaskStatusBody,
  GetTaskStatsResponse,
  GetTaskResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serializeTask(todo: DbTodo) {
  const status = (todo.status || (todo.completed ? "completed" : "todo")) as "todo" | "in-progress" | "completed";
  const completed = status === "completed" || todo.completed;

  return {
    id: todo.id,
    userId: todo.userId,
    title: todo.title,
    description: todo.description,
    status,
    completed,
    priority: (todo.priority || "medium") as "low" | "medium" | "high",
    dueDate: todo.dueDate,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

// GET /tasks & GET /todos (Stats)
async function handleGetStats(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

  let allTodos: DbTodo[] = await db.select().from(todosTable);
  allTodos = allTodos.filter((t: DbTodo) => t.userId === userId);

  const total = allTodos.length;
  const completed = allTodos.filter((t: DbTodo) => t.status === "completed" || t.completed).length;
  const inProgress = allTodos.filter((t: DbTodo) => t.status === "in-progress").length;
  const active = total - completed;
  const highPriority = allTodos.filter(
    (t: DbTodo) => t.priority === "high" && !(t.status === "completed" || t.completed)
  ).length;
  const dueSoon = allTodos.filter(
    (t: DbTodo) => t.dueDate && t.dueDate <= sevenDaysStr && !(t.status === "completed" || t.completed)
  ).length;

  res.json(GetTaskStatsResponse.parse({ total, completed, active, inProgress, highPriority, dueSoon }));
}

router.get("/tasks/stats", requireAuth, handleGetStats);
router.get("/todos/stats", requireAuth, handleGetStats);

// DELETE /tasks/clear-completed & DELETE /todos/clear-completed
async function handleClearCompleted(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const deleted = await db
    .delete(todosTable)
    .where(and(or(eq(todosTable.completed, true), eq(todosTable.status, "completed")), eq(todosTable.userId, userId)))
    .returning();

  res.json({ deleted: deleted.length });
}

router.delete("/tasks/clear-completed", requireAuth, handleClearCompleted);
router.delete("/todos/clear-completed", requireAuth, handleClearCompleted);

// GET /tasks & GET /todos (List)
async function handleListTasks(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { status, priority, search, sortBy } = req.query;
  const userId = req.user.id;

  let todos: DbTodo[] = await db.select().from(todosTable);
  todos = todos.filter((t: DbTodo) => t.userId === userId);

  // Filter by status
  if (status && status !== "all") {
    if (status === "active") {
      todos = todos.filter((t: DbTodo) => t.status !== "completed" && !t.completed);
    } else if (status === "completed") {
      todos = todos.filter((t: DbTodo) => t.status === "completed" || t.completed);
    } else if (status === "todo" || status === "in-progress") {
      todos = todos.filter((t: DbTodo) => t.status === status);
    }
  }

  // Filter by priority
  if (priority) {
    todos = todos.filter((t: DbTodo) => t.priority === priority);
  }

  // Filter by search query
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    todos = todos.filter(
      (t: DbTodo) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  todos.sort((a: DbTodo, b: DbTodo) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === "priority") {
      const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    // Default: createdAt descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const serialized = todos.map(serializeTask);
  res.json(serialized);
}

router.get("/tasks", requireAuth, handleListTasks);
router.get("/todos", requireAuth, handleListTasks);

// POST /tasks & POST /todos (Create)
async function handleCreateTask(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, description, status = "todo", priority = "medium", dueDate } = parsed.data;
  const userId = req.user.id;
  const isCompleted = status === "completed";

  const [newTask] = await db
    .insert(todosTable)
    .values({
      userId,
      title,
      description: description || null,
      status,
      completed: isCompleted,
      priority,
      dueDate: dueDate || null,
    })
    .returning();

  res.status(201).json(GetTaskResponse.parse(serializeTask(newTask)));
}

router.post("/tasks", requireAuth, handleCreateTask);
router.post("/todos", requireAuth, handleCreateTask);

// GET /tasks/:id & GET /todos/:id
async function handleGetTask(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [todo] = await db.select().from(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id)));
  if (!todo) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(GetTaskResponse.parse(serializeTask(todo)));
}

router.get("/tasks/:id", requireAuth, handleGetTask);
router.get("/todos/:id", requireAuth, handleGetTask);

// PATCH /tasks/:id/status
router.patch("/tasks/:id/status", requireAuth, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateTaskStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const status = parsed.data.status;
  const completed = status === "completed";

  const [updated] = await db
    .update(todosTable)
    .set({ status, completed, updatedAt: new Date() })
    .where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(GetTaskResponse.parse(serializeTask(updated)));
});

// PATCH /tasks/:id/complete & PATCH /todos/:id/complete
async function handleToggleComplete(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id)));
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const nextCompleted = !existing.completed;
  const nextStatus = nextCompleted ? "completed" : "todo";

  const [updated] = await db
    .update(todosTable)
    .set({ completed: nextCompleted, status: nextStatus, updatedAt: new Date() })
    .where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id)))
    .returning();

  res.json(GetTaskResponse.parse(serializeTask(updated)));
}

router.patch("/tasks/:id/complete", requireAuth, handleToggleComplete);
router.patch("/todos/:id/complete", requireAuth, handleToggleComplete);

// PUT /tasks/:id & PATCH /tasks/:id & PATCH /todos/:id
async function handleUpdateTask(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateTaskPatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
  if (parsed.data.dueDate !== undefined) updateData.dueDate = parsed.data.dueDate;
  if (parsed.data.status !== undefined) {
    updateData.status = parsed.data.status;
    updateData.completed = parsed.data.status === "completed";
  } else if (parsed.data.completed !== undefined) {
    updateData.completed = parsed.data.completed;
    updateData.status = parsed.data.completed ? "completed" : "todo";
  }

  const [updated] = await db
    .update(todosTable)
    .set(updateData)
    .where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(GetTaskResponse.parse(serializeTask(updated)));
}

router.put("/tasks/:id", requireAuth, handleUpdateTask);
router.patch("/tasks/:id", requireAuth, handleUpdateTask);
router.patch("/todos/:id", requireAuth, handleUpdateTask);

// DELETE /tasks/:id & DELETE /todos/:id
async function handleDeleteTask(req: any, res: any): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db.delete(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, req.user.id))).returning();
  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.sendStatus(204);
}

router.delete("/tasks/:id", requireAuth, handleDeleteTask);
router.delete("/todos/:id", requireAuth, handleDeleteTask);

export default router;
