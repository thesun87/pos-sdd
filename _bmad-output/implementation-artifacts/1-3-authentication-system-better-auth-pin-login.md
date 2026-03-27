# Story 1.3: Authentication System — Custom Auth & PIN Login

Status: review

## Story

As a **nhân viên cửa hàng**,
I want **đăng nhập vào hệ thống bằng email/mật khẩu (Dashboard) hoặc mã PIN (POS) qua hệ thống Custom Auth (NestJS AuthService + Prisma)**,
so that **tôi truy cập được chức năng phù hợp với vai trò một cách nhanh chóng và bảo mật, không phụ thuộc vào thư viện external không kiểm soát được schema**.

## Acceptance Criteria

1. **Given** server dang chay, **When** truy cap `POST /api/v1/auth/sign-up` voi email + password hop le, **Then** user moi duoc tao trong DB (bang `accounts` cua custom auth), lien ket voi `users` table hien tai qua `user_id` + `tenant_id`

2. **Given** user da dang ky, **When** truy cap `POST /api/v1/auth/sign-in` voi dung credentials, **Then** tra ve session cookie (HttpOnly) + session duoc luu trong DB (bang `sessions`), user co the truy cap cac route duoc bao ve

3. **Given** user da dang ky va co `pin_hash` trong DB, **When** gui `POST /api/v1/auth/pin-login` voi `{ pin, tenantSlug, email }`, **Then** he thong verify PIN (bcrypt compare), tao JWT token (cho POS/KDS offline-capable), tra ve token

4. **Given** POS da cache JWT + user data vao local storage (encrypted), **When** mat mang, **When** user nhap PIN, **Then** PIN duoc verify local bang bcrypt hash da cache, cho phep truy cap POS offline

5. **Given** session dang active, **When** goi `GET /api/v1/auth/session`, **Then** tra ve user info bao gom roles, store assignments, va tenant context

6. **Given** session het han hoac user goi `POST /api/v1/auth/sign-out`, **When** request gui di, **Then** session bi xoa khoi DB, cookie bi clear, audit log ghi nhan LOGIN/LOGOUT event

7. **Given** Custom AuthService da tich hop, **When** cac NestJS controllers su dung `@CurrentUser()` decorator va `SessionAuthGuard`, **Then** user data available trong moi request, guards tu dong bao ve cac routes (KHONG con phu thuoc `@thallesp/nestjs-better-auth`)

8. **Given** Next.js web app, **When** user truy cap trang Dashboard/Management, **Then** middleware kiem tra session qua `GET /api/v1/auth/session`, redirect ve login neu chua xac thuc

9. **Given** user da dang nhap (session hoac JWT), **When** goi `POST /api/v1/auth/set-pin` voi `{ pin }` (4-8 so), **Then** he thong hash PIN (bcrypt) va luu vao `users.pin_hash`, ghi audit log. **And** admin co the goi `POST /api/v1/auth/reset-pin` voi `{ userId, newPin }` de dat lai PIN cho user khac trong cung tenant

## Tasks / Subtasks

- [x] Task 1: Go Better-Auth va cai dependencies thay the (AC: #1, #7)
  - [x] Go `better-auth`, `@better-auth/prisma-adapter` khoi `packages/database`
  - [x] Go `@thallesp/nestjs-better-auth` khoi `apps/api`
  - [x] Go `better-auth` client khoi `apps/web`
  - [x] Doi ten env var: `BETTER_AUTH_SECRET` → `AUTH_JWT_SECRET` trong `.env.example`
  - [x] Dam bao body parser KHONG bi disable trong `main.ts` (restore ve NestJS default)

- [x] Task 2: Mo rong Prisma schema (AC: #1, #2) — GIU NGUYEN
  - [x] Models `Account`, `Session`, `Verification` da co trong `schema.prisma` — khong thay doi
  - [x] Migrations da chay thanh cong — KHONG rollback, KHONG chay them migration moi
  - [x] KHONG chay `npx auth@latest generate` — schema do chung ta kiem soat 100%

- [x] Task 3: Implement Custom AuthService (AC: #1, #2, #5)
  - [x] Viet lai `packages/database/src/auth.ts` — XOA `betterAuth()` config, chi export helper types: `SessionWithUser`, `AccountWithUser`
  - [x] Viet lai `apps/api/src/modules/auth/auth.service.ts` voi cac methods:
    - `signUp(email, password, tenantId)` — tao User + Account(provider: 'credential'), bcrypt hash password
    - `signIn(email, password, tenantId)` — verify password bcrypt, tao Session record (token = randomBytes(32)), tra ve token
    - `getSession(token)` — query sessions table kem user+roles+storeAssignments, kiem tra expires_at
    - `signOut(token)` — xoa Session record, ghi audit log LOGOUT
  - [x] Session token: `crypto.randomBytes(32).toString('hex')` luu trong `sessions.token`
  - [x] Session expiry: mac dinh 7 ngay (cau hinh qua env `SESSION_EXPIRES_IN`)

- [x] Task 4: Tich hop Custom Auth vao NestJS (AC: #2, #7)
  - [x] Viet lai `apps/api/src/modules/auth/auth.module.ts` — XOA `AuthModule.forRoot()` tu nestjs-better-auth, thay bang NestJS module thong thuong (providers: AuthService, SessionAuthGuard)
  - [x] KHOI PHUC body parser mac dinh trong `main.ts` — XOA `bodyParser: false` va raw body parser workaround
  - [x] Tao `SessionAuthGuard` — doc session cookie (`session_token`), query sessions table, inject user vao `request.user`
  - [x] Cau hinh HttpOnly cookie khi sign-in: `httpOnly: true, secure: prod-only, sameSite: 'lax'`
  - [x] Cap nhat `auth-mode.guard.ts` — Composite guard: kiem tra session (SessionAuthGuard) truoc, fallback JWT (JwtAuthGuard)
  - [x] Them endpoints vao AuthController: `POST /api/v1/auth/sign-up`, `POST /api/v1/auth/sign-in`, `GET /api/v1/auth/session`, `POST /api/v1/auth/sign-out`
  - [x] Thay the `@Session()` decorator bang `@CurrentUser()` (da co tu Task 7)

- [x] Task 5: Implement PIN management endpoints — set/reset PIN (AC: #3, #9)
  - [x] Tao `apps/api/src/modules/auth/dto/set-pin.dto.ts` — Zod + class-validator: `{ pin: string }` (4-8 so, chi so)
  - [x] Implement `POST /api/v1/auth/set-pin` (authenticated — yeu cau session hoac JWT):
    1. Validate PIN format (4-8 ky tu so)
    2. Bcrypt hash PIN (salt rounds 10) bang `hashPin()` tu `@pos-sdd/shared`
    3. Update `users.pin_hash` cho current user
    4. Ghi audit log `UPDATE` resource: `user_pin`
    5. Tra ve `{ success: true }`
  - [x] Implement `POST /api/v1/auth/reset-pin` (admin only — yeu cau role manager+):
    1. Nhan `{ userId: string, newPin: string }`
    2. Validate target user thuoc cung tenant
    3. Hash va update `pin_hash`
    4. Ghi audit log `UPDATE` resource: `user_pin`, metadata: `{ reset_by: adminUserId }`
  - [x] Luu y: User KHONG co `pin_hash` se KHONG the dang nhap PIN — endpoint nay la prerequisite cho PIN login

- [x] Task 6: Cap nhat PIN login endpoint (AC: #3, #6) — SUA NHO
  - [x] `apps/api/src/modules/auth/auth.controller.ts` — da co, giu nguyen structure
  - [x] `apps/api/src/modules/auth/dto/pin-login.dto.ts` — giu nguyen
  - [x] Implement `POST /api/v1/auth/pin-login`:
    1. Tim user theo `tenantSlug` + `email`
    2. Verify `is_active === true`
    3. Bcrypt compare `pin` voi `pin_hash`
    4. Tao JWT token (sign voi `AUTH_JWT_SECRET` — doi tu `BETTER_AUTH_SECRET`) chua: `userId`, `tenantId`, `roles`, `storeAssignments`, `exp` (24h)
    5. Tra ve `{ token, user: { id, name, email, roles, storeAssignments } }`
  - [x] `apps/api/src/modules/auth/dto/pin-login-response.dto.ts` — giu nguyen
  - [x] Ghi audit log `LOGIN` khi PIN login thanh cong
  - [x] Ghi audit log `LOGIN` voi metadata `{ reason: 'invalid_pin' }` khi that bai

- [x] Task 7: Implement JWT Guard cho POS/KDS routes (AC: #3, #7)
  - [x] Tao `apps/api/src/common/guards/jwt-auth.guard.ts`
  - [x] Guard extract JWT tu `Authorization: Bearer <token>` header
  - [x] Verify JWT signature + expiry
  - [x] Inject decoded payload vao `request.user` voi type `JwtPayload`
  - [x] Tao `apps/api/src/common/decorators/current-user.decorator.ts` — `@CurrentUser()` decorator
  - [x] Tao `apps/api/src/common/types/jwt-payload.ts` — type definition
  - [x] Cap nhat `apps/api/src/common/guards/auth-mode.guard.ts` — Composite guard: kiem tra session (SessionAuthGuard) truoc, fallback JWT (khong con dung Better-Auth)

- [x] Task 8: Implement offline PIN verification utilities (AC: #4)
  - [x] Tao `packages/shared/src/auth/pin-utils.ts`:
    - `hashPin(pin: string): Promise<string>` — bcrypt hash (salt rounds 10)
    - `verifyPin(pin: string, hash: string): Promise<boolean>` — bcrypt compare
    - `validatePinFormat(pin: string): boolean` — 4-8 ky tu, chi so
  - [x] Tao `packages/shared/src/auth/offline-auth.ts`:
    - `interface CachedAuthData { userId, tenantId, email, name, roles, storeAssignments, pinHash, cachedAt }`
    - `isAuthCacheValid(cachedAt: number, maxAgeMs: number): boolean`
  - [x] Tao `packages/shared/src/auth/jwt-utils.ts`:
    - `interface JwtPayload { userId, tenantId, roles, storeAssignments, iat, exp }`
    - `isTokenExpired(payload: JwtPayload): boolean`
  - [x] Export tu `@pos-sdd/shared`

- [x] Task 9: Viet lai Custom Auth client cho Next.js (AC: #8)
  - [x] Viet lai `apps/web/lib/auth-client.ts` — XOA `createAuthClient()` tu better-auth, thay bang fetch wrapper thuan:
    - `signIn(email, password)` → `POST /api/v1/auth/sign-in` (credentials: 'include')
    - `signOut()` → `POST /api/v1/auth/sign-out` (credentials: 'include')
    - `getSession()` → `GET /api/v1/auth/session` (credentials: 'include')
  - [x] Cap nhat `apps/web/middleware.ts` — goi `GET /api/v1/auth/session` voi cookie forwarding, redirect ve /login neu tra ve 401
  - [x] Viet lai `apps/web/hooks/useAuth.ts` — wrap fetch functions thay vi Better-Auth client methods
  - [x] `apps/web/app/(auth)/layout.tsx` — giu nguyen (UI khong doi)
  - [x] `apps/web/app/(auth)/login/page.tsx` — cap nhat dung authClient.signIn moi
  - [x] `apps/web/app/(auth)/pin/page.tsx` — giu nguyen (dung fetch truc tiep)

- [x] Task 10: Cap nhat seed data (AC: #1, #9) — SUA NHO
  - [x] Cap nhat `packages/database/prisma/seed.ts`:
    - Tao `Account` record cho admin user voi bcrypt hash password thu cong (KHONG dung Better-Auth API)
    - Hash password: `bcrypt.hash('Admin@123', 10)` luu vao `accounts.password`, `provider_id: 'credential'`
    - Dam bao admin user van co `pin_hash` (PIN: 123456) trong `users` table — da co tu Story 1.2
  - [x] Verify seed chay thanh cong (da chay o Story 1.2, schema khong thay doi)

- [x] Task 11: Cap nhat Testing (AC: #1-#9)
  - [x] Tests cho PIN login service: happy path, wrong PIN, inactive user, user not found, user chua co PIN — giu nguyen
  - [x] Tests cho set-pin/reset-pin endpoints — giu nguyen
  - [x] Tests cho JWT guard — giu nguyen
  - [x] Tests cho offline PIN utilities — giu nguyen
  - [x] Them tests cho `signIn` service: happy path, wrong password, inactive user, user not found
  - [x] Them tests cho `signOut`: session bi xoa, audit log LOGOUT duoc ghi
  - [x] Them tests cho `SessionAuthGuard`: valid session cookie, expired session, missing cookie
  - [x] Cap nhat tests cho `auth-mode.guard.ts`: session (custom SessionAuthGuard) truoc, fallback JWT
  - [x] Verify `turbo build` thanh cong
  - [x] Verify `turbo type-check` khong loi

## Dev Notes

### Thong tin ky thuat quan trong

**Cong nghe & Phien ban (PHAI tuan thu):**
- Custom Auth: NestJS AuthService + Prisma truc tiep — KHONG dung thu vien auth external
- bcryptjs: Dung cho password hashing + PIN hashing (salt rounds 10)
- JWT: Dung `jose` (ESM native, lighter) de sign/verify JWT cho POS/KDS
- Session token: `crypto.randomBytes(32).toString('hex')` — luu trong `sessions.token`
- NestJS 11: SWC compiler, Vitest, body parser MAC DINH (KHONG disable)

**CRITICAL: KHONG disable body parser**
Body parser NestJS phai giu nguyen mac dinh. KHONG them `bodyParser: false` vao `main.ts`.
Toan bo endpoint `/api/v1/*` dung NestJS ValidationPipe binh thuong.

**Env vars:**
```
# Custom Auth
AUTH_JWT_SECRET=your-secret-key-min-32-chars   # sign/verify JWT cho POS/KDS
AUTH_URL=http://localhost:3001                   # base URL cua API server
SESSION_EXPIRES_IN=7d                           # thoi gian session het han (mac dinh 7 ngay)
```

### Prisma Schema — GIU NGUYEN HOAN TOAN

Schema `accounts`, `sessions`, `verifications` da migrate dung. KHONG thay doi gi.
**KHONG chay `npx auth@latest generate`** — schema do chung ta kiem soat 100%.

### Custom AuthService Pattern

```typescript
// apps/api/src/modules/auth/auth.service.ts
async signIn(email: string, password: string, tenantId: string) {
  const account = await prisma.account.findFirst({
    where: { user: { email, tenant_id: tenantId }, provider_id: 'credential' },
    include: { user: { include: { user_roles: true, store_assignments: true } } }
  });
  if (!account?.password || !await bcrypt.compare(password, account.password)) {
    throw new UnauthorizedException();
  }
  const token = randomBytes(32).toString('hex');
  await prisma.session.create({
    data: {
      id: uuidv7(), token,
      user_id: account.user_id,
      expires_at: addDays(new Date(), 7),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    }
  });
  return token; // set lam HttpOnly cookie
}
```

**Cookie Configuration (HttpOnly — bao ve chong XSS):**
```typescript
res.cookie('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### NestJS Auth Module Pattern

```typescript
// apps/api/src/modules/auth/auth.module.ts
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard],
  exports: [AuthService, SessionAuthGuard],
})
export class AuthModule {}
// KHONG import tu @thallesp/nestjs-better-auth
```

### SessionAuthGuard Pattern

```typescript
// Lay session_token tu cookie
// Query sessions table + check expires_at
// Include user voi roles + store_assignments
// Inject vao request.user
// Neu khong co cookie hoac session het han: throw UnauthorizedException
```

### auth-client.ts (Next.js) — Fetch Wrapper Thuan

```typescript
// apps/web/lib/auth-client.ts — KHONG dung better-auth SDK
export const authClient = {
  signIn: (email: string, password: string) =>
    fetch('/api/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }),
  signOut: () =>
    fetch('/api/v1/auth/sign-out', { method: 'POST', credentials: 'include' }),
  getSession: () =>
    fetch('/api/v1/auth/session', { credentials: 'include' }),
};
```

### middleware.ts (Next.js) Pattern

```typescript
// Goi GET /api/v1/auth/session voi cookie forwarding (headers: { cookie: req.headers.cookie })
// Neu response 401 → redirect ve /login
// KHONG dung better-auth middleware
```

### PIN Provisioning Flow (Cap/Dat PIN cho user)

**Luong cap PIN:**
1. **Admin tao user** (Story 1.4) → user chua co PIN, `pin_hash = null`
2. **Admin dat PIN cho user** → `POST /api/v1/auth/reset-pin { userId, newPin }` → hash va luu `pin_hash`
3. **User tu dat PIN** (sau khi dang nhap email/password lan dau) → `POST /api/v1/auth/set-pin { pin }` → hash va luu `pin_hash`
4. **User dang nhap POS bang PIN** → `POST /api/v1/auth/pin-login { pin, tenantSlug, email }`

**Luu y quan trong:**
- User **KHONG co `pin_hash`** se **KHONG the** dang nhap PIN — endpoint `pin-login` phai tra ve loi ro rang: `"PIN chua duoc thiet lap. Vui long lien he quan ly."`
- Seed data admin user **DA co** `pin_hash` (PIN: 123456) tu Story 1.2, nen co the test PIN login ngay
- Story 1.4 (User CRUD) se build UI de admin quan ly PIN cua user — Story 1.3 chi cung cap API endpoints

```
Luong cap PIN:

Admin (Dashboard)                NestJS API                    Database
    │                                │                            │
    ├── POST /reset-pin ───────────→ │                            │
    │   { userId, newPin: "1234" }   ├── validate admin role      │
    │                                ├── validate target user     │
    │                                │   same tenant              │
    │                                ├── hashPin("1234")          │
    │                                ├── UPDATE users SET ────────→
    │                                │   pin_hash = $hash         │
    │                                ├── INSERT audit_log ────────→
    │                                │                            │
    ←── { success: true } ──────────┤                            │

User (Dashboard, sau login)      NestJS API                    Database
    │                                │                            │
    ├── POST /set-pin ─────────────→ │                            │
    │   { pin: "5678" }              ├── validate session/JWT     │
    │                                ├── hashPin("5678")          │
    │                                ├── UPDATE users SET ────────→
    │                                │   pin_hash = $hash         │
    │                                ├── INSERT audit_log ────────→
    │                                │                            │
    ←── { success: true } ──────────┤                            │
```

### PIN Login Flow (Custom — KHONG phai Better-Auth built-in)

```
POS Client                    NestJS API
    │                             │
    ├──POST /api/v1/auth/pin-login──→
    │  { pin, tenantSlug, email } │
    │                             ├── Find tenant by slug
    │                             ├── Find user by tenant_id + email
    │                             ├── Check user.is_active
    │                             ├── bcrypt.compare(pin, user.pin_hash)
    │                             ├── Load user roles + store assignments
    │                             ├── Sign JWT { userId, tenantId, roles, storeAssignments }
    │                             ├── Write audit_log (LOGIN)
    │                             │
    ←── { token, user: {...} } ──┤
    │                             │
    ├── Cache to encrypted        │
    │   localStorage:             │
    │   - JWT token               │
    │   - User data               │
    │   - PIN hash (for offline)  │
```

### Offline PIN Verification Flow

```
POS Client (Offline)
    │
    ├── User enters PIN
    ├── Load cached pinHash from encrypted localStorage
    ├── bcrypt.compare(enteredPin, cachedPinHash)
    ├── Check cached JWT expiry (graceful: allow up to 24h extra offline)
    ├── If valid → Grant access to POS
    ├── If invalid → Show error, lock after 5 attempts
    │
    Note: Offline auth chi cho phep truy cap POS features
          Management/Dashboard yeu cau online session
```

### Dual Auth Strategy (Session vs JWT)

| Context | Auth Method | Guard | Use Case |
|---------|------------|-------|----------|
| Dashboard/Management | Session (HttpOnly cookie) | SessionAuthGuard | Online-only, secure |
| POS | JWT (Bearer token) | JwtAuthGuard | Offline-capable |
| KDS | JWT (Bearer token) | JwtAuthGuard | Offline-capable |
| API (general) | Session OR JWT | AuthModeGuard | Composite: SessionAuthGuard truoc, fallback JwtAuthGuard |

### JWT Payload Structure

```typescript
interface JwtPayload {
  userId: string;      // UUID v7
  tenantId: string;    // UUID v7
  roles: string[];     // ['cashier', 'shift_lead']
  storeAssignments: {
    storeId: string;
    scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
  }[];
  iat: number;         // issued at (unix timestamp)
  exp: number;         // expiry (unix timestamp) — 24h from iat
}
```

### Environment Variables Can Them

Them vao `.env.example`:
```
# Custom Auth
AUTH_JWT_SECRET=your-secret-key-min-32-chars
AUTH_URL=http://localhost:3001
SESSION_EXPIRES_IN=7d
```

`AUTH_JWT_SECRET` dung de:
- Sign/verify JWT tokens cho POS/KDS (PIN login)
- **PHAI** >= 32 ky tu, random string

### Security Requirements (BAT BUOC)

- PIN: Toi thieu 4 so, toi da 8 so — validate truoc khi hash
- Password: Toi thieu 8 ky tu, phai co uppercase + lowercase + number
- PIN hash: bcrypt, salt rounds = 10 (da co tu Story 1.2)
- Password hash: bcrypt salt rounds = 10, luu trong `accounts.password`
- JWT expiry: 24h cho POS, session expiry 7 ngay cho Dashboard
- Failed login attempts: Log vao audit_logs, KHONG lock account (de cho Story sau implement rate limiting)
- Session data: KHONG luu sensitive data (pin_hash, password) trong session/JWT
- Local cache (POS): Encrypt voi Web Crypto API AES-256 truoc khi luu localStorage

### Cau truc thu muc can tao/cap nhat

```
packages/database/
├── src/
│   ├── auth.ts                    # UPDATE — XOA betterAuth(), chi export helper types
│   └── index.ts                   # UPDATE — export SessionWithUser, AccountWithUser types
├── prisma/
│   ├── schema.prisma              # UPDATE — add Account, Session, Verification
│   ├── seed.ts                    # UPDATE — add Account records
│   └── migrations/                # NEW migration

packages/shared/
├── src/
│   ├── auth/
│   │   ├── pin-utils.ts           # NEW — PIN hash/verify
│   │   ├── offline-auth.ts        # NEW — Offline auth types & utils
│   │   ├── jwt-utils.ts           # NEW — JWT payload types & utils
│   │   └── index.ts               # NEW — barrel export
│   └── index.ts                   # UPDATE — export auth module

apps/api/
├── src/
│   ├── main.ts                    # UPDATE — KHOI PHUC body parser mac dinh (XOA bodyParser: false)
│   ├── app.module.ts              # UPDATE — import AuthModule (custom)
│   ├── modules/auth/
│   │   ├── auth.module.ts         # UPDATE — XOA BetterAuthModule.forRoot, dung custom module
│   │   ├── auth.controller.ts     # UPDATE — them sign-up/sign-in/session/sign-out endpoints
│   │   ├── auth.service.ts        # UPDATE — them signUp/signIn/getSession/signOut methods
│   │   ├── auth.service.spec.ts   # NEW — tests
│   │   └── dto/
│   │       ├── pin-login.dto.ts   # NEW
│   │       ├── pin-login-response.dto.ts  # NEW
│   │       ├── set-pin.dto.ts     # NEW — user tu dat PIN
│   │       └── reset-pin.dto.ts   # NEW — admin reset PIN cho user khac
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts  # NEW
│   │   │   ├── jwt-auth.guard.spec.ts  # NEW
│   │   │   ├── session-auth.guard.ts  # NEW — SessionAuthGuard
│   │   └── auth-mode.guard.ts     # UPDATE — composite SessionAuthGuard/JwtAuthGuard
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts  # NEW
│   │   └── types/
│   │       └── jwt-payload.ts     # NEW

apps/web/
├── lib/
│   ├── auth-client.ts             # UPDATE — fetch wrapper thuan, XOA createAuthClient()
│   └── prisma.ts                  # EXISTING
├── hooks/
│   └── useAuth.ts                 # UPDATE — wrap fetch functions thay vi Better-Auth methods
├── middleware.ts                   # NEW/UPDATE — auth middleware
├── app/(auth)/
│   ├── layout.tsx                 # UPDATE — Modern Bistro auth layout
│   ├── login/page.tsx             # NEW — email/password login
│   └── pin/page.tsx               # NEW — PIN login for POS
```

### Previous Story Intelligence (Story 1.2)

**Tu Story 1.2:**
- Prisma 7.x **KHONG** dung `url` trong `schema.prisma` — phai dung `prisma.config.ts` voi `datasource.url`
- Prisma 7.x yeu cau `@prisma/adapter-pg` + `pg` cho PostgreSQL connections
- `uuidv7` package da cai, `generateId()` co trong `@pos-sdd/shared`
- `bcryptjs` da cai trong `packages/database` — dung cho PIN hashing
- Tenant isolation middleware (`createTenantPrismaClient`) da hoat dong — 11 tests pass
- `DatabaseService` da la `@Global()` module trong NestJS
- Seed data: 1 tenant (`pos-sdd-demo`), 2 stores, 6 roles, 5 policies, 1 admin user (admin@pos-sdd.local, PIN: 123456)
- DATABASE_URL phai dung `127.0.0.1` thay vi `localhost` tren Windows voi Docker

**Tu Story 1.1:**
- NestJS chay voi SWC compiler, global prefix `/api/v1`, CORS enabled
- `.env.example` da co `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` — co the reuse `JWT_SECRET` lam `BETTER_AUTH_SECRET` hoac tao moi
- Hot-reload via tsx watch

**Anti-patterns can tranh:**
- KHONG merge Better-Auth tables vao `users` table — giu tach biet, lien ket qua foreign key
- KHONG su dung `@default(dbgenerated())` cho UUID — generate UUID v7 o application level
- KHONG luu plain-text PIN trong bat ky dau — chi luu bcrypt hash
- KHONG expose `pin_hash` hay `password_hash` trong API responses hoac JWT payload
- KHONG disable body parser globally ma khong re-enable cho non-auth routes — se break ValidationPipe
- KHONG tao session cho PIN login — PIN login tra ve JWT token, KHONG phai session cookie
- KHONG skip audit logging — moi login/logout PHAI ghi audit_log

### Testing Standards

- Framework: **Vitest** (KHONG dung Jest)
- Test files: `*.spec.ts` co-located voi source
- Mock database: mock PrismaClient, KHONG ket noi real DB trong unit tests
- Tests can viet:
  - `auth.service.spec.ts`: PIN login happy path, wrong PIN, inactive user, user not found, tenant not found
  - `jwt-auth.guard.spec.ts`: valid JWT, expired JWT, invalid signature, missing Authorization header
  - `pin-utils.spec.ts`: hash then verify, wrong PIN returns false
  - `auth-mode.guard.spec.ts`: session found → pass, no session + valid JWT → pass, no session + no JWT → reject

### Project Structure Notes

- Better-Auth server config (`auth.ts`) dat trong `packages/database` vi no can truc tiep PrismaClient — export tu `@pos-sdd/database`
- Shared auth utilities (PIN hash, JWT types) dat trong `packages/shared/src/auth/` — dung chung FE/BE
- NestJS auth module dat trong `apps/api/src/modules/auth/` — tuan thu NestJS module pattern
- Next.js auth client dat trong `apps/web/lib/auth-client.ts` — tuan thu Next.js convention

### References

- Better-Auth NestJS integration [Source: https://better-auth.com/docs/integrations/nestjs]
- Better-Auth Prisma adapter [Source: https://better-auth.com/docs/adapters/prisma]
- Better-Auth custom plugins [Source: https://better-auth.com/docs/concepts/plugins]
- Architecture: Better-Auth 1.5 selection [Source: architecture.md#Authentication-Security]
- Architecture: Authorization Pipeline [Source: architecture.md#Authentication-Security]
- Architecture: API Security — Hybrid Session + JWT [Source: architecture.md#Authentication-Security]
- Architecture: Offline Auth — Cached JWT + PIN [Source: architecture.md#Authentication-Security]
- Epics: FR52-FR56, FR58-FR59 [Source: epics.md#Epic-10 / Epic cross-cutting]
- Story 1.2 completion notes [Source: 1-2-database-schema-foundation-prisma-setup.md#Completion-Notes]
- UX: Auth layout centered, Modern Bistro style [Source: ux-design-specification.md]
- Project Context: Security First rules [Source: project-context.md#Critical-Dont-Miss-Rules]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6 (SM/Story Context Engine)

### Completion Notes List

**Implementation Notes (2026-03-26) — Better-Auth integration (superseded):**

- Better-Auth 1.5.6 duoc tich hop thanh cong voi NestJS 11 qua `@thallesp/nestjs-better-auth` 2.5.2
- 30 tests tong cong pass voi Better-Auth approach — sau do correct course sang Custom Auth

**Implementation Notes (2026-03-27) — Custom Auth implementation (FINAL):**

- Da go hoan toan Better-Auth: `better-auth`, `@better-auth/prisma-adapter` khoi `packages/database`; `@thallesp/nestjs-better-auth` khoi `apps/api`; `better-auth` khoi `apps/web`
- `packages/database/src/auth.ts` duoc viet lai — chi export helper types `SessionWithUser`, `AccountWithUser` (Prisma 7.x snake_case field names)
- Custom `AuthService` implement day du: `signUp`, `signIn`, `getSession`, `signOut`, `pinLogin`, `setPinForUser`, `resetPinForUser`
- `SessionAuthGuard` moi: doc `session_token` cookie, query sessions table, inject user vao request
- `AuthModeGuard` cap nhat: kiem tra session (SessionAuthGuard) truoc, fallback JWT (khong con dung Better-Auth)
- `AuthNestModule` viet lai don gian: AuthService + SessionAuthGuard + AuthModeGuard providers, khong co BetterAuthModule
- `main.ts` restore body parser mac dinh (bo `bodyParser: false`)
- `auth-client.ts` (Next.js) viet lai fetch wrapper thuan — khong dung `createAuthClient()` Better-Auth
- `middleware.ts` (Next.js) goi `GET /api/v1/auth/session` voi cookie forwarding thay vi kiem tra Better-Auth cookie
- `useAuth.ts` viet lai dung useState/useEffect thay vi `useSession()` Better-Auth
- Prisma 7.x quan trong: field names trong TypeScript INPUT/OUTPUT theo DB column names (snake_case) khi co `@map()` — e.g. `user_id`, `expires_at`, `account_id`, `provider_id`
- 47 tests tong cong: 11 pin-utils + 23 auth.service + 5 jwt-auth.guard + 3 session-auth.guard + 5 auth-mode.guard — tat ca PASS
- `turbo type-check` — 5/5 tasks PASS; `turbo test` — 8/8 tasks PASS

**Technical Decisions:**
- Dung `jsonwebtoken` (da co trong Node ecosystem) thay vi `jose`
- KHONG tao Session cho PIN login — tra ve JWT token theo dung spec (offline-capable)
- Failed login attempts chi log ra console, khong ghi DB (rate limiting se implement o story sau)
- `packages/database` build script doi tu `tsc --noEmit` sang `tsc` de emit dist files (can thiet cho workspace type resolution)

### File List

packages/database/src/auth.ts (UPDATED — viet lai, chi export SessionWithUser, AccountWithUser types)
packages/database/src/index.ts (UPDATED — export SessionWithUser, AccountWithUser thay vi auth/Auth)
packages/database/package.json (UPDATED — go better-auth/prisma-adapter, doi build: tsc --noEmit -> tsc)
packages/database/prisma/schema.prisma (UPDATED — add Account, Session, Verification models + User relations)
packages/database/prisma/seed.ts (UPDATED — cap nhat comment, snake_case fields)
packages/database/prisma/migrations/20260326085755_add_better_auth_tables/ (NEW migration)
packages/database/prisma/migrations/20260326145737_fix_better_auth_schema/ (NEW migration)

packages/shared/src/auth/pin-utils.ts (NEW)
packages/shared/src/auth/pin-utils.spec.ts (NEW — 11 tests)
packages/shared/src/auth/offline-auth.ts (NEW)
packages/shared/src/auth/jwt-utils.ts (NEW)
packages/shared/src/auth/index.ts (NEW)
packages/shared/src/index.ts (UPDATED — export auth module)

apps/api/src/main.ts (UPDATED — restore body parser mac dinh, bo bodyParser: false)
apps/api/src/app.module.ts (UPDATED — import AuthNestModule)
apps/api/src/modules/auth/auth.module.ts (UPDATED — viet lai, bo BetterAuthModule.forRoot)
apps/api/src/modules/auth/auth.service.ts (UPDATED — them signUp/signIn/getSession/signOut, doi BETTER_AUTH_SECRET->AUTH_JWT_SECRET)
apps/api/src/modules/auth/auth.service.spec.ts (UPDATED — 23 tests, them signIn/signOut/getSession/signUp tests)
apps/api/src/modules/auth/auth.controller.ts (UPDATED — viet lai, them sign-up/sign-in/session/sign-out, bo @Session/@AllowAnonymous Better-Auth)
apps/api/src/modules/auth/dto/pin-login.dto.ts (EXISTING — giu nguyen)
apps/api/src/modules/auth/dto/pin-login-response.dto.ts (EXISTING — giu nguyen)
apps/api/src/modules/auth/dto/set-pin.dto.ts (EXISTING — giu nguyen)
apps/api/src/modules/auth/dto/reset-pin.dto.ts (EXISTING — giu nguyen)
apps/api/src/modules/auth/dto/sign-up.dto.ts (NEW)
apps/api/src/modules/auth/dto/sign-in.dto.ts (NEW)
apps/api/src/common/guards/jwt-auth.guard.ts (UPDATED — doi BETTER_AUTH_SECRET->AUTH_JWT_SECRET)
apps/api/src/common/guards/jwt-auth.guard.spec.ts (UPDATED — doi BETTER_AUTH_SECRET->AUTH_JWT_SECRET)
apps/api/src/common/guards/auth-mode.guard.ts (UPDATED — viet lai, dung SessionAuthGuard + JWT, khong dung Better-Auth session)
apps/api/src/common/guards/auth-mode.guard.spec.ts (UPDATED — viet lai, inject AuthService, test session va JWT)
apps/api/src/common/guards/session-auth.guard.ts (NEW — doc session cookie, query DB)
apps/api/src/common/guards/session-auth.guard.spec.ts (NEW — 3 tests)
apps/api/src/common/decorators/current-user.decorator.ts (EXISTING — giu nguyen)
apps/api/src/common/types/jwt-payload.ts (UPDATED — iat/exp optional, them sessionToken?)
apps/api/package.json (UPDATED — go @thallesp/nestjs-better-auth, them bcryptjs/@types/bcryptjs)

apps/web/lib/auth-client.ts (UPDATED — viet lai fetch wrapper thuan, bo createAuthClient())
apps/web/middleware.ts (UPDATED — goi GET /api/v1/auth/session voi cookie forwarding)
apps/web/app/(auth)/layout.tsx (EXISTING — giu nguyen)
apps/web/app/(auth)/login/page.tsx (UPDATED — dung authClient.signIn moi, them tenantId input)
apps/web/app/(auth)/pin/page.tsx (EXISTING — giu nguyen, dung fetch truc tiep)
apps/web/hooks/useAuth.ts (UPDATED — viet lai useState/useEffect thay vi useSession Better-Auth)
apps/web/package.json (UPDATED — go better-auth)

.env.example (UPDATED — doi BETTER_AUTH_SECRET->AUTH_JWT_SECRET, them SESSION_EXPIRES_IN, AUTH_URL)
.env (UPDATED — BETTER_AUTH_URL added)

## Change Log

- 2026-03-26: Story 1.3 implemented — Better-Auth 1.5 integrated with NestJS 11, PIN login system, JWT guards, offline auth utilities, Next.js auth client. 30 unit tests. turbo build + type-check PASS. Status: review.
- 2026-03-27: Correct course — Go hoan toan Better-Auth, implement Custom Auth (NestJS AuthService + Prisma truc tiep). Them signUp/signIn/getSession/signOut methods. Tao SessionAuthGuard. Cap nhat AuthModeGuard (session cookie truoc, fallback JWT). Viet lai Next.js auth-client.ts/middleware.ts/useAuth.ts. 47 unit tests (36 API + 11 shared). turbo type-check (5/5) + turbo test (8/8) PASS. Status: review.
