import { PrismaClient } from "@/generated/prisma-client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Remove explicit datasource config to allow Prisma to resolve DATABASE_URL lazily at runtime
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
