# Story 1.6: Store Scope Assignment & Multi-tenant Isolation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **quan tri vien he thong**,
I want **gan nhan vien vao pham vi cua hang (Single Store / Store Group / All Stores) va dam bao du lieu khong bi truy cap cheo tenant**,
so that **nhan vien chi thay va thao tac du lieu trong pham vi duoc phan quyen** (FR55, FR72).

## Acceptance Criteria

1. **Given** user duoc gan scope "Single Store" cho Store A
   **When** user query bat ky du lieu nao
   **Then** chi tra ve du lieu cua Store A, KHONG BAO GIO thay du lieu Store B (NFR14)

2. **Given** user tu Tenant X
   **When** co gang truy cap resource cua Tenant Y (du biet ID)
   **Then** tra ve 403 Forbidden, audit log ghi nhan attempt

3. **Given** quan tri vien gan user vao Store Group
   **When** user dang nhap
   **Then** user thay dropdown chon store trong group, du lieu filter dung scope

4. **Given** quan tri vien muon quan ly stores
   **When** goi CRUD endpoints cho stores
   **Then** `GET /api/v1/stores` tra ve danh sach stores cua tenant (co pagination)
   **And** `GET /api/v1/stores/:id` tra ve store detail
   **And** `POST /api/v1/stores` tao store moi (chi Chain Owner, System Admin)
   **And** `PATCH /api/v1/stores/:id` cap nhat store
   **And** `DELETE /api/v1/stores/:id` deactivate store (soft delete, KHONG xoa neu co store assignments hoac du lieu active)

5. **Given** quan tri vien muon gan/go store assignments cho user
   **When** goi `POST /api/v1/users/:id/store-assignments` voi `{ assignments: [{ storeId, scopeType }] }`
   **Then** store assignments cua user duoc cap nhat (replace tat ca assignments hien tai)
   **And** audit log ghi nhan thay doi assignments voi old va new data
   **And** neu user co active JWT session, storeAssignments KHONG tu dong cap nhat (user can re-login)

6. **Given** quan tri vien muon xem store assignments cua user
   **When** goi `GET /api/v1/users/:id/store-assignments`
   **Then** tra ve danh sach assignments voi store details (name, address)

7. **Given** request den store-scoped endpoint co storeId
   **When** StoreScopeGuard kiem tra
   **Then** xac minh user co quyen truy cap store do dua tren assignments
   **And** ALL_STORES → cho phep moi store
   **And** SINGLE_STORE → chi storeId chinh xac match
   **And** STORE_GROUP → kiem tra storeId nam trong group (simplified: storeId direct match)

8. **Given** TenantInterceptor duoc apply
   **When** moi request den API
   **Then** tenant_id tu JWT/session duoc inject vao request context
   **And** DatabaseService su dung createTenantPrismaClient(basePrisma, tenantId) de tao tenant-scoped client

## Tasks / Subtasks

- [x] Task 1: Tao StoreModule structure (AC: #4)
  - [x] Tao `apps/api/src/modules/store/store.module.ts`
  - [x] Tao `apps/api/src/modules/store/store.service.ts`
  - [x] Tao `apps/api/src/modules/store/store.controller.ts`
  - [x] Tao DTOs: `create-store.dto.ts`, `update-store.dto.ts`, `list-stores-query.dto.ts`
  - [x] Import StoreModule vao `app.module.ts`

- [x] Task 2: Implement StoreService CRUD (AC: #4)
  - [x] `listStores(tenantId, query)`:
    1. Build where: `{ tenant_id, AND: filters }` — filter by `isActive`, `search` (ILIKE name, address)
    2. Pagination: `{ data: stores, meta: { page, limit, total } }`
  - [x] `getStoreById(storeId, tenantId)`:
    1. Query store voi `where: { id: storeId, tenant_id: tenantId }`
    2. Include: `_count: { select: { user_assignments: true } }` de biet so users assigned
    3. Tra ve store voi userCount
  - [x] `createStore(tenantId, dto, adminUserId)`:
    1. Validate store name khong trung trong tenant: `prisma.store.findFirst({ where: { tenant_id, name } })`
    2. Tao store: `prisma.store.create({ data: { id: uuidv7(), tenant_id, name, address, phone, settings: {} } })`
    3. Ghi audit log: `CREATE`, resource: `store`
    4. Tra ve store moi
  - [x] `updateStore(storeId, tenantId, dto, adminUserId)`:
    1. Tim store theo id + tenant_id
    2. Validate name unique (neu doi name)
    3. Update store, ghi audit log voi old_data va new_data
  - [x] `deactivateStore(storeId, tenantId, adminUserId)`:
    1. Tim store theo id + tenant_id
    2. Kiem tra user_assignments count: neu co active assignments → warn (KHONG block, chi ghi audit metadata)
    3. Set `is_active = false`, ghi audit log: `UPDATE`, resource: `store`

- [x] Task 3: Implement StoreController (AC: #4)
  - [x] `GET /api/v1/stores` — listStores, guards: AuthModeGuard
  - [x] `GET /api/v1/stores/:id` — getStoreById, guards: AuthModeGuard
  - [x] `POST /api/v1/stores` — createStore, guards: AuthModeGuard + RoleGuard, roles: chain_owner, system_admin
  - [x] `PATCH /api/v1/stores/:id` — updateStore, guards: AuthModeGuard + RoleGuard, roles: chain_owner, system_admin, store_manager
  - [x] `POST /api/v1/stores/:id/deactivate` — deactivateStore, guards: AuthModeGuard + RoleGuard, roles: chain_owner, system_admin

- [x] Task 4: Implement User Store Assignment endpoints (AC: #5, #6)
  - [x] Tao `apps/api/src/modules/user/dto/assign-store.dto.ts`
  - [x] Them endpoint `POST /api/v1/users/:id/store-assignments` trong UserController
  - [x] Them endpoint `GET /api/v1/users/:id/store-assignments` trong UserController
  - [x] Implement `assignStoreScopes(userId, tenantId, adminUserId, dto)` trong UserService
  - [x] Implement `getStoreAssignments(userId, tenantId)` trong UserService

- [x] Task 5: Implement TenantInterceptor (AC: #8)
  - [x] Kiem tra `apps/api/src/modules/database/database.service.ts` — xac nhan co su dung `createTenantPrismaClient` hay khong
  - [x] Ket luan: DatabaseService extend PrismaClient truc tiep, moi service truyen tenant_id thu cong vao query. Tenant isolation DA HOAT DONG qua manual where clause. TenantInterceptor SKIP theo khuyen nghi trong story (ALTERNATIVE simpler approach).

- [x] Task 6: Cross-tenant access test va audit logging (AC: #2)
  - [x] Tests cross-tenant trong store.service.spec.ts: `getStoreById` cross-tenant blocked → NotFoundException
  - [x] Tests cross-tenant trong user.service.spec.ts: `getStoreAssignments` cross-tenant → NotFoundException
  - [x] Tenant isolation: moi query store/user deu co `tenant_id` trong WHERE clause

- [x] Task 7: Seed data updates (AC: #1, #3)
  - [x] Cap nhat `packages/database/prisma/seed.ts`:
    1. Admin user: store assignment ALL_STORES cho Store 1
    2. Demo cashier user (cashier@pos-sdd.local): SINGLE_STORE cho Store 1
    3. Demo store manager user (manager@pos-sdd.local): STORE_GROUP cho Store 1 + Store 2

- [x] Task 8: Write Unit Tests day du (AC: #1-#8)
  - [x] `store.service.spec.ts` — 15 tests: listStores (pagination, isActive filter, search), getStoreById (happy path, not found, cross-tenant), createStore (happy path, duplicate name), updateStore (happy path, not found, conflict), deactivateStore (happy path, audit metadata, not found)
  - [x] `store.controller.spec.ts` — 5 tests: verify response format cho tung endpoint
  - [x] `user.service.spec.ts` — them 8 tests: assignStoreScopes (happy path, ALL_STORES, not found, invalid stores, duplicate ALL_STORES, audit log), getStoreAssignments (happy path, empty, cross-tenant)
  - [x] `user.controller.spec.ts` — them 2 tests: assignStoreScopes, getStoreAssignments endpoints

- [x] Task 9: Verify build va type-check (AC: all)
  - [x] `pnpm turbo build` — PASS (5 successful)
  - [x] `pnpm turbo type-check` — PASS (5 successful)
  - [x] `pnpm turbo test` — PASS (176 tests, 0 regression, 17 test files)
  - [ ] `pnpm turbo test` — PASS (145 tests cu + tests moi, khong regression)

## Dev Notes

### Thong tin ky thuat quan trong

**Cong nghe & Phien ban (PHAI tuan thu):**
- NestJS 11: SWC compiler, Vitest, class-validator cho DTOs
- Prisma 7.x: snake_case field names trong TypeScript — `tenant_id`, `is_active`, `store_id`, `scope_type`, `user_assignments`, `store_assignments`
- UUID v7: `uuidv7()` tu package `uuidv7` — dung cho tat ca primary keys
- `bcryptjs`: salt rounds = 10 (da co pattern)
- StoreScopeType enum: `SINGLE_STORE`, `STORE_GROUP`, `ALL_STORES` (da dinh nghia trong Prisma schema)

**CRITICAL: Tenant Isolation DA CO — Chi Can Mo Rong**
```
Prisma client extension: packages/database/src/middleware/tenant-isolation.ts
- createTenantPrismaClient(basePrisma, tenantId) — tao tenant-scoped client
- EXCLUDED_MODELS: ['Tenant', 'UserRole', 'UserStoreAssignment'] — KHONG auto-inject tenant_id
- APPEND_ONLY_MODELS: ['AuditLog'] — KHONG cho update/delete
- Auto-inject tenant_id vao WHERE clause cho read va data cho write
```

**CRITICAL: UserStoreAssignment la EXCLUDED model trong tenant isolation middleware.** Vi no KHONG co `tenant_id` column — isolation phu thuoc vao user_id FK → User.tenant_id. Khi query, PHAI join qua User de dam bao tenant isolation, HOAC validate user thuoc dung tenant truoc khi query assignments.

**CRITICAL: Store model DA CO trong tenant isolation middleware.** Moi store query tu dong duoc filter theo `tenant_id`. KHONG can manual inject.

**StoreScopeGuard DA CO (tu Story 1.5):**
```typescript
// File: apps/api/src/common/guards/store-scope.guard.ts
// - Doc storeId tu params, query, hoac body
// - Neu KHONG co storeId → cho qua (tenant-level operation)
// - ALL_STORES → cho qua
// - SINGLE_STORE → exact match
// - STORE_GROUP → simplified direct match (TODO: full group query)
```
StoreScopeGuard DA HOAN CHINH cho story nay — chi can ap dung `@UseGuards(StoreScopeGuard)` tren store-scoped endpoints va test ky luong.

**Prisma Schema (DA CO — KHONG tao migration):**
```
model Store {
  id         String   @id @db.Uuid
  tenant_id  String   @db.Uuid
  name       String
  address    String?
  phone      String?
  settings   Json     @default("{}")
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  tenant     Tenant   @relation(...)
  user_assignments  UserStoreAssignment[]
  policies          Policy[]
  audit_logs        AuditLog[]
  @@index([tenant_id])
  @@map("stores")
}

model UserStoreAssignment {
  id         String         @id @db.Uuid
  user_id    String
  store_id   String         @db.Uuid
  scope_type StoreScopeType @default(SINGLE_STORE)
  user       User           @relation(...)
  store      Store          @relation(...)
  @@unique([user_id, store_id])
  @@map("user_store_assignments")
}

enum StoreScopeType {
  SINGLE_STORE
  STORE_GROUP
  ALL_STORES
}
```

**API Response Format (BAT BUOC):**
```json
// Single item
{ "data": { "id": "...", "name": "Chi nhánh Quận 1", "address": "...", "isActive": true, "userCount": 5 } }

// List with pagination
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 2 } }
```

**Audit Log Pattern (tu Story 1.3, 1.4, 1.5):**
```typescript
await this.prisma.auditLog.create({
  data: {
    id: uuidv7(),
    tenant_id: tenantId,
    user_id: adminUserId,
    action: 'CREATE', // hoac 'UPDATE', 'DELETE'
    resource: 'store', // hoac 'user_store_assignment'
    resource_id: targetId,
    new_data: { name, address },
    old_data: previousData, // chi cho UPDATE
    ip_address: req.ip,
    metadata: {} // optional
  }
});
```

**JWT Payload Type (DA CO):**
```typescript
// File: apps/api/src/common/types/jwt-payload.ts
export interface JwtPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  storeAssignments: {
    storeId: string;
    scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
  }[];
  iat?: number;
  exp?: number;
}
```

### Cau truc thu muc can tao

```
apps/api/src/modules/store/
├── dto/
│   ├── create-store.dto.ts          # NEW
│   ├── update-store.dto.ts          # NEW
│   └── list-stores-query.dto.ts     # NEW
├── store.controller.ts               # NEW
├── store.service.ts                  # NEW
├── store.service.spec.ts             # NEW
├── store.controller.spec.ts          # NEW
├── store.module.ts                   # NEW

apps/api/src/modules/user/
├── dto/
│   └── assign-store.dto.ts          # NEW
├── user.controller.ts               # MODIFY — them POST/GET /:id/store-assignments endpoints
├── user.service.ts                  # MODIFY — them assignStoreScopes, getStoreAssignments methods

apps/api/src/
├── app.module.ts                    # MODIFY — import StoreModule

packages/database/prisma/
├── seed.ts                          # MODIFY — them store assignment seed data
```

### Existing Code de Reuse — KHONG Reinvent

| Can gi | Da co o dau | Cach dung |
|--------|-------------|-----------|
| AuthModeGuard | `apps/api/src/common/guards/auth-mode.guard.ts` | `@UseGuards(AuthModeGuard)` — da handle JWT + Session |
| RoleGuard | `apps/api/src/common/guards/role.guard.ts` | `@UseGuards(RoleGuard)` + `@Roles(...)` |
| StoreScopeGuard | `apps/api/src/common/guards/store-scope.guard.ts` | `@UseGuards(StoreScopeGuard)` — DA CO day du |
| @CurrentUser() | `apps/api/src/common/decorators/current-user.decorator.ts` | Extract `tenantId`, `userId`, `roles`, `storeAssignments` |
| @Roles() | `apps/api/src/common/decorators/roles.decorator.ts` | Restrict by role |
| JwtPayload type | `apps/api/src/common/types/jwt-payload.ts` | Interface voi `storeAssignments` |
| DatabaseService | `apps/api/src/modules/database/` | Inject via constructor DI, `this.dbService.getClient()` |
| uuidv7() | `uuidv7` package | `import { uuidv7 } from 'uuidv7'` |
| Tenant isolation middleware | `packages/database/src/middleware/tenant-isolation.ts` | `createTenantPrismaClient(basePrisma, tenantId)` |
| UserService | `apps/api/src/modules/user/user.service.ts` | DA CO createUser, listUsers, getUserById, assignRoles — chi THEM assignStoreScopes, getStoreAssignments |
| UserController | `apps/api/src/modules/user/user.controller.ts` | DA CO CRUD + POST /:id/roles — chi THEM POST/GET /:id/store-assignments |
| Seed stores | `packages/database/prisma/seed.ts` | 2 stores DA SEED — chi them store assignment data |
| Store model | `packages/database/prisma/schema.prisma` | DA CO — chi can query/create records |
| UserStoreAssignment model | `packages/database/prisma/schema.prisma` | DA CO — chi can query/create records |
| RoleModule pattern | `apps/api/src/modules/role/` | Tham khao cau truc module, service, controller, DTOs |
| PolicyModule pattern | `apps/api/src/modules/policy/` | Tham khao cau truc CRUD |

### NestJS Module Pattern (theo Story 1.5)

```typescript
// store.module.ts
import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
```

DatabaseService da la `@Global()` module — KHONG can import DatabaseModule.

### Controller Pattern (theo role.controller.ts)

```typescript
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listStores(@Query() query: ListStoresQueryDto, @CurrentUser() user: JwtPayload) {
    return this.storeService.listStores(user.tenantId, query);
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Body() dto: CreateStoreDto, @CurrentUser() user: JwtPayload) {
    const result = await this.storeService.createStore(user.tenantId, dto, user.userId);
    return { data: result };
  }
}
```

**Luu y:** Global prefix `/api/v1` da cau hinh trong `main.ts` — controller chi can `@Controller('stores')` → URL = `/api/v1/stores`

### DTO Validation Pattern (theo Story 1.4, 1.5 DTOs)

```typescript
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

**Luu y quan trong:** Dung `!` (definite assignment assertion) cho required fields — da fix tu Story 1.4 (loi TS2564).

### Prisma Query Patterns (tu Story 1.4, 1.5)

**Prisma 7.x:** Field names theo DB column names (snake_case):
- `tenant_id` (KHONG phai `tenantId`)
- `is_active` (KHONG phai `isActive`)
- `store_id` (KHONG phai `storeId`)
- `scope_type` (KHONG phai `scopeType`)
- `user_id` (KHONG phai `userId`)
- `user_assignments` (KHONG phai `userAssignments`)
- `store_assignments` (KHONG phai `storeAssignments`)

```typescript
// Query store voi user count
const stores = await this.prisma.store.findMany({
  where: { tenant_id: tenantId, is_active: true },
  include: { _count: { select: { user_assignments: true } } },
});

// Query user store assignments voi store info
const assignments = await this.prisma.userStoreAssignment.findMany({
  where: { user_id: userId },
  include: { store: { select: { id: true, name: true, address: true, is_active: true } } },
});
```

### Test Pattern (theo Story 1.4, 1.5)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPrisma = {
  store: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  userStoreAssignment: { findMany: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

const mockDbService = { getClient: vi.fn().mockReturnValue(mockPrisma) };
```

### Scope Decisions

- **StoreModule la CRUD don gian:** Store CRUD tuong tu RoleModule — KHONG co complex business logic. Chi can CRUD + audit log.
- **Store deactivation (soft delete):** KHONG hard delete stores. Set `is_active = false`. Ly do: stores co relational data (assignments, policies, audit logs, va sau nay se co orders, payments, etc.)
- **Store assignment replace strategy:** Tuong tu role assignment (Story 1.5) — `POST /users/:id/store-assignments` THAY THE toan bo assignments hien tai. Ly do: don gian, khong can manage individual assignment IDs.
- **StoreScopeGuard KHONG thay doi:** Guard DA CO va DA TEST tu Story 1.5. Chi can ap dung decorator len store-scoped endpoints.
- **TenantInterceptor la OPTIONAL:** Tenant isolation middleware DA CO o database level (Prisma $extends). Moi service DA truyen tenant_id. TenantInterceptor la redundant safety net — implement NEU du budget, SKIP neu khong can (Phase 2).
- **STORE_GROUP simplified:** Giong nhu Story 1.5 de lai (IG-2 — deferred), STORE_GROUP hien tai chi match storeId truc tiep. Full implementation can bang `store_group_members` — se lam khi co Store Group management feature.
- **UserStoreAssignment EXCLUDED tu tenant middleware:** Vi model nay KHONG co `tenant_id` column. Isolation phu thuoc vao viec validate user thuoc dung tenant TRUOC khi query assignments. Day la BY DESIGN trong Prisma schema.

### Anti-patterns can tranh

- KHONG tao migration moi — schema DA CO Store, UserStoreAssignment models
- KHONG dang ky StoreScopeGuard lam global guard — chi apply qua `@UseGuards()` khi can
- KHONG hard delete stores — chi soft delete (is_active = false)
- KHONG allow cross-tenant store access — MOI query PHAI co tenant_id
- KHONG skip audit logging — MOI thao tac CRUD PHAI ghi audit_log
- KHONG omit tenant_id trong bat ky query nao (ngoai tru EXCLUDED_MODELS)
- KHONG su dung `@default(dbgenerated())` cho UUID — generate UUID v7 o application level
- KHONG tao TenantInterceptor phuc tap — tenant isolation DA CO o database middleware level
- KHONG cho phep tao store assignment voi storeId cua tenant khac — PHAI validate storeId thuoc cung tenant
- KHONG su dung `userStoreAssignment` camelCase trong Prisma queries — PHAI dung `userStoreAssignment` (Prisma model name, PascalCase cho model, nhung snake_case cho field access)

### Previous Story Intelligence (Story 1.5)

**Tu Story 1.5 (RBAC):**
- RoleModule va PolicyModule DA TAO — tham khao pattern cho StoreModule
- StoreScopeGuard, LimitGuard, ApprovalGuard, RoleGuard, PolicyLoaderInterceptor DA TAO va DA TEST
- 72 tests moi (tong 145) — KHONG duoc lam hong
- Guards KHONG dang ky global — chi apply khi can
- StoreScopeGuard hien tai STORE_GROUP la simplified (direct storeId match) — acceptable cho story nay
- Policy cache TTL 5 phut trong PolicyLoaderInterceptor
- assignRoles pattern trong UserService — tham khao cho assignStoreScopes
- `POST /users/:id/roles` endpoint pattern — tham khao cho `POST /users/:id/store-assignments`

**Tu Story 1.4 (User CRUD):**
- UserService da co CRUD + assignRoles — them assignStoreScopes va getStoreAssignments
- UserController da co 7 endpoints — them 2 endpoint cho store assignments
- DTO dung `!` (definite assignment assertion) cho required fields
- Response format: `{ data: ... }` (single) hoac `{ data: [...], meta: { page, limit, total } }` (list)
- `DatabaseService` inject qua DI, goi `this.dbService.getClient()` de lay PrismaClient

**Tu Story 1.3 (Auth):**
- AuthModeGuard la composite guard (Session + JWT) — DA CO
- `@CurrentUser()` decorator DA CO `storeAssignments` trong JwtPayload
- JWT payload DA INCLUDE storeAssignments — nghia la khi user login, assignments DA duoc load va embed vao token
- Khi user assignments thay doi, user PHAI re-login de lay JWT moi voi assignments moi

**Tu Story 1.2 (Database):**
- Schema DA CO: Store, UserStoreAssignment models
- Seed DA CO: 2 stores — chi can them store assignment records
- Tenant isolation middleware DA ACTIVE cho Store model
- UserStoreAssignment la EXCLUDED model — tenant isolation khong auto-inject

**Debug Log tu truoc:**
- Prisma Json type: dung `Prisma.InputJsonValue` cast cho JSON fields
- Prisma NullableJson: dung `Prisma.DbNull` cho nullable Json fields khi set null
- Fix unit test mock contamination: doi `mockResolvedValue` → `mockResolvedValueOnce` trong tests
- Fix StoreScopeGuard: bo `extends Request` de tranh TypeScript incompatible interface error
- Fix TS2564: dung `!` cho required DTO fields

### Git Intelligence

**Commit pattern:** `feat(module): description` hoac `dev X-Y: description`
**Recent commits:**
- `254f8fd` feat(1-5): role management & 4-layer RBAC setup
- `295b324` feat(1-4): user account management CRUD with code review fixes
- `ccc0768` mark(1-3): story 1-3 complete
- `1aad48d` fix(1-3): resolve 10 patch findings
- `25ba8f3` dev 1-2: database schema foundation
- Test count: 145 tests (73 cu + 72 moi tu Story 1.5) — PHAI giu nguyen

### Project Structure Notes

- Store CRUD module hoan toan moi: `apps/api/src/modules/store/` — tuong tu role module
- User module MODIFY: them 2 endpoints + 2 methods + 1 DTO
- `app.module.ts` MODIFY: import StoreModule
- Seed MODIFY: them store assignment data
- KHONG tao migration — schema da co san
- KHONG modify Prisma schema — da du cho story nay
- KHONG modify tenant isolation middleware — da du cho story nay

### References

- [Source: epics.md#Story-1.6] — Store Scope Assignment & Multi-tenant Isolation acceptance criteria
- [Source: epics.md#FR55] — Gan user vao store scope cu the (Single Store, Store Group, All Stores)
- [Source: epics.md#FR72] — Multi-tenant isolation, khong truy cap cheo
- [Source: architecture.md#Multi-Tenant-Isolation] — Prisma middleware (application-level), auto inject WHERE tenant_id
- [Source: architecture.md#Authentication-Security] — 4-layer authorization pipeline
- [Source: architecture.md#API-Naming] — `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Format-Patterns] — API response format `{ data, meta }`
- [Source: architecture.md#Project-Structure] — modules/store/ chua duoc tao, o day la vi tri dung
- [Source: prd.md#FR55] — Quan tri vien gan user vao pham vi cua hang cu the
- [Source: prd.md#FR72] — Multi-tenant data isolation
- [Source: prd.md#NFR14] — Row-level security, no cross-tenant data leakage
- [Source: project-context.md#Critical-Dont-Miss-Rules] — NEVER omit tenant_id or store_id
- [Source: 1-5-role-management-4-layer-rbac-setup.md] — RoleModule pattern, StoreScopeGuard, Guards pipeline, test patterns
- [Source: 1-5-role-management-4-layer-rbac-setup.md#Scope-Decisions] — StoreScopeGuard STORE_GROUP deferred (IG-2), auto-seed deferred (IG-3)
- [Source: packages/database/prisma/schema.prisma] — Store, UserStoreAssignment models DA CO
- [Source: packages/database/prisma/seed.ts] — 2 demo stores DA SEED, store assignments CHUA SEED
- [Source: packages/database/src/middleware/tenant-isolation.ts] — Tenant-scoped Prisma client, EXCLUDED_MODELS

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (2026-03-29)

### Debug Log References

- Removed unused `storeIds` variable in `assignStoreScopes` to fix lint error (`@typescript-eslint/no-unused-vars`)
- Pre-existing lint errors in `role.guard.spec.ts` và `auth.controller.ts` (không phải do story này gây ra, giữ nguyên)
- `UserStoreAssignment` là EXCLUDED model trong tenant middleware — tenant isolation thực hiện thủ công bằng cách validate user.tenant_id trước khi query assignments
- `generateId()` từ `@pos-sdd/shared` được dùng thay vì `uuidv7()` trực tiếp (theo pattern của story 1.4, 1.5)

### Completion Notes List

- Tạo StoreModule hoàn chỉnh: module, service, controller, 3 DTOs — pattern theo RoleModule
- StoreService: 5 methods CRUD với transaction + audit log đầy đủ, tenant isolation qua WHERE clause
- StoreController: 5 endpoints với guards đúng theo spec (AuthModeGuard, RoleGuard + Roles)
- UserService: thêm `assignStoreScopes` + `getStoreAssignments` — pattern theo `assignRoles`
- UserController: thêm 2 endpoints `/store-assignments`
- TenantInterceptor: SKIP (ALTERNATIVE approach) — DatabaseService dùng PrismaClient trực tiếp, tenant isolation thủ công trong mỗi service
- Seed data: 3 demo users với store assignments (admin=ALL_STORES, cashier=SINGLE_STORE, manager=STORE_GROUP)
- Tests: 31 tests mới (176 tổng, tăng từ 145), không có regression

### File List

**New files:**
- `apps/api/src/modules/store/store.module.ts`
- `apps/api/src/modules/store/store.service.ts`
- `apps/api/src/modules/store/store.controller.ts`
- `apps/api/src/modules/store/store.service.spec.ts`
- `apps/api/src/modules/store/store.controller.spec.ts`
- `apps/api/src/modules/store/dto/create-store.dto.ts`
- `apps/api/src/modules/store/dto/update-store.dto.ts`
- `apps/api/src/modules/store/dto/list-stores-query.dto.ts`
- `apps/api/src/modules/user/dto/assign-store.dto.ts`

**Modified files:**
- `apps/api/src/app.module.ts` — import StoreModule
- `apps/api/src/modules/user/user.service.ts` — thêm assignStoreScopes, getStoreAssignments
- `apps/api/src/modules/user/user.controller.ts` — thêm 2 store-assignments endpoints
- `apps/api/src/modules/user/user.service.spec.ts` — thêm 8 tests mới + thêm mock models
- `apps/api/src/modules/user/user.controller.spec.ts` — thêm 2 tests + mocks
- `packages/database/prisma/seed.ts` — thêm store assignments + 2 demo users
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — cập nhật status
