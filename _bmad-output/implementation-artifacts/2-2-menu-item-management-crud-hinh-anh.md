# Story 2.2: Menu Item Management (CRUD + Hình ảnh)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **cửa hàng trưởng**,
I want **tạo, chỉnh sửa và xóa sản phẩm bao gồm tên, giá, mô tả và hình ảnh**,
so that **thực đơn đầy đủ thông tin để thu ngân và khách hàng nhìn thấy** (FR2).

## Acceptance Criteria

1. **Given** cửa hàng trưởng trong Management Portal
   **When** tạo product mới (tên, giá VND integer, mô tả, category, hình ảnh)
   **Then** product được lưu với `tenant_id`, hình ảnh được upload và resize cho POS display

2. **Given** product đã tồn tại
   **When** chỉnh sửa giá
   **Then** giá mới có hiệu lực ngay, menu sync xuống POS

3. **Given** product đang bị gán trong combo hoặc order active
   **When** xóa product
   **Then** hệ thống cảnh báo dependencies, chỉ cho phép soft-delete (deactivate)

## Tasks / Subtasks

- [ ] Task 1: Prisma Schema — Thêm model `MenuItem` (AC: #1)
  - [ ] Thêm model `MenuItem` vào `packages/database/prisma/schema.prisma`
  - [ ] Thêm relation `menu_items MenuItems[]` vào model `MenuCategory`, `Tenant`, `Store`
  - [ ] Chạy `pnpm prisma migrate dev --name add-menu-items`
  - [ ] Verify `@pos-sdd/database` export model mới

- [ ] Task 2: Shared Validators — Zod schemas cho MenuItem (AC: #1, #2)
  - [ ] Tạo `packages/shared/src/validators/menu-item.schema.ts`
  - [ ] Schemas: `createMenuItemSchema`, `updateMenuItemSchema`

- [ ] Task 3: MenuItem Controller + Service trong MenuModule (AC: #1, #2, #3)
  - [ ] Tạo `apps/api/src/modules/menu/menu-item.controller.ts`
  - [ ] Tạo `apps/api/src/modules/menu/menu-item.service.ts`
  - [ ] Register controller + service trong `menu.module.ts` (đã tồn tại từ Story 2.1)

- [ ] Task 4: MenuItem CRUD Endpoints (AC: #1, #2, #3)
  - [ ] `GET /api/v1/menu-items` — list với pagination + filter (storeId, categoryId, isActive)
  - [ ] `GET /api/v1/menu-items/:id` — get by id
  - [ ] `POST /api/v1/menu-items` — create (multipart/form-data cho image)
  - [ ] `PATCH /api/v1/menu-items/:id` — update (multipart/form-data cho image)
  - [ ] `DELETE /api/v1/menu-items/:id` — soft-delete (set `is_active = false`)

- [ ] Task 5: Image Upload Service (AC: #1)
  - [ ] Tạo `apps/api/src/modules/menu/image-upload.service.ts`
  - [ ] Multer config: memory storage, file type validation (jpg/png/webp), max 5MB
  - [ ] Phase 1: lưu local `apps/api/uploads/menu-items/` (Phase 2: cloud storage)
  - [ ] Resize ảnh: thumbnail (200x200) + display (600x600) via sharp
  - [ ] Trả về `image_url` relative path

- [ ] Task 6: Cập nhật Category delete logic (AC: #3 từ Story 2.1)
  - [ ] Trong `category.service.ts`, bỏ comment product count check
  - [ ] Thêm kiểm tra `menuItem.count({ where: { category_id } })` trước khi delete

- [ ] Task 7: DTOs + Swagger Decorators (AC: #1, #2)
  - [ ] Tạo `apps/api/src/modules/menu/dto/create-menu-item.dto.ts`
  - [ ] Tạo `apps/api/src/modules/menu/dto/update-menu-item.dto.ts`
  - [ ] Tạo `apps/api/src/modules/menu/dto/list-menu-items-query.dto.ts`
  - [ ] Thêm `@ApiTags('Menu Items')`, `@ApiOperation()`, `@ApiConsumes('multipart/form-data')` decorators

- [ ] Task 8: Backend Unit Tests (AC: #1, #2, #3)
  - [ ] Tạo `apps/api/src/modules/menu/menu-item.service.spec.ts`
  - [ ] Tạo `apps/api/src/modules/menu/menu-item.controller.spec.ts`
  - [ ] Test: CRUD, soft-delete, image upload validation, tenant isolation, category validation

- [ ] Task 9: Frontend — API Client + Types (AC: #1, #2)
  - [ ] Cập nhật `apps/web/lib/api/types.ts` — thêm MenuItemResponse, PaginatedMenuItemsResponse
  - [ ] Tạo `apps/web/lib/api/menu-items.ts` — fetch functions (list, get, create, update, delete)
  - [ ] Create/update dùng `FormData` cho multipart upload (image field)
  - [ ] Dùng native `fetch` với `credentials: 'include'`

- [ ] Task 10: Frontend — Menu Item List Page (AC: #1, #2)
  - [ ] Tạo `apps/web/app/(management)/management/menu/items/page.tsx` — Menu items page
  - [ ] Tạo `apps/web/components/menu/menu-item-list.tsx` — Grid/Table view danh sách items
  - [ ] Tạo `apps/web/components/menu/menu-item-card.tsx` — Card hiển thị: thumbnail, tên, giá VND, category badge, trạng thái
  - [ ] Filter: category dropdown, search bar, active/inactive toggle
  - [ ] Pagination controls
  - [ ] Hiển thị empty state khi chưa có items
  - [ ] Format giá VND: `Intl.NumberFormat('vi-VN')` — integer only

- [ ] Task 11: Frontend — Create/Edit Menu Item Form (AC: #1, #2)
  - [ ] Tạo `apps/web/components/menu/menu-item-form-dialog.tsx` — Shadcn Dialog cho create/edit
  - [ ] Form fields: Tên (required), Giá VND (required, integer), Mô tả (optional), Category dropdown (required), Image upload
  - [ ] Image upload: preview ảnh trước khi submit, drag-drop zone hoặc click-to-upload
  - [ ] Edit mode: hiển thị ảnh hiện tại, cho phép thay đổi
  - [ ] Validation client-side: tên không trống, giá ≥ 0, category required
  - [ ] Hiển thị lỗi từ API (duplicate name, invalid category, v.v.)
  - [ ] Toast thông báo thành công/lỗi (Sonner)

- [ ] Task 12: Frontend — Soft-Delete Confirmation Dialog (AC: #3)
  - [ ] Tạo `apps/web/components/menu/menu-item-delete-dialog.tsx`
  - [ ] Hiển thị cảnh báo: "Sản phẩm sẽ bị ẩn khỏi POS, không xóa vĩnh viễn"
  - [ ] Hiển thị tên + ảnh sản phẩm đang xóa
  - [ ] Nút "Ẩn sản phẩm" màu destructive, có loading state

- [ ] Task 13: Frontend Tests (AC: #1, #2)
  - [ ] Tạo `apps/web/components/menu/menu-item-list.test.tsx`
  - [ ] Test render danh sách, filter by category, search, price formatting

- [ ] Task 14: Verification — Full Stack
  - [ ] `pnpm turbo build` — PASS
  - [ ] `pnpm turbo type-check` — PASS
  - [ ] `pnpm turbo lint` — PASS
  - [ ] `pnpm turbo test` — PASS (no regression)
  - [ ] Swagger UI tại `/api/docs` hiển thị endpoints mới
  - [ ] Management Portal: `/management/menu/items` hiển thị danh sách sản phẩm
  - [ ] Upload ảnh + preview hoạt động đúng
  - [ ] Soft-delete ẩn sản phẩm khỏi danh sách active

## Dev Notes

### Công nghệ & Phiên bản (PHẢI tuân thủ)

**Backend:**
- **NestJS 11** — SWC compiler, Vitest (KHÔNG Jest)
- **Prisma 7.x** — TypeScript engine, `@pos-sdd/database`
- **Multer** — built-in NestJS `@UseInterceptors(FileInterceptor())` (KHÔNG cài thêm package)
- **sharp** — resize ảnh (CẦN cài: `pnpm add sharp --filter api`)
- **class-validator + class-transformer** — ĐÃ CÓ
- **@nestjs/swagger** — ĐÃ CÓ, dùng manual `@ApiProperty()` (SWC incompatible with CLI plugin)
- **UUID v7** via `generateId()` từ `@pos-sdd/shared`
- **Currency: Integer (VND)** — KHÔNG dùng float/decimal

**Frontend:**
- **Next.js 16** — App Router, Turbopack dev server
- **React 19** — `'use client'` cho interactive components
- **Tailwind CSS v4** — `@theme` tokens trong `globals.css`
- **Shadcn UI** — `@pos-sdd/ui` (Button, Card, Dialog, Input, Label, Skeleton, Sonner)
- **Framer Motion 12** — animations cho card transitions
- **Vitest** — `*.test.tsx` cho frontend tests

### CRITICAL: Prisma Schema — Model MenuItem

```prisma
model MenuItem {
  id            String   @id @db.Uuid
  tenant_id     String   @db.Uuid
  store_id      String   @db.Uuid
  category_id   String   @db.Uuid
  name          String
  description   String?
  price         Int               // VND integer — KHÔNG decimal
  image_url     String?
  thumb_url     String?           // thumbnail 200x200
  sort_order    Int      @default(0)
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  tenant        Tenant       @relation(fields: [tenant_id], references: [id])
  store         Store        @relation(fields: [store_id], references: [id])
  category      MenuCategory @relation(fields: [category_id], references: [id])

  @@unique([tenant_id, store_id, name])
  @@index([tenant_id, store_id, category_id])
  @@index([tenant_id, store_id, is_active])
  @@map("menu_items")
}
```

**PHẢI thêm relations vào models hiện có:**
```prisma
// Trong model Tenant — thêm:
menu_items MenuItem[]

// Trong model Store — thêm:
menu_items MenuItem[]

// Trong model MenuCategory — thêm:
menu_items MenuItem[]
```

**Schema rules (giống Story 2.1):**
- Tables: snake_case, plural → `menu_items`
- FK: `{referenced_table_singular}_id` → `category_id`
- `price` là Integer (VND) — **TUYỆT ĐỐI KHÔNG** dùng Decimal/Float
- `image_url` + `thumb_url` lưu relative path (e.g., `/uploads/menu-items/{uuid}.webp`)
- `@@unique([tenant_id, store_id, name])` — tên sản phẩm duy nhất trong mỗi store

### CRITICAL: API Endpoints Design

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/api/v1/menu-items` | List items (paginated) | AuthModeGuard | store_manager+, cashier (read-only) |
| `GET` | `/api/v1/menu-items/:id` | Get item by ID | AuthModeGuard | store_manager+, cashier |
| `POST` | `/api/v1/menu-items` | Create item (multipart) | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |
| `PATCH` | `/api/v1/menu-items/:id` | Update item (multipart) | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |
| `DELETE` | `/api/v1/menu-items/:id` | Soft-delete (deactivate) | AuthModeGuard, RoleGuard | store_manager, chain_owner, system_admin |

**Query params cho GET list:**
- `storeId` (required) — filter by store
- `categoryId` (optional) — filter by category
- `page`, `limit` — pagination (default: 1, 20)
- `search` — tìm theo tên
- `isActive` — filter active/inactive

### CRITICAL: Image Upload Pattern

```typescript
// menu-item.controller.ts — Create endpoint
@Post()
@UseGuards(AuthModeGuard, RoleGuard)
@Roles('store_manager', 'chain_owner', 'system_admin')
@UseInterceptors(FileInterceptor('image'))
@ApiConsumes('multipart/form-data')
@HttpCode(HttpStatus.CREATED)
async createMenuItem(
  @Body() dto: CreateMenuItemDto,
  @UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
      .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, fileIsRequired: false }),
  )
  file: Express.Multer.File | undefined,
  @CurrentUser() user: JwtPayload,
) {
  const result = await this.menuItemService.createMenuItem(user.tenantId, dto, file, user.userId);
  return { data: result };
}
```

**Image Upload Service:**
```typescript
// image-upload.service.ts
@Injectable()
export class ImageUploadService {
  private readonly uploadDir = resolve(__dirname, '../../../../uploads/menu-items');

  async processAndSave(file: Express.Multer.File): Promise<{ imageUrl: string; thumbUrl: string }> {
    const id = generateId();
    const ext = 'webp'; // Always convert to webp for consistency + performance

    // Ensure upload directory exists
    await mkdir(this.uploadDir, { recursive: true });

    // Full-size display image (600x600 max, maintain aspect ratio)
    const displayPath = join(this.uploadDir, `${id}.${ext}`);
    await sharp(file.buffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(displayPath);

    // Thumbnail (200x200, cover crop)
    const thumbPath = join(this.uploadDir, `${id}_thumb.${ext}`);
    await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 70 })
      .toFile(thumbPath);

    return {
      imageUrl: `/uploads/menu-items/${id}.${ext}`,
      thumbUrl: `/uploads/menu-items/${id}_thumb.${ext}`,
    };
  }

  async deleteImages(imageUrl: string | null, thumbUrl: string | null): Promise<void> {
    // Best-effort delete — log errors but don't throw
    for (const url of [imageUrl, thumbUrl]) {
      if (!url) continue;
      try {
        await unlink(resolve(__dirname, '../../../..', url.startsWith('/') ? url.slice(1) : url));
      } catch { /* file may not exist */ }
    }
  }
}
```

**CRITICAL:** Phase 1 dùng local file system. Khi chuyển Phase 2, chỉ cần swap `ImageUploadService` sang cloud storage (S3/GCS) mà KHÔNG thay đổi controller/service logic.

**PHẢI serve static files:** Trong `main.ts`, thêm:
```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// ...
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
```

### CRITICAL: Soft-Delete Logic (AC: #3)

```typescript
async deleteMenuItem(itemId: string, tenantId: string, adminUserId: string) {
  await this.db.$transaction(async (tx) => {
    const item = await tx.menuItem.findFirst({
      where: { id: itemId, tenant_id: tenantId },
    });
    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm');

    // Soft-delete — set is_active = false (KHÔNG hard delete)
    // Story 2.4 sẽ thêm check combo dependencies
    await tx.menuItem.update({
      where: { id: itemId },
      data: { is_active: false },
    });

    await tx.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenantId,
        store_id: item.store_id,
        user_id: adminUserId,
        action: 'DELETE',
        resource: 'menu_item',
        resource_id: itemId,
        old_data: { name: item.name, price: item.price, is_active: true },
        new_data: { is_active: false },
        metadata: { action_type: 'soft_delete' },
      },
    });
  });
}
```

### CRITICAL: Cập nhật Category Delete (từ Story 2.1)

Trong `category.service.ts`, bỏ comment TODO và thêm check:
```typescript
// TRƯỚC KHI delete category:
const productCount = await tx.menuItem.count({
  where: { category_id: categoryId, tenant_id: tenantId },
});
if (productCount > 0) {
  throw new BadRequestException(
    `Danh mục đang chứa ${productCount} sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước khi xóa.`
  );
}
```

### CRITICAL: Existing Code Patterns — PHẢI tuân thủ

**Controller pattern** (theo `store.controller.ts` và `category.controller.ts`):
```typescript
@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}
  // ... endpoints
}
```

**Service pattern** (theo `store.service.ts`):
- Constructor inject `DatabaseService` + `ImageUploadService`
- Business logic trong `$transaction`
- Audit log trong cùng transaction
- Response interface: `MenuItemResponse`
- `_mapMenuItemResponse()` private helper

**Response format:**
- Single: `{ data: {...} }`
- List: `{ data: [...], meta: { page, limit, total } }`

**Guards/Decorators đã có — REUSE:**
- `AuthModeGuard` — `common/guards/auth-mode.guard.ts`
- `RoleGuard` — `common/guards/role.guard.ts`
- `@Roles()` — `common/decorators/roles.decorator.ts`
- `@CurrentUser()` — `common/decorators/current-user.decorator.ts`
- `JwtPayload` type — `common/types/jwt-payload.ts`

**Import paths PHẢI có `.js` extension (ESM):**
```typescript
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
```

### CRITICAL: DTO Patterns

```typescript
// create-menu-item.dto.ts
export class CreateMenuItemDto {
  @ApiProperty({ example: 'Phở Bò Tái', minLength: 1, maxLength: 200 })
  @IsString() @MinLength(1) @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'uuid-store-id' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 55000, description: 'Giá VND (integer)' })
  @Type(() => Number) // multipart/form-data sends strings
  @IsInt() @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'Phở bò tái nạm thơm ngon' })
  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Hình ảnh (jpg/png/webp, max 5MB)' })
  image?: Express.Multer.File; // For Swagger docs only
}
```

**LƯU Ý QUAN TRỌNG:** Khi dùng `multipart/form-data`, tất cả fields đều gửi dưới dạng STRING. PHẢI dùng `@Type(() => Number)` từ `class-transformer` cho fields số (price). Nếu không, validation sẽ fail vì `price` là string "55000" thay vì number 55000.

### NestJS File Structure

```
apps/api/src/modules/menu/
├── dto/
│   ├── create-category.dto.ts       (từ Story 2.1)
│   ├── update-category.dto.ts       (từ Story 2.1)
│   ├── reorder-categories.dto.ts    (từ Story 2.1)
│   ├── list-categories-query.dto.ts (từ Story 2.1)
│   ├── create-menu-item.dto.ts      (NEW)
│   ├── update-menu-item.dto.ts      (NEW)
│   └── list-menu-items-query.dto.ts (NEW)
├── category.controller.ts           (từ Story 2.1)
├── category.controller.spec.ts      (từ Story 2.1)
├── category.service.ts              (MODIFIED — thêm product count check)
├── category.service.spec.ts         (từ Story 2.1)
├── menu-item.controller.ts          (NEW)
├── menu-item.controller.spec.ts     (NEW)
├── menu-item.service.ts             (NEW)
├── menu-item.service.spec.ts        (NEW)
├── image-upload.service.ts          (NEW)
└── menu.module.ts                   (MODIFIED — register new controller+services)
```

### Multi-tenant Isolation — CRITICAL

- **LUÔN** filter by `tenant_id` trong mọi query
- `storeId` được gửi từ client, service PHẢI validate `storeId` thuộc `tenantId`
- `categoryId` PHẢI validate thuộc cùng `tenant_id` + `store_id`
- Unique constraint: `@@unique([tenant_id, store_id, name])` — tên item không trùng trong cùng store

### Testing Standards

- **Vitest** — co-located `*.spec.ts`
- **KHÔNG dùng Jest**
- Mock `DatabaseService` (Prisma) + mock `ImageUploadService` trong unit tests
- Test cases bắt buộc:
  - Create item — success + duplicate name + invalid category + invalid price
  - Update item — success + not found + price update
  - Delete item — soft-delete success, verify `is_active = false`
  - List — pagination, categoryId filter, search, storeId filter
  - Image — valid upload, invalid type rejection, oversized rejection, no image (optional)
  - Category delete — blocked when has items (cập nhật test Story 2.1)
  - Tenant isolation — user từ tenant A không thấy items tenant B

### Anti-patterns cần tránh

- ❌ KHÔNG dùng Decimal/Float cho price — dùng Integer (VND)
- ❌ KHÔNG hard-delete menu items — luôn soft-delete (`is_active = false`)
- ❌ KHÔNG lưu ảnh gốc không resize — luôn resize qua sharp
- ❌ KHÔNG dùng memory storage cho file upload production (nhưng Phase 1 OK vì dùng buffer → sharp → disk)
- ❌ KHÔNG tạo lại guards/interceptors đã có
- ❌ KHÔNG dùng format error khác RFC 7807
- ❌ KHÔNG tạo thư mục `__tests__` — co-locate `*.spec.ts`
- ❌ KHÔNG bỏ `.js` extension trong import paths (ESM)
- ❌ KHÔNG quên `@Type(() => Number)` cho numeric fields trong multipart DTO
- ❌ KHÔNG quên `tenant_id` trong mọi query

### Previous Story Intelligence

**Từ Story 2.1 (Category Management — ready-for-dev):**
- `modules/menu/` structure đã tồn tại — CHỈ CẦN thêm files mới vào
- `menu.module.ts` đã có — thêm `MenuItemController`, `MenuItemService`, `ImageUploadService`
- `CategoryService` có TODO cho product count check — story này PHẢI implement check đó
- Pattern: `$transaction`, audit log, `_mapResponse()`, pagination, Zod schemas
- Reuse `DatabaseModule` import trong `MenuModule`

**Từ Story 1.8 (API Foundation — done):**
- Swagger tại `/api/docs` — thêm `@ApiTags`, `@ApiConsumes('multipart/form-data')`
- HttpExceptionFilter global — errors tự động format RFC 7807
- TenantInterceptor global — `tenantId` đã inject vào request
- ResponseTransformInterceptor global — response auto-wrap
- Import `.js` extension bắt buộc (ESM)

**Từ Store module patterns:**
- `Promise.all([findMany, count])` cho pagination
- Error handling: `NotFoundException`, `ConflictException`, `BadRequestException`
- Audit log: `action: 'CREATE'|'UPDATE'|'DELETE'`, `resource`, `resource_id`

### Git Intelligence

**Recent commits:**
```
3b25a13 feat 1-8
c4f7c55 feat 1-7
9b9d2cf feat 1-6
```

**Commit pattern cho story này:** `feat(2-2): menu item management CRUD hinh anh`

### CRITICAL: Frontend — Management Portal UI

**Page route:** `apps/web/app/(management)/management/menu/items/page.tsx`

**Navigation:** Từ category list page (`/management/menu`) có link/tab sang items page.

**Menu Item List Page — UI Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Quản lý Sản phẩm"                  [+ Thêm sản phẩm] │
│  ──────────────────────────────────────────────────────────────── │
│  🔍 [Tìm kiếm...]   📂 [Tất cả danh mục ▾]   [Active ▾]        │
│  ──────────────────────────────────────────────────────────────── │
│  Ảnh     Tên sản phẩm        Danh mục      Giá         Hành động│
│  ──────────────────────────────────────────────────────────────── │
│  [📷]    Phở Bò Tái          🍜 Phở & Bún   55.000₫    [✏️][🗑️]│
│  [📷]    Bún Chả Hà Nội     🍜 Phở & Bún   45.000₫    [✏️][🗑️]│
│  [📷]    Cơm Tấm Sườn       🍚 Cơm          50.000₫    [✏️][🗑️]│
│  [📷]    Trà Đào Cam Sả     🥤 Đồ uống     35.000₫    [✏️][🗑️]│
│  [  ]    Bánh Flan (Đã ẩn)   🍰 Tráng miệng 20.000₫    [✏️][↩️]│
│  ──────────────────────────────────────────────────────────────── │
│  ◀ 1 2 3 ▶                                  Hiển thị 5/24        │
└──────────────────────────────────────────────────────────────────┘
```

**Design Requirements (Modern Bistro theme):**
- Item rows: `bg-white border-b border-slate-100` với hover `bg-slate-50`
- Row height: `h-16` đủ chứa thumbnail + text
- Thumbnail: `w-10 h-10 rounded-lg object-cover` từ `thumb_url`, fallback placeholder icon
- Giá VND: `text-primary font-semibold text-right` — format `Intl.NumberFormat('vi-VN')`
- Category badge: `bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs`
- Inactive items: `opacity-50 bg-slate-50` với badge "Đã ẩn" + nút khôi phục (↩️) thay nút xóa
- Table header: `text-muted text-xs uppercase tracking-wide` — sticky
- Hit targets: ≥48x48px cho action buttons
- Empty state: dùng `EmptyState` từ `@pos-sdd/ui`
- Responsive: table layout desktop/tablet, stacked list mobile

**Image Upload — Preview Pattern:**
```tsx
'use client';
// Upload zone trong form dialog:
// - Click hoặc drag-drop file
// - Preview ảnh ngay trước khi submit (URL.createObjectURL)
// - Hiển thị file size + format validation
// - Edit mode: hiển thị ảnh hiện tại, cho phép thay đổi
// - FormData multipart submit cho create/update
```

**API Client — FormData Upload:**
```typescript
// apps/web/lib/api/menu-items.ts
export async function createMenuItem(data: { name: string; storeId: string; categoryId: string; price: number; description?: string; image?: File }) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('storeId', data.storeId);
  formData.append('categoryId', data.categoryId);
  formData.append('price', String(data.price));
  if (data.description) formData.append('description', data.description);
  if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_BASE}/menu-items`, {
    method: 'POST',
    body: formData,  // KHÔNG set Content-Type — browser tự thêm boundary
    credentials: 'include',
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

**Price Formatting:**
```typescript
const formatVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// 55000 → "55.000 ₫"
```

**Frontend File Structure:**
```
apps/web/
├── app/(management)/management/menu/
│   ├── page.tsx                            # Story 2.1: Category list
│   └── items/
│       └── page.tsx                        # NEW: Menu items page
├── components/menu/
│   ├── category-list.tsx                   # Story 2.1
│   ├── category-card.tsx                   # Story 2.1
│   ├── category-form-dialog.tsx            # Story 2.1
│   ├── category-delete-dialog.tsx          # Story 2.1
│   ├── menu-item-list.tsx                  # NEW: Grid/table view
│   ├── menu-item-card.tsx                  # NEW: Item card with thumbnail
│   ├── menu-item-form-dialog.tsx           # NEW: Create/edit form + image upload
│   ├── menu-item-delete-dialog.tsx         # NEW: Soft-delete confirmation
│   └── menu-item-list.test.tsx             # NEW: Frontend tests
├── lib/api/
│   ├── menu-categories.ts                  # Story 2.1
│   ├── menu-items.ts                       # NEW: API client (FormData upload)
│   └── types.ts                            # MODIFIED: thêm MenuItem types
```

### Scope Decisions

- Story này là **FULL-STACK** — Backend API + Management Portal UI
- Image upload Phase 1: **local filesystem** (`uploads/menu-items/`)
- Phase 2: swap sang cloud storage (S3/Cloudinary) — chỉ thay `ImageUploadService`
- Soft-delete only — KHÔNG hard delete menu items
- **CHƯA** tạo modifier group associations (Story 2.3)
- **CHƯA** tạo combo associations (Story 2.4)
- Static file serving cần config trong `main.ts`
- Frontend image upload dùng `FormData` + native `fetch`

### Project Structure Notes

- `apps/api/src/modules/menu/` — thư mục ĐÃ TỒN TẠI từ Story 2.1
- `apps/web/components/menu/` — thư mục ĐÃ TỒN TẠI từ Story 2.1
- `apps/web/lib/api/` — thư mục ĐÃ TỒN TẠI từ Story 2.1
- Thêm `menu-item.controller.ts`, `menu-item.service.ts`, `image-upload.service.ts` vào module này
- `apps/api/uploads/menu-items/` — thư mục MỚI cho image storage (thêm vào `.gitignore`)
- `apps/web/app/(management)/management/menu/items/` — thư mục MỚI cho items page
- `packages/shared/src/validators/menu-item.schema.ts` — Zod schemas MỚI
- `packages/database/prisma/schema.prisma` — thêm model `MenuItem` + relations

### References

- [Source: epics.md#Story-2.2] — Menu Item Management acceptance criteria
- [Source: epics.md#Epic-2] — Menu Management & Catalog epic context
- [Source: architecture.md#API-Naming-Conventions] — `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Naming-Patterns-Database] — snake_case, plural tables, UUID v7
- [Source: architecture.md#Structure-Patterns-NestJS-Module] — dto/, controller, service, module
- [Source: architecture.md#API-Response-Format] — `{ data }` single, `{ data, meta }` list
- [Source: architecture.md#Requirements-to-Structure-Mapping] — Menu → `modules/menu/`
- [Source: architecture.md#Multi-Tenant-Isolation] — Prisma middleware + explicit tenant_id
- [Source: prd.md#FR2] — CRUD sản phẩm (tên, giá, mô tả, hình ảnh)
- [Source: ux-design-specification.md#Snap-Order-Card] — Card cần thumb_url cho POS display
- [Source: 2-1-category-management-crud-sap-xep.md] — Previous story patterns & TODO

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (SM/Story Context Engine)

### Debug Log References

N/A — Story chưa implement.

### Completion Notes List

- Story 2.2 là FULL-STACK — touch `apps/api` + `apps/web` + `packages/database` + `packages/shared`
- MenuItem model cần FK `category_id` → `MenuCategory.id`
- Image upload: Backend dùng Multer + sharp, Frontend dùng `FormData` + native `fetch`
- Ảnh convert sang WebP cho performance, tạo 2 sizes (display 600x600 + thumb 200x200)
- Frontend image preview dùng `URL.createObjectURL()` trước khi submit
- Multipart form-data: numeric fields cần `@Type(() => Number)` decorator (backend)
- Frontend FormData: KHÔNG set `Content-Type` header — browser tự thêm `boundary`
- Giá VND format: `Intl.NumberFormat('vi-VN')` — integer only
- Cập nhật category delete logic từ Story 2.1 — thêm product count check
- Static assets serving cần config trong `main.ts`
- Thêm `uploads/` vào `.gitignore`
- Components menu/ và lib/api/ đã có từ Story 2.1 — chỉ cần thêm files mới

### File List

**Backend:**
- `packages/database/prisma/schema.prisma` (MODIFIED — thêm MenuItem + relations)
- `packages/shared/src/validators/menu-item.schema.ts` (NEW)
- `apps/api/src/modules/menu/menu-item.controller.ts` (NEW)
- `apps/api/src/modules/menu/menu-item.controller.spec.ts` (NEW)
- `apps/api/src/modules/menu/menu-item.service.ts` (NEW)
- `apps/api/src/modules/menu/menu-item.service.spec.ts` (NEW)
- `apps/api/src/modules/menu/image-upload.service.ts` (NEW)
- `apps/api/src/modules/menu/dto/create-menu-item.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/update-menu-item.dto.ts` (NEW)
- `apps/api/src/modules/menu/dto/list-menu-items-query.dto.ts` (NEW)
- `apps/api/src/modules/menu/menu.module.ts` (MODIFIED — register new providers)
- `apps/api/src/modules/menu/category.service.ts` (MODIFIED — uncomment product check)
- `apps/api/src/main.ts` (MODIFIED — static assets serving)
- `.gitignore` (MODIFIED — add uploads/)

**Frontend:**
- `apps/web/app/(management)/management/menu/items/page.tsx` (NEW)
- `apps/web/components/menu/menu-item-list.tsx` (NEW)
- `apps/web/components/menu/menu-item-card.tsx` (NEW)
- `apps/web/components/menu/menu-item-form-dialog.tsx` (NEW)
- `apps/web/components/menu/menu-item-delete-dialog.tsx` (NEW)
- `apps/web/components/menu/menu-item-list.test.tsx` (NEW)
- `apps/web/lib/api/menu-items.ts` (NEW)
- `apps/web/lib/api/types.ts` (MODIFIED — thêm MenuItem types)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-05-02 | Story context created | Comprehensive developer guide for menu item CRUD + image upload |
