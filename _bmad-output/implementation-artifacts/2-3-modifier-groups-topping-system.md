# Story 2.3: Modifier Groups & Topping System

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **cửa hàng trưởng**,
I want **định nghĩa nhóm món thêm (modifier groups) bắt buộc/tùy chọn với giá riêng, gắn vào sản phẩm**,
so that **thu ngân có thể thêm topping/size/đường đá khi tạo order** (FR3).

## Acceptance Criteria

1. **Given** cửa hàng trưởng tạo modifier group
   **When** set modifier group là "bắt buộc" (required) với min/max selection
   **Then** POS bắt buộc chọn ít nhất min modifier khi thêm món có group này

2. **Given** modifier có giá riêng (vd: +5,000đ cho Thêm phô mai)
   **When** thu ngân chọn modifier trên POS
   **Then** giá modifier được cộng vào tổng giá món

3. **Given** 1 modifier group cần gắn cho nhiều products
   **When** gán modifier group cho nhiều products cùng lúc
   **Then** tất cả products đó hiển thị modifier group khi order

## Tasks / Subtasks

### Backend Tasks

- [ ] Task 1: Prisma Schema — Models `ModifierGroup`, `ModifierItem`, `MenuItemModifierGroup` (AC: #1, #2, #3)
  - [ ] Thêm model `ModifierGroup` vào `schema.prisma`
  - [ ] Thêm model `ModifierItem` vào `schema.prisma`
  - [ ] Thêm explicit join model `MenuItemModifierGroup` (nhiều-nhiều MenuItem ↔ ModifierGroup)
  - [ ] Thêm relations vào `Tenant`, `Store`, `MenuItem`
  - [ ] Chạy `pnpm prisma migrate dev --name add-modifier-groups`

- [ ] Task 2: Shared Validators — Zod schemas (AC: #1, #2)
  - [ ] Tạo `packages/shared/src/validators/modifier-group.schema.ts`
  - [ ] Schemas: `createModifierGroupSchema`, `updateModifierGroupSchema`, `createModifierItemSchema`, `assignModifierGroupsSchema`

- [ ] Task 3: ModifierGroup Controller + Service (AC: #1, #2, #3)
  - [ ] Tạo `apps/api/src/modules/menu/modifier-group.controller.ts`
  - [ ] Tạo `apps/api/src/modules/menu/modifier-group.service.ts`
  - [ ] Register trong `menu.module.ts`

- [ ] Task 4: ModifierGroup CRUD Endpoints (AC: #1, #2)
  - [ ] `GET /api/v1/modifier-groups` — list (paginated, storeId filter)
  - [ ] `GET /api/v1/modifier-groups/:id` — get by id (include items)
  - [ ] `POST /api/v1/modifier-groups` — create group + items in 1 request
  - [ ] `PATCH /api/v1/modifier-groups/:id` — update group
  - [ ] `DELETE /api/v1/modifier-groups/:id` — soft-delete (deactivate)

- [ ] Task 5: ModifierItem Sub-resource Endpoints (AC: #2)
  - [ ] `POST /api/v1/modifier-groups/:groupId/items` — add item to group
  - [ ] `PATCH /api/v1/modifier-groups/:groupId/items/:itemId` — update item
  - [ ] `DELETE /api/v1/modifier-groups/:groupId/items/:itemId` — remove item

- [ ] Task 6: Product-ModifierGroup Assignment Endpoint (AC: #3)
  - [ ] `POST /api/v1/menu-items/:id/modifier-groups` — assign groups to product
  - [ ] `GET /api/v1/menu-items/:id/modifier-groups` — list groups of product
  - [ ] `DELETE /api/v1/menu-items/:id/modifier-groups/:groupId` — unassign

- [ ] Task 7: DTOs + Swagger (AC: #1, #2, #3)
  - [ ] `create-modifier-group.dto.ts`, `update-modifier-group.dto.ts`
  - [ ] `create-modifier-item.dto.ts`, `update-modifier-item.dto.ts`
  - [ ] `assign-modifier-groups.dto.ts`, `list-modifier-groups-query.dto.ts`

- [ ] Task 8: Backend Unit Tests (AC: #1, #2, #3)
  - [ ] `modifier-group.service.spec.ts` — CRUD, min/max validation, tenant isolation
  - [ ] `modifier-group.controller.spec.ts` — endpoint routing, guards

- [ ] Task 9: Cập nhật MenuItem response — include modifier groups (AC: #1)
  - [ ] Trong `menu-item.service.ts`, thêm `include: { modifier_groups }` vào get/list
  - [ ] Thêm `has_required_modifiers` computed field vào response

### Frontend Tasks

- [ ] Task 10: API Client + Types (AC: #1, #2, #3)
  - [ ] Cập nhật `apps/web/lib/api/types.ts` — ModifierGroupResponse, ModifierItemResponse
  - [ ] Tạo `apps/web/lib/api/modifier-groups.ts` — CRUD + assign functions

- [ ] Task 11: Modifier Group List Page (AC: #1, #2)
  - [ ] Tạo `apps/web/app/(management)/management/menu/modifiers/page.tsx`
  - [ ] Tạo `apps/web/components/menu/modifier-group-list.tsx` — danh sách groups
  - [ ] Tạo `apps/web/components/menu/modifier-group-card.tsx` — hiển thị group + items count + type badge
  - [ ] Search bar, filter required/optional, empty state

- [ ] Task 12: Create/Edit Modifier Group Dialog (AC: #1, #2)
  - [ ] Tạo `apps/web/components/menu/modifier-group-form-dialog.tsx`
  - [ ] Form: Tên group, Required/Optional toggle, Min/Max selection
  - [ ] Inline modifier items list: tên + giá VND (thêm/sửa/xóa items ngay trong dialog)
  - [ ] Validation: tên required, min ≤ max, giá ≥ 0 (integer VND)

- [ ] Task 13: Assign Modifier Groups to Products (AC: #3)
  - [ ] Tạo `apps/web/components/menu/modifier-assign-dialog.tsx`
  - [ ] Multi-select products checklist để gán modifier group
  - [ ] Hoặc: trong menu-item-form-dialog thêm section chọn modifier groups

- [ ] Task 14: Frontend — Delete/Deactivate Dialog
  - [ ] Tạo `apps/web/components/menu/modifier-group-delete-dialog.tsx`
  - [ ] Cảnh báo khi group đang gắn với products

- [ ] Task 15: Frontend Tests (AC: #1, #2)
  - [ ] Tạo `apps/web/components/menu/modifier-group-list.test.tsx`
  - [ ] Test render, filter, price formatting VND

- [ ] Task 16: Verification — Full Stack
  - [ ] `pnpm turbo build` — PASS
  - [ ] `pnpm turbo type-check` — PASS
  - [ ] `pnpm turbo lint` — PASS
  - [ ] `pnpm turbo test` — PASS
  - [ ] Swagger tại `/api/docs` hiển thị endpoints mới
  - [ ] Management Portal `/management/menu/modifiers` hoạt động

## Dev Notes

### Công nghệ & Phiên bản (PHẢI tuân thủ)

**Backend:** NestJS 11 (SWC, Vitest), Prisma 7.x (`@pos-sdd/database`), class-validator, @nestjs/swagger manual decorators, UUID v7 via `generateId()`, Currency Integer VND.

**Frontend:** Next.js 16 (App Router), React 19 (`'use client'`), Tailwind CSS v4, Shadcn UI (`@pos-sdd/ui`), Framer Motion 12, Vitest (`*.test.tsx`).

### CRITICAL: Prisma Schema — 3 Models

```prisma
model ModifierGroup {
  id            String   @id @db.Uuid
  tenant_id     String   @db.Uuid
  store_id      String   @db.Uuid
  name          String
  is_required   Boolean  @default(false)
  min_selection Int      @default(0)
  max_selection Int      @default(1)
  sort_order    Int      @default(0)
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  tenant        Tenant   @relation(fields: [tenant_id], references: [id])
  store         Store    @relation(fields: [store_id], references: [id])
  modifier_items ModifierItem[]
  menu_item_modifier_groups MenuItemModifierGroup[]

  @@unique([tenant_id, store_id, name])
  @@index([tenant_id, store_id, is_active])
  @@map("modifier_groups")
}

model ModifierItem {
  id                String   @id @db.Uuid
  tenant_id         String   @db.Uuid
  modifier_group_id String   @db.Uuid
  name              String
  price             Int      @default(0)  // VND integer — phụ phí
  sort_order        Int      @default(0)
  is_active         Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  tenant            Tenant        @relation(fields: [tenant_id], references: [id])
  modifier_group    ModifierGroup @relation(fields: [modifier_group_id], references: [id], onDelete: Cascade)

  @@unique([tenant_id, modifier_group_id, name])
  @@index([modifier_group_id])
  @@map("modifier_items")
}

model MenuItemModifierGroup {
  id                String   @id @db.Uuid
  tenant_id         String   @db.Uuid
  menu_item_id      String   @db.Uuid
  modifier_group_id String   @db.Uuid
  sort_order        Int      @default(0)
  created_at        DateTime @default(now())

  tenant            Tenant        @relation(fields: [tenant_id], references: [id])
  menu_item         MenuItem      @relation(fields: [menu_item_id], references: [id], onDelete: Cascade)
  modifier_group    ModifierGroup @relation(fields: [modifier_group_id], references: [id], onDelete: Cascade)

  @@unique([menu_item_id, modifier_group_id])
  @@index([menu_item_id])
  @@index([modifier_group_id])
  @@map("menu_item_modifier_groups")
}
```

**PHẢI thêm relations vào models hiện có:**
```prisma
// Tenant — thêm:
modifier_groups ModifierGroup[]
modifier_items  ModifierItem[]
menu_item_modifier_groups MenuItemModifierGroup[]

// Store — thêm:
modifier_groups ModifierGroup[]

// MenuItem — thêm:
menu_item_modifier_groups MenuItemModifierGroup[]
```

**Schema rules:**
- Explicit join table `MenuItemModifierGroup` thay vì implicit (cần `sort_order` metadata)
- `ModifierItem.price` là Integer VND — phụ phí cộng thêm (0 = miễn phí)
- `is_required=true` + `min_selection≥1` = bắt buộc chọn trên POS
- `onDelete: Cascade` — xóa group → xóa items + assignments
- UUID v7 cho tất cả PKs

### CRITICAL: API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/modifier-groups` | List groups (paginated) |
| `GET` | `/api/v1/modifier-groups/:id` | Get group + items |
| `POST` | `/api/v1/modifier-groups` | Create group + items |
| `PATCH` | `/api/v1/modifier-groups/:id` | Update group |
| `DELETE` | `/api/v1/modifier-groups/:id` | Soft-delete |
| `POST` | `/api/v1/modifier-groups/:groupId/items` | Add item |
| `PATCH` | `/api/v1/modifier-groups/:groupId/items/:itemId` | Update item |
| `DELETE` | `/api/v1/modifier-groups/:groupId/items/:itemId` | Remove item |
| `POST` | `/api/v1/menu-items/:id/modifier-groups` | Assign groups |
| `GET` | `/api/v1/menu-items/:id/modifier-groups` | List assigned groups |
| `DELETE` | `/api/v1/menu-items/:id/modifier-groups/:groupId` | Unassign |

**Auth:** AuthModeGuard + RoleGuard. Roles: store_manager, chain_owner, system_admin (write), cashier (read-only).

**Query params GET list:** `storeId` (required), `page`, `limit`, `search`, `isActive`, `isRequired`.

### CRITICAL: Create Group + Items — Single Request

```typescript
// POST /api/v1/modifier-groups
// Body:
{
  "storeId": "uuid",
  "name": "Size",
  "isRequired": true,
  "minSelection": 1,
  "maxSelection": 1,
  "items": [
    { "name": "Nhỏ", "price": 0 },
    { "name": "Vừa", "price": 5000 },
    { "name": "Lớn", "price": 10000 }
  ]
}
```

**Service logic:** Validate `min ≤ max`, `min ≤ items.length`. Create group + items trong `$transaction`. Audit log.

### CRITICAL: Assign Groups to Product (AC: #3)

```typescript
// POST /api/v1/menu-items/:id/modifier-groups
// Body:
{
  "modifierGroupIds": ["uuid-1", "uuid-2"],
  "sortOrders": [0, 1]  // optional
}
```

**Logic:** Validate all groupIds belong to same tenant+store. Upsert `MenuItemModifierGroup` records. Replace existing assignments if provided.

### CRITICAL: Existing Patterns — PHẢI tuân thủ

**Controller pattern** (theo `category.controller.ts`, `menu-item.controller.ts`):
```typescript
@ApiTags('Modifier Groups')
@Controller('modifier-groups')
export class ModifierGroupController {
  constructor(private readonly modifierGroupService: ModifierGroupService) {}
}
```

**Service pattern:** Constructor inject `DatabaseService`. `$transaction` cho business logic. Audit log trong cùng transaction. `_mapResponse()` private helper.

**Response format:** Single: `{ data: {...} }`. List: `{ data: [...], meta: { page, limit, total } }`.

**Guards/Decorators — REUSE:** `AuthModeGuard`, `RoleGuard`, `@Roles()`, `@CurrentUser()`, `JwtPayload`.

**Import `.js` extension bắt buộc (ESM).**

### CRITICAL: DTO Patterns

```typescript
// create-modifier-group.dto.ts
export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Size' }) @IsString() @MinLength(1) @MaxLength(100)
  name!: string;

  @ApiProperty() @IsUUID()
  storeId!: string;

  @ApiProperty({ example: true }) @IsBoolean()
  isRequired!: boolean;

  @ApiProperty({ example: 1 }) @IsInt() @Min(0)
  minSelection!: number;

  @ApiProperty({ example: 3 }) @IsInt() @Min(1)
  maxSelection!: number;

  @ApiPropertyOptional({ type: [CreateModifierItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateModifierItemDto)
  items?: CreateModifierItemDto[];
}

export class CreateModifierItemDto {
  @ApiProperty({ example: 'Thêm phô mai' }) @IsString() @MinLength(1) @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 5000, description: 'Phụ phí VND integer' })
  @IsInt() @Min(0)
  price!: number;
}
```

### CRITICAL: Business Rules

- `is_required=true` → POS **PHẢI** hiển thị Contextual Sliding Modifiers panel (UX-DR13, Story 3.1)
- `min_selection=0` + `is_required=false` → tùy chọn
- `min_selection ≤ max_selection` — validate backend
- `min_selection ≤ total active items in group` — validate khi create/update
- Soft-delete group → `is_active=false`, tất cả assignments vẫn giữ nhưng POS không hiển thị
- Modifier item price = 0 → miễn phí (vd: Ít đường, Không đá)
- Modifier item price > 0 → phụ phí cộng thêm vào giá món

### Multi-tenant Isolation

- **LUÔN** filter by `tenant_id` trong mọi query
- `storeId` validate thuộc `tenantId`
- Group name unique per `tenant_id + store_id`
- Assignment validate: `menu_item` và `modifier_group` cùng `tenant_id + store_id`

### Testing Standards

- **Vitest** — co-located `*.spec.ts`
- Mock `DatabaseService` trong unit tests
- Test cases bắt buộc:
  - Create group + items — success + duplicate name + min>max validation
  - Update group — success + not found
  - Delete group — soft-delete, verify assignments affected
  - Modifier item CRUD — add/update/remove item
  - Assign to product — success + cross-store rejection
  - List — pagination, search, isRequired filter
  - Tenant isolation
  - Price validation — integer only, ≥ 0

### Anti-patterns cần tránh

- ❌ KHÔNG dùng implicit many-to-many Prisma — dùng explicit join table (cần sort_order)
- ❌ KHÔNG dùng float cho price — Integer VND
- ❌ KHÔNG hard-delete modifier groups — soft-delete
- ❌ KHÔNG tạo lại guards/interceptors đã có
- ❌ KHÔNG dùng error format khác RFC 7807
- ❌ KHÔNG tạo `__tests__/` — co-locate `*.spec.ts`
- ❌ KHÔNG bỏ `.js` extension trong import (ESM)
- ❌ KHÔNG quên `tenant_id` trong mọi query

### Previous Story Intelligence

**Từ Story 2.2 (Menu Item — ready-for-dev):**
- `modules/menu/` đã có: `category.controller/service`, `menu-item.controller/service`, `image-upload.service`, `menu.module.ts`
- `MenuItem` model đã tồn tại — thêm relation `menu_item_modifier_groups`
- Pattern: `$transaction`, audit log, `_mapResponse()`, pagination
- Static file serving đã config trong `main.ts`
- Multipart upload pattern đã establish

**Từ Story 2.1 (Category — ready-for-dev):**
- `MenuModule` structure, `DatabaseModule` import
- Reorder bulk integer approach
- Delete-with-dependencies guard pattern

**Từ Story 1.8 (API Foundation — done):**
- Swagger `/api/docs`, HttpExceptionFilter (RFC 7807), TenantInterceptor, LoggingInterceptor, ResponseTransformInterceptor

### Frontend UI

**Page route:** `apps/web/app/(management)/management/menu/modifiers/page.tsx`

**Navigation:** Tab/link từ `/management/menu` → Modifiers page.

**Modifier Group List — UI Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Header: "Nhóm món thêm"              [+ Thêm nhóm mới] │
│  ──────────────────────────────────────────────────────── │
│  🔍 [Tìm kiếm...]   [Tất cả ▾]  [Bắt buộc/Tùy chọn ▾] │
│  ──────────────────────────────────────────────────────── │
│  📦 Size (Bắt buộc)      3 lựa chọn, 1-1    [✏️] [🗑️] │
│     Nhỏ: +0₫ | Vừa: +5.000₫ | Lớn: +10.000₫           │
│  📦 Topping (Tùy chọn)   5 lựa chọn, 0-3    [✏️] [🗑️] │
│     Phô mai: +5.000₫ | Trứng: +8.000₫ | ...            │
│  📦 Đường đá (Bắt buộc)  4 lựa chọn, 1-1    [✏️] [🗑️] │
│     100%: +0₫ | 70%: +0₫ | 50%: +0₫ | 0%: +0₫         │
└──────────────────────────────────────────────────────────┘
```

**Design (Modern Bistro):**
- Cards: `bg-white rounded-2xl shadow-sm border-slate-200`
- Required badge: `bg-primary/10 text-primary` (Teal)
- Optional badge: `bg-secondary text-secondary-foreground`
- Price: `text-primary font-semibold` — format VND `Intl.NumberFormat('vi-VN')`
- Hit targets ≥48x48px

**Create/Edit Dialog:**
- Shadcn Dialog. Form: Tên group, Required toggle, Min/Max numeric inputs
- Inline items editor: table/list với Add/Remove rows
- Each item row: Tên (Input) + Giá VND (Input, integer)
- Validation: tên required, min≤max, giá≥0

**Frontend File Structure:**
```
apps/web/
├── app/(management)/management/menu/modifiers/
│   └── page.tsx                              # NEW
├── components/menu/
│   ├── modifier-group-list.tsx               # NEW
│   ├── modifier-group-card.tsx               # NEW
│   ├── modifier-group-form-dialog.tsx        # NEW
│   ├── modifier-assign-dialog.tsx            # NEW
│   ├── modifier-group-delete-dialog.tsx      # NEW
│   └── modifier-group-list.test.tsx          # NEW
├── lib/api/
│   ├── modifier-groups.ts                    # NEW
│   └── types.ts                              # MODIFIED
```

### NestJS File Structure

```
apps/api/src/modules/menu/
├── dto/
│   ├── create-modifier-group.dto.ts          # NEW
│   ├── update-modifier-group.dto.ts          # NEW
│   ├── create-modifier-item.dto.ts           # NEW
│   ├── update-modifier-item.dto.ts           # NEW
│   ├── assign-modifier-groups.dto.ts         # NEW
│   └── list-modifier-groups-query.dto.ts     # NEW
├── modifier-group.controller.ts              # NEW
├── modifier-group.controller.spec.ts         # NEW
├── modifier-group.service.ts                 # NEW
├── modifier-group.service.spec.ts            # NEW
├── menu-item.service.ts                      # MODIFIED — include modifiers
└── menu.module.ts                            # MODIFIED — register new providers
```

### Scope Decisions

- Story này là **FULL-STACK** — Backend API + Management Portal UI
- **CHƯA** implement POS Contextual Sliding Modifiers UI (sẽ ở Story 3.1)
- **CHƯA** tính giá modifier vào order total (sẽ ở Story 3.2)
- Modifier groups quản lý tại Management Portal, POS chỉ consume data
- Explicit join table cho MenuItem ↔ ModifierGroup (cần sort_order)
- Soft-delete only — không hard delete modifier groups

### References

- [Source: epics.md#Story-2.3] — Modifier Groups acceptance criteria
- [Source: epics.md#Epic-2] — Menu Management & Catalog
- [Source: prd.md#FR3] — Modifier groups bắt buộc/tùy chọn, giá riêng
- [Source: architecture.md#API-Naming-Conventions] — `/api/v1/{resource}` plural
- [Source: architecture.md#Naming-Patterns-Database] — snake_case, plural, UUID v7
- [Source: architecture.md#Structure-Patterns-NestJS-Module] — dto/, controller, service
- [Source: architecture.md#Multi-Tenant-Isolation] — Prisma middleware + explicit tenant_id
- [Source: 2-2-menu-item-management-crud-hinh-anh.md] — MenuItem model, menu module patterns
- [Source: 2-1-category-management-crud-sap-xep.md] — Category patterns, MenuModule setup

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (SM/Story Context Engine)

### Debug Log References

N/A — Story chưa implement.

### Completion Notes List

- Story 2.3 là FULL-STACK — touch `apps/api` + `apps/web` + `packages/database` + `packages/shared`
- 3 models mới: `ModifierGroup`, `ModifierItem`, `MenuItemModifierGroup` (explicit join)
- Create group + items trong 1 request (nested create)
- Assign groups to multiple products hoặc assign từ product form
- Modifier price là Integer VND (phụ phí cộng thêm)
- min/max selection validation cả backend + frontend
- MenuItem response cần update để include modifier groups
- Chuẩn bị data cho Story 3.1 (POS Contextual Sliding Modifiers)
- Chuẩn bị data cho Story 3.2 (Order creation — modifier price calculation)
- Story 7.3 sẽ cần recipe mapping cho modifier items
- Manual Swagger decorators (SWC incompatible)
- `@ValidateNested` + `@Type()` cho nested DTO arrays

### File List

**Backend:**
- `packages/database/prisma/schema.prisma` (MODIFIED — 3 models + relations)
- `packages/shared/src/validators/modifier-group.schema.ts` (NEW)
- `apps/api/src/modules/menu/modifier-group.controller.ts` (NEW)
- `apps/api/src/modules/menu/modifier-group.controller.spec.ts` (NEW)
- `apps/api/src/modules/menu/modifier-group.service.ts` (NEW)
- `apps/api/src/modules/menu/modifier-group.service.spec.ts` (NEW)
- `apps/api/src/modules/menu/dto/create-modifier-group.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/update-modifier-group.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/create-modifier-item.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/update-modifier-item.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/assign-modifier-groups.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/list-modifier-groups-query.dto.ts` (NEW)
- `apps/api/src/modules/menu/menu-item.service.ts` (MODIFIED — include modifiers)
- `apps/api/src/modules/menu/menu.module.ts` (MODIFIED — register new providers)

**Frontend:**
- `apps/web/app/(management)/management/menu/modifiers/page.tsx` (NEW)
- `apps/web/components/menu/modifier-group-list.tsx` (NEW)
- `apps/web/components/menu/modifier-group-card.tsx` (NEW)
- `apps/web/components/menu/modifier-group-form-dialog.tsx` (NEW)
- `apps/web/components/menu/modifier-assign-dialog.tsx` (NEW)
- `apps/web/components/menu/modifier-group-delete-dialog.tsx` (NEW)
- `apps/web/components/menu/modifier-group-list.test.tsx` (NEW)
- `apps/web/lib/api/modifier-groups.ts` (NEW)
- `apps/web/lib/api/types.ts` (MODIFIED — thêm Modifier types)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-05-02 | Story context created | Comprehensive developer guide for modifier groups & topping system |
