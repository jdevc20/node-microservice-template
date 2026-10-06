import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./configurations/env.js";
import { connectDatabase, disconnectDatabase } from "./database/prisma.js";

const server = createServer(app);

async function start(): Promise<void> {
  await connectDatabase();

  server.listen(env.PORT, () => {
    console.log(`${env.SERVICE_NAME} listening on port ${env.PORT}`);
  });
}

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  setTimeout(async () => {
    await disconnectDatabase();
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch(async (error) => {
  console.error("Failed to start service:", error);
  await disconnectDatabase();
  process.exit(1);
});
