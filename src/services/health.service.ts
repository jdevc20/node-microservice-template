import { prisma } from "../database/prisma.js";

export async function getHealth() {
  return {
    database: await checkDatabase(),
  };
}

async function checkDatabase(): Promise<"up" | "down"> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "up";
  } catch {
    return "down";
  }
}
