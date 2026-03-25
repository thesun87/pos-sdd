# Story 1.2: Database Schema Foundation & Prisma Setup

Status: done

## Story

As a **developer**,
I want **Prisma 7.x duoc cau hinh trong `packages/database` voi schema co ban (tenants, stores, users, roles, policies) va migration dau tien**,
so that **cac module nghiep vu co the mo rong schema khi can, tuan thu naming conventions**.

## Acceptance Criteria

1. **Given** PostgreSQL dang chay qua Docker Compose, **When** chay `pnpm prisma migrate dev`, **Then** database duoc tao voi cac bang: `tenants`, `stores`, `users`, `roles`, `user_roles`, `policies`, `audit_logs`

2. **Given** schema duoc tao, **When** kiem tra database, **Then** tat ca tables dung snake_case, UUID v7 cho primary keys, `tenant_id` + `store_id` tren moi bang scoped

3. **Given** Prisma client duoc generate, **When** import tu `apps/web` va `apps/api`, **Then** `@pos-sdd/database` export Prisma client san sang su dung

4. **Given** multi-tenant isolation can thiet, **When** bat ky query nao duoc thuc hien, **Then** Prisma middleware (hoac extension) auto-inject `WHERE tenant_id = ?` tren moi query (FR72)

## Tasks / Subtasks

- [x] Task 1: Cai dat Prisma 7.x va cau hinh co ban (AC: #3)
  - [x] Cai dat `prisma` va `@prisma/client` trong `packages/database`
  - [x] Tao `packages/database/prisma/schema.prisma` voi PostgreSQL provider
  - [x] Cau hinh `datasource` doc `DATABASE_URL` tu environment (qua `prisma.config.ts` — Prisma 7.x requirement)
  - [x] Cau hinh Prisma client generation voi output path phu hop monorepo
  - [x] Cap nhat `packages/database/package.json` voi scripts: `generate`, `migrate:dev`, `migrate:deploy`, `studio`
  - [x] Cap nhat `packages/database/src/index.ts` de export PrismaClient thuc (thay the placeholder tu Story 1.1)

- [x] Task 2: Thiet ke va tao schema co ban (AC: #1, #2)
  - [x] Tao model `Tenant` (id UUID v7, name, slug, settings JSON, is_active, timestamps)
  - [x] Tao model `Store` (id UUID v7, tenant_id FK, name, address, phone, settings JSON, is_active, timestamps)
  - [x] Tao model `User` (id UUID v7, tenant_id FK, email unique per tenant, name, pin_hash, password_hash, is_active, timestamps)
  - [x] Tao model `Role` (id UUID v7, tenant_id FK, name, description, is_system boolean, permissions JSON, timestamps)
  - [x] Tao model `UserRole` (id UUID v7, user_id FK, role_id FK, unique constraint [user_id, role_id])
  - [x] Tao model `UserStoreAssignment` (id UUID v7, user_id FK, store_id FK, scope_type enum: SINGLE_STORE/STORE_GROUP/ALL_STORES)
  - [x] Tao model `Policy` (id UUID v7, tenant_id FK, store_id nullable FK, role String, action String, resource String, limit Decimal nullable, override_role String nullable, conditions JSON nullable, is_active, timestamps)
  - [x] Tao model `AuditLog` (id UUID v7, tenant_id FK, store_id nullable FK, user_id FK, action String, resource String, resource_id String nullable, old_data JSON nullable, new_data JSON nullable, ip_address String nullable, metadata JSON nullable, created_at — KHONG co updated_at vi append-only)
  - [x] Tao cac indexes can thiet (xem Dev Notes)
  - [x] Tao enums: `StoreScopeType`, `AuditAction`

- [x] Task 3: Chay migration dau tien (AC: #1)
  - [x] Dam bao Docker Compose PostgreSQL dang chay (`docker-compose up -d postgres`)
  - [x] Chay `pnpm prisma migrate dev --name init-foundation-schema`
  - [x] Verify migration thanh cong va cac bang duoc tao dung
  - [x] Chay `pnpm prisma generate` de tao Prisma client

- [x] Task 4: Implement Prisma multi-tenant middleware/extension (AC: #4)
  - [x] Tao `packages/database/src/middleware/tenant-isolation.ts`
  - [x] Implement Prisma client extension (`$extends`) de auto-inject `tenant_id` filter tren moi query (findMany, findFirst, findUnique, update, delete)
  - [x] Extension nhan `tenantId` tu context khi khoi tao
  - [x] Bao ve chong cross-tenant access: throw error neu query khong co tenant_id
  - [x] Export factory function `createTenantPrismaClient(tenantId: string)` tu `@pos-sdd/database`
  - [x] Viet unit tests cho tenant isolation middleware

- [x] Task 5: Tao seed data co ban (AC: #1, #2)
  - [x] Tao `packages/database/prisma/seed.ts`
  - [x] Seed 1 tenant demo (`pos-sdd-demo`)
  - [x] Seed 2 stores cho tenant demo
  - [x] Seed 6 default roles (Cashier, Kitchen, Shift Lead, Store Manager, Chain Owner, System Admin) voi is_system = true
  - [x] Seed default policies cho moi role (discount limits, void limits, refund limits)
  - [x] Seed 1 admin user (email: admin@pos-sdd.local, PIN: 123456 — hashed bcrypt)
  - [x] Cau hinh `prisma.seed` trong package.json de chay `tsx prisma/seed.ts`

- [x] Task 6: Tich hop vao apps/api (NestJS) (AC: #3)
  - [x] Tao `apps/api/src/modules/database/database.module.ts` — Global NestJS module
  - [x] Tao `apps/api/src/modules/database/database.service.ts` — Wrap PrismaClient, implement `onModuleInit` (connect) va `onModuleDestroy` (disconnect)
  - [x] Register `DatabaseModule` lam `@Global()` module trong `AppModule`
  - [x] Verify injection hoat dong: tsc --noEmit pass, cross-package import verified

- [x] Task 7: Tich hop vao apps/web (Next.js) (AC: #3)
  - [x] Tao `apps/web/lib/prisma.ts` — Singleton PrismaClient cho Next.js (hot reload safe)
  - [x] Verify import tu `@pos-sdd/database` hoat dong trong Next.js server components/actions

- [x] Task 8: Verification & Testing (AC: #1 - #4)
  - [x] Chay `pnpm prisma migrate dev` tu root — migration thanh cong (9 tables created)
  - [x] Verify `turbo build` — build thanh cong voi Prisma client
  - [x] Verify `turbo type-check` — khong loi (5/5 packages pass)
  - [x] Verify `turbo test` — 11/11 tenant isolation unit tests pass
  - [x] Test cross-package import: `apps/api` va `apps/web` import duoc `@pos-sdd/database`

## Dev Notes

### Thong tin ky thuat quan trong

**Cong nghe & Phien ban (PHAI tuan thu):**
- Prisma: **7.x** — TypeScript engine (khong con Rust), TypedSQL support
- PostgreSQL: **16** — dang chay qua Docker Compose tu Story 1.1
- UUID: **v7** (time-sortable) cho tat ca primary keys — KHONG dung auto-increment hoac UUID v4
- Currency: **Integer** (VND khong co decimal) — `Decimal` type trong Prisma cho limit fields

**DATABASE_URL (da co tu Story 1.1):**
```
postgresql://pos_user:pos_password@localhost:5432/pos_sdd_dev
```

### Prisma Schema Pattern (BAT BUOC)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === ENUMS ===
enum StoreScopeType {
  SINGLE_STORE
  STORE_GROUP
  ALL_STORES
}

// === MODELS ===
model Tenant {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String
  slug       String   @unique
  settings   Json     @default("{}")
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  stores     Store[]
  users      User[]
  roles      Role[]
  policies   Policy[]
  audit_logs AuditLog[]

  @@map("tenants")
}
```

**Quy tac naming BAT BUOC:**
- Model name: PascalCase (`Tenant`, `UserRole`)
- Table name (@@map): snake_case, plural (`tenants`, `user_roles`)
- Column name: snake_case (`tenant_id`, `created_at`)
- Foreign key: `{referenced_table_singular}_id` (`tenant_id`, `store_id`, `user_id`)
- Index name: `idx_{table}_{columns}` (`idx_users_tenant_id_email`)
- Enum: PascalCase (`StoreScopeType`, `AuditAction`)

### UUID v7 Strategy

Prisma 7.x khong co native UUID v7 support. Su dung cach sau:
- Prisma `@default(dbgenerated("gen_random_uuid()"))` tao UUID v4 o DB level
- **Uu tien:** Cai `uuidv7` package va generate UUID v7 o application level truoc khi insert
- Tao utility function trong `@pos-sdd/shared/utils`:
```typescript
import { uuidv7 } from 'uuidv7';
export const generateId = (): string => uuidv7();
```
- Trong Prisma schema, dat `@id @db.Uuid` (khong dung `@default` tu DB) de app control ID generation
- **Luu y:** Cach nay dam bao time-sortable IDs cho moi record

### Index Strategy (BAT BUOC)

```prisma
// Moi bang scoped PHAI co composite index tenant_id
@@index([tenant_id])

// Users: unique email per tenant
@@unique([tenant_id, email])

// Policies: lookup nhanh theo role + action
@@index([tenant_id, role, action, resource])

// AuditLogs: query theo thoi gian va user
@@index([tenant_id, created_at])
@@index([tenant_id, user_id, created_at])

// UserStoreAssignment: lookup nhanh
@@unique([user_id, store_id])
```

### Tenant Isolation Pattern (Prisma Client Extension)

```typescript
// packages/database/src/middleware/tenant-isolation.ts
import { PrismaClient, Prisma } from '@prisma/client';

export function createTenantPrismaClient(tenantId: string) {
  const prisma = new PrismaClient();

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenant_id: tenantId };
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
      },
    },
  });
}
```

**Luu y quan trong:**
- Extension nay chi ap dung cho cac bang co `tenant_id` field
- Bang `Tenant` ban than KHONG co tenant_id — can exclude khoi extension
- AuditLog la append-only: KHONG co update/delete operations

### NestJS Database Module Pattern

```typescript
// apps/api/src/modules/database/database.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@pos-sdd/database';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// apps/api/src/modules/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

### Next.js Prisma Singleton Pattern

```typescript
// apps/web/lib/prisma.ts
import { PrismaClient } from '@pos-sdd/database';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Seed Data Structure

**6 Default Roles (is_system = true):**

| Role | Key Permissions |
|------|----------------|
| System Admin | Full access all modules |
| Chain Owner | All stores, reports, config, user management |
| Store Manager | Single/group stores, full operations |
| Shift Lead | Single store, limited admin (void, discount up to limit) |
| Cashier | POS operations, limited void |
| Kitchen | KDS access only |

**Default Policies (vi du):**

| Role | Action | Resource | Limit | Override |
|------|--------|----------|-------|----------|
| cashier | discount | order | 10 (%) | shift_lead |
| cashier | void | order_item | 50000 (VND) | shift_lead |
| shift_lead | discount | order | 20 (%) | store_manager |
| shift_lead | void | order | 200000 (VND) | store_manager |
| store_manager | refund | payment | 500000 (VND) | chain_owner |

### AuditLog Design (Append-only — NFR13)

- **KHONG BAO GIO** co `updated_at` — chi co `created_at`
- **KHONG BAO GIO** cho phep UPDATE hoac DELETE tren `audit_logs`
- Moi record luu: who (user_id), what (action, resource, resource_id), when (created_at), data change (old_data, new_data)
- Retention: >= 12 thang (NFR13)
- Field `metadata` cho extra context (vd: IP address, device info, approval_by)

### Cau truc thu muc can tao/cap nhat

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Auto-generated by Prisma
│   └── seed.ts                # Seed data script
├── src/
│   ├── index.ts               # Re-export PrismaClient + utilities
│   └── middleware/
│       └── tenant-isolation.ts # Prisma extension for multi-tenant
├── package.json               # Cap nhat scripts
└── tsconfig.json

apps/api/src/modules/database/
├── database.module.ts         # Global NestJS module
└── database.service.ts        # Prisma service wrapper

apps/web/lib/
└── prisma.ts                  # Singleton Prisma client
```

### Previous Story Intelligence (Story 1.1)

**Bai hoc tu Story 1.1:**
- `packages/database` hien tai chi co placeholder `src/index.ts` — can thay the bang Prisma client exports thuc
- TypeScript 6.0 yeu cau `ignoreDeprecations: "6.0"` — da duoc cau hinh
- ESLint dang dung ca `.eslintrc.js` (legacy) va `eslint.config.mjs` (flat) — co the can tuy chinh cho Prisma generated files
- `tsup.config.ts` da duoc tao cho `packages/shared` — xem xet co can cho `packages/database` khong (thuong khong can vi Prisma client tu generate)
- Docker Compose da san sang voi PostgreSQL 16 tren port 5432 va Redis 7 tren port 6379
- `.env.example` da co `DATABASE_URL` — khong can tao lai
- NestJS dang chay voi SWC compiler, global prefix `/api/v1`, CORS enabled
- `pnpm-workspace.yaml` da cau hinh `apps/*` va `packages/*`
- Naming: NestJS files dung kebab-case (`.ts`)

**Files tu Story 1.1 se bi thay doi:**
- `packages/database/src/index.ts` — thay placeholder bang real exports
- `packages/database/package.json` — them prisma dependencies va scripts
- `apps/api/src/app.module.ts` — import DatabaseModule

**Anti-patterns can tranh:**
- KHONG dung `__tests__` folder — tests phai co-located
- KHONG dung auto-increment IDs — phai dung UUID v7
- KHONG dung float cho currency — phai dung Integer (VND)
- KHONG tao Prisma client truc tiep trong apps — phai import tu `@pos-sdd/database`
- KHONG hardcode tenant_id — phai dung middleware/extension inject tu dong
- KHONG cho phep cross-tenant queries — phai co guard

### Testing Standards

- Framework: **Vitest** (KHONG dung Jest)
- Test files: `*.spec.ts` co-located voi source
- Viet tests cho:
  - Tenant isolation middleware (critical — dam bao data khong leak giua tenants)
  - Seed script chay thanh cong
  - Prisma client export hoat dong
- Mock PostgreSQL bang in-memory hoac test database (PostgreSQL test container hoac sqlite)

### References

- Architecture: Prisma 7.x + PostgreSQL selection [Source: architecture.md#Data-Architecture]
- Multi-tenant isolation strategy [Source: architecture.md#Infrastructure-Deployment — Prisma middleware]
- Policy table schema [Source: architecture.md#Authentication-Security]
- Naming conventions [Source: architecture.md#Naming-Patterns]
- UUID v7 requirement [Source: architecture.md#Format-Patterns]
- AuditLog immutability (NFR13) [Source: epics.md#NFR-Requirements]
- 6 default roles [Source: epics.md#Story-1.5]
- 4-layer RBAC [Source: architecture.md#Authorization-Pipeline-Architecture]
- FR72: Multi-tenant isolation [Source: epics.md#Cross-Cutting-Capabilities]
- Story 1.1 completion notes [Source: 1-1-khoi-tao-turborepo-monorepo-dev-environment.md#Completion-Notes]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6 (SM/Story Context Engine)

### Completion Notes List

- Story 1.2 la foundation database cho toan bo project — tat ca stories sau se mo rong schema nay
- Schema chi tao cac bang foundation (tenants, stores, users, roles, policies, audit_logs) — cac bang nghiep vu (orders, products, payments...) se duoc them o cac epic sau
- Prisma migration phu thuoc Docker Compose PostgreSQL dang chay
- Tenant isolation middleware la CRITICAL — phai test ky truoc khi bat dau cac stories tiep theo
- `UserStoreAssignment` cho phep flexible scope assignment (Story 1.6 se build UI tren foundation nay)
- Policy table la DB-driven — cho phep thay doi RBAC rules ma khong can deploy lai code (Story 1.5 se build Policy Service)
- **Prisma 7.x Breaking Change**: `url` khong con duoc support trong `schema.prisma` — phai dung `prisma.config.ts` voi `datasource.url`. Prisma adapter (`@prisma/adapter-pg` + `pg`) bat buoc cho tat ca connections.
- DATABASE_URL phai dung `127.0.0.1` thay vi `localhost` tren Windows voi Docker (port binding `127.0.0.1:5432`)
- `uuidv7` package duoc cai cho ca `packages/database` va `packages/shared` — `generateId()` trong shared da duoc update sang UUID v7
- Seed script dung `tsx` (khong phai `ts-node`) va bcryptjs de hash PIN/password
- 11 unit tests cho tenant isolation (findMany, findFirst, findUnique, create, update, delete, AuditLog append-only protection, cross-tenant isolation)
- Tat ca 8 tasks hoan thanh, `turbo type-check` va `turbo test` pass clean

## File List

### New Files
- `packages/database/prisma/schema.prisma` — Prisma schema with 7 models + 2 enums
- `packages/database/prisma/migrations/20260325083947_init_foundation_schema/migration.sql` — Initial migration
- `packages/database/prisma/seed.ts` — Seed script (1 tenant, 2 stores, 6 roles, 5 policies, 1 admin user)
- `packages/database/prisma.config.ts` — Prisma 7.x config (datasource URL)
- `packages/database/src/middleware/tenant-isolation.ts` — Tenant isolation Prisma extension
- `packages/database/src/middleware/tenant-isolation.spec.ts` — 11 unit tests
- `apps/api/src/modules/database/database.module.ts` — Global NestJS DatabaseModule
- `apps/api/src/modules/database/database.service.ts` — PrismaClient NestJS service
- `apps/web/lib/prisma.ts` — Singleton PrismaClient for Next.js

### Modified Files
- `packages/database/src/index.ts` — Replaced placeholder with real PrismaClient exports
- `packages/database/package.json` — Added Prisma scripts + dependencies
- `packages/shared/src/utils/index.ts` — Updated `generateId()` to use UUID v7
- `apps/api/src/app.module.ts` — Added DatabaseModule import
- `apps/api/package.json` — Added @pos-sdd/database + Prisma deps
- `apps/web/package.json` — Added @pos-sdd/database + Prisma deps
- `.env` — Updated DATABASE_URL to use 127.0.0.1 (Windows Docker fix)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-03-25 | Story created | Ultimate context engine analysis completed — comprehensive developer guide created |
| 2026-03-25 | Story implemented | Prisma 7.5 setup, schema migration, tenant isolation middleware (11 tests), seed data, NestJS + Next.js integration |
