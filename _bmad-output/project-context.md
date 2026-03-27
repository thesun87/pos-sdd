---
project_name: 'pos-sdd'
user_name: 'Tuan.nguyen'
date: '2026-03-16T21:20:49+07:00'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'style_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 25
optimized_for_llm: true
existing_patterns_found: 26
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Monorepo:** Turborepo 2.x, pnpm
- **Frontend:** Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Shadcn UI, Framer Motion, Zustand, TanStack Query, React Hook Form, Zod
- **Backend:** NestJS 11, Socket.IO, Custom Auth (NestJS AuthService + Prisma)
- **Database:** PostgreSQL, Prisma 7.x, SQLite (wa-sqlite + OPFS for offline-first)
- **Language:** TypeScript 6.0+, Node.js 24 LTS
- **Testing:** Vitest, React Testing Library, Playwright

## Critical Implementation Rules

### Language-Specific Rules (TypeScript/Node.js)

- **Data Integrity:** Use UUID v7 for all primary keys. Store currency (VND) as Integers only.
- **Type Safety:** Maintain strict TypeScript configuration. Avoid `any`; use Zod schemas for runtime validation.
- **Module System:** Use ESM and absolute imports via monorepo workspace aliases (`@pos-sdd/*`).
- **Error Handling:** Standardize on RFC 7807 problem details. Always include specific `errorCode` for client-side handling.

### Framework-Specific Rules (Next.js & NestJS)

- **Frontend Architecture:** Use Next.js 16 Route Groups for multi-view separation. Manage UI state with Zustand and server state/caching with TanStack Query.
- **Offline Capabilities:** Implement sync logic in Web Workers. Use `wa-sqlite` + OPFS for local browser persistence.
- **Backend Authorization:** Follow the 4-layer authorization pipeline (Auth → Policy → Role → Scope → Limit). Always enforce `tenant_id` at the application level.
- **API & Real-time:** Use NestJS Controllers for REST and Socket.IO for real-time events. Follow `{domain}:{action}` naming for socket events.

### Testing Rules

- **Organization:** Use co-location for test files. Backend: `*.spec.ts`, Frontend: `*.test.tsx`.
- **Tools:** Use Vitest for unit/integration tests and Playwright for E2E testing of critical paths (Ordering, Payment).
- **Mocking:** Mock external dependencies (DB, API) in unit tests. Use a shared `@pos-sdd/shared/fixtures` for consistent test data.
- **Priority:** Ensure 100% coverage for pricing logic, promotion rules, and authorization guards.

### Code Quality & Style Rules

- **Naming Conventions:** Use `snake_case` (plural) for DB tables, `camelCase` for API parameters, and `PascalCase` for React components.
- **Organization:** Use feature-based component organization (e.g., `components/order/`). Avoid grouping by file type.
- **Visual Excellence:** Follow "Modern Bistro" aesthetics: 16px+ rounded corners, glassmorphism, and responsive touch optimizations (min 44px tap targets).
- **Standards:** Enforce linting via Biome/ESLint. Maintain consistent API response formats using RFC 7807 for errors.

### Development Workflow Rules

- **Branching Strategy:** Use `feature/{epic-id}-{task-name}` for new tasks. Always branch from and merge to `main`.
- **Commits:** Follow Conventional Commits format (e.g., `feat(ui): add kds ticket grid`).
- **PR Requirements:** All PRs must pass CI (linting, types, vitest). Include screenshots for UI changes.
- **Environment Management:** Use `.env` files for local dev. Centralize shared config in `@pos-sdd/config`.

### Critical Don't-Miss Rules

- **Multi-tenancy Integrity:** NEVER omit `tenant_id` or `store_id` in database queries. Isolation is mandatory at the application level.
- **VND Handling:** NEVER use floats for currency. VND has no decimals—always use Integers.
- **Offline-First Reality:** NEVER assume stable connectivity. All POS actions must persist to local SQLite first, then sync.
- **Security First:** NEVER store plain-text PINs in local storage. Use bcrypt hashing for local verification.
- **Performance Budget:** NEVER run heavy computations or sync logic on the UI thread. Use Web Workers to keep POS interactions under 200ms.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when technology stack changes.
- Review quarterly for outdated rules.
- Remove rules that become obvious over time.

Last Updated: 2026-03-16T21:20:49+07:00

