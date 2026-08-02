import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma instance across the app (avoids exhausting
// DB connections during dev with hot-reload).
export const prisma = new PrismaClient();
