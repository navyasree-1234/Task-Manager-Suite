import app from "../artifacts/api-server/src/app";
import { initDb } from "@workspace/db";

let isDbInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isDbInitialized) {
    await initDb();
    isDbInitialized = true;
  }
  return app(req, res);
}
