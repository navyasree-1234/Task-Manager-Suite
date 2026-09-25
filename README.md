# Task-Manager-Suite

A full-stack, production-ready Task Management Application built with **React 19, TypeScript, Express 5, Drizzle ORM, Zod, and Tailwind CSS**.

- **GitHub Repository**: [https://github.com/navyasree-1234/Task-Manager-Suite](https://github.com/navyasree-1234/Task-Manager-Suite)

---

## Architecture Overview

- **`artifacts/todo-app`**: Frontend web application built with React 19, Vite, TanStack Query, Wouter, Lucide Icons, and Tailwind CSS.
- **`artifacts/api-server`**: Backend REST API built with Express 5, JWT authentication, bcrypt password hashing, and Pino logger.
- **`lib/db`**: Database layer using Drizzle ORM with automatic schema initialization. Supports embedded **PGlite** (zero external dependencies required) and external **PostgreSQL**.
- **`lib/api-spec`**: OpenAPI 3.1 contract specification with Orval codegen.
- **`lib/api-zod`**: Auto-generated Zod schemas for runtime request/response validation.
- **`lib/api-client-react`**: Auto-generated React Query hooks and custom fetch client.

---

## Features

- **Authentication & Protection**: User registration, login with JWT tokens, password hashing with bcrypt, protected routes, and profile retrieval (`/api/auth/me`). Unauthenticated users are strictly restricted to login/register.
- **Task Management**: Create, view, edit, update status (`To Do`, `In Progress`, `Completed`), toggle completion, assign due dates, and delete tasks.
- **Filters & Search**: Filter tasks by status and priority, search by keyword, and sort by date created, due date, priority, or title.
- **Productivity Dashboard & Stats**: Visual metrics showing total, active, in-progress, completed, high priority, and upcoming due tasks.
- **Calendar View**: Visual calendar displaying tasks assigned to specific due dates.
- **Windows & Cross-Platform Compatibility**: Fully compatible with Windows PowerShell, Command Prompt, macOS, and Linux out-of-the-box.

---

## Prerequisites

- **Node.js**: v18.x, v20.x, or v24.x (v24 recommended)
- **pnpm**: v9.x or v11.x (`npm install -g pnpm`)

---

## Quick Start Instructions (Windows / VS Code)

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
pnpm install
```

### 2. Configure Environment Variables (Optional)

A `.env.example` file is provided in the root directory.

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=task-manager-suite-secret-key-2026
VITE_API_URL=http://localhost:5000/api
```

> **Note**: If `DATABASE_URL` is omitted, the application automatically uses an embedded **PGlite** database saved in the local `.data` directory. No external PostgreSQL installation is required for local development.

### 3. Run the Backend API Server

In Terminal 1:

```powershell
pnpm --filter @workspace/api-server run start
```

The API server will start at: `http://localhost:5000` (Health check: `http://localhost:5000/api/healthz`)

### 4. Run the Frontend Development Server

In Terminal 2:

```powershell
pnpm --filter @workspace/todo-app run dev --port 3000
```

The frontend application will start at: `http://localhost:3000`

---

## Available Workspace Commands

| Command | Description |
| :--- | :--- |
| `pnpm install` | Install all workspace dependencies |
| `pnpm run typecheck` | Perform TypeScript typechecking across all 9 packages |
| `pnpm run build` | Typecheck and build all workspace applications and libraries |
| `pnpm --filter @workspace/api-server run dev` | Build and start the backend API server in development mode |
| `pnpm --filter @workspace/todo-app run dev` | Start the Vite frontend development server |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate React Query hooks and Zod schemas from `openapi.yaml` |

---

## Deployment Guide

### Backend Deployment (Render)
1. Go to **[dashboard.render.com](https://dashboard.render.com)** -> Click **New +** -> **Web Service**.
2. Connect your GitHub repository `navyasree-1234/Task-Manager-Suite`.
3. Configuration:
   - **Root Directory**: `artifacts/api-server`
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run start`
   - **Environment Variables**:
     - `PORT` = `5000`
     - `JWT_SECRET` = `task-manager-suite-secret-key-2026`
     - `DATABASE_URL` = *(Optional: Postgres connection string)*

### Frontend Deployment (Vercel)
1. Go to **[vercel.com/new](https://vercel.com/new)** -> Import `navyasree-1234/Task-Manager-Suite`.
2. Configuration:
   - **Root Directory**: `artifacts/todo-app`
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
   - **Environment Variable**:
     - `VITE_API_URL` = `https://<YOUR_RENDER_BACKEND_URL>/api`

---

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current user profile (Requires `Authorization: Bearer <token>`)
- `POST /api/auth/logout` — Logout user

### Tasks

- `GET /api/tasks` — List tasks with query filters (`status`, `priority`, `search`, `sortBy`)
- `POST /api/tasks` — Create a new task
- `GET /api/tasks/stats` — Retrieve workspace task metrics
- `GET /api/tasks/:id` — Get task by ID
- `PUT /api/tasks/:id` — Update task details
- `PATCH /api/tasks/:id/status` — Update task status (`todo`, `in-progress`, `completed`)
- `PATCH /api/tasks/:id/complete` — Toggle task completion
- `DELETE /api/tasks/:id` — Delete a task
- `DELETE /api/tasks/clear-completed` — Delete all completed tasks

---

## License

MIT
