import { PrismaClient, createPrismaClientOptions } from '@pos-sdd/database';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient(createPrismaClientOptions());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
