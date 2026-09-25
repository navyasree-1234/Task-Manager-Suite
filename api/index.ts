import app from "../artifacts/api-server/src/app";
import { initDb } from "../lib/db/src/index";

let isDbInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isDbInitialized) {
    await initDb();
    isDbInitialized = true;
  }
  return (app as any)(req, res);
}
