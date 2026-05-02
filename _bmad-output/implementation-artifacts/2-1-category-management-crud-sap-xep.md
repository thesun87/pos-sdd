# Story 2.1: Category Management (CRUD + Sắp xếp)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **cửa hàng trưởng**,
I want **tạo, chỉnh sửa, xóa các danh mục sản phẩm và sắp xếp thứ tự hiển thị**,
so that **thực đơn trên POS được tổ chức khoa học, thu ngân tìm món nhanh** (FR1).

## Acceptance Criteria

1. **Given** cửa hàng trưởng đăng nhập Management Portal
   **When** tạo category mới (tên, icon, thứ tự)
   **Then** category được lưu vào DB với `tenant_id` + `store_id`, hiển thị trong danh sách

2. **Given** danh sách categories đã tồn tại
   **When** kéo thả để sắp xếp lại thứ tự
   **Then** thứ tự mới được lưu, POS hiển thị theo thứ tự mới

3. **Given** category có chứa sản phẩm
   **When** xóa category
   **Then** hệ thống cảnh báo và yêu cầu chuyển sản phẩm sang category khác trước khi xóa

## Tasks / Subtasks

- [ ] Task 1: Prisma Schema — Thêm model `MenuCategory` (AC: #1)
  - [ ] Thêm model `MenuCategory` vào `packages/database/prisma/schema.prisma`
  - [ ] Chạy `pnpm prisma migrate dev --name add-menu-categories`
  - [ ] Verify `@pos-sdd/database` export model mới

- [ ] Task 2: Shared Validators — Zod schemas cho Category (AC: #1, #2)
  - [ ] Tạo `packages/shared/src/validators/menu-category.schema.ts`
  - [ ] Schemas: `createCategorySchema`, `updateCategorySchema`, `reorderCategoriesSchema`

- [ ] Task 3: NestJS Menu Module — Setup (AC: #1)
  - [ ] Tạo `apps/api/src/modules/menu/menu.module.ts`
  - [ ] Tạo `apps/api/src/modules/menu/category.controller.ts`
  - [ ] Tạo `apps/api/src/modules/menu/category.service.ts`
  - [ ] Register `MenuModule` trong `app.module.ts`

- [ ] Task 4: Category CRUD Endpoints (AC: #1, #3)
  - [ ] `GET /api/v1/menu-categories` — list với pagination + filter (storeId)
  - [ ] `GET /api/v1/menu-categories/:id` — get by id
  - [ ] `POST /api/v1/menu-categories` — create
  - [ ] `PATCH /api/v1/menu-categories/:id` — update
  - [ ] `DELETE /api/v1/menu-categories/:id` — soft-delete (deactivate) hoặc delete có kiểm tra

- [ ] Task 5: Reorder Endpoint (AC: #2)
  - [ ] `POST /api/v1/menu-categories/reorder` — bulk reorder (nhận array ids theo thứ tự mới)

- [ ] Task 6: DTOs + Swagger Decorators (AC: #1, #2)
  - [ ] Tạo `apps/api/src/modules/menu/dto/create-category.dto.ts`
  - [ ] Tạo `apps/api/src/modules/menu/dto/update-category.dto.ts`
  - [ ] Tạo `apps/api/src/modules/menu/dto/reorder-categories.dto.ts`
  - [ ] Tạo `apps/api/src/modules/menu/dto/list-categories-query.dto.ts`
  - [ ] Thêm `@ApiTags('Menu Categories')`, `@ApiOperation()`, `@ApiProperty()` decorators

- [ ] Task 7: Backend Unit Tests (AC: #1, #2, #3)
  - [ ] Tạo `apps/api/src/modules/menu/category.service.spec.ts`
  - [ ] Tạo `apps/api/src/modules/menu/category.controller.spec.ts`
  - [ ] Test CRUD operations, reorder logic, delete-with-products guard

- [ ] Task 8: Frontend — API Client + Types (AC: #1)
  - [ ] Tạo `apps/web/lib/api/menu-categories.ts` — fetch functions (list, get, create, update, delete, reorder)
  - [ ] Tạo `apps/web/lib/api/types.ts` — CategoryResponse, PaginatedCategoriesResponse interfaces
  - [ ] Dùng native `fetch` với base URL từ env `NEXT_PUBLIC_API_URL`

- [ ] Task 9: Frontend — Category List Page (AC: #1, #2)
  - [ ] Tạo `apps/web/app/(management)/management/menu/page.tsx` — Category management page
  - [ ] Tạo `apps/web/components/menu/category-list.tsx` — Danh sách categories với drag-and-drop
  - [ ] Tạo `apps/web/components/menu/category-card.tsx` — Card component cho mỗi category (icon, tên, sort handle)
  - [ ] Tích hợp HTML5 Drag-and-Drop API (hoặc framer-motion `Reorder`) cho sắp xếp
  - [ ] Hiển thị empty state khi chưa có category
  - [ ] Search bar để lọc categories theo tên

- [ ] Task 10: Frontend — Create/Edit Category Dialog (AC: #1)
  - [ ] Tạo `apps/web/components/menu/category-form-dialog.tsx` — Shadcn Dialog cho create/edit
  - [ ] Form fields: Tên (required), Icon (emoji picker hoặc text input), Store selector
  - [ ] Validation: tên không trống, max 100 ký tự
  - [ ] Hiển thị lỗi từ API (duplicate name, v.v.)
  - [ ] Optimistic UI update sau khi submit thành công

- [ ] Task 11: Frontend — Delete Confirmation Dialog (AC: #3)
  - [ ] Tạo `apps/web/components/menu/category-delete-dialog.tsx` — Xác nhận xóa category
  - [ ] Hiển thị cảnh báo khi category có sản phẩm (chuẩn bị cho Story 2.2)
  - [ ] Nút xóa màu destructive, có loading state

- [ ] Task 12: Frontend Tests (AC: #1, #2)
  - [ ] Tạo `apps/web/components/menu/category-list.test.tsx`
  - [ ] Test render danh sách, search filter, reorder callback

- [ ] Task 13: Verification — Full Stack
  - [ ] `pnpm turbo build` — PASS
  - [ ] `pnpm turbo type-check` — PASS
  - [ ] `pnpm turbo lint` — PASS
  - [ ] `pnpm turbo test` — PASS (no regression on existing tests)
  - [ ] Swagger UI tại `/api/docs` hiển thị endpoints mới
  - [ ] Management Portal: `/management/menu` hiển thị danh sách categories
  - [ ] Drag-drop reorder hoạt động và persist về API

## Dev Notes

### Công nghệ & Phiên bản (PHẢI tuân thủ)

**Backend:**
- **NestJS 11** — SWC compiler, Vitest (KHÔNG Jest)
- **Prisma 7.x** — TypeScript engine, `@pos-sdd/database`
- **class-validator + class-transformer** — ĐÃ CÓ
- **@nestjs/swagger** — ĐÃ CÓ, dùng manual `@ApiProperty()` (SWC incompatible with CLI plugin)
- **UUID v7** via `generateId()` từ `@pos-sdd/shared` — cho primary keys
- **Currency: Integer (VND)** — KHÔNG dùng float/decimal

**Frontend:**
- **Next.js 16** — App Router, Turbopack dev server
- **React 19** — Server Components mặc định, `'use client'` cho interactive
- **Tailwind CSS v4** — `@theme` tokens trong `globals.css`
- **Shadcn UI** — `@pos-sdd/ui` package (Button, Card, Dialog, Input, Label, Skeleton, Sonner)
- **Framer Motion 12** — `Reorder` component cho drag-and-drop
- **Vitest** — `*.test.tsx` cho frontend tests

### CRITICAL: Prisma Schema — Model MenuCategory

```prisma
model MenuCategory {
  id          String   @id @db.Uuid
  tenant_id   String   @db.Uuid
  store_id    String   @db.Uuid
  name        String
  icon        String?
  sort_order  Int      @default(0)
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenant_id], references: [id])
  store       Store    @relation(fields: [store_id], references: [id])

  @@unique([tenant_id, store_id, name])
  @@index([tenant_id, store_id, sort_order])
  @@map("menu_categories")
}
```

**Schema rules:**
- Tables: snake_case, **plural** → `menu_categories`
- Columns: snake_case → `tenant_id`, `store_id`, `sort_order`
- FK: `{referenced_table_singular}_id` → `tenant_id`, `store_id`
- UUID v7 cho PK
- `is_active` boolean prefix
- `sort_order` dùng Integer (bulk reorder approach — đơn giản hơn floating-point cho category lists nhỏ)
- `@@unique([tenant_id, store_id, name])` — tên category duy nhất trong mỗi store

**PHẢI thêm relations vào model Tenant và Store:**
```prisma
// Trong model Tenant — thêm:
menu_categories MenuCategory[]

// Trong model Store — thêm:
menu_categories MenuCategory[]
```

**Lưu ý:** Story 2.2 sẽ thêm model `MenuItem` với FK `category_id` → `MenuCategory.id`. Story này CHƯA tạo `MenuItem` nhưng delete logic cần chuẩn bị cho tương lai.

### CRITICAL: API Endpoints Design

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/api/v1/menu-categories` | List categories (paginated) | AuthModeGuard | store_manager+, cashier (read-only) |
| `GET` | `/api/v1/menu-categories/:id` | Get category by ID | AuthModeGuard | store_manager+, cashier |
| `POST` | `/api/v1/menu-categories` | Create category | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |
| `PATCH` | `/api/v1/menu-categories/:id` | Update category | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |
| `DELETE` | `/api/v1/menu-categories/:id` | Delete category | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |
| `POST` | `/api/v1/menu-categories/reorder` | Bulk reorder | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |

**Query params cho GET list:**
- `storeId` (required) — filter by store
- `page`, `limit` — pagination (default: 1, 20)
- `search` — tìm kiếm theo tên
- `isActive` — filter active/inactive

### CRITICAL: Reorder Strategy — Bulk Integer Reorder

Dùng **bulk reorder** approach (client gửi mảng IDs theo thứ tự mới):

```typescript
// POST /api/v1/menu-categories/reorder
// Body:
{
  "storeId": "uuid-store",
  "categoryIds": ["id-1", "id-3", "id-2"]  // thứ tự mới
}
```

**Service logic:**
```typescript
async reorderCategories(tenantId: string, storeId: string, categoryIds: string[], adminUserId: string) {
  await this.db.$transaction(async (tx) => {
    // 1. Validate tất cả categoryIds thuộc tenant + store
    const categories = await tx.menuCategory.findMany({
      where: { tenant_id: tenantId, store_id: storeId, id: { in: categoryIds } },
      select: { id: true },
    });
    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Một hoặc nhiều categoryId không hợp lệ');
    }

    // 2. Update sort_order theo index trong array
    for (let i = 0; i < categoryIds.length; i++) {
      await tx.menuCategory.update({
        where: { id: categoryIds[i] },
        data: { sort_order: i },
      });
    }

    // 3. Audit log
    await tx.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenantId,
        store_id: storeId,
        user_id: adminUserId,
        action: 'UPDATE',
        resource: 'menu_category',
        resource_id: null,
        new_data: { order: categoryIds },
        metadata: { action_type: 'reorder' },
      },
    });
  });
}
```

**Lý do chọn bulk Integer thay vì floating-point:** Danh sách categories thường nhỏ (<50 items). Bulk update đơn giản, dễ hiểu, atomic. Floating-point chỉ cần cho lists rất lớn (>1000 items).

### CRITICAL: Delete Category Logic (AC: #3)

```typescript
async deleteCategory(categoryId: string, tenantId: string, adminUserId: string) {
  await this.db.$transaction(async (tx) => {
    const category = await tx.menuCategory.findFirst({
      where: { id: categoryId, tenant_id: tenantId },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    // Kiểm tra sản phẩm thuộc category (chuẩn bị cho Story 2.2)
    // Khi model MenuItem chưa tồn tại, skip check này
    // SAU Story 2.2: uncomment dòng dưới
    // const productCount = await tx.menuItem.count({ where: { category_id: categoryId } });
    // if (productCount > 0) {
    //   throw new BadRequestException(
    //     `Danh mục đang chứa ${productCount} sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước khi xóa.`
    //   );
    // }

    // Hard delete (vì chưa có products liên kết)
    await tx.menuCategory.delete({ where: { id: categoryId } });

    await tx.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenantId,
        store_id: category.store_id,
        user_id: adminUserId,
        action: 'DELETE',
        resource: 'menu_category',
        resource_id: categoryId,
        old_data: { name: category.name, sort_order: category.sort_order },
      },
    });
  });
}
```

**Quan trọng:** Khi Story 2.2 (MenuItem) được implement, DEV PHẢI quay lại thêm product count check. Để TODO comment rõ ràng trong code.

### CRITICAL: Existing Code Patterns — PHẢI tuân thủ

**Controller pattern** (theo `store.controller.ts`):
```typescript
@ApiTags('Menu Categories')
@Controller('menu-categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listCategories(@Query() query: ListCategoriesQueryDto, @CurrentUser() user: JwtPayload) {
    return this.categoryService.listCategories(user.tenantId, query);
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('store_manager', 'chain_owner', 'system_admin')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    const result = await this.categoryService.createCategory(user.tenantId, dto, user.userId);
    return { data: result };
  }
}
```

**Service pattern** (theo `store.service.ts`):
- Constructor inject `DatabaseService`
- Business logic trong `$transaction`
- Audit log trong cùng transaction
- Response interface riêng (e.g., `CategoryResponse`)
- `_mapCategoryResponse()` private helper

**Response format:**
- Single: `{ data: {...} }`
- List: `{ data: [...], meta: { page, limit, total } }`

**Guards/Decorators đã có — REUSE:**
- `AuthModeGuard` — từ `common/guards/auth-mode.guard.ts`
- `RoleGuard` — từ `common/guards/role.guard.ts`
- `@Roles()` — từ `common/decorators/roles.decorator.ts`
- `@CurrentUser()` — từ `common/decorators/current-user.decorator.ts`
- `JwtPayload` type — từ `common/types/jwt-payload.ts`

**Import paths PHẢI có `.js` extension (ESM):**
```typescript
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
```

### CRITICAL: DTO Patterns

```typescript
// create-category.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Phở & Bún', description: 'Tên danh mục', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'uuid-store-id', description: 'Store ID' })
  @IsUUID()
  storeId!: string;

  @ApiPropertyOptional({ example: '🍜', description: 'Icon emoji hoặc icon name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
```

```typescript
// reorder-categories.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class ReorderCategoriesDto {
  @ApiProperty({ example: 'uuid-store-id' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ example: ['uuid-1', 'uuid-3', 'uuid-2'], description: 'Category IDs theo thứ tự mới' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  categoryIds!: string[];
}
```

### CRITICAL: Module Registration

```typescript
// apps/api/src/modules/menu/menu.module.ts
import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class MenuModule {}
```

**PHẢI register trong `app.module.ts`:**
```typescript
import { MenuModule } from './modules/menu/menu.module.js';
// ...
imports: [..., MenuModule],
```

### NestJS File Structure cho Module Mới

```
apps/api/src/modules/menu/
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── reorder-categories.dto.ts
│   └── list-categories-query.dto.ts
├── category.controller.ts
├── category.controller.spec.ts
├── category.service.ts
├── category.service.spec.ts
└── menu.module.ts
```

### Multi-tenant Isolation — CRITICAL

- **LUÔN** filter by `tenant_id` trong mọi query — đã enforce bởi TenantInterceptor nhưng service PHẢI explicit check
- `storeId` được gửi từ client, service PHẢI validate `storeId` thuộc `tenantId`
- Unique constraint: `@@unique([tenant_id, store_id, name])` — tên category không trùng trong cùng store

### Testing Standards

- **Vitest** — co-located `*.spec.ts`
- **KHÔNG dùng Jest** — NestJS 11 dùng Vitest
- **`@nestjs/testing`** — ĐÃ CÓ trong devDependencies
- Mock `DatabaseService` (Prisma) trong unit tests
- Test cases bắt buộc:
  - Create category — success + duplicate name error
  - Update category — success + not found
  - Delete category — success + with products (khi có MenuItem)
  - Reorder — success + invalid IDs
  - List — pagination, search filter, storeId filter
  - Tenant isolation — user từ tenant A không thấy categories tenant B

### Anti-patterns cần tránh

- ❌ KHÔNG tạo lại guards/interceptors đã có
- ❌ KHÔNG dùng format error khác RFC 7807
- ❌ KHÔNG tạo thư mục `__tests__` — co-locate `*.spec.ts`
- ❌ KHÔNG dùng Jest — dùng Vitest
- ❌ KHÔNG dùng auto-increment cho PK — dùng UUID v7 via `generateId()`
- ❌ KHÔNG dùng float cho currency
- ❌ KHÔNG bỏ `.js` extension trong import paths (ESM)
- ❌ KHÔNG tạo Zod schemas riêng trong apps/api — dùng từ `@pos-sdd/shared/validators`
- ❌ KHÔNG dùng `@nestjs/swagger` CLI plugin — dùng manual decorators
- ❌ KHÔNG quên `tenant_id` trong mọi query — multi-tenant isolation bắt buộc

### Previous Story Intelligence

**Từ Story 1.8 (API Foundation — done):**
- Swagger đã setup tại `/api/docs` — chỉ cần thêm `@ApiTags`, `@ApiOperation`, `@ApiProperty`
- HttpExceptionFilter global — errors tự động format RFC 7807
- LoggingInterceptor global — requests tự động log
- TenantInterceptor global — `tenantId` đã inject vào request
- ResponseTransformInterceptor global — response đã auto-wrap
- Pattern import: `.js` extension bắt buộc (ESM)

**Từ Story 1.6 (Store Scope — done):**
- StoreService pattern: `$transaction`, audit log, `_mapResponse()`, pagination
- `store_id` validation pattern: check store thuộc tenant trước khi thao tác

**Từ Story 1.4 (User CRUD — done):**
- Service pattern: `Promise.all([findMany, count])` cho pagination
- Error handling: `NotFoundException`, `ConflictException`, `BadRequestException`
- Audit log: `action: 'CREATE'|'UPDATE'|'DELETE'`, `resource`, `resource_id`, `old_data`, `new_data`

**Debug learnings:**
- ESLint 8 — packages dùng inline config
- `turbo type-check` cần `--noEmit` flag
- SWC compiler — `nest-cli.json` dùng `"builder": "swc"`
- Import paths PHẢI có `.js` extension (ESM)

### Git Intelligence

**Recent commits:**
```
3b25a13 feat 1-8
c4f7c55 feat 1-7
9b9d2cf feat 1-6
254f8fd feat(1-5): role management & 4-layer RBAC setup
```

**Commit pattern cho story này:** `feat(2-1): category management CRUD sap xep`

### CRITICAL: Frontend — Management Portal UI

**Page route:** `apps/web/app/(management)/management/menu/page.tsx`

**Layout đã có** (`(management)/layout.tsx`): Desktop sidebar (w-64) + header (h-14) + content area.

**Category List Page — UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Header: "Quản lý Danh mục"        [+ Thêm danh mục] │
│  ─────────────────────────────────────────────────── │
│  🔍 Search: [Tìm kiếm danh mục...]                  │
│  ─────────────────────────────────────────────────── │
│  ☰ 🍜 Phở & Bún                        [✏️] [🗑️]   │
│  ☰ 🥤 Đồ uống                          [✏️] [🗑️]   │
│  ☰ 🍰 Tráng miệng                      [✏️] [🗑️]   │
│  ☰ 🍕 Món phụ                           [✏️] [🗑️]   │
│                                                      │
│  (☰ = drag handle, kéo để sắp xếp)                 │
└─────────────────────────────────────────────────────┘
```

**Design Requirements (Modern Bistro theme):**
- Background: `bg-slate-50` (management layout)
- Category cards: `bg-white rounded-2xl shadow-sm border-slate-200`
- Drag handle: `text-muted` (Slate-500), cursor grab
- Primary action button: `bg-primary text-primary-foreground` (Teal-600)
- Delete button: `text-destructive` (Red-500)
- Hit targets: ≥48x48px cho touch optimization
- Hover effects: subtle `shadow-md` transition
- Empty state: Dùng `EmptyState` component từ `@pos-sdd/ui`

**Drag-and-Drop — Framer Motion Reorder:**
```tsx
'use client';
import { Reorder } from 'framer-motion';

// Sử dụng Reorder.Group + Reorder.Item
// onReorder callback gọi API POST /menu-categories/reorder
// Optimistic UI: cập nhật local state trước, revert nếu API fail
```

**Create/Edit Dialog:**
- Dùng Shadcn `Dialog` component từ `@pos-sdd/ui`
- Form fields: Tên (Input, required), Icon (Input, optional emoji/text)
- Validation client-side trước khi gọi API
- Show error toast (Sonner) khi API trả lỗi (duplicate name, etc.)

**Delete Confirmation Dialog:**
- Destructive action → yêu cầu xác nhận
- Hiển thị tên category đang xóa
- Nút "Xóa" màu destructive, nút "Hủy" secondary
- Loading spinner khi đang xóa

**API Client Pattern:**
```typescript
// apps/web/lib/api/menu-categories.ts
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

export async function listCategories(storeId: string, params?: { page?: number; search?: string }) {
  const searchParams = new URLSearchParams({ storeId, ...params });
  const res = await fetch(`${API_BASE}/menu-categories?${searchParams}`, { credentials: 'include' });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

**Frontend File Structure:**
```
apps/web/
├── app/(management)/management/menu/
│   └── page.tsx                           # NEW: Category management page
├── components/menu/
│   ├── category-list.tsx                   # NEW: List + drag-drop
│   ├── category-card.tsx                   # NEW: Single category card
│   ├── category-form-dialog.tsx            # NEW: Create/edit dialog
│   ├── category-delete-dialog.tsx          # NEW: Delete confirmation
│   └── category-list.test.tsx              # NEW: Frontend tests
├── lib/api/
│   ├── menu-categories.ts                  # NEW: API client
│   └── types.ts                            # NEW: Shared response types
```

### Scope Decisions

- Story này là **FULL-STACK** — Backend API + Management Portal UI
- **CHƯA** tạo model `MenuItem` — sẽ ở Story 2.2
- Delete category: hard delete khi chưa có products, chuẩn bị TODO cho product check
- Reorder: bulk integer approach (client gửi array IDs)
- Frontend dùng `Reorder` từ framer-motion (ĐÃ CÓ trong dependencies)

### Project Structure Notes

- `apps/api/src/modules/menu/` — thư mục MỚI cho tất cả menu-related code
- `apps/web/app/(management)/management/menu/` — thư mục MỚI cho menu management pages
- `apps/web/components/menu/` — thư mục MỚI cho menu components
- `apps/web/lib/api/` — thư mục MỚI cho API client functions
- Module này sẽ mở rộng trong Story 2.2 (MenuItem), 2.3 (Modifier), 2.4 (Combo)
- `packages/shared/src/validators/menu-category.schema.ts` — Zod schemas MỚI
- `packages/database/prisma/schema.prisma` — thêm model `MenuCategory` + relations

### References

- [Source: epics.md#Story-2.1] — Category Management acceptance criteria
- [Source: epics.md#Epic-2] — Menu Management & Catalog epic context
- [Source: architecture.md#API-Naming-Conventions] — `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Naming-Patterns-Database] — snake_case, plural tables, UUID v7
- [Source: architecture.md#Structure-Patterns-NestJS-Module] — dto/, controller, service, module
- [Source: architecture.md#API-Response-Format] — `{ data }` single, `{ data, meta }` list
- [Source: architecture.md#Requirements-to-Structure-Mapping] — Menu → `modules/menu/`, `validators/menu.schema.ts`
- [Source: architecture.md#Enforcement-Guidelines] — RFC 7807, co-locate tests, UUID v7, VND integer
- [Source: architecture.md#Multi-Tenant-Isolation] — Prisma middleware + explicit tenant_id filtering
- [Source: prd.md#FR1] — CRUD categories với thứ tự hiển thị tùy chỉnh

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (SM/Story Context Engine)

### Debug Log References

N/A — Story chưa implement.

### Completion Notes List

- Story 2.1 là FULL-STACK — touch `apps/api` + `apps/web` + `packages/database` + `packages/shared`
- Đây là story ĐẦU TIÊN của Epic 2 — tạo `modules/menu/` + `components/menu/` structures mới
- MenuCategory schema cần thêm relations vào Tenant và Store models
- Delete logic chuẩn bị sẵn TODO cho product check (Story 2.2)
- Reorder dùng bulk integer (không floating-point) vì category list nhỏ
- Frontend dùng framer-motion `Reorder` cho drag-and-drop (ĐÃ CÓ dependency)
- Manual Swagger decorators (SWC incompatible with CLI plugin)
- `@pos-sdd/shared` validators cần Zod schemas cho category
- Management Portal layout đã có: sidebar + header + content area
- Shadcn UI components có sẵn: Button, Card, Dialog, Input, Label, Skeleton, Sonner

### File List

**Backend:**
- `packages/database/prisma/schema.prisma` (MODIFIED — thêm MenuCategory + relations)
- `packages/shared/src/validators/menu-category.schema.ts` (NEW)
- `apps/api/src/modules/menu/menu.module.ts` (NEW)
- `apps/api/src/modules/menu/category.controller.ts` (NEW)
- `apps/api/src/modules/menu/category.controller.spec.ts` (NEW)
- `apps/api/src/modules/menu/category.service.ts` (NEW)
- `apps/api/src/modules/menu/category.service.spec.ts` (NEW)
- `apps/api/src/modules/menu/dto/create-category.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/update-category.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/reorder-categories.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/list-categories-query.dto.ts` (NEW)
- `apps/api/src/app.module.ts` (MODIFIED — import MenuModule)

**Frontend:**
- `apps/web/app/(management)/management/menu/page.tsx` (NEW)
- `apps/web/components/menu/category-list.tsx` (NEW)
- `apps/web/components/menu/category-card.tsx` (NEW)
- `apps/web/components/menu/category-form-dialog.tsx` (NEW)
- `apps/web/components/menu/category-delete-dialog.tsx` (NEW)
- `apps/web/components/menu/category-list.test.tsx` (NEW)
- `apps/web/lib/api/menu-categories.ts` (NEW)
- `apps/web/lib/api/types.ts` (NEW)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-05-02 | Story context created | Comprehensive developer guide for category management CRUD + reorder |
