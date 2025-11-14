import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection pool exhaustion
// This is critical for Prisma Accelerate which has connection limits

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
