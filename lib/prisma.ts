import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function databaseUrl() {
  try {
    const contents = readFileSync(join(process.cwd(), ".env"), "utf8");
    const match = contents.match(/^DATABASE_URL="?([^"\r\n]+)"?$/m);
    return match?.[1] ?? process.env.DATABASE_URL;
  } catch {
    return process.env.DATABASE_URL;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: databaseUrl() } },
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
