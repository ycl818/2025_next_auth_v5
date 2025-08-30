import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

// due to nextjs hot reload, global is not affected by hot reload
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
