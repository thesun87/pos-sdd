# Story 1.5: Role Management & 4-Layer RBAC Setup

Status: done

## Story

As a **quan tri vien he thong**,
I want **he thong co 6 vai tro mac dinh va model phan quyen 4 lop (RBAC → Store Scope → Limit Rules → Approval Override)**,
so that **moi hanh dong duoc kiem soat chat che theo vai tro, pham vi cua hang va nguong gioi han** (FR53, FR54).

## Acceptance Criteria

1. **Given** he thong moi duoc khoi tao
   **When** tenant duoc tao
   **Then** 6 vai tro mac dinh (Cashier, Kitchen, Shift Lead, Store Manager, Chain Owner, System Admin) duoc seed vao database voi permissions mac dinh
   **And** roles co `is_system = true`, khong the xoa hoac doi ten

2. **Given** NestJS API nhan request
   **When** request di qua Guards Pipeline
   **Then** thu tu kiem tra: AuthGuard → PolicyLoaderInterceptor → RoleGuard → StoreScopeGuard → LimitGuard → ApprovalGuard (NFR12)
   **And** Policy Service doc rules tu bang `policies` (DB-driven)

3. **Given** Chain Owner muon tao custom role
   **When** tao role moi voi permissions tuy chinh
   **Then** role duoc luu vao database voi `is_system = false`, co the gan cho users trong tenant
   **And** validation: role name unique trong tenant, permissions la JSON hop le

4. **Given** quan tri vien muon quan ly roles
   **When** goi CRUD endpoints cho roles
   **Then** `GET /api/v1/roles` tra ve danh sach roles cua tenant (co pagination)
   **And** `GET /api/v1/roles/:id` tra ve role detail voi permissions va policies
   **And** `POST /api/v1/roles` tao custom role (chi Chain Owner, System Admin)
   **And** `PATCH /api/v1/roles/:id` cap nhat custom role (KHONG cho sua system roles)
   **And** `DELETE /api/v1/roles/:id` xoa custom role (KHONG cho xoa system roles, KHONG xoa neu co users dang gan)

5. **Given** quan tri vien muon quan ly policies (limit rules)
   **When** goi CRUD endpoints cho policies
   **Then** `GET /api/v1/policies` tra ve danh sach policies cua tenant (filter by role, action, resource)
   **And** `POST /api/v1/policies` tao policy moi
   **And** `PATCH /api/v1/policies/:id` cap nhat policy
   **And** `DELETE /api/v1/policies/:id` xoa policy

6. **Given** quan tri vien muon gan/go roles cho user
   **When** goi `POST /api/v1/users/:id/roles` voi `{ roleIds: [...] }`
   **Then** roles cua user duoc cap nhat (replace tat ca roles hien tai)
   **And** audit log ghi nhan thay doi roles voi old_roles va new_roles
   **And** neu user dang co active session, JWT payload KHONG tu dong cap nhat (user can re-login)

7. **Given** request co `@Roles('store_manager', 'chain_owner')` decorator
   **When** RoleGuard kiem tra
   **Then** cho phep neu user co it nhat 1 role trong danh sach
   **And** tra ve 403 Forbidden neu khong co role phu hop

8. **Given** request co `@CheckPolicy({ action: 'discount', resource: 'order' })` decorator
   **When** LimitGuard kiem tra voi amount = 25%
   **Then** tra ve policy limit tuong ung (vd: Shift Lead = 20%, Store Manager = 30%)
   **And** neu vuot limit, tra ve 403 voi thong tin can approval override

## Tasks / Subtasks

- [x] Task 1: Tao RoleModule structure (AC: #3, #4)
  - [x] Tao `apps/api/src/modules/role/role.module.ts`
  - [x] Tao `apps/api/src/modules/role/role.service.ts`
  - [x] Tao `apps/api/src/modules/role/role.controller.ts`
  - [x] Tao DTOs: `create-role.dto.ts`, `update-role.dto.ts`, `list-roles-query.dto.ts`
  - [x] Import RoleModule vao `app.module.ts`

- [x] Task 2: Implement RoleService CRUD (AC: #1, #3, #4)
  - [x] `listRoles(tenantId, query)`:
    1. Build where: `{ tenant_id, AND: filters }` — filter by `isSystem`, `search` (ILIKE name)
    2. Include: `_count: { select: { user_roles: true } }` de biet so users per role
    3. Pagination: `{ data: roles, meta: { page, limit, total } }`
  - [x] `getRoleById(roleId, tenantId)`:
    1. Query role voi `include: { user_roles: { include: { user: { select: { id, name, email } } } } }`
    2. Query policies cua role: `prisma.policy.findMany({ where: { tenant_id, role: role.name } })`
    3. Tra ve role voi users count va policies
  - [x] `createRole(tenantId, dto)`:
    1. Validate role name unique trong tenant: `prisma.role.findFirst({ where: { tenant_id, name } })`
    2. Tao role: `prisma.role.create({ data: { id: uuidv7(), tenant_id, name, description, is_system: false, permissions: dto.permissions || {} } })`
    3. Ghi audit log: `CREATE`, resource: `role`
    4. Tra ve role moi
  - [x] `updateRole(roleId, tenantId, dto)`:
    1. Tim role theo id + tenant_id
    2. KHONG cho update system roles (`is_system = true`) — throw ForbiddenException
    3. Validate name unique (neu doi name)
    4. Update role, ghi audit log voi old_data va new_data
  - [x] `deleteRole(roleId, tenantId)`:
    1. Tim role theo id + tenant_id
    2. KHONG cho xoa system roles — throw ForbiddenException
    3. Kiem tra user_roles count: neu > 0 → throw ConflictException ("Role dang duoc gan cho users")
    4. Delete role, ghi audit log: `DELETE`, resource: `role`

- [x] Task 3: Implement PolicyService CRUD (AC: #5)
  - [x] Tao `apps/api/src/modules/policy/policy.module.ts`
  - [x] Tao `apps/api/src/modules/policy/policy.service.ts`
  - [x] Tao `apps/api/src/modules/policy/policy.controller.ts`
  - [x] Tao DTOs: `create-policy.dto.ts`, `update-policy.dto.ts`, `list-policies-query.dto.ts`
  - [x] Import PolicyModule vao `app.module.ts`
  - [x] `listPolicies(tenantId, query)`:
    1. Filter by: role, action, resource, storeId, isActive
    2. Pagination: `{ data: policies, meta: { page, limit, total } }`
  - [x] `createPolicy(tenantId, dto)`:
    1. Validate role name exists trong tenant
    2. Validate unique constraint: `[tenant_id, role, action, resource, store_id]`
    3. Tao policy voi `is_active = true`
    4. Ghi audit log: `CREATE`, resource: `policy`
  - [x] `updatePolicy(policyId, tenantId, dto)`:
    1. Tim policy theo id + tenant_id
    2. Update fields (limit, override_role, conditions, is_active)
    3. Ghi audit log voi old_data va new_data
  - [x] `deletePolicy(policyId, tenantId)`:
    1. Tim policy theo id + tenant_id
    2. Delete, ghi audit log: `DELETE`, resource: `policy`

- [x] Task 4: Implement User Role Assignment endpoint (AC: #6)
  - [x] Them endpoint `POST /api/v1/users/:id/roles` trong UserController
  - [x] Tao `assign-roles.dto.ts`: `{ roleIds: string[] }` — array of UUID, min 1 item
  - [x] Implement `assignRoles(userId, tenantId, adminUserId, roleIds)` trong UserService:
    1. Validate user ton tai va cung tenant
    2. Validate tat ca roleIds ton tai va cung tenant
    3. Transaction: delete tat ca user_roles cu → createMany user_roles moi
    4. Ghi audit log: `UPDATE`, resource: `user_role`, metadata: `{ old_roles, new_roles }`
  - [x] Tra ve: `{ data: { userId, roles: [...] } }`

- [x] Task 5: Tao @Roles() decorator va RoleGuard (AC: #7)
  - [x] Tao `apps/api/src/common/decorators/roles.decorator.ts`:
    ```typescript
    export const ROLES_KEY = 'roles';
    export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
    ```
  - [x] Tao `apps/api/src/common/guards/role.guard.ts`:
    1. Read roles metadata tu `Reflector`
    2. Neu KHONG co @Roles() decorator → cho qua (public endpoint)
    3. Lay user.roles tu request (da set boi AuthModeGuard)
    4. Kiem tra user co it nhat 1 role match → cho qua
    5. Khong match → throw ForbiddenException("Insufficient role permissions")
  - [x] Unit tests cho RoleGuard: happy path, forbidden, no decorator (passthrough)

- [x] Task 6: Tao PolicyLoaderInterceptor (AC: #2)
  - [x] Tao `apps/api/src/common/interceptors/policy-loader.interceptor.ts`:
    1. Load ALL policies cua user's tenant + roles 1 lan
    2. Query: `prisma.policy.findMany({ where: { tenant_id, role: { in: user.roles }, is_active: true } })`
    3. Gan policies vao `request.policies` (co the truy cap trong guards sau)
    4. Caching: dung in-memory Map<tenantId-roles, policies> voi TTL 5 phut (tuong lai chuyen Redis)
  - [x] Unit tests cho PolicyLoaderInterceptor

- [x] Task 7: Tao @CheckPolicy() decorator va LimitGuard (AC: #8)
  - [x] Tao `apps/api/src/common/decorators/check-policy.decorator.ts`:
    ```typescript
    export interface PolicyCheck {
      action: string;   // 'discount', 'void', 'refund', 'cancel', 'edit_price'
      resource: string; // 'order', 'order_item', 'payment'
    }
    export const CHECK_POLICY_KEY = 'check_policy';
    export const CheckPolicy = (check: PolicyCheck) => SetMetadata(CHECK_POLICY_KEY, check);
    ```
  - [x] Tao `apps/api/src/common/guards/limit.guard.ts`:
    1. Read policy check metadata tu Reflector
    2. Neu KHONG co @CheckPolicy() → cho qua
    3. Doc policies tu `request.policies` (da load boi PolicyLoaderInterceptor)
    4. Tim policy matching: `{ action, resource }` cho user's roles
    5. Kiem tra limit:
       - Neu `limit = null` → unlimited, cho qua
       - Neu request body co `amount`/`percentage` → so sanh voi policy.limit
       - Neu trong limit → cho qua
       - Neu vuot limit → tra ve 403 voi `{ needsApproval: true, currentLimit, requiredOverrideRole: policy.override_role }`
  - [x] Unit tests cho LimitGuard: within limit, exceeds limit, no policy (deny by default), unlimited

- [x] Task 8: Tao StoreScopeGuard (AC: #2)
  - [x] Tao `apps/api/src/common/guards/store-scope.guard.ts`:
    1. Doc `storeId` tu request params, query, hoac body
    2. Doc `user.storeAssignments` tu request
    3. Kiem tra:
       - `ALL_STORES` → cho qua moi store
       - `STORE_GROUP` → kiem tra storeId nam trong group
       - `SINGLE_STORE` → kiem tra storeId chinh xac match
    4. Neu khong match → throw ForbiddenException("Store access denied")
    5. Neu request KHONG co storeId (tenant-level operations) → cho qua (StoreScopeGuard chi apply cho store-scoped resources)
  - [x] Unit tests cho StoreScopeGuard

- [x] Task 9: Tao ApprovalGuard skeleton (AC: #2)
  - [x] Tao `apps/api/src/common/guards/approval.guard.ts`:
    1. Skeleton implementation — doc approval token tu request header `X-Approval-Token`
    2. Neu KHONG co token va action khong can approval → cho qua
    3. Neu can approval (flagged boi LimitGuard) va co token → validate token (JWT, verify approver role)
    4. Ghi audit log cho approval: requester, approver, action, amount
    5. **NOTE:** Day la skeleton — full approval flow (PIN input UI, approval token generation) se implement o Epic rieng (Payment/Order epics)
  - [x] Unit tests co ban cho ApprovalGuard

- [x] Task 10: Viet Unit Tests day du (AC: #1-#8)
  - [x] `role.service.spec.ts`:
    - listRoles: pagination, filter by isSystem, search
    - getRoleById: happy path, not found, cross-tenant
    - createRole: happy path, duplicate name, permissions validation
    - updateRole: happy path, system role blocked, name conflict
    - deleteRole: happy path, system role blocked, role in use blocked
  - [x] `role.controller.spec.ts`:
    - Verify guards (AuthModeGuard), response format
  - [x] `policy.service.spec.ts`:
    - CRUD operations, validation, audit logging
  - [x] `policy.controller.spec.ts`:
    - Verify guards, response format
  - [x] `user role assignment`:
    - assignRoles: happy path, invalid roles, cross-tenant, audit log

- [x] Task 11: Verify build va type-check (AC: all)
  - [x] `pnpm turbo build` — PASS
  - [x] `pnpm turbo type-check` — PASS
  - [x] `pnpm turbo test` — PASS (145 tests: 73 cu + 72 moi)

## Dev Notes

### Thong tin ky thuat quan trong

**Cong nghe & Phien ban (PHAI tuan thu):**
- NestJS 11: SWC compiler, Vitest, class-validator cho DTOs
- Prisma 7.x: snake_case field names trong TypeScript khi co `@map()` — `tenant_id`, `is_system`, `is_active`, `user_roles`, `override_role`
- UUID v7: `uuidv7()` tu package `uuidv7` — dung cho tat ca primary keys
- `bcryptjs`: salt rounds = 10 (da co pattern)

**CRITICAL: 4-Layer Authorization Pipeline**
```
Request
   │
AuthGuard (verify JWT/session) — DA CO tu Story 1.3
   │
PolicyLoaderInterceptor ← Load ALL policies 1 lan, gan vao request.policies — TASK 6
   │
RoleGuard ← doc roles tu request.user.roles — TASK 5
   │
StoreScopeGuard ← doc storeAssignments tu request.user — TASK 8
   │
LimitGuard ← doc policies tu request.policies — TASK 7
   │
ApprovalGuard ← skeleton, full flow trong epic sau — TASK 9
   │
Controller
```

**CRITICAL: Guards KHONG dang ky global** — chi apply qua `@UseGuards()` tren controller/method level. AuthModeGuard van la guard duy nhat duoc apply rong rai. RoleGuard, LimitGuard, StoreScopeGuard, ApprovalGuard chi apply khi co decorator tuong ung (`@Roles()`, `@CheckPolicy()`).

**CRITICAL: Tenant Isolation**
- MOI query Prisma PHAI co `tenant_id` trong WHERE clause
- Tenant isolation middleware DA CO — nhung van PHAI explicit kiem tra trong service layer
- KHONG BAO GIO cho phep truy cap roles/policies cua tenant khac

**CRITICAL: System Roles Protection**
- 6 system roles (`is_system = true`) KHONG duoc xoa, doi ten, hoac modify permissions
- Custom roles (`is_system = false`) co the CRUD tu do
- Seed data DA CO 6 roles + 5 policies mac dinh trong `packages/database/prisma/seed.ts`

**Policy Table Schema (DA CO trong Prisma):**
```
policy {
  id            String    @id @db.Uuid
  tenant_id     String    @db.Uuid
  store_id      String?   @db.Uuid    // null = apply cho tat ca stores
  role          String                  // role name (cashier, shift_lead, etc.)
  action        String                  // discount, void, refund, cancel, edit_price
  resource      String                  // order, order_item, payment
  limit         Decimal?                // 20 (%), 500000 (VND), null = unlimited
  override_role String?                 // role co quyen override
  conditions    Json?                   // complex rules (future)
  is_active     Boolean   @default(true)
}
// Index: [tenant_id, role, action, resource]
```

**Default Policies (DA SEED):**
| Role | Action | Resource | Limit | Override |
|------|--------|----------|-------|----------|
| cashier | discount | order | 10% | shift_lead |
| cashier | void | order_item | 50,000 | shift_lead |
| shift_lead | discount | order | 20% | store_manager |
| shift_lead | void | order_item | 200,000 | store_manager |
| store_manager | refund | order | 500,000 | chain_owner |

**API Response Format (BAT BUOC):**
```json
// Single item
{ "data": { "id": "...", "name": "cashier", "description": "...", "isSystem": true, "permissions": {...}, "usersCount": 5 } }

// List with pagination
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 6 } }
```

**Audit Log Pattern (tu Story 1.3, 1.4):**
```typescript
await this.prisma.auditLog.create({
  data: {
    id: uuidv7(),
    tenant_id: tenantId,
    user_id: adminUserId,
    action: 'CREATE', // hoac 'UPDATE', 'DELETE'
    resource: 'role',  // hoac 'policy', 'user_role'
    resource_id: targetId,
    new_data: { name, permissions },
    old_data: previousData, // chi cho UPDATE
    ip_address: req.ip,
    metadata: {} // optional
  }
});
```

### Cau truc thu muc can tao

```
apps/api/src/modules/role/
├── dto/
│   ├── create-role.dto.ts          # NEW
│   ├── update-role.dto.ts          # NEW
│   └── list-roles-query.dto.ts     # NEW
├── role.controller.ts               # NEW
├── role.service.ts                  # NEW
├── role.service.spec.ts             # NEW
├── role.controller.spec.ts          # NEW
├── role.module.ts                   # NEW

apps/api/src/modules/policy/
├── dto/
│   ├── create-policy.dto.ts        # NEW
│   ├── update-policy.dto.ts        # NEW
│   └── list-policies-query.dto.ts  # NEW
├── policy.controller.ts             # NEW
├── policy.service.ts                # NEW
├── policy.service.spec.ts           # NEW
├── policy.controller.spec.ts        # NEW
├── policy.module.ts                 # NEW

apps/api/src/modules/user/
├── dto/
│   └── assign-roles.dto.ts         # NEW
├── user.controller.ts               # MODIFY — them POST /:id/roles endpoint
├── user.service.ts                  # MODIFY — them assignRoles method

apps/api/src/common/guards/
├── role.guard.ts                    # NEW
├── store-scope.guard.ts             # NEW
├── limit.guard.ts                   # NEW
├── approval.guard.ts                # NEW
├── role.guard.spec.ts               # NEW
├── store-scope.guard.spec.ts        # NEW
├── limit.guard.spec.ts              # NEW
├── approval.guard.spec.ts           # NEW

apps/api/src/common/decorators/
├── roles.decorator.ts               # NEW
├── check-policy.decorator.ts        # NEW

apps/api/src/common/interceptors/
├── policy-loader.interceptor.ts     # NEW
├── policy-loader.interceptor.spec.ts # NEW

apps/api/src/
├── app.module.ts                    # MODIFY — import RoleModule, PolicyModule
```

### Existing Code de Reuse — KHONG Reinvent

| Can gi | Da co o dau | Cach dung |
|--------|-------------|-----------|
| AuthModeGuard | `apps/api/src/common/guards/auth-mode.guard.ts` | `@UseGuards(AuthModeGuard)` — da handle JWT + Session |
| @CurrentUser() | `apps/api/src/common/decorators/current-user.decorator.ts` | Extract `tenantId`, `userId`, `roles`, `storeAssignments` |
| JwtPayload type | `apps/api/src/common/types/jwt-payload.ts` | Interface: `{ userId, tenantId, roles: string[], storeAssignments }` |
| DatabaseService | `apps/api/src/modules/database/` | Inject via constructor DI, `this.dbService.getClient()` |
| uuidv7() | `uuidv7` package | `import { uuidv7 } from 'uuidv7'` |
| UserService | `apps/api/src/modules/user/user.service.ts` | DA CO createUser, listUsers, getUserById — chi THEM assignRoles |
| UserController | `apps/api/src/modules/user/user.controller.ts` | DA CO CRUD endpoints — chi THEM POST /:id/roles |
| Seed roles | `packages/database/prisma/seed.ts` | 6 system roles DA SEED — KHONG tao lai |
| Seed policies | `packages/database/prisma/seed.ts` | 5 default policies DA SEED — KHONG tao lai |
| Policy model | `packages/database/prisma/schema.prisma` | DA CO — chi can query/create records |
| Role model | `packages/database/prisma/schema.prisma` | DA CO — chi can query/create records |
| Prisma tenant middleware | `packages/database/src/middleware/tenant-isolation.ts` | Auto-inject tenant_id — Policy model duoc bao gom |

### NestJS Module Pattern (theo Story 1.4)

```typescript
// role.module.ts
import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService], // export de PolicyModule co the inject neu can
})
export class RoleModule {}
```

DatabaseService da la `@Global()` module — KHONG can import DatabaseModule.

### Controller Pattern (theo user.controller.ts)

```typescript
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listRoles(@Query() query: ListRolesQueryDto, @CurrentUser() user: JwtPayload) {
    return this.roleService.listRoles(user.tenantId, query);
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  async createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    const result = await this.roleService.createRole(user.tenantId, dto);
    return { data: result };
  }
}
```

**Luu y:** Global prefix `/api/v1` da cau hinh trong `main.ts` — controller chi can `@Controller('roles')` → URL = `/api/v1/roles`

### DTO Validation Pattern (theo Story 1.4 DTOs)

```typescript
import { IsString, MinLength, IsOptional, IsObject } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, unknown>;
}
```

**Luu y quan trong:** Dung `!` (definite assignment assertion) cho required fields — da fix tu Story 1.4 (loi TS2564).

### Prisma Query Patterns (tu Story 1.4)

**Prisma 7.x:** Field names theo DB column names (snake_case):
- `tenant_id` (KHONG phai `tenantId`)
- `is_system` (KHONG phai `isSystem`)
- `is_active` (KHONG phai `isActive`)
- `user_roles` (KHONG phai `userRoles`)
- `override_role` (KHONG phai `overrideRole`)
- `store_id` (KHONG phai `storeId`)

```typescript
// Query role voi user count
const roles = await this.prisma.role.findMany({
  where: { tenant_id: tenantId },
  include: { _count: { select: { user_roles: true } } },
});

// Query policies cho role
const policies = await this.prisma.policy.findMany({
  where: { tenant_id: tenantId, role: roleName, is_active: true },
});
```

### Test Pattern (theo Story 1.4)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPrisma = {
  role: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  policy: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  userRole: { createMany: vi.fn(), deleteMany: vi.fn(), count: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

const mockDbService = { getClient: vi.fn().mockReturnValue(mockPrisma) };
```

### Guard Testing Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Mock ExecutionContext
const createMockContext = (user: JwtPayload, metadata?: any): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => ({ user, policies: [...] }),
  }),
  getHandler: () => ({}),
  getClass: () => ({}),
}) as unknown as ExecutionContext;

// Mock Reflector
const mockReflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
```

### Scope Decisions

- **RoleGuard KHONG global:** Chi apply khi co `@Roles()` decorator. Endpoints khong co `@Roles()` chi can AuthModeGuard la du.
- **PolicyLoaderInterceptor:** Load policies 1 lan per request, gan vao `request.policies`. Guards sau doc tu day, KHONG query DB rieng.
- **ApprovalGuard la skeleton (IG-1 — deferred):** LimitGuard hien tai throw ForbiddenException khi vuot limit, nen request khong bao gio den ApprovalGuard. Handoff mechanism (LimitGuard set `request.needsApproval` flag thay vi throw) se implement cung voi full approval flow trong Payment/Order epics. ApprovalGuard hien tai luon pass through.
- **StoreScopeGuard STORE_GROUP (IG-2 — deferred):** STORE_GROUP check hien tai la simplified (storeId direct match). Full implementation can query bang `store_group_members` — se lam khi co Store Group management feature (Story 1.6 hoac sau).
- **Auto-seed 6 default roles khi tao tenant moi (IG-3 — deferred):** AC1 yeu cau 6 system roles duoc seed khi tenant duoc tao. Hien tai chi co manual seed script cho demo tenant. Can implement event/hook tu dong khi tao tenant moi — se xu ly trong Story sau khi co Tenant Management feature. Ghi nhan de KHONG quen implement.
- **StoreScopeGuard:** Chi apply cho store-scoped resources. Tenant-level operations (role CRUD, policy CRUD) KHONG can StoreScopeGuard vi roles/policies la tenant-wide.
- **Role assignment tach biet:** `POST /api/v1/users/:id/roles` la endpoint rieng, KHONG ghep vao UpdateUserDto. Day la thiet ke co chu y tu Story 1.4.
- **Policy uniqueness:** Unique constraint tren `[tenant_id, role, action, resource, store_id]` — 1 role chi co 1 policy cho 1 action tren 1 resource tai 1 store.

### Anti-patterns can tranh

- KHONG dang ky RoleGuard/LimitGuard/StoreScopeGuard lam global guards — chi apply qua `@UseGuards()` khi can
- KHONG tao migration moi — schema da co Role, Policy, UserRole models
- KHONG implement full approval flow (PIN UI, approval token gen) — chi skeleton guard
- KHONG hardcode role names trong guards — doc tu decorator metadata va DB
- KHONG cache policies vinh vien — TTL 5 phut (hoac invalidate khi policy thay doi)
- KHONG cho phep sua/xoa system roles (is_system = true)
- KHONG cho phep xoa role dang co users — kiem tra user_roles count truoc
- KHONG tra ve sensitive data trong role/policy responses
- KHONG tao duplicate policies (same tenant + role + action + resource + store)
- KHONG skip audit logging — MOI thao tac CRUD PHAI ghi audit_log
- KHONG omit `tenant_id` trong bat ky query nao
- KHONG su dung `@default(dbgenerated())` cho UUID — generate UUID v7 o application level

### Previous Story Intelligence (Story 1.4)

**Tu Story 1.4 (User CRUD):**
- UserService da co `createUser()` nhan `roleIds` param va validate roles — pattern de theo cho assignRoles
- UserController da co 6 endpoints — them 1 endpoint `POST /:id/roles` cho role assignment
- 73 tests pass (36 user + 37 auth) — KHONG duoc lam hong
- DTO dung `!` (definite assignment assertion) cho required fields — fix loi TS2564
- Response format: `{ data: ... }` (single) hoac `{ data: [...], meta: { page, limit, total } }` (list)
- Audit log pattern da established — reuse cho role/policy CRUD
- `DatabaseService` inject qua DI, goi `this.dbService.getClient()` de lay PrismaClient

**Tu Story 1.3 (Auth):**
- AuthModeGuard la composite guard (Session + JWT) — DA CO va hoat dong
- `@CurrentUser()` decorator tra ve `JwtPayload` — co `roles: string[]` va `storeAssignments`
- `resetPinForUser()` co role check pattern — tham khao de implement RoleGuard
- JWT payload DA CO roles va storeAssignments — guards co the doc truc tiep

**Tu Story 1.2 (Database):**
- Schema DA CO: Role, Policy, UserRole, UserStoreAssignment models
- Seed DA CO: 6 system roles + 5 default policies
- Tenant isolation middleware DA ACTIVE cho Policy model
- `StoreScopeType` enum: SINGLE_STORE, STORE_GROUP, ALL_STORES

### Git Intelligence

**Commit pattern:** `feat(module): description` hoac `dev X-Y: description`
**Recent commits:**
- `295b324` feat(1-4): user account management CRUD with code review fixes
- `ccc0768` mark(1-3): story 1-3 complete
- `1aad48d` fix(1-3): resolve 10 patch findings
- `25ba8f3` dev 1-2: database schema foundation
- Test count: 73 tests (36 user + 37 auth) — PHAI giu nguyen

### References

- [Source: epics.md#Story-1.5] — Role Management & 4-Layer RBAC acceptance criteria
- [Source: architecture.md#Authentication-Security] — 4-layer authorization pipeline: AuthGuard → PolicyLoader → RoleGuard → StoreScopeGuard → LimitGuard → ApprovalGuard
- [Source: architecture.md#Policy-Schema] — Policy table schema voi role, action, resource, limit, override
- [Source: architecture.md#NestJS-Module-Structure] — modules/policy/ trong project tree
- [Source: architecture.md#API-Naming] — `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Format-Patterns] — API response format `{ data, meta }`
- [Source: prd.md#FR53] — 6 default roles + custom roles
- [Source: prd.md#FR54] — 4-layer permission model
- [Source: prd.md#Layer-3-Limit-Rules] — Limit matrix: Cashier/Shift Lead/Store Manager/Chain Owner
- [Source: prd.md#Layer-4-Approval-Override] — Approval flow khi vuot limit
- [Source: project-context.md#Critical-Dont-Miss-Rules] — Multi-tenancy, authorization at API level
- [Source: 1-4-user-account-management-crud.md] — UserService patterns, DTO conventions, audit log format
- [Source: packages/database/prisma/seed.ts] — 6 system roles + 5 default policies DA SEED

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fix Prisma Json type: dùng `Prisma.InputJsonValue` cast cho `permissions` (role) và `conditions` (policy)
- Fix Prisma NullableJson: dùng `Prisma.DbNull` cho nullable Json fields khi set null
- Fix unit test mock contamination: đổi `mockResolvedValue` → `mockResolvedValueOnce` trong updateRole tests
- Fix StoreScopeGuard: bỏ `extends Request` để tránh TypeScript incompatible interface error

### Completion Notes List

- ✅ Task 1: RoleModule tạo đầy đủ (module, service, controller, 3 DTOs, import vào AppModule)
- ✅ Task 2: RoleService CRUD hoàn chỉnh: listRoles (pagination+filter), getRoleById (với policies), createRole, updateRole (block system roles), deleteRole (block system + in-use)
- ✅ Task 3: PolicyModule tạo đầy đủ (module, service, controller, 3 DTOs, import vào AppModule)
- ✅ Task 4: UserService.assignRoles() + POST /users/:id/roles endpoint, transaction-safe, audit log với old/new roles
- ✅ Task 5: @Roles() decorator + RoleGuard (passthrough khi không có decorator, ForbiddenException khi thiếu role)
- ✅ Task 6: PolicyLoaderInterceptor với in-memory cache TTL 5 phút
- ✅ Task 7: @CheckPolicy() decorator + LimitGuard (deny-by-default, unlimited khi limit=null, needsApproval response)
- ✅ Task 8: StoreScopeGuard (ALL_STORES/SINGLE_STORE/STORE_GROUP, passthrough khi không có storeId)
- ✅ Task 9: ApprovalGuard skeleton (JWT approval token validation, audit log)
- ✅ Task 10: 72 unit tests mới, tổng 145/145 pass (không regression)
- ✅ Task 11: type-check PASS, tests PASS

### File List

apps/api/src/modules/role/role.module.ts
apps/api/src/modules/role/role.service.ts
apps/api/src/modules/role/role.controller.ts
apps/api/src/modules/role/role.service.spec.ts
apps/api/src/modules/role/role.controller.spec.ts
apps/api/src/modules/role/dto/create-role.dto.ts
apps/api/src/modules/role/dto/update-role.dto.ts
apps/api/src/modules/role/dto/list-roles-query.dto.ts
apps/api/src/modules/policy/policy.module.ts
apps/api/src/modules/policy/policy.service.ts
apps/api/src/modules/policy/policy.controller.ts
apps/api/src/modules/policy/policy.service.spec.ts
apps/api/src/modules/policy/policy.controller.spec.ts
apps/api/src/modules/policy/dto/create-policy.dto.ts
apps/api/src/modules/policy/dto/update-policy.dto.ts
apps/api/src/modules/policy/dto/list-policies-query.dto.ts
apps/api/src/modules/user/dto/assign-roles.dto.ts
apps/api/src/modules/user/user.service.ts (MODIFIED - thêm assignRoles, userRole.deleteMany mock)
apps/api/src/modules/user/user.controller.ts (MODIFIED - thêm POST /:id/roles)
apps/api/src/modules/user/user.service.spec.ts (MODIFIED - thêm assignRoles tests, thêm userRole.deleteMany/findMany mocks)
apps/api/src/common/decorators/roles.decorator.ts
apps/api/src/common/decorators/check-policy.decorator.ts
apps/api/src/common/guards/role.guard.ts
apps/api/src/common/guards/role.guard.spec.ts
apps/api/src/common/guards/limit.guard.ts
apps/api/src/common/guards/limit.guard.spec.ts
apps/api/src/common/guards/store-scope.guard.ts
apps/api/src/common/guards/store-scope.guard.spec.ts
apps/api/src/common/guards/approval.guard.ts
apps/api/src/common/guards/approval.guard.spec.ts
apps/api/src/common/interceptors/policy-loader.interceptor.ts
apps/api/src/common/interceptors/policy-loader.interceptor.spec.ts
apps/api/src/app.module.ts (MODIFIED - import RoleModule, PolicyModule)
_bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED - status in-progress → review)
