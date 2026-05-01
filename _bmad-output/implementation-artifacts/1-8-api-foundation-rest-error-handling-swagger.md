# Story 1.8: API Foundation — REST + Error Handling + Swagger

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **NestJS 11 API được cấu hình với REST endpoints cơ bản, Swagger auto-generation, RFC 7807 error format, và common guards/interceptors/filters**,
so that **mọi module nghiệp vụ sau này có baseline nhất quán để xây dựng** (NFR33).

## Acceptance Criteria

1. **Given** NestJS app khởi động
   **When** truy cập `/api/docs`
   **Then** Swagger UI hiển thị với tất cả endpoints hiện có

2. **Given** request gây lỗi validation
   **When** server trả về error
   **Then** format RFC 7807: `{ type, title, status, detail, errorCode, timestamp }` (NFR16)

3. **Given** API nhận request
   **When** response trả về
   **Then** format: `{ data: {...}, meta: { page, limit, total } }` cho list, `{ data: {...} }` cho single item
   **And** JSON fields camelCase, dates ISO 8601, currency integer (VND), null rõ ràng

4. **Given** common infrastructure
   **When** module mới được tạo
   **Then** có sẵn: TenantInterceptor (inject tenant_id), LoggingInterceptor, ValidationPipe (đã có), HttpExceptionFilter

## Tasks / Subtasks

- [x] Task 1: Cài đặt @nestjs/swagger + swagger-ui-express (AC: #1)
  - [x] `pnpm add @nestjs/swagger swagger-ui-express -F @pos-sdd/api`
  - [x] `pnpm add -D @types/express -F @pos-sdd/api` (nếu chưa có — ĐÃ CÓ)
  - [x] Cấu hình Swagger trong `main.ts` với DocumentBuilder
  - [x] Setup endpoint tại `/api/docs` (SAU setGlobalPrefix)
  - [x] Thêm Bearer auth + Cookie auth vào Swagger config

- [x] Task 2: Tạo HttpExceptionFilter — RFC 7807 (AC: #2)
  - [x] Tạo `apps/api/src/common/filters/http-exception.filter.ts`
  - [x] Tạo `apps/api/src/common/filters/http-exception.filter.spec.ts`
  - [x] Catch tất cả `HttpException` + unhandled exceptions
  - [x] Output format: `{ type, title, status, detail, errorCode, timestamp }`
  - [x] Xử lý class-validator errors: extract field-level details vào `errors` array
  - [x] Content-Type: `application/problem+json`
  - [x] Register globally trong `main.ts`

- [x] Task 3: Tạo LoggingInterceptor (AC: #4)
  - [x] Tạo `apps/api/src/common/interceptors/logging.interceptor.ts`
  - [x] Tạo `apps/api/src/common/interceptors/logging.interceptor.spec.ts`
  - [x] Log: method, url, userId (nếu có), duration, statusCode
  - [x] Structured JSON format cho production
  - [x] Register globally trong `main.ts`

- [x] Task 4: Tạo TenantInterceptor (AC: #4)
  - [x] Tạo `apps/api/src/common/interceptors/tenant.interceptor.ts`
  - [x] Tạo `apps/api/src/common/interceptors/tenant.interceptor.spec.ts`
  - [x] Extract `tenantId` từ `request.user` (đã set bởi AuthModeGuard)
  - [x] Inject vào request context cho downstream services
  - [x] Register globally trong `main.ts` (SAU guards, TRƯỚC controllers)

- [x] Task 5: Tạo ResponseTransformInterceptor (AC: #3)
  - [x] Tạo `apps/api/src/common/interceptors/response-transform.interceptor.ts`
  - [x] Tạo `apps/api/src/common/interceptors/response-transform.interceptor.spec.ts`
  - [x] Wrap response tự động: `{ data: ... }` cho single, giữ nguyên `{ data, meta }` cho paginated
  - [x] Register globally trong `main.ts`

- [x] Task 6: Annotate existing DTOs + Controllers với Swagger decorators (AC: #1)
  - [x] Thêm `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` vào UserController, RoleController, PolicyController, StoreController, AuthController
  - [x] Thêm `@ApiProperty()` vào existing DTOs (CreateUserDto, UpdateUserDto, ListUsersQueryDto, AssignRolesDto, AssignStoreDto, etc.)
  - [x] Sử dụng NestJS CLI plugin HOẶC manual decorators

- [x] Task 7: Tạo shared error codes + API response types (AC: #2, #3)
  - [x] Tạo `apps/api/src/common/constants/error-codes.ts` — enum ErrorCode
  - [x] Tạo `apps/api/src/common/dto/api-response.dto.ts` — generic response wrapper
  - [x] Tạo `apps/api/src/common/dto/pagination-query.dto.ts` — base pagination DTO
  - [x] Tạo `apps/api/src/common/dto/problem-detail.dto.ts` — RFC 7807 response schema cho Swagger

- [x] Task 8: Cập nhật main.ts tổng hợp (AC: #1, #2, #3, #4)
  - [x] Thêm Swagger setup
  - [x] Register HttpExceptionFilter globally
  - [x] Register LoggingInterceptor globally
  - [x] Register TenantInterceptor globally (OPTIONAL — chỉ nếu cần global)
  - [x] Register ResponseTransformInterceptor globally
  - [x] Giữ nguyên ValidationPipe đã có
  - [x] Thứ tự: Filters → Pipes → Interceptors

- [ ] Task 9: Verification & Documentation (AC: #1, #2, #3, #4)
  - [ ] `pnpm turbo build` — PASS
  - [ ] `pnpm turbo type-check` — PASS
  - [ ] `pnpm turbo lint` — PASS
  - [ ] `pnpm turbo test` — PASS (176 tests hiện tại không regression)
  - [ ] Truy cập `http://localhost:3001/api/docs` — Swagger UI hiển thị
  - [ ] Test error response trả đúng RFC 7807 format
  - [ ] Test paginated response trả đúng `{ data, meta }` format

## Dev Notes

### Công nghệ & Phiên bản (PHẢI tuân thủ)

- **@nestjs/swagger: ^11.x** (match NestJS 11)
- **swagger-ui-express: latest** — Swagger UI renderer
- **NestJS 11** — SWC compiler, Vitest (không Jest)
- **class-validator + class-transformer** — ĐÃ CÓ trong dependencies

### CRITICAL: Existing main.ts — Giữ nguyên và mở rộng

```typescript
// apps/api/src/main.ts — HIỆN TẠI
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env['WEB_URL'] || 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const port = parseInt(process.env['API_PORT'] ?? '3001', 10);
  await app.listen(port);
}
```

**Swagger PHẢI setup SAU `setGlobalPrefix` và TRƯỚC `app.listen`:**
```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Trong bootstrap(), SAU setGlobalPrefix:
const config = new DocumentBuilder()
  .setTitle('POS SDD API')
  .setDescription('Point of Sale System Design Document - REST API')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
  .addCookieAuth('pos_session')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Lưu ý:** Swagger path `api/docs` KHÔNG bị ảnh hưởng bởi `setGlobalPrefix` — nó là absolute path.

### CRITICAL: RFC 7807 Error Format

```json
{
  "type": "https://pos-sdd.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Dữ liệu đầu vào không hợp lệ",
  "errorCode": "VALIDATION_FAILED",
  "timestamp": "2026-05-01T15:00:00+07:00",
  "errors": [
    { "field": "email", "message": "email must be an email" }
  ]
}
```

**Error Code mapping:**
| HTTP Status | errorCode | type suffix |
|-------------|-----------|-------------|
| 400 | `BAD_REQUEST` | `bad-request` |
| 401 | `UNAUTHORIZED` | `unauthorized` |
| 403 | `FORBIDDEN` | `forbidden` |
| 404 | `NOT_FOUND` | `not-found` |
| 409 | `CONFLICT` | `conflict` |
| 422 | `VALIDATION_FAILED` | `validation-failed` |
| 500 | `INTERNAL_ERROR` | `internal-error` |

**class-validator errors mapping:** NestJS ValidationPipe trả `BadRequestException` với `response.message` là string[] — map thành `errors` array với field extraction.

### CRITICAL: Existing Code Patterns — KHÔNG phá vỡ

**Hiện tại controllers trả response thủ công:**
```typescript
// user.controller.ts pattern
return { data: result };  // single item
return this.userService.listUsers(...);  // returns { data: [...], meta: { page, limit, total } }
```

**ResponseTransformInterceptor PHẢI handle 2 cases:**
1. Response đã có `data` key → giữ nguyên (controller đã wrap)
2. Response chưa có `data` key → wrap vào `{ data: response }`
3. Response có `data` + `meta` → giữ nguyên (paginated pattern từ UserService)

**HOẶC** — approach đơn giản hơn: KHÔNG tạo ResponseTransformInterceptor, để controllers tự wrap (pattern hiện tại đang hoạt động tốt). Chỉ tạo nếu cần enforce consistency.

### CRITICAL: Existing Guards/Interceptors — KHÔNG duplicate

Đã có trong `apps/api/src/common/`:
```
common/
├── decorators/
│   ├── check-policy.decorator.ts
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── guards/
│   ├── approval.guard.ts (+ spec)
│   ├── auth-mode.guard.ts (+ spec)
│   ├── jwt-auth.guard.ts (+ spec)
│   ├── limit.guard.ts (+ spec)
│   ├── role.guard.ts (+ spec)
│   ├── session-auth.guard.ts (+ spec)
│   └── store-scope.guard.ts (+ spec)
├── interceptors/
│   ├── policy-loader.interceptor.ts (+ spec)
├── types/
│   └── jwt-payload.ts
```

**KHÔNG tạo lại bất kỳ file nào ở trên!**

### Existing Modules (đã có controllers + services + DTOs)

- `modules/auth/` — AuthController, AuthService (login, register, PIN)
- `modules/user/` — UserController, UserService (CRUD, roles, store assignments)
- `modules/role/` — RoleController, RoleService (CRUD roles)
- `modules/policy/` — PolicyController, PolicyService (CRUD policies)
- `modules/store/` — StoreController, StoreService (CRUD stores)
- `modules/database/` — DatabaseModule, DatabaseService (Prisma)

**Tất cả controllers trên cần thêm Swagger decorators.**

### Swagger Annotation Strategy

**Option A (Recommended): NestJS Swagger CLI Plugin** — auto-generate `@ApiProperty()` từ class-validator decorators. Cấu hình trong `nest-cli.json`:
```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true,
    "plugins": ["@nestjs/swagger"]
  }
}
```
**Lưu ý:** Plugin KHÔNG hoạt động với SWC builder — phải dùng manual decorators hoặc chuyển sang tsc cho build. **Kiểm tra trước khi quyết định.**

**Option B: Manual `@ApiProperty()` trên DTOs** — an toàn hơn, hoạt động với SWC:
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email nhân viên' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên nhân viên', minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: '1234', description: 'PIN 4-6 chữ số', pattern: '^\\d{4,6}$' })
  @IsOptional()
  @Matches(/^\d{4,6}$/)
  pin?: string;
}
```

### Files cần tạo MỚI

```
apps/api/src/common/
├── filters/
│   ├── http-exception.filter.ts          # NEW: RFC 7807
│   └── http-exception.filter.spec.ts     # NEW: tests
├── interceptors/
│   ├── logging.interceptor.ts            # NEW
│   ├── logging.interceptor.spec.ts       # NEW
│   ├── tenant.interceptor.ts             # NEW
│   ├── tenant.interceptor.spec.ts        # NEW
│   ├── response-transform.interceptor.ts     # NEW (optional)
│   └── response-transform.interceptor.spec.ts # NEW (optional)
├── constants/
│   └── error-codes.ts                    # NEW
├── dto/
│   ├── api-response.dto.ts               # NEW
│   ├── pagination-query.dto.ts           # NEW
│   └── problem-detail.dto.ts             # NEW
```

### Files cần CẬP NHẬT

```
apps/api/src/main.ts                        # MODIFIED: Swagger + global filters/interceptors
apps/api/package.json                       # MODIFIED: thêm @nestjs/swagger, swagger-ui-express
apps/api/nest-cli.json                      # MODIFIED: swagger plugin (nếu dùng Option A)
apps/api/src/modules/user/user.controller.ts       # MODIFIED: Swagger decorators
apps/api/src/modules/user/dto/*.ts                 # MODIFIED: @ApiProperty
apps/api/src/modules/auth/auth.controller.ts       # MODIFIED: Swagger decorators
apps/api/src/modules/role/role.controller.ts       # MODIFIED: Swagger decorators
apps/api/src/modules/policy/policy.controller.ts   # MODIFIED: Swagger decorators
apps/api/src/modules/store/store.controller.ts     # MODIFIED: Swagger decorators
```

### NestJS File Naming Convention

- `kebab-case.ts` cho tất cả NestJS files
- `*.spec.ts` cho tests — co-located cùng folder
- `*.dto.ts` cho Data Transfer Objects
- `*.filter.ts` cho Exception Filters
- `*.interceptor.ts` cho Interceptors
- `*.guard.ts` cho Guards

### Error Handling Strategy — HttpExceptionFilter

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let detail = 'Lỗi hệ thống';
    let errors: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      // Handle class-validator errors (BadRequestException with message array)
      if (typeof exResponse === 'object' && 'message' in exResponse) {
        const messages = (exResponse as { message: string | string[] }).message;
        if (Array.isArray(messages)) {
          errors = messages.map(m => ({ field: '', message: m }));
          detail = 'Dữ liệu đầu vào không hợp lệ';
          errorCode = 'VALIDATION_FAILED';
        } else {
          detail = messages;
        }
      }
      // Map status to errorCode if not already set
    }

    response.status(status).header('Content-Type', 'application/problem+json').json({
      type: `https://pos-sdd.com/errors/${errorCode.toLowerCase().replace(/_/g, '-')}`,
      title: HttpStatus[status] || 'Error',
      status,
      detail,
      errorCode,
      timestamp: new Date().toISOString(),
      instance: request.url,
      ...(errors && { errors }),
    });
  }
}
```

### LoggingInterceptor Pattern

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const user = (request as any).user;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - now;
        this.logger.log(JSON.stringify({
          method, url,
          userId: user?.userId || 'anonymous',
          statusCode: response.statusCode,
          duration: `${duration}ms`,
        }));
      }),
    );
  }
}
```

### Dependencies cần cài

```bash
pnpm add @nestjs/swagger swagger-ui-express -F @pos-sdd/api
```

**Lưu ý:** `@types/express` ĐÃ CÓ. Không cần cài thêm type packages.

### Anti-patterns cần tránh

- ❌ KHÔNG tạo lại guards/interceptors đã có — reuse `auth-mode.guard.ts`, `policy-loader.interceptor.ts`, etc.
- ❌ KHÔNG dùng format error khác RFC 7807 — PHẢI dùng `{ type, title, status, detail, errorCode, timestamp }`
- ❌ KHÔNG dùng `@Catch(HttpException)` mà bỏ sót unhandled errors — dùng `@Catch()` (catch all)
- ❌ KHÔNG đổi format response hiện tại `{ data }` và `{ data, meta }` — giữ nguyên pattern
- ❌ KHÔNG đặt Swagger path sau `setGlobalPrefix` — `api/docs` là absolute path
- ❌ KHÔNG leak stack trace trong production — chỉ include trong development
- ❌ KHÔNG tạo thư mục `__tests__` — co-locate `*.spec.ts` cùng folder
- ❌ KHÔNG dùng Jest — dùng Vitest (NestJS 11 default)
- ❌ KHÔNG xóa `.gitkeep` files trong common/ directories
- ❌ KHÔNG sử dụng `@nestjs/swagger` CLI plugin với SWC builder — sẽ không hoạt động, dùng manual decorators

### Previous Story Intelligence

**Từ Story 1.7 (Design System — review):**
- 176 tests — KHÔNG ĐƯỢC phá vỡ
- Story 1.7 là frontend only — story 1.8 là BACKEND ONLY
- `pnpm turbo build`, `turbo type-check`, `turbo lint` đều PASS — phải giữ nguyên

**Từ Story 1.6 (Store Scope):**
- Pattern response: `{ data: result }` cho single, `{ data: [...], meta: { page, limit, total } }` cho list
- Controllers dùng `@UseGuards(AuthModeGuard)` pattern
- UserService đã có `PaginatedUsersResponse` interface

**Từ Story 1.5 (RBAC):**
- Guards pipeline: AuthGuard → PolicyLoaderInterceptor → RoleGuard → StoreScopeGuard → LimitGuard → ApprovalGuard
- Tất cả guards đã có unit tests

**Từ Story 1.3 (Auth):**
- AuthController có login, register, PIN auth endpoints
- Session cookie name: `pos_session`
- JWT bearer token support

**Debug learnings từ previous stories:**
- ESLint 8 không resolve scoped package sub-paths — packages dùng inline config
- `turbo type-check` cần `--noEmit` flag
- SWC compiler — nest-cli.json dùng `"builder": "swc"`
- Import paths phải có `.js` extension (ESM): `import { Foo } from './foo.js'`

### Git Intelligence

**Recent commits:**
```
c4f7c55 feat 1-7
9b9d2cf feat 1-6
254f8fd feat(1-5): role management & 4-layer RBAC setup
295b324 feat(1-4): user account management CRUD with code review fixes
```

**Commit pattern cho story này:** `feat(1-8): API foundation REST error handling swagger`

### Scope Decisions

- **Story này là BACKEND ONLY** — không có frontend changes
- **Swagger:** setup + annotate existing controllers/DTOs — KHÔNG tạo endpoints mới
- **Error handling:** global HttpExceptionFilter — retroactively standardize ALL error responses
- **Interceptors:** LoggingInterceptor + TenantInterceptor + (optional) ResponseTransformInterceptor
- **KHÔNG refactor** existing controller/service code — chỉ thêm decorators
- **KHÔNG thêm** business endpoints mới — chỉ infrastructure

### Testing Standards

- Vitest — co-located `*.spec.ts` files
- PHẢI đảm bảo: `turbo build`, `turbo type-check`, `turbo lint`, `turbo test` đều PASS
- PHẢI test: HttpExceptionFilter xử lý đúng các loại exception
- PHẢI test: LoggingInterceptor log đúng format
- PHẢI test: TenantInterceptor extract đúng tenantId
- Test pattern sử dụng `@nestjs/testing` — ĐÃ CÓ trong devDependencies

### Project Structure Notes

- `apps/api/src/common/` là nơi đặt infrastructure code (guards, interceptors, filters, decorators)
- `apps/api/src/common/filters/` — thư mục MỚI (chưa tồn tại, cần tạo)
- `apps/api/src/common/constants/` — thư mục MỚI (chưa tồn tại, cần tạo)
- `apps/api/src/common/dto/` — thư mục MỚI (chưa tồn tại, cần tạo)
- `apps/api/src/config/` — hiện chỉ có `.gitkeep` — có thể dùng cho app config sau
- `apps/api/src/gateway/` — hiện chỉ có `.gitkeep` — cho Socket.IO sau

### References

- [Source: epics.md#Story-1.8] — API Foundation acceptance criteria
- [Source: architecture.md#API-Design] — REST, Swagger/OpenAPI auto-gen
- [Source: architecture.md#Error-Handling] — RFC 7807 format `{ type, title, status, detail, errorCode }`
- [Source: architecture.md#API-Response-Format] — `{ data, meta }` pattern
- [Source: architecture.md#API-Naming-Conventions] — `/api/v1/{resource}` plural, kebab-case
- [Source: architecture.md#Data-Exchange-Rules] — camelCase JSON, ISO 8601 dates, VND integer
- [Source: architecture.md#Process-Patterns-Error-Handling] — Exception Filters, RFC 7807, 422 validation
- [Source: architecture.md#Process-Patterns-Logging] — error/warn/info/debug levels, JSON structured
- [Source: architecture.md#Naming-Patterns-Code] — kebab-case NestJS files
- [Source: architecture.md#Structure-Patterns-Test] — Co-located `*.spec.ts`
- [Source: architecture.md#Enforcement-Guidelines] — RFC 7807 mandatory, co-locate tests

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (SM/Story Context Engine)

### Debug Log References

N/A — Story chưa implement.

### Completion Notes List

- Story 1.8 là BACKEND ONLY — chỉ touch `apps/api`
- @nestjs/swagger CLI plugin KHÔNG hoạt động với SWC builder — dùng manual `@ApiProperty()` decorators
- HttpExceptionFilter PHẢI catch ALL (`@Catch()`) bao gồm cả unhandled exceptions
- Swagger path `api/docs` là absolute — không bị prefix bởi `setGlobalPrefix`
- Existing controllers đã wrap response thủ công (`{ data }`) — ResponseTransformInterceptor là OPTIONAL
- Sau story này, tất cả API errors sẽ đồng nhất RFC 7807, Swagger docs tự động cập nhật khi thêm module mới

### File List

- `apps/api/src/common/filters/http-exception.filter.ts` (NEW)
- `apps/api/src/common/filters/http-exception.filter.spec.ts` (NEW)
- `apps/api/src/common/interceptors/logging.interceptor.ts` (NEW)
- `apps/api/src/common/interceptors/logging.interceptor.spec.ts` (NEW)
- `apps/api/src/common/interceptors/tenant.interceptor.ts` (NEW)
- `apps/api/src/common/interceptors/tenant.interceptor.spec.ts` (NEW)
- `apps/api/src/common/interceptors/response-transform.interceptor.ts` (NEW — optional)
- `apps/api/src/common/interceptors/response-transform.interceptor.spec.ts` (NEW — optional)
- `apps/api/src/common/constants/error-codes.ts` (NEW)
- `apps/api/src/common/dto/api-response.dto.ts` (NEW)
- `apps/api/src/common/dto/pagination-query.dto.ts` (NEW)
- `apps/api/src/common/dto/problem-detail.dto.ts` (NEW)
- `apps/api/src/main.ts` (MODIFIED)
- `apps/api/package.json` (MODIFIED)
- `apps/api/src/modules/user/user.controller.ts` (MODIFIED — Swagger)
- `apps/api/src/modules/user/dto/*.ts` (MODIFIED — @ApiProperty)
- `apps/api/src/modules/auth/auth.controller.ts` (MODIFIED — Swagger)
- `apps/api/src/modules/role/role.controller.ts` (MODIFIED — Swagger)
- `apps/api/src/modules/policy/policy.controller.ts` (MODIFIED — Swagger)
- `apps/api/src/modules/store/store.controller.ts` (MODIFIED — Swagger)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-05-01 | Story context created | Comprehensive developer guide for API foundation |
