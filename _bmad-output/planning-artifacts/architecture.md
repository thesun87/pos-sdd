---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - planning-artifacts/product-brief-pos-sdd-2026-03-13.md
  - planning-artifacts/prd.md
  - planning-artifacts/prd-validation-report.md
  - planning-artifacts/ux-design-specification.md
  - planning-artifacts/research/domain-Commerce-Domain-POS-cho-FnB-research-2026-03-13.md
  - docs/pos-feature-brife.md
  - design-artifacts/wireframes/wireframe-set-summary.md
  - design-artifacts/wireframes/prompts/cashier-pos-wireframes.md
  - design-artifacts/visual-design/ (6 Stitch HTML mockups - referenced)
workflowType: 'architecture'
project_name: 'pos-sdd'
user_name: 'Tuan.nguyen'
date: '2026-03-15T10:36:59+07:00'
lastStep: 8
status: 'complete'
completedAt: '2026-03-15T14:40:00+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
72 yêu cầu chức năng (FR1-FR72) phân bổ qua 9 modules MVP + cross-cutting capabilities:

| Module | FR Count | Architectural Impact |
|--------|----------|---------------------|
| Menu & Product Management | FR1-FR7 | Catalog service, offline menu cache, KDS station routing config |
| Order Processing | FR8-FR15 | Transaction core, order state machine, real-time KDS push, split/merge logic |
| Table & Floor Management | FR16-FR21 | Spatial data model, drag-drop UI state, staff assignment |
| Kitchen Display (KDS) | FR22-FR28 | WebSocket/LAN real-time, multi-screen routing, bidirectional status sync |
| Payment & Financial | FR29-FR36 | Multi-payment engine, VietQR generation, cash shift management, reconciliation |
| Inventory & Stock | FR37-FR44 | Recipe-based auto-deduction, offline inventory tracking, low-stock alert system |
| Reporting & Analytics | FR45-FR51 | Real-time dashboard (≤30s), aggregation pipeline, kitchen analytics |
| User & Access Management | FR52-FR59 | 4-layer RBAC, PIN authentication, audit log immutability, approval workflow |
| Promotion & Discount | FR60-FR67 | Rule engine, auto-apply, coupon tracking, time-based activation |
| Cross-Cutting | FR68-FR72 | Offline mode 4-24h, event sourcing sync, LAN communication, thermal print, multi-tenant isolation |

**Non-Functional Requirements:**
- Performance: POS UI ≤200ms, Local DB write ≤10ms, KDS display ≤1s, Dashboard ≤3s, 300 orders/giờ
- Security: TLS 1.2+, AES-256 local encryption, hashed PIN, 4-layer RBAC at API level, audit trail immutable ≥12 tháng
- Reliability: Cloud ≥99.5% uptime, POS 100% offline 4-24h, zero data loss, sync recovery ≤2 phút
- Scalability: ≥500 tenants, ≥2,000 stores, ≥1,000 concurrent POS sessions, ≥10,000 events/phút sync
- Hardware: ESC/POS printer (USB/BT/LAN), VietQR NAPAS, multi-device (Android 9+/Windows 10+/Chrome)

**Scale & Complexity:**
- Primary domain: Full-stack SaaS (Hybrid Offline-First POS + Cloud Management Platform)
- Complexity level: Medium-High
- Estimated architectural components: 15-20 (services, modules, shared libraries)

### Technical Constraints & Dependencies

| Constraint | Detail | Architectural Impact |
|------------|--------|---------------------|
| Offline-First Transaction Layer | POS/KDS phải hoạt động hoàn toàn offline 4-24h | Local DB (IndexedDB/SQLite), Event Sourcing, Write-Ahead Log |
| Low-Bandwidth Sync | Delta sync only, tối ưu cho 4G/wifi yếu | CRDT cho inventory, append-only event log cho orders |
| Multi-Device Support | Tablet (Android/iPad), Desktop, Smart TV | Cross-platform web app (Chromium-based), responsive touch-optimized |
| Print Integration | ESC/POS thermal printer (USB/BT/Network) | Print service abstraction, offline print queue |
| Real-time Communication | WebSocket (online) + LAN (offline) cho POS↔KDS↔Dashboard | Dual communication layer, graceful fallback |
| Vietnam Market Specific | VietQR (NAPAS), Nghị định 123/2020 (e-Invoice), localization | VN payment standards, Vietnamese UI, compliance-ready architecture |
| Tech Stack (from UX) | Next.js/React + Tailwind + Shadcn UI | React ecosystem, SSR for management, SPA for POS |
| Greenfield Project | Xây dựng hoàn toàn mới, không legacy constraints | Freedom to choose optimal architecture from scratch |

### Cross-Cutting Concerns Identified

| Concern | Affected Modules | Architectural Approach Required |
|---------|-----------------|-------------------------------|
| **Offline Data Persistence** | POS, KDS, Payment, Inventory, Print | Local database layer, sync engine, conflict resolution strategy |
| **Real-time Event Broadcasting** | Order→KDS, Status→POS, Metrics→Dashboard | Event bus (WebSocket online, LAN offline), pub/sub pattern |
| **Multi-Tenant Data Isolation** | All modules | tenant_id + store_id scoping, row-level security, API-level enforcement |
| **Audit Trail (Immutable)** | Payment, User, Order (void/cancel/discount) | Append-only audit log, ≥12 month retention |
| **4-Layer Authorization** | All user actions | RBAC → Store Scope → Limit Rules → Approval Override pipeline |
| **Thermal Printing** | Receipt, Kitchen ticket, Reports | Print service abstraction across USB/BT/Network |
| **Localization (VN)** | UI, Currency, Date/Time, Invoice | Vietnamese-first, VND currency, DD/MM/YYYY format |
| **Error Handling & Recovery** | Offline→Online transition, Print failures, Sync conflicts | Graceful degradation, retry strategies, user-friendly error states |

### UX Architecture Implications

Từ UX Design Specification và Wireframe/Visual Design:
- **Design Direction:** "The Modern Bistro" — Light mode, Glassmorphism, rounded corners (16px+)
- **Tech Stack:** Next.js/React + Tailwind CSS + Shadcn UI
- **Multi-view Architecture:** POS (2-column touch), KDS (grid landscape), Dashboard (mobile-first 1-column), Management Portal (desktop data grid)
- **Custom Components Required:** Snap-Order Card, KDS Ticket, Visual Floor Plan, Table Widget, Reconciliation Grid, Multi-branch Chart
- **Animation Framework:** Framer Motion cho micro-interactions
- **Responsive Strategy:** Device-specific optimization (không phải responsive chung)

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack SaaS** — Kết hợp Web App (POS/KDS chạy trên Chromium) + Cloud Platform (Dashboard/Management). Yêu cầu offline-first, real-time communication, và multi-tenant architecture → cần monorepo với frontend và backend riêng biệt, chia sẻ types và utilities.

### Starter Options Đã Xem Xét

| Option | Pros | Cons | Verdict |
|--------|------|------|---------||
| **T3 Stack (create-t3-app 7.40)** | Type-safe, setup nhanh, tích hợp tRPC/Next.js mượt mà | Single project, thiếu backend chuyên biệt cho WebSocket và Sync Engine | ❌ Thiếu tách biệt backend |
| **Next.js 16 standalone** | Đơn giản nhất, API Routes tích hợp sẵn | Không thích hợp xử lý concurrency cao cho offline sync engine và hardware integration | ❌ Quá đơn giản |
| **Turborepo + Next.js 16 + NestJS 11** | Enterprise-grade, tách biệt rõ ràng, dễ chia sẻ packages/types | Setup ban đầu phức tạp hơn (CI/CD, monorepo config) | ✅ **Được chọn** |

### Selected Starter: Turborepo Monorepo + Next.js 16 + NestJS 11

**Rationale for Selection:**
Hệ thống pos-sdd có độ phức tạp trung bình-cao với các yêu cầu đặc thù như Offline-First Data Sync, Real-time KDS (WebSocket), và Multi-tenant SaaS. Việc sử dụng Next.js cho toàn bộ Frontend (App Router, Turbopack) và NestJS cho Backend chuyên biệt mang lại khả năng mở rộng (scalability) tốt nhất. Turborepo orchestration giúp chia sẻ Prisma schema, TypeScript types, và Shadcn UI components dễ dàng. Better-Auth 1.5 hỗ trợ tích hợp sâu cho cả 2 framework này.

**Initialization Command:**

```bash
npx create-turbo@latest pos-sdd --use-pnpm
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 6.0+ — End-to-end type safety
- Node.js 24 LTS (v24.12.0) — ESM by default
- SWC compiler — Default trong cả Next.js 16 (Turbopack) và NestJS 11

**Styling Solution:**
- Tailwind CSS v4 — Utility-first, tree-shakeable
- Shadcn UI — Headless components với full ownership
- Framer Motion — Micro-animations (Modern Bistro style)

**Database & ORM:**
- PostgreSQL — Primary database
- Prisma 7.x — TypeScript engine (không còn Rust), TypedSQL support
- Shared `packages/database` — Schema và client dùng chung giữa Next.js và NestJS

**Build Tooling:**
- Turborepo 2.x — Monorepo orchestration, remote caching, task pipelines
- pnpm — Efficient dependency management
- Turbopack — Default bundler cho Next.js 16
- SWC — Default compiler cho NestJS 11

**Authentication:**
- Better-Auth 1.5 — Plugin-based, TypeScript-first
- OAuth 2.1 Provider Plugin — Sẵn sàng cho enterprise SSO
- Audit logs built-in — Phù hợp yêu cầu audit trail của pos-sdd
- PIN-based auth — Custom implementation cho POS offline

**Testing Framework:**
- Vitest — Default cho NestJS 11 (thay Jest)
- React Testing Library — Component testing
- Playwright — E2E testing

**Code Organization:**

```
pos-sdd/
├── apps/
│   ├── web/                    # Next.js 16 App Router
│   │   ├── app/
│   │   │   ├── (pos)/          # POS Cashier views
│   │   │   ├── (kds)/          # Kitchen Display
│   │   │   ├── (dashboard)/    # Manager Dashboard (mobile-first)
│   │   │   ├── (management)/   # Management Portal (desktop)
│   │   │   └── (auth)/         # Authentication pages
│   │   ├── components/         # App-specific components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Client-side utilities
│   │   └── public/
│   │
│   └── api/                    # NestJS 11
│       ├── src/
│       │   ├── modules/
│       │   │   ├── order/      # Order management
│       │   │   ├── menu/       # Menu & catalog
│       │   │   ├── kitchen/    # KDS & production
│       │   │   ├── payment/    # Payment processing
│       │   │   ├── inventory/  # Stock management
│       │   │   ├── reporting/  # Analytics & dashboard
│       │   │   ├── user/       # User & RBAC
│       │   │   ├── promotion/  # Promotion engine
│       │   │   ├── table/      # Table management
│       │   │   └── sync/       # Offline sync engine
│       │   ├── common/         # Guards, interceptors, filters
│       │   ├── config/         # App configuration
│       │   └── gateway/        # WebSocket gateway
│       └── test/
│
├── packages/
│   ├── shared/                 # @pos-sdd/shared
│   │   ├── types/              # Shared TypeScript types
│   │   ├── constants/          # Business constants (roles, limits)
│   │   ├── validators/         # Zod schemas
│   │   └── utils/              # Shared utilities
│   │
│   ├── database/               # @pos-sdd/database
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # Migration history
│   │   └── src/                # Prisma client exports
│   │
│   ├── ui/                     # @pos-sdd/ui
│   │   ├── components/         # Shared Shadcn UI components
│   │   └── styles/             # Design tokens, theme
│   │
│   └── config/                 # @pos-sdd/config
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Development Experience:**
- Hot reload — Turbopack (Next.js) + SWC (NestJS)
- Prisma Studio — Visual database browser
- Remote caching — Turborepo cache giữa CI/CD và local
- Biome hoặc ESLint — Linting & formatting

**Deployment Strategy:**
- **Phase 1 (MVP):** Vercel (Next.js) + Railway/Render (NestJS + PostgreSQL)
- **Phase 2 (Scale):** Docker + self-hosted (VPS/Cloud) khi hệ thống phát triển lớn
- **Database:** PostgreSQL managed (Supabase/Neon with connection pooler) → Self-hosted khi cần

### Trade-offs & Mitigations (Party Mode Review)

Đánh giá bởi Architect, Dev, và PM:

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| **Initial Setup Complexity** | Sprint 1 tốn effort cấu hình monorepo, CI/CD, shared packages | Coi đây là Sprint 0 (Foundation Sprint), tập trung hoàn toàn vào infrastructure |
| **Connection Pooling (Serverless)** | Prisma + Vercel (Serverless) dễ nghẽn connection tới PostgreSQL | Dùng PgBouncer hoặc Managed DB pooler (Neon/Supabase) |
| **Authentication Cross-Domain** | Better-Auth cần xử lý session cookie giữa App và API trên 2 subdomain | Cấu hình shared domain cookie (`*.pos-sdd.com`) hoặc JWT token strategy |
| **Offline Sync Architecture** | Prisma PostgreSQL chỉ là Cloud DB, Frontend cần local DB riêng | Thiết kế Sync Engine layer: IndexedDB (Web) ↔ NestJS Sync Module ↔ Prisma PostgreSQL |

**Note:** Project initialization using this Turborepo setup should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Local Database: SQLite (OPFS + wa-sqlite) cho offline-first
- Sync Protocol: Hybrid Event Sourcing + Last-Write-Wins + CRDT
- Authorization: NestJS Guards Pipeline + DB-driven Policy Service
- Real-time Communication: Socket.IO (online) + LAN WebSocket (offline)
- Multi-tenant Isolation: Application-level via Prisma middleware

**Important Decisions (Shape Architecture):**
- State Management: Zustand (client) + TanStack Query (server)
- API Pattern: REST + Swagger auto-generation
- Offline Auth: Cached JWT + PIN local verification
- Performance: Code splitting + Service Worker + Web Workers

**Deferred Decisions (Post-MVP → Phase 2):**
- OpenTelemetry full observability
- PostgreSQL RLS (second isolation layer)
- Secret management (Vault/Infisical)
- Docker production build for self-hosted

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|----------|
| **Data Modeling** | Schema-first (Prisma) | Prisma 7.x | Greenfield project, Prisma TypedSQL hỗ trợ tốt |
| **Data Validation** | Hybrid: Zod (shared) + class-validator (NestJS) | Zod 3.x | Zod schemas trong `packages/shared/validators` dùng chung FE/BE, class-validator cho NestJS DTO layer |
| **Server Caching** | Redis | Redis 7.x | In-memory cache cho sessions, menu data, promotion rules, policy cache |
| **Local Database (Offline)** | SQLite via OPFS + wa-sqlite | wa-sqlite latest | SQL compatible giúp sync logic với PostgreSQL dễ dàng, OPFS cho persistent storage trên browser |
| **Migration Approach** | Prisma Migrate (schema-first) | Built-in Prisma 7 | Auto-generate migrations từ schema changes |

**Data Flow Architecture:**
```
[Browser/POS]                    [Cloud]
SQLite (wa-sqlite/OPFS)  ←→  NestJS Sync Module  ←→  PostgreSQL (Prisma)
       ↑                              ↑                       ↑
  TanStack Query              Socket.IO Gateway         Redis Cache
  + Zustand Store
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|----------|
| **Identity Provider** | Better-Auth 1.5 | Plugin-based, TypeScript-first, audit logs built-in, NestJS + Next.js integration |
| **Authorization Pattern** | NestJS Guards Pipeline + Policy Service (DB-driven) | Custom design by Tuan — 4-layer pipeline đọc rules từ database |
| **POS Offline Auth** | Cached JWT + PIN verification local | Cache JWT khi online, PIN verify against bcrypt hash trong SQLite khi offline |
| **API Security** | Hybrid: Session (Web) + JWT (POS/KDS) | Session-based cho Dashboard/Management (secure), JWT cho POS/KDS (offline-capable) |
| **Data Encryption (Local)** | Web Crypto API (AES-256) | Native browser API, encrypt sensitive fields (payment data, PIN hash) trước khi lưu SQLite |

**Authorization Pipeline Architecture:**
```
Request
   │
AuthGuard (verify JWT/session)
   │
PolicyLoaderInterceptor ← Load ALL policies 1 lần, gắn vào request context
   │
RoleGuard ← đọc từ request.policies
   │
StoreScopeGuard ← đọc từ request.policies
   │
LimitGuard ← đọc từ request.policies
   │
ApprovalGuard ← đọc từ request.policies
   │
Controller
```

**Policy Table Schema:**
```
policy {
  id         String
  role       String    // cashier, manager, owner
  action     String    // discount, void, refund
  resource   String    // order, order_item, payment
  limit      Decimal?  // 20 (%), 500000 (VND)
  override   String?   // manager, owner (role có quyền override)
  conditions Json?     // Complex rules (future)
  tenant_id  String
  store_id   String?
}
```

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|----------|
| **API Design** | REST (NestJS Controllers) | Standard, Swagger/OpenAPI auto-gen, dễ tích hợp third-party (payment gateway, delivery platform) |
| **API Documentation** | @nestjs/swagger auto-generate | Zero effort, luôn sync với code từ DTOs và decorators |
| **Error Handling** | NestJS Exception Filters + RFC 7807 format | Thống nhất `{ type, title, status, detail, errorCode }`, errorCode cho frontend handle specific errors |
| **Real-time (Online)** | Socket.IO via NestJS Gateway | Mature, auto-reconnect, room-based (per store), fallback polling |
| **Real-time (Offline/LAN)** | mDNS/Bonjour discovery + direct WebSocket | POS và KDS trên cùng LAN, mDNS auto-discovery, direct WS không qua server |

**Sync Protocol (Hybrid):**

| Data Type | Strategy | Rationale |
|-----------|----------|----------|
| **Orders, Payments, Audit logs** | Event Sourcing (append-only) | Không bao giờ mất data, server replay theo sequence number |
| **Menu, Settings, Promotions** | Last-Write-Wins (server → client) | Server là source of truth, client pull & overwrite local |
| **Inventory counters** | CRDT (G-Counter / PN-Counter) | Nhiều POS trừ kho đồng thời, tự merge không conflict |

**Sync Flow:**
```
[POS Offline]                         [NestJS Sync Module]
SQLite Event Log  ──push events──→   Validate → Apply to PostgreSQL
                  ←──ack + seq──      Return confirmed sequence

SQLite Menu Cache ←──pull changes──  Query changes since last_sync_at
                  ──ack──→           Mark as synced

SQLite Inventory  ──push CRDT──→     Merge CRDT state
                  ←──merged state──  Return merged counters
```

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|----------|
| **State Management** | Zustand (client/UI state) + TanStack Query (server state) | Tách biệt rõ ràng, Zustand luôn hoạt động offline, TanStack Query smart cache/refetch |
| **Routing** | Next.js Route Groups: `(pos)/`, `(kds)/`, `(dashboard)/`, `(management)/` | 1 app, 4 layouts riêng biệt, ít deploy complexity hơn multi-app |
| **Form Handling** | React Hook Form + Zod | Uncontrolled forms (performance), Zod schemas reuse từ `packages/shared/validators` |
| **Offline Data Layer** | TanStack Query + custom SQLite adapter | Khi offline đọc từ SQLite, khi online smart refetch. Đồng nhất API cho developer |
| **Performance** | Code splitting + Service Worker + Web Workers | SW cache critical POS assets, Web Worker chạy sync engine + SQLite để không block UI (≤200ms) |

**Frontend Architecture Diagram:**
```
┌─────────────────────────────────────────────┐
│                 Next.js App                  │
│  ┌──────────┐ ┌──────┐ ┌─────────┐ ┌──────┐│
│  │  (pos)/   │ │(kds)/│ │(dashboard)│ │(mgmt)││
│  │Touch-opt  │ │Grid  │ │Mobile-1st │ │Desktop││
│  └────┬──────┘ └──┬───┘ └────┬──────┘ └──┬───┘│
│       └───────────┴──────────┴───────────┘    │
│                      │                        │
│  ┌───────────┐  ┌────────────┐                │
│  │  Zustand   │  │ TanStack   │                │
│  │(UI State)  │  │  Query     │                │
│  └─────┬─────┘  └─────┬──────┘                │
│        │               │                      │
│  ┌─────┴───────────────┴──────┐               │
│  │   SQLite Adapter (wa-sqlite)│               │
│  └─────────────┬──────────────┘               │
│           [Web Worker]                        │
│      Sync Engine + SQLite Ops                 │
└──────────────────┬────────────────────────────┘
                   │ Socket.IO / LAN WebSocket
              [NestJS API]
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|----------|
| **CI/CD** | Vercel (auto-deploy Next.js) + GitHub Actions (NestJS tests/deploy) | Zero config frontend deploy, GitHub Actions cho backend pipeline |
| **Environment Config** | `.env` files (dev) + Platform env vars (production) | `@nestjs/config` cho NestJS, Vercel/Railway env vars cho prod. Phase 2: Vault/Infisical |
| **Error Monitoring** | Sentry (errors FE+BE) + NestJS ConsoleLogger JSON (logs) | Sentry free tier, NestJS 11 native JSON logging. Phase 2: OpenTelemetry |
| **Container Strategy** | Docker Compose local only (PostgreSQL + Redis) | Dev environment consistency. Prod Phase 1: managed services. Phase 2: Docker NestJS |
| **Multi-Tenant Isolation** | Prisma middleware (application-level) | Auto inject `WHERE tenant_id = ?`. Phase 2: thêm PostgreSQL RLS |
| **Uptime Monitoring** | Better Uptime / UptimeRobot | Free tier, alert khi service down |

**Deployment Architecture:**
```
Phase 1 (MVP):
┌──────────┐     ┌───────────┐     ┌──────────────┐
│  Vercel   │────│ Railway /  │────│  Managed DB   │
│ (Next.js) │    │  Render    │    │ (PostgreSQL + │
│           │    │ (NestJS)   │    │  Redis)       │
└──────────┘     └───────────┘     └──────────────┘

Phase 2 (Scale):
┌──────────┐     ┌───────────┐     ┌──────────────┐
│  VPS /    │────│  Docker    │────│  Self-hosted  │
│  Cloud    │    │ (NestJS +  │    │  PostgreSQL + │
│ (Next.js) │    │  Workers)  │    │  Redis        │
└──────────┘     └───────────┘     └──────────────┘
```

### Decision Impact Analysis

**Implementation Sequence (Recommended Order):**
1. Turborepo + monorepo setup (Sprint 0)
2. PostgreSQL + Prisma schema + Better-Auth (Foundation)
3. NestJS modules + REST API + Swagger (Core Backend)
4. Policy Service + Guards Pipeline (Authorization)
5. Next.js Route Groups + Zustand + TanStack Query (Core Frontend)
6. SQLite (wa-sqlite) + Sync Engine trên Web Worker (Offline Layer)
7. Socket.IO Gateway + LAN fallback (Real-time)
8. Redis caching + Service Worker (Performance)
9. Sentry + CI/CD pipeline (Observability)

**Cross-Component Dependencies:**
- SQLite adapter phụ thuộc vào Prisma schema (cần sync structure)
- Policy Service phụ thuộc vào Better-Auth (user identity)
- Sync Engine phụ thuộc vào cả SQLite (local) và NestJS API (remote)
- Socket.IO Gateway phụ thuộc vào Policy Service (authorization cho WebSocket events)
- TanStack Query SQLite adapter phụ thuộc vào Web Worker setup

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**32 conflict points identified** — Các vùng mà AI agents có thể implement khác nhau nếu không quy ước.

### Naming Patterns

**Database Naming Conventions:**

| Rule | Convention | Example |
|------|-----------|--------|
| Tables | snake_case, **plural** | `orders`, `order_items`, `menu_categories` |
| Columns | snake_case | `tenant_id`, `created_at`, `unit_price` |
| Foreign keys | `{referenced_table_singular}_id` | `order_id`, `store_id`, `category_id` |
| Indexes | `idx_{table}_{columns}` | `idx_orders_tenant_id`, `idx_order_items_order_id` |
| Enums | PascalCase (Prisma) | `OrderStatus`, `PaymentMethod` |
| Boolean columns | `is_` or `has_` prefix | `is_active`, `has_modifier` |

**API Naming Conventions:**

| Rule | Convention | Example |
|------|-----------|--------|
| Endpoints | `/api/v1/{resource}` **plural**, kebab-case | `/api/v1/orders`, `/api/v1/menu-categories` |
| Route params | `:id` format | `/api/v1/orders/:id` |
| Query params | camelCase | `?storeId=123&startDate=2026-01-01` |
| Nested resources | Max 2 levels | `/api/v1/orders/:id/items` |
| Actions | POST with verb | `POST /api/v1/orders/:id/void` |

**Code Naming Conventions:**

| Rule | Convention | Example |
|------|-----------|--------|
| Files (React components) | PascalCase `.tsx` | `OrderCard.tsx`, `KdsTicket.tsx` |
| Files (utilities) | camelCase `.ts` | `formatCurrency.ts`, `syncEngine.ts` |
| Files (NestJS) | kebab-case `.ts` | `order.service.ts`, `order.controller.ts` |
| React components | PascalCase | `OrderCard`, `FloorPlanWidget` |
| Functions/variables | camelCase | `getActiveOrders()`, `totalAmount` |
| Constants | UPPER_SNAKE_CASE | `MAX_DISCOUNT_PERCENT`, `ORDER_STATUS` |
| Types/Interfaces | PascalCase | `Order`, `CreateOrderDto` |
| Zustand stores | `use` + Name + `Store` | `useCartStore`, `useKdsStore` |
| Custom hooks | `use` + descriptive name | `useOfflineSync`, `useFloorPlan` |

### Structure Patterns

**Test Location:** Co-located — `*.spec.ts` (NestJS) / `*.test.tsx` (React) cùng folder với source:
```
modules/order/
├── order.service.ts
├── order.service.spec.ts    ← co-located
├── order.controller.ts
└── order.controller.spec.ts
```

**Component Organization:** Feature-based:
```
components/
├── order/
│   ├── OrderCard.tsx
│   ├── OrderCard.test.tsx
│   ├── OrderList.tsx
│   └── index.ts          ← barrel export
├── kds/
│   ├── KdsTicket.tsx
│   └── KdsGrid.tsx
```

**NestJS Module Structure:**
```
modules/order/
├── dto/
│   ├── create-order.dto.ts
│   └── update-order.dto.ts
├── entities/
│   └── order.entity.ts
├── order.controller.ts
├── order.service.ts
├── order.module.ts
└── order.gateway.ts        ← WebSocket (nếu cần)
```

### Format Patterns

**API Response Format (Success):**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**API Response Format (Single Item):**
```json
{
  "data": { "orderId": "abc-123", "totalAmount": 150000 }
}
```

**API Error Format (RFC 7807):**
```json
{
  "type": "https://pos-sdd.com/errors/order-limit-exceeded",
  "title": "Order Limit Exceeded",
  "status": 403,
  "detail": "Discount 25% exceeds your limit of 20%",
  "errorCode": "ORDER_LIMIT_EXCEEDED",
  "timestamp": "2026-03-15T14:00:00+07:00"
}
```

**Data Exchange Rules:**
- JSON fields: camelCase (Prisma auto-convert từ snake_case DB)
- Dates: ISO 8601 strings trong API (`2026-03-15T14:00:00+07:00`), VN format trong UI (`15/03/2026 14:00`)
- Currency: Integer (VND không có decimal) → `150000` không phải `150000.00`
- Null handling: Trả `null` rõ ràng, không omit field
- IDs: UUID v7 (time-sortable) cho primary keys

### Communication Patterns

**Socket.IO Event Naming:** `{domain}:{action}` format, lowercase:
```
order:created, order:updated, order:status-changed
kds:ticket-bumped, kds:priority-changed
sync:push, sync:pull, sync:conflict
store:settings-updated
```

**Event Payload Standard:**
```json
{
  "event": "order:created",
  "data": { "orderId": "...", "items": [...] },
  "meta": {
    "tenantId": "...",
    "storeId": "...",
    "timestamp": "2026-03-15T14:00:00+07:00",
    "userId": "...",
    "version": 1
  }
}
```

**Zustand Store Pattern:**
```typescript
// State + Actions tách biệt, immutable updates
interface CartState {
  items: CartItem[];              // state
  addItem: (item: CartItem) => void;   // actions
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
}));
```

**TanStack Query Key Convention:** Array format, hierarchical:
```typescript
// [domain, action, ...params]
queryKey: ['orders', 'list', { storeId, status }]
queryKey: ['orders', 'detail', orderId]
queryKey: ['menu', 'categories', storeId]
queryKey: ['inventory', 'stock', { storeId, categoryId }]
```

### Process Patterns

**Error Handling:**
- Backend: NestJS Exception Filters catch all → log to Sentry → return RFC 7807
- Frontend: React Error Boundaries per route group, toast notification cho user errors
- Offline: Queue failed operations in SQLite, retry khi reconnect (exponential backoff)
- Validation errors: Return `422` with field-level error details

**Loading States:**
- Global loading: Zustand `isLoading` flag per store
- Server state: TanStack Query `isLoading`, `isFetching`, `isError` built-in
- UI rendering: Shadcn UI Skeleton components cho loading placeholders
- Optimistic updates: TanStack Query `onMutate` + rollback on error

**Validation Timing:**
- Frontend: `onBlur` validation (React Hook Form), submit-time full validation
- Backend: DTO validation (class-validator) at Controller → business rules at Service
- Shared: Zod schemas from `packages/shared/validators` used by both layers

**Logging Levels:**
- `error`: Unrecoverable failures, exceptions → Sentry alert
- `warn`: Recoverable issues, degraded performance → log only
- `info`: Business events (order created, payment processed) → structured JSON
- `debug`: Development only, stripped in production

### Enforcement Guidelines

**All AI Agents MUST:**
1. Đọc và tuân thủ `architecture.md` trước khi implement bất kỳ feature nào
2. Sử dụng Zod schemas từ `packages/shared/validators` — KHÔNG tạo validation riêng
3. Tuân thủ naming conventions (DB snake_case, API camelCase, files theo quy tắc)
4. Sử dụng error format RFC 7807 — KHÔNG tự tạo format khác
5. Co-locate tests — KHÔNG tạo thư mục `__tests__` riêng biệt
6. Feature-based component organization — KHÔNG group by type
7. Dùng UUID v7 cho primary keys — KHÔNG dùng auto-increment hoặc UUID v4
8. Currency luôn là integer (VND) — KHÔNG dùng float/decimal

**Pattern Verification:**
- ESLint rules enforce naming conventions
- Prisma schema validation enforce DB naming
- PR review checklist includes pattern compliance
- CI pipeline runs lint + type check trước khi merge

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pos-sdd/
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint + Type check + Test (all apps)
│       └── deploy-api.yml              # Build & deploy NestJS to Railway
│
├── apps/
│   ├── web/                            # Next.js 16 App Router
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout (fonts, providers)
│   │   │   ├── globals.css             # Tailwind CSS imports
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.tsx          # Auth layout (centered, minimal)
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── pin/page.tsx        # PIN entry for POS
│   │   │   ├── (pos)/
│   │   │   │   ├── layout.tsx          # POS layout (2-column, touch-opt)
│   │   │   │   ├── page.tsx            # Main POS screen
│   │   │   │   ├── floor-plan/page.tsx # Visual floor plan
│   │   │   │   └── shift/page.tsx      # Cash shift management
│   │   │   ├── (kds)/
│   │   │   │   ├── layout.tsx          # KDS layout (grid, landscape)
│   │   │   │   └── page.tsx            # Kitchen Display tickets
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx          # Dashboard layout (mobile-first)
│   │   │   │   ├── page.tsx            # Dashboard overview
│   │   │   │   ├── sales/page.tsx
│   │   │   │   ├── kitchen/page.tsx
│   │   │   │   └── inventory/page.tsx
│   │   │   └── (management)/
│   │   │       ├── layout.tsx          # Management layout (desktop sidebar)
│   │   │       ├── menu/page.tsx       # Menu management
│   │   │       ├── products/page.tsx
│   │   │       ├── inventory/page.tsx
│   │   │       ├── staff/page.tsx
│   │   │       ├── promotions/page.tsx
│   │   │       ├── stores/page.tsx     # Multi-store management
│   │   │       ├── reports/page.tsx
│   │   │       ├── reconciliation/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── components/
│   │   │   ├── order/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── cart/
│   │   │   │   ├── CartPanel.tsx
│   │   │   │   └── index.ts
│   │   │   ├── kds/
│   │   │   │   ├── KdsTicket.tsx
│   │   │   │   └── index.ts
│   │   │   ├── floor-plan/
│   │   │   │   ├── FloorPlanCanvas.tsx
│   │   │   │   └── index.ts
│   │   │   ├── menu/
│   │   │   │   ├── MenuItemCard.tsx
│   │   │   │   └── index.ts
│   │   │   └── common/
│   │   │       ├── OfflineIndicator.tsx
│   │   │       └── index.ts
│   │   ├── hooks/
│   │   │   ├── useOfflineSync.ts
│   │   │   ├── useLocalDb.ts
│   │   │   └── usePolicies.ts
│   │   ├── lib/
│   │   │   ├── auth-client.ts          # Better-Auth client setup
│   │   │   ├── api-client.ts           # REST API client
│   │   │   ├── socket-client.ts        # Socket.IO client
│   │   │   └── query-client.ts         # TanStack Query config
│   │   ├── stores/
│   │   │   ├── useCartStore.ts         # Zustand
│   │   │   ├── useKdsStore.ts          # Zustand
│   │   │   └── useOfflineStore.ts      # Zustand
│   │   ├── workers/
│   │   │   ├── sync.worker.ts          # Web Worker
│   │   │   └── sqlite.worker.ts        # Web Worker
│   │   ├── middleware.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                            # NestJS 11
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── filters/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── order/
│       │   │   ├── menu/
│       │   │   ├── kitchen/
│       │   │   ├── payment/
│       │   │   ├── inventory/
│       │   │   ├── user/
│       │   │   ├── policy/                # Policy Service
│       │   │   └── sync/                  # Sync Engine
│       │   └── gateway/
│       │       └── events.gateway.ts      # Socket.IO
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                         # @pos-sdd/shared
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   └── validators/            # Zod schemas
│   │   └── package.json
│   │
│   ├── database/                       # @pos-sdd/database
│   │   ├── prisma/
│   │   │   └── schema.prisma           # Shared schema
│   │   ├── src/
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── ui/                             # @pos-sdd/ui
│   │   ├── src/
│   │   │   ├── components/             # Shadcn UI
│   │   │   └── tokens/                 # Design tokens
│   │   └── package.json
│   │
│   └── config/                         # @pos-sdd/config
│       ├── eslint/
│       └── typescript/
│
├── docker-compose.yml                  # PostgreSQL + Redis (dev)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Architectural Boundaries

**API Boundary:** `apps/api` exposes REST endpoints `/api/v1/*` + Socket.IO gateway. Frontend NEVER accesses DB trực tiếp.

**Data Boundary:** `packages/database` chứa Prisma schema duy nhất. Cả web và api import từ `@pos-sdd/database`.

**Validation Boundary:** `packages/shared/validators` chứa Zod schemas dùng chung FE/BE.

**UI Boundary:** `packages/ui` chứa design system components (Shadcn). App-specific components nằm trong `apps/web/components/`.

### Requirements to Structure Mapping

| Module (PRD) | Backend (NestJS) | Frontend (Next.js) | Shared |
|--------------|-----------------|-------------------|--------|
| **Menu & Product (FR1-FR7)** | `modules/menu/` | `(management)/menu/`, `components/menu/` | `validators/menu.schema.ts` |
| **Order Processing (FR8-FR15)** | `modules/order/` | `(pos)/page.tsx`, `components/order/` | `validators/order.schema.ts` |
| **Table & Floor (FR16-FR21)** | `modules/table/` | `(pos)/floor-plan/`, `components/floor-plan/` | `types/table.types.ts` |
| **KDS (FR22-FR28)** | `modules/kitchen/` | `(kds)/page.tsx`, `components/kds/` | `types/kitchen.types.ts` |
| **Payment (FR29-FR36)** | `modules/payment/` | `components/cart/PaymentModal.tsx` | `types/payment.types.ts` |
| **Inventory (FR37-FR44)** | `modules/inventory/` | `(management)/inventory/` | `types/inventory.types.ts` |
| **Reporting (FR45-FR51)** | `modules/reporting/` | `(dashboard)/` | `types/reporting.types.ts` |
| **User & RBAC (FR52-FR59)** | `modules/user/`, `modules/policy/` | `(management)/staff/`, `(auth)/` | `types/policy.types.ts` |
| **Promotion (FR60-FR67)** | `modules/promotion/` | `(management)/promotions/` | `types/promotion.types.ts` |
| **Offline & Sync (FR68-FR72)** | `modules/sync/`, `gateway/` | `workers/`, `hooks/useOfflineSync.ts` | `types/sync.types.ts` |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Tất cả các lựa chọn công nghệ (Next.js 16, NestJS 11, Turborepo 2.x, Prisma 7) đều tương thích hoàn toàn. Sự lựa chọn Node.js 24 (LTS) đảm bảo hỗ trợ ESM và hiệu suất cao nhất.

**Pattern Consistency:**
Các quy tắc đặt tên (naming conventions) và cấu trúc thư mục feature-based hoàn toàn phù hợp với triết lý của monorepo và micro-services-like architecture trong NestJS.

**Structure Alignment:**
Cấu trúc Turborepo chia nhỏ logic vào các `packages/shared` và `packages/database` đảm bảo tính "Single Source of Truth", giảm thiểu duplication code.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
Mọi feature chính (POS, KDS, Dashboard, Manangement) đều được ánh xạ vào cấu trúc thư mục và có công nghệ nền tảng hỗ trợ (Next.js layout groups).

**Functional Requirements Coverage:**
Toàn bộ 72 FRs được bao phủ bởi các module trong NestJS và App Router của Next.js. Các yêu cầu offline và lan-fallback được xử lý bởi Sync Engine và Socket.IO/mDNS.

**Non-Functional Requirements Coverage:**
- Performance: Phân vùng Web Worker cho SQLite/Sync giúp giữ UI mượt mà.
- Security: Kiến trúc Custom Guards Pipeline + Policy Service bao phủ 4-layer RBAC.
- Reliability: Offline-first với SQLite/Event-Sourcing đảm bảo zero data loss.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Tất cả quyết định then chốt (Data, Auth, API, Frontend, Infrastructure) đều đã có version và rationale cụ thể.

**Structure Completeness:**
Bản đồ thư mục (Project Tree) chi tiết đến cấp độ module và file quan trọng.

**Pattern Completeness:**
Quy tắc code, naming, và xử lý lỗi đồng nhất giúp các AI agent làm việc độc lập không conflict.

### Gap Analysis Results

- **Critical:** Không có gap nghiêm trọng gây block.
- **Important:** Cần chú ý logic phân xử xung đột (Conflict Resolution) trong Sync Engine khi code thực tế.
- **Nice-to-Have:** Cân nhắc tích hợp Storybook cho design system ở Phase 2.

### Architecture Completeness Checklist

- [x] **Requirements Analysis:** Đã phân tích đủ 72 FRs và các NFRs quan trọng.
- [x] **Architectural Decisions:** Stack công nghệ hiện đại (2026 ready) đã chốt.
- [x] **Implementation Patterns:** Quy tắc nhất quán cho monorepo đã thiết lập.
- [x] **Project Structure:** Cấu trúc thư mục cụ thể và ánh xạ chính xác vào PRD.

### Architecture Readiness Assessment

**Overall Status:** **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH**

**Key Strengths:**
1. **High Scalability:** Kiến trúc monorepo linh hoạt.
2. **Offline-First Resilience:** Giải pháp đồng bộ dữ liệu mạnh mẽ.
3. **Admin Flexibility:** DB-driven Authorization.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
```bash
npx create-turbo@latest pos-sdd --use-pnpm
```
