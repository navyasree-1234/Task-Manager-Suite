import app from "./app";
import { logger } from "./lib/logger";
import { initDb } from "@workspace/db";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function main() {
  try {
    await initDb();
    logger.info("Database initialized successfully");

    app.listen(port, "0.0.0.0", () => {
      logger.info({ port }, `Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

main();
