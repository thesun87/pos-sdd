import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';
export { createTenantPrismaClient } from './middleware/tenant-isolation.js';
export type { TenantPrismaClient } from './middleware/tenant-isolation.js';

/**
 * Returns the constructor options for PrismaClient using the PrismaPg adapter.
 * Use this to avoid duplicating DATABASE_URL + adapter setup across packages.
 */
export function createPrismaClientOptions(): ConstructorParameters<typeof PrismaClient>[0] {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return { adapter } as ConstructorParameters<typeof PrismaClient>[0];
}

let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient(createPrismaClientOptions());
  }
  return _prisma;
}
