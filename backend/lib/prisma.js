import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection pool exhaustion
// This is critical for Prisma Accelerate which has connection limits
// For Vercel serverless, each function invocation gets a fresh instance but reuses within same execution context

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
