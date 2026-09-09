import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection pool exhaustion
// This is critical for Prisma Accelerate which has connection limits
// For Vercel serverless, each function invocation gets a fresh instance but reuses within same execution context

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Cache on the global across module reloads (local dev) AND across warm
// serverless invocations on Vercel — a fresh client per invocation would
// exhaust the Postgres connection limit.
globalForPrisma.prisma = prisma;
