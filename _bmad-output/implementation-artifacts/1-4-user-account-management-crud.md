# Story 1.4: User Account Management (CRUD)

Status: review

## Story

As a **quan tri vien he thong**,
I want **tao, chinh sua, vo hieu hoa, va dat lai ma PIN cho tai khoan nhan vien**,
so that **toi quan ly duoc doi ngu nhan vien tren he thong** (FR52).

## Acceptance Criteria

1. **Given** quan tri vien da dang nhap Management Portal
   **When** tao user moi voi thong tin (ten, email, PIN, vai tro)
   **Then** user duoc tao trong database voi `tenant_id` dung, PIN duoc hash bcrypt
   **And** validation: email unique trong tenant, PIN 4-6 chu so

2. **Given** user account ton tai
   **When** quan tri vien chinh sua thong tin user (ten, email)
   **Then** thong tin duoc cap nhat, audit log ghi nhan thay doi voi `old_data` va `new_data`

3. **Given** user account ton tai
   **When** quan tri vien vo hieu hoa (deactivate) user
   **Then** `is_active = false`, sessions hien tai bi thu hoi (xoa tat ca sessions), user khong the dang nhap nua
   **And** audit log ghi nhan `UPDATE` action voi `resource: 'user'`, metadata: `{ deactivated_by: adminUserId }`

4. **Given** nhan vien quen PIN
   **When** quan tri vien reset PIN
   **Then** PIN moi duoc set (hash bcrypt), PIN cu vo hieu ngay lap tuc
   **And** endpoint `POST /api/v1/auth/reset-pin` da co tu Story 1.3 — KHONG implement lai

5. **Given** quan tri vien truy cap danh sach users
   **When** goi `GET /api/v1/users` voi cac filter (search, role, is_active)
   **Then** tra ve danh sach users co pagination, format: `{ data: [...], meta: { page, limit, total } }`
   **And** chi tra ve users thuoc cung `tenant_id` (multi-tenant isolation)
   **Note** `search` la full-text ILIKE tren ca name va email (thay vi 2 filter rieng — UX tot hon)

6. **Given** quan tri vien xem chi tiet 1 user
   **When** goi `GET /api/v1/users/:id`
   **Then** tra ve user info kem roles va store_assignments
   **And** KHONG tra ve `pin_hash`, `password_hash` — chi tra ve `has_pin: boolean`

## Tasks / Subtasks

- [x] Task 1: Tao UserModule structure (AC: all)
  - [x] Tao `apps/api/src/modules/user/user.module.ts`
  - [x] Tao `apps/api/src/modules/user/user.service.ts`
  - [x] Tao `apps/api/src/modules/user/user.controller.ts`
  - [x] Import UserModule vao `app.module.ts`

- [x] Task 2: Tao DTOs voi Zod validation (AC: #1, #2, #5)
  - [x] `dto/create-user.dto.ts` — `{ email: string, name: string, pin?: string, roleIds: string[] }`
    - email: valid email format, required
    - name: min 2 chars, required
    - pin: optional, 4-6 so (regex: `/^\d{4,6}$/`)
    - roleIds: array of UUID v7, min 1 item
  - [x] `dto/update-user.dto.ts` — `{ name?: string, email?: string }`
    - Partial update, tat ca fields optional
    - KHONG cho phep update `pin_hash`, `password_hash`, `tenant_id`, `is_active` qua endpoint nay
  - [x] `dto/list-users-query.dto.ts` — `{ page?: number, limit?: number, search?: string, roleId?: string, isActive?: boolean }`
    - page: default 1, min 1, max 1000
    - limit: default 20, min 1, max 100
    - search: tim kiem ILIKE tren ca name va email (gop 1 field, max 100 chars) — thay vi tach rieng name/email filter
    - roleId: filter theo role
    - isActive: filter theo trang thai

- [x] Task 3: Implement UserService (AC: #1, #2, #3, #5, #6)
  - [x] `createUser(tenantId, dto)`:
    1. Validate email unique trong tenant: `prisma.user.findUnique({ where: { tenant_id_email: { tenant_id, email } } })`
    2. Validate roleIds ton tai va thuoc cung tenant: `prisma.role.findMany({ where: { id: { in: roleIds }, tenant_id } })`
    3. Tao user trong transaction:
       - `prisma.user.create({ data: { id: uuidv7(), tenant_id, email, name, pin_hash: pin ? await hashPin(pin) : null, is_active: true } })`
       - `prisma.userRole.createMany({ data: roleIds.map(rid => ({ id: uuidv7(), user_id, role_id: rid })) })`
    4. Ghi audit log: `CREATE`, resource: `user`, new_data chua user info (KHONG chua pin_hash)
    5. Tra ve user voi roles (exclude pin_hash, password_hash)
  - [x] `updateUser(userId, tenantId, dto)`:
    1. Tim user theo id + tenant_id (dam bao tenant isolation)
    2. Neu update email — validate email unique trong tenant
    3. Update user, ghi audit log voi old_data va new_data
    4. Tra ve updated user
  - [x] `deactivateUser(userId, tenantId, adminUserId)`:
    1. Tim user theo id + tenant_id
    2. KHONG cho deactivate chinh minh (userId !== adminUserId)
    3. Update `is_active = false`
    4. Xoa tat ca sessions cua user: `prisma.session.deleteMany({ where: { user_id: userId } })`
    5. Ghi audit log: `UPDATE`, resource: `user`, metadata: `{ deactivated_by: adminUserId }`
  - [x] `activateUser(userId, tenantId, adminUserId)`:
    1. Tim user theo id + tenant_id
    2. Update `is_active = true`
    3. Ghi audit log: `UPDATE`, resource: `user`, metadata: `{ activated_by: adminUserId }`
  - [x] `getUserById(userId, tenantId)`:
    1. Query user voi includes: `user_roles: { include: { role: true } }`, `store_assignments: { include: { store: true } }`
    2. Map response: exclude `pin_hash`, `password_hash`; them `hasPIN: !!user.pin_hash`
  - [x] `listUsers(tenantId, query)`:
    1. Build where clause: `{ tenant_id, AND: filters }`
    2. Search filter: `{ OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }`
    3. Role filter: `{ user_roles: { some: { role_id: roleId } } }`
    4. isActive filter: `{ is_active: isActive }`
    5. Pagination: `skip: (page - 1) * limit, take: limit`
    6. Count total: `prisma.user.count({ where })`
    7. Tra ve `{ data: users, meta: { page, limit, total } }`

- [x] Task 4: Implement UserController (AC: #1-#6)
  - [x] `POST /api/v1/users` — @UseGuards(AuthModeGuard), @CurrentUser()
    - Lay `tenantId` tu `request.user.tenantId` (tu JWT payload hoac session)
    - Validate DTO, goi `userService.createUser()`
    - Response: `{ data: user }` (201 Created)
  - [x] `GET /api/v1/users` — @UseGuards(AuthModeGuard)
    - Query params: page, limit, search, roleId, isActive
    - Response: `{ data: users, meta: { page, limit, total } }`
  - [x] `GET /api/v1/users/:id` — @UseGuards(AuthModeGuard)
    - Response: `{ data: user }` (voi roles va store_assignments)
  - [x] `PATCH /api/v1/users/:id` — @UseGuards(AuthModeGuard), @CurrentUser()
    - Validate DTO, goi `userService.updateUser()`
    - Response: `{ data: user }`
  - [x] `POST /api/v1/users/:id/deactivate` — @UseGuards(AuthModeGuard), @CurrentUser()
    - Goi `userService.deactivateUser()`
    - Response: `{ data: { success: true } }`
  - [x] `POST /api/v1/users/:id/activate` — @UseGuards(AuthModeGuard), @CurrentUser()
    - Goi `userService.activateUser()`
    - Response: `{ data: { success: true } }`

- [x] Task 5: Viet Unit Tests (AC: #1-#6)
  - [x] `user.service.spec.ts`:
    - createUser: happy path, duplicate email, invalid roles, PIN hash verified
    - updateUser: happy path, email conflict, user not found, cross-tenant blocked
    - deactivateUser: happy path, self-deactivation blocked, sessions cleared
    - activateUser: happy path
    - getUserById: happy path, cross-tenant returns null/error
    - listUsers: pagination, search filter, role filter, isActive filter, empty results
  - [x] `user.controller.spec.ts`:
    - Verify guards applied (AuthModeGuard)
    - Verify DTO validation
    - Verify response format

- [x] Task 6: Verify build va type-check (AC: all)
  - [x] `pnpm turbo build` — PASS
  - [x] `pnpm turbo type-check` — PASS
  - [x] `pnpm turbo test` — PASS (tat ca tests cu + moi)

## Dev Notes

### Thong tin ky thuat quan trong

**Cong nghe & Phien ban (PHAI tuan thu):**
- NestJS 11: SWC compiler, Vitest, body parser MAC DINH
- Prisma 7.x: snake_case field names trong TypeScript khi co `@map()`
- bcryptjs: salt rounds = 10 (da co pattern tu auth.service.ts)
- UUID v7: `uuidv7()` tu package `uuidv7` (da cai) — dung cho tat ca primary keys
- `hashPin()` tu `@pos-sdd/shared` — PHAI reuse, KHONG implement lai

**CRITICAL: Tenant Isolation**
- MOI query Prisma PHAI co `tenant_id` trong WHERE clause
- `tenantId` lay tu `request.user` (tu SessionAuthGuard hoac JwtAuthGuard)
- KHONG BAO GIO cho phep user truy cap data cua tenant khac
- Test tenant isolation: query user tu tenant A, expect khong thay user tenant B

**CRITICAL: Sensitive Data Protection**
- KHONG BAO GIO tra ve `pin_hash` hoac `password_hash` trong API responses
- Map response: them `hasPIN: boolean` de FE biet user da co PIN chua
- KHONG luu sensitive fields trong audit log `new_data`/`old_data`

**CRITICAL: PIN Reset da co — KHONG implement lai**
- `POST /api/v1/auth/reset-pin` da implement trong Story 1.3 (`auth.service.ts` method `resetPinForUser`)
- Story 1.4 chi implement CRUD cho user entity, KHONG tao them PIN endpoints
- FE se goi `/api/v1/auth/reset-pin` tu user management UI

**API Response Format (BAT BUOC):**
```json
// Single item
{ "data": { "id": "...", "email": "...", "name": "...", "hasPIN": true, "isActive": true, "roles": [...] } }

// List with pagination
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 42 } }
```

**Audit Log Pattern (tu Story 1.3):**
```typescript
await this.prisma.auditLog.create({
  data: {
    id: uuidv7(),
    tenant_id: tenantId,
    user_id: adminUserId,
    action: 'CREATE', // hoac 'UPDATE', 'DELETE'
    resource: 'user',
    resource_id: targetUserId,
    new_data: { name, email, roles: roleIds }, // KHONG chua pin_hash
    old_data: previousUserData, // chi cho UPDATE
    ip_address: req.ip,
    metadata: { reason: '...' } // optional
  }
});
```

**Session Revocation khi deactivate:**
```typescript
// Xoa tat ca sessions cua user — bat buoc khi deactivate
await this.prisma.session.deleteMany({ where: { user_id: userId } });
```

### Cau truc thu muc can tao

```
apps/api/src/modules/user/
├── dto/
│   ├── create-user.dto.ts     # NEW
│   ├── update-user.dto.ts     # NEW
│   └── list-users-query.dto.ts # NEW
├── user.controller.ts          # NEW
├── user.service.ts             # NEW
├── user.service.spec.ts        # NEW
├── user.module.ts              # NEW

apps/api/src/
├── app.module.ts               # UPDATE — import UserModule
```

### Existing Code de Reuse — KHONG Reinvent

| Can gi | Da co o dau | Cach dung |
|--------|-------------|-----------|
| hashPin() | `@pos-sdd/shared/auth/pin-utils` | `import { hashPin } from '@pos-sdd/shared'` |
| uuidv7() | `uuidv7` package | `import { uuidv7 } from 'uuidv7'` |
| DatabaseService (Prisma) | `apps/api/src/modules/database/` | Inject via constructor DI |
| AuthModeGuard | `apps/api/src/common/guards/auth-mode.guard.ts` | `@UseGuards(AuthModeGuard)` |
| @CurrentUser() | `apps/api/src/common/decorators/current-user.decorator.ts` | Extract `tenantId`, `userId` tu request |
| JwtPayload type | `apps/api/src/common/types/jwt-payload.ts` | Interface cho request.user |
| AuditLog model | `packages/database/prisma/schema.prisma` | Da co model, chi can create records |
| resetPinForUser() | `apps/api/src/modules/auth/auth.service.ts` | DA implement — KHONG tao lai |

### NestJS Module Pattern (theo Story 1.3)

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

DatabaseService da la `@Global()` module — KHONG can import DatabaseModule trong UserModule.

### Controller Pattern (theo auth.controller.ts)

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthModeGuard)
  async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    const result = await this.userService.createUser(user.tenantId, dto);
    return { data: result };
  }

  @Get()
  @UseGuards(AuthModeGuard)
  async listUsers(@Query() query: ListUsersQueryDto, @CurrentUser() user: JwtPayload) {
    return this.userService.listUsers(user.tenantId, query);
  }

  @Get(':id')
  @UseGuards(AuthModeGuard)
  async getUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.userService.getUserById(id, user.tenantId);
    return { data: result };
  }
}
```

**Luu y:** Global prefix `/api/v1` da cau hinh trong `main.ts` — controller chi can `@Controller('users')` → URL = `/api/v1/users`

### DTO Validation Pattern (theo auth DTOs)

```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsArray, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: 'PIN phai la 4-6 chu so' })
  pin?: string;

  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
```

### Prisma Query Patterns (tu auth.service.ts)

**Prisma 7.x quan trong:** Field names trong TypeScript INPUT/OUTPUT theo DB column names (snake_case) khi co `@map()`:
- `tenant_id` (KHONG phai `tenantId`)
- `pin_hash` (KHONG phai `pinHash`)
- `is_active` (KHONG phai `isActive`)
- `user_roles` (KHONG phai `userRoles`)
- `store_assignments` (KHONG phai `storeAssignments`)

```typescript
// Query user voi relations
const user = await this.prisma.user.findFirst({
  where: { id: userId, tenant_id: tenantId },
  include: {
    user_roles: { include: { role: true } },
    store_assignments: { include: { store: true } },
  },
});
```

### Test Pattern (theo auth.service.spec.ts)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock PrismaClient
const mockPrisma = {
  user: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  userRole: { createMany: vi.fn() },
  session: { deleteMany: vi.fn() },
  role: { findMany: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

// Mock DatabaseService
const mockDbService = { getClient: vi.fn().mockReturnValue(mockPrisma) };
```

### Project Structure Notes

- UserModule dat trong `apps/api/src/modules/user/` — tuan thu NestJS feature-based module pattern
- DTOs dung class-validator (da co trong project) — KHONG dung Zod cho NestJS DTOs (Zod chi dung trong shared package)
- Tests co-located: `user.service.spec.ts` cung folder voi `user.service.ts`
- Import path: `import { UserModule } from './modules/user/user.module'` trong app.module.ts

### Scope Decisions

- **Role assignment khi update user**: `UpdateUserDto` KHONG co `roleIds` — viec thay doi roles cua user thuoc scope Story 1.5 (Role Management & RBAC). Story 1.4 chi CRUD user entity (name, email). Day la quyet dinh co chu y, khong phai thieu sot.
- **Search filter**: Dung 1 field `search` ILIKE tren ca name + email thay vi 2 filter rieng. UX tot hon, spec AC5 duoc cap nhat de reflect dieu nay.

### Anti-patterns can tranh

- KHONG tao them PIN endpoints — `reset-pin` va `set-pin` DA CO trong AuthController
- KHONG tra ve `pin_hash` hay `password_hash` trong bat ky API response nao
- KHONG cho phep user tu deactivate chinh minh
- KHONG hardcode role names (admin, manager) — query roles tu DB theo `is_system` flag
- KHONG tao migration moi — schema da du cho User CRUD (User, UserRole, Role, AuditLog models da co)
- KHONG su dung `@default(dbgenerated())` cho UUID — generate UUID v7 o application level
- KHONG omit `tenant_id` trong bat ky query nao — tenant isolation la BAT BUOC
- KHONG skip audit logging — MOI thao tac CRUD PHAI ghi audit_log

### Previous Story Intelligence (Story 1.3)

**Tu Story 1.3 (Custom Auth):**
- `AuthService` da implement `resetPinForUser()` — kiem tra admin role (system_admin, chain_owner, store_manager), verify same tenant, hash PIN, ghi audit log
- `AuthModeGuard` la composite guard: kiem tra session (SessionAuthGuard) truoc, fallback JWT (JwtAuthGuard)
- `@CurrentUser()` decorator tra ve user data tu `request.user` — chua `userId`, `tenantId`, `roles`, `storeAssignments` (tu JWT) hoac full user object (tu session)
- Prisma 7.x: field names theo DB column names (snake_case) — PHAI dung `tenant_id`, `pin_hash`, `is_active`, `user_roles`, `store_assignments`
- `DatabaseService` inject qua DI, goi `this.dbService.getClient()` de lay PrismaClient
- 47 tests pass — KHONG duoc lam hong khi them UserModule

**Tu Story 1.2 (Database Schema):**
- Models `User`, `UserRole`, `UserStoreAssignment`, `Role`, `AuditLog` DA CO trong schema.prisma
- Seed data: 6 roles (cashier, kitchen, shift_lead, store_manager, chain_owner, system_admin) DA CO
- `tenant_id` unique constraint voi `email` tren `users` table: `@@unique([tenant_id, email])`
- `UserRole` unique constraint: `@@unique([user_id, role_id])`
- `bcryptjs` da cai trong `packages/database`

### Git Intelligence

**Commit pattern:** `feat(module): description` hoac `dev X-Y: description`
**Recent commits:**
- `ccc0768` mark(1-3): story 1-3 complete
- `1aad48d` fix(1-3): resolve 10 patch findings from code review
- `25ba8f3` dev 1-2: database schema foundation

### References

- [Source: epics.md#Story-1.4] — User Account Management acceptance criteria
- [Source: architecture.md#Naming-Patterns] — API naming: `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Structure-Patterns] — NestJS module structure
- [Source: architecture.md#Format-Patterns] — API response format `{ data, meta }`
- [Source: architecture.md#Authentication-Security] — Authorization pipeline, 4-layer RBAC
- [Source: prd.md#FR52] — Admin CRUD user accounts
- [Source: prd.md#FR58] — Immutable audit log
- [Source: project-context.md#Critical-Dont-Miss-Rules] — Multi-tenancy, VND integers, security
- [Source: 1-3-authentication-system-better-auth-pin-login.md] — Custom Auth patterns, PIN management, session handling

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Dev Agent)

### Debug Log References

- Fix TypeScript strict mode: thêm `!` (definite assignment assertion) cho required fields trong `CreateUserDto` (email, name, roleIds) — lỗi TS2564 khi type-check

### Completion Notes List

- ✅ UserModule structure tạo đầy đủ: module, service, controller, 3 DTOs
- ✅ UserService implement 6 methods: createUser, updateUser, deactivateUser, activateUser, getUserById, listUsers
- ✅ Tenant isolation: mọi query đều có `tenant_id` trong WHERE clause
- ✅ Sensitive data bảo vệ: không trả về `pin_hash`/`password_hash`, dùng `hasPIN: boolean`
- ✅ Audit log cho mọi thao tác CRUD (CREATE/UPDATE với old_data/new_data)
- ✅ Session revocation khi deactivate: `session.deleteMany({ where: { user_id } })`
- ✅ Self-deactivation blocked: kiểm tra userId !== adminUserId
- ✅ 36 tests mới (25 service + 11 controller) — tổng 73 tests pass
- ✅ Build, type-check, test đều PASS

### File List

- `apps/api/src/modules/user/user.module.ts` — NEW
- `apps/api/src/modules/user/user.service.ts` — NEW
- `apps/api/src/modules/user/user.controller.ts` — NEW
- `apps/api/src/modules/user/user.service.spec.ts` — NEW
- `apps/api/src/modules/user/user.controller.spec.ts` — NEW
- `apps/api/src/modules/user/dto/create-user.dto.ts` — NEW
- `apps/api/src/modules/user/dto/update-user.dto.ts` — NEW
- `apps/api/src/modules/user/dto/list-users-query.dto.ts` — NEW
- `apps/api/src/app.module.ts` — MODIFIED (import UserModule)

### Change Log

- 2026-03-28: Implement User Account Management CRUD (Story 1.4) — tạo UserModule với đầy đủ service, controller, DTOs, 36 unit tests
