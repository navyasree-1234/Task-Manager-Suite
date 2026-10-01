import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;

let dbInstance: any;

let pgliteClient: PGlite | null = null;

if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
  const pool = new Pool({ connectionString: dbUrl });
  dbInstance = drizzlePg(pool, { schema });
} else {
  let dbDir: string;
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseDir = isServerless ? "/tmp" : process.cwd();
    dbDir = path.resolve(baseDir, ".data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (err) {
    dbDir = path.resolve("/tmp", ".data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }
  const pglitePath = path.join(dbDir, "pglite_data");
  const pidPath = path.join(pglitePath, "postmaster.pid");
  if (fs.existsSync(pidPath)) {
    try {
      fs.unlinkSync(pidPath);
    } catch (_e) {
      // ignore
    }
  }
  pgliteClient = new PGlite(pglitePath);
  dbInstance = drizzlePglite(pgliteClient, { schema });
}

export const db = dbInstance;

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  if (pgliteClient) {
    await pgliteClient.waitReady;
  }
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    isInitialized = true;
  } catch (err) {
    console.error("Error initializing database tables:", err);
  }
}

export * from "./schema";
