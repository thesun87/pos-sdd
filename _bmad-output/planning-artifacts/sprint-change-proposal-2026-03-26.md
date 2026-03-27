# Sprint Change Proposal — 2026-03-26

**Dự án:** pos-sdd
**Người đề xuất:** Tuan.nguyen
**Ngày:** 2026-03-26
**Scope:** Minor — Có thể thực hiện trực tiếp bởi dev team

---

## Phần 1: Tóm tắt vấn đề

**Vấn đề phát hiện:** Story 1-3 (Authentication System) đã implement xong với Better-Auth 1.5 và đang ở trạng thái **review**. Trong quá trình review, phát hiện Better-Auth tự quản lý schema DB thông qua runtime adapter và công cụ `npx auth@latest generate`, gây ra các rủi ro:

1. **Mất kiểm soát migration:** Better-Auth có thể thay đổi schema nội bộ khi update version, tạo ra migration conflict ngoài tầm kiểm soát của team.
2. **Body parser anti-pattern:** Better-Auth yêu cầu disable body parser toàn cục trong NestJS (`bodyParser: false`), sau đó phải re-enable thủ công cho từng namespace — đây là anti-pattern nguy hiểm, dễ gây lỗi validation khó debug.
3. **Dependency rủi ro:** `@thallesp/nestjs-better-auth` là package community, ít maintained, không đảm bảo tương thích dài hạn với NestJS 11.

**Phát hiện khi nào:** Trong giai đoạn review story 1-3, trước khi merge vào main.

**Quyết định:** Thay thế Better-Auth bằng **Custom Auth** (NestJS AuthService + Prisma trực tiếp) — giữ nguyên schema DB hiện tại, chỉ thay thế runtime layer.

---

## Phần 2: Phân tích impact

### Epic Impact

| Epic | Trạng thái | Impact |
|------|-----------|--------|
| **Epic 1** | in-progress | ✅ Vẫn hoàn thành được — chỉ story 1-3 bị ảnh hưởng |
| **Epic 2–10** | backlog | ✅ Không ảnh hưởng — không có epic nào import Better-Auth |

### Story Impact

| Story | Trạng thái | Impact |
|-------|-----------|--------|
| **1-1** | done | ✅ Không ảnh hưởng |
| **1-2** | done | ✅ Không ảnh hưởng |
| **1-3** | review | ⚠️ **Rewrite** — thay Better-Auth bằng Custom Auth (~40-50% rework) |
| **1-4** | backlog | 🔧 Điều chỉnh nhỏ — AC "thu hồi session" dùng custom SessionService |
| **1-5 → 1-8** | backlog | ✅ Không ảnh hưởng |

### Artifact Conflicts

| Artifact | Impact |
|----------|--------|
| **Story 1-3** (implementation-artifacts) | Rewrite — đã có proposals cụ thể |
| **architecture.md** | Cập nhật 2 dòng: Better-Auth 1.5 → Custom Auth |
| **project-context.md** | Cập nhật 1 dòng: Better-Auth 1.5 → Custom Auth |
| **epics.md** | Cập nhật mô tả Epic 1 và Story 1.3 |
| **PRD** | Không cần thay đổi — FR56 không đề cập Better-Auth cụ thể |
| **UX Design** | Không ảnh hưởng — UI login/PIN form giữ nguyên |
| **packages/database/package.json** | Gỡ: `better-auth`, `@better-auth/prisma-adapter` |
| **apps/api/package.json** | Gỡ: `@thallesp/nestjs-better-auth` |
| **apps/web/package.json** | Gỡ: `better-auth` (client) |
| **.env.example** | Đổi tên: `BETTER_AUTH_SECRET` → `AUTH_JWT_SECRET` |

### Technical Impact

- **Schema DB:** Giữ nguyên hoàn toàn — `accounts`, `sessions`, `verifications` tables không thay đổi, migrations không cần rollback
- **Code tái sử dụng:** ~50% code story 1-3 giữ nguyên (Tasks 2, 5, 7, 8: schema, PIN management, JWT guard, offline utils)
- **Body parser:** Khôi phục về NestJS default — loại bỏ anti-pattern
- **Endpoints:** Tất cả chuyển về namespace nhất quán `/api/v1/auth/*`

---

## Phần 3: Hướng đi đề xuất

**Lựa chọn:** Option 1 — Direct Adjustment (điều chỉnh trực tiếp story 1-3)

**Lý do:**
- Schema DB đã đúng, không cần rollback migration
- Phần lớn business logic (PIN, JWT, offline) đã implement và độc lập với Better-Auth
- Effort thấp-trung bình, rủi ro thấp
- Không ảnh hưởng MVP scope hay timeline đáng kể
- Giải quyết root cause triệt để: 100% kiểm soát schema và migration

**Effort ước tính:** Medium (2-3 ngày dev)
**Rủi ro:** Low — schema không đổi, chỉ thay runtime layer
**Timeline impact:** Minimal — story 1-3 chưa merge, đang ở review

---

## Phần 4: Chi tiết thay đổi

### Story 1-3: Thay đổi tiêu đề & mô tả

**CŨ:**
```
Story 1.3: Authentication System — Better-Auth & PIN Login

As a developer,
I want Better-Auth 1.5 duoc tich hop voi NestJS 11 va Next.js 16...
so that moi module sau nay co the xac thuc nguoi dung nhat quan...
```

**MỚI:**
```
Story 1.3: Authentication System — Custom Auth & PIN Login

As a nhân viên cửa hàng,
I want đăng nhập vào hệ thống bằng email/mật khẩu (Dashboard) hoặc
mã PIN (POS) qua hệ thống Custom Auth (NestJS AuthService + Prisma),
So that tôi truy cập được chức năng phù hợp với vai trò một cách
nhanh chóng và bảo mật, không phụ thuộc vào thư viện external
không kiểm soát được schema.
```

---

### Story 1-3: Thay đổi Acceptance Criteria

**AC1 CŨ:** `...user moi duoc tao trong DB (bang user, account cua Better-Auth)...`
**AC1 MỚI:** `...user moi duoc tao trong DB (bang accounts cua custom auth), lien ket voi users table qua user_id + tenant_id`

**AC2 CŨ:** `POST /api/auth/sign-in/email`
**AC2 MỚI:** `POST /api/v1/auth/sign-in`

**AC5 CŨ:** `GET /api/auth/get-session`
**AC5 MỚI:** `GET /api/v1/auth/session`

**AC6 CŨ:** `POST /api/auth/sign-out`
**AC6 MỚI:** `POST /api/v1/auth/sign-out`

**AC7 CŨ:** `Given Better-Auth da tich hop, When cac NestJS controllers su dung @Session() decorator (tu @thallesp/nestjs-better-auth)...`
**AC7 MỚI:** `Given Custom AuthService da tich hop, When cac NestJS controllers su dung @CurrentUser() decorator va SessionAuthGuard, Then user data available trong moi request, guards tu dong bao ve cac routes (KHONG con phu thuoc @thallesp/nestjs-better-auth)`

---

### Story 1-3: Thay đổi Tasks

| Task | Hành động |
|------|----------|
| Task 1 | **VIẾT LẠI** — Gỡ Better-Auth dependencies, đổi env var `BETTER_AUTH_SECRET` → `AUTH_JWT_SECRET`, khôi phục body parser |
| Task 2 | **GIỮ NGUYÊN** ✅ — Schema đúng, migrations không thay đổi |
| Task 3 | **VIẾT LẠI** — Xóa `betterAuth()` config, implement `AuthService.signIn/signUp/getSession/signOut` |
| Task 4 | **VIẾT LẠI** — Xóa `AuthModule.forRoot()` từ nestjs-better-auth, tạo `SessionAuthGuard`, khôi phục body parser |
| Task 5 | **GIỮ NGUYÊN** ✅ — set-pin, reset-pin không phụ thuộc Better-Auth |
| Task 6 | **SỬA NHỎ** — Đổi env var `BETTER_AUTH_SECRET` → `AUTH_JWT_SECRET` |
| Task 7 | **GIỮ NGUYÊN** ✅ — JwtAuthGuard, @CurrentUser(), JwtPayload types độc lập |
| Task 8 | **GIỮ NGUYÊN** ✅ — pin-utils, offline-auth, jwt-utils hoàn toàn độc lập |
| Task 9 | **VIẾT LẠI** — Xóa `createAuthClient()`, thay bằng fetch wrapper thuần cho sign-in/sign-out/session |
| Task 10 | **SỬA NHỎ** — Seed tạo Account record với bcrypt hash thủ công, không gọi Better-Auth API |
| Task 11 | **CẬP NHẬT** — Thêm tests cho signIn/signOut/SessionAuthGuard custom, cập nhật auth-mode guard tests |

---

### Story 1-3: Thay đổi Dev Notes

**XÓA toàn bộ:**
- Better-Auth server configuration pattern
- Body parser disable instructions
- `npx auth@latest generate` instructions
- Better-Auth Prisma schema notes (schema giữ nguyên nhưng không còn do Better-Auth quản lý)

**THÊM MỚI:**
- Custom AuthService pattern (signIn với session token)
- Cookie configuration (HttpOnly, secure, sameSite)
- SessionAuthGuard pattern
- auth-client.ts fetch wrapper pattern (Next.js)
- Ghi rõ: KHÔNG disable body parser, KHÔNG chạy `npx auth@latest generate`
- Env vars: `AUTH_JWT_SECRET`, `AUTH_URL`, `SESSION_EXPIRES_IN`

---

### Architecture.md: Cập nhật 2 dòng

```
Dòng 285: Better-Auth 1.5 → Custom Auth (NestJS AuthService + Prisma)
  Rationale cũ: "Plugin-based, TypeScript-first, audit logs built-in, NestJS + Next.js integration"
  Rationale mới: "Custom implementation — full schema control, no external runtime dependency,
                  body parser intact, Prisma-native session management"

Dòng 181 (Additional Requirements):
  Authentication: Better-Auth 1.5 → Custom Auth (NestJS AuthService + Prisma)
```

---

### project-context.md: Cập nhật 1 dòng

```
Dòng 23: Better-Auth 1.5 → Custom Auth (NestJS AuthService + Prisma)
```

---

### epics.md: Cập nhật mô tả

**Epic 1 description:**
`...hệ thống authentication (Better-Auth 1.5 + PIN)...`
→ `...hệ thống authentication (Custom Auth + PIN)...`

**Story 1.3 AC trong epics.md:**
`Better-Auth 1.5 xác thực thành công, trả về session cookie`
→ `Custom AuthService xác thực thành công, trả về session cookie (HttpOnly)`

---

## Phần 5: Implementation Handoff

**Scope classification:** Minor — Thực hiện trực tiếp bởi dev team

**Người thực hiện:** Developer (dev agent / Tuan.nguyen)

**Thứ tự thực hiện:**
1. Gỡ Better-Auth dependencies (packages/database, apps/api, apps/web)
2. Đổi env var `BETTER_AUTH_SECRET` → `AUTH_JWT_SECRET` trong `.env.example`
3. Viết lại `packages/database/src/auth.ts` (xóa betterAuth config)
4. Viết lại `apps/api/src/modules/auth/auth.service.ts` (thêm signIn/signUp/getSession/signOut)
5. Viết lại `apps/api/src/modules/auth/auth.module.ts` (xóa AuthModule.forRoot)
6. Tạo `SessionAuthGuard`, cập nhật `auth-mode.guard.ts`
7. Khôi phục body parser trong `main.ts`
8. Viết lại `apps/web/lib/auth-client.ts` và `hooks/useAuth.ts`
9. Cập nhật `apps/web/middleware.ts`
10. Cập nhật seed.ts
11. Cập nhật + bổ sung tests
12. Cập nhật artifacts: architecture.md, project-context.md, epics.md

**Success criteria:**
- `turbo build` pass không lỗi
- `turbo type-check` không lỗi
- Tất cả tests trong story 1-3 pass
- Đăng nhập email/password hoạt động, trả về HttpOnly session cookie
- PIN login hoạt động, trả về JWT token
- Offline PIN verification hoạt động
- Không còn package `better-auth`, `@thallesp/nestjs-better-auth` trong bất kỳ package.json nào
- Body parser mặc định hoạt động bình thường cho tất cả `/api/v1/*` routes
