import { PrismaClient } from '@prisma/client';

// Models that do NOT have tenant_id — excluded from auto-injection
const EXCLUDED_MODELS = ['Tenant', 'UserRole', 'UserStoreAssignment'] as const;

// AuditLog is append-only — no update/delete allowed
const APPEND_ONLY_MODELS = ['AuditLog'] as const;

type ExcludedModel = (typeof EXCLUDED_MODELS)[number];
type AppendOnlyModel = (typeof APPEND_ONLY_MODELS)[number];

function isExcludedModel(model: string): model is ExcludedModel {
  return EXCLUDED_MODELS.includes(model as ExcludedModel);
}

function isAppendOnlyModel(model: string): model is AppendOnlyModel {
  return APPEND_ONLY_MODELS.includes(model as AppendOnlyModel);
}

function injectTenantWhere(args: Record<string, unknown>, tenantId: string): Record<string, unknown> {
  return { ...args, where: { ...(args.where as Record<string, unknown>), tenant_id: tenantId } };
}

function injectTenantData(args: Record<string, unknown>, tenantId: string): Record<string, unknown> {
  const data = args.data as Record<string, unknown>;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...args, data: { ...data, tenant_id: tenantId } };
  }
  return args;
}

function guardAppendOnly(model: string, operation: string): void {
  if (isAppendOnlyModel(model)) {
    throw new Error(`${operation} operation is not allowed on ${model} (append-only table)`);
  }
}

/**
 * Creates a tenant-scoped Prisma client that auto-injects tenant_id on all queries.
 * Accepts an existing base PrismaClient to reuse the connection pool.
 *
 * @param basePrisma - The shared base PrismaClient instance
 * @param tenantId - The tenant UUID to scope all queries to
 */
export function createTenantPrismaClient(basePrisma: PrismaClient, tenantId: string) {
  if (!tenantId) {
    throw new Error('tenantId is required to create a tenant-scoped Prisma client');
  }

  return basePrisma.$extends({
    query: {
      $allModels: {
        // --- READ operations ---
        async findMany({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async findFirst({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async findFirstOrThrow({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        // findUnique requires exact unique constraint fields — convert to findFirst to allow tenant filter
        async findUnique({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async findUniqueOrThrow({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async count({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async aggregate({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async groupBy({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },

        // --- WRITE operations ---
        async create({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            args = injectTenantData(args, tenantId);
          }
          return query(args);
        },
        async createMany({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          if (!isExcludedModel(model)) {
            const data = args.data as Record<string, unknown> | Record<string, unknown>[];
            if (Array.isArray(data)) {
              args = { ...args, data: data.map((row) => ({ ...row, tenant_id: tenantId })) };
            } else if (data && typeof data === 'object') {
              args = { ...args, data: { ...data, tenant_id: tenantId } };
            }
          }
          return query(args);
        },
        async upsert({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          guardAppendOnly(model, 'Upsert');
          if (!isExcludedModel(model)) {
            const create = args.create as Record<string, unknown>;
            const update = args.update as Record<string, unknown>;
            args = {
              ...args,
              create: { ...create, tenant_id: tenantId },
              update: update, // do NOT override tenant_id on update
            };
          }
          return query(args);
        },
        async update({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          guardAppendOnly(model, 'Update');
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async updateMany({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          guardAppendOnly(model, 'UpdateMany');
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async delete({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          guardAppendOnly(model, 'Delete');
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
        async deleteMany({ model, args, query }: { model: string; args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          guardAppendOnly(model, 'DeleteMany');
          if (!isExcludedModel(model)) {
            args = injectTenantWhere(args, tenantId);
          }
          return query(args);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantPrismaClient>;
