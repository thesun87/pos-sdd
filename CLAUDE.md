# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POS SDD is a modern Point of Sale system built as a Turborepo monorepo with multi-tenant architecture. It supports PIN-based offline login for POS terminals in addition to standard email/password authentication via Better-Auth.

## Prerequisites & Setup

- Node.js 24 LTS+, pnpm 9+, Docker Desktop
- Copy `.env.example` to `.env`, then run `docker-compose up -d` (PostgreSQL 16 on :5432, Redis 7 on :6379)
- `pnpm install` to install all workspace dependencies

## Commands

```bash
# Development (all apps)
pnpm dev                                    # Next.js :3000, NestJS :3001

# Filter to specific app
pnpm turbo dev --filter=@pos-sdd/web
pnpm turbo dev --filter=@pos-sdd/api

# Quality checks
pnpm lint
pnpm type-check
pnpm test

# Build
pnpm build

# Database
pnpm --filter=@pos-sdd/database db:generate   # Prisma generate
pnpm --filter=@pos-sdd/database db:migrate    # Run migrations
pnpm --filter=@pos-sdd/database db:seed       # Seed data
pnpm --filter=@pos-sdd/database db:studio     # Prisma Studio

# Run a single test file
pnpm --filter=@pos-sdd/api vitest run src/modules/auth/auth.service.spec.ts
pnpm --filter=@pos-sdd/shared vitest run src/auth/pin-utils.spec.ts
```

## Workspace Structure

```
apps/web/          # @pos-sdd/web     — Next.js 16 App Router frontend
apps/api/          # @pos-sdd/api     — NestJS 11 REST API
packages/shared/   # @pos-sdd/shared  — Types, validators, pin-utils, jwt-utils
packages/database/ # @pos-sdd/database — Prisma client + Better-Auth instance
packages/ui/       # @pos-sdd/ui      — Shadcn UI components
packages/config/   # @pos-sdd/config  — ESLint, TypeScript, Tailwind base configs
```

## Architecture

### Authentication Flow

Two auth modes run in parallel:
1. **Better-Auth** (`/api/auth/*`) — session-based, handles email/password login; the NestJS body parser is **disabled** globally so Better-Auth can consume the raw request body.
2. **PIN/JWT** (`/api/v1/auth/*`) — for POS terminal staff; `auth.service.ts` verifies PIN hashes from `@pos-sdd/shared` and issues JWTs.

`AuthModeGuard` in `apps/api/src/common/guards/` routes requests to the correct strategy. The global prefix is `api/v1` with Better-Auth routes excluded from it.

### Multi-Tenancy

Every resource model has a `tenant_id` FK. `createTenantPrismaClient()` from `@pos-sdd/database` returns a scoped Prisma client. `UserStoreAssignment` controls which stores a user can access (SINGLE_STORE | STORE_GROUP | ALL_STORES).

### Frontend Route Groups

The Next.js app uses route groups to enforce per-section layouts:
- `(auth)` — public: `/login`, `/pin`
- `(dashboard)` — manager overview
- `(pos)` — POS terminal
- `(kds)` — Kitchen Display System
- `(management)` — management portal

`middleware.ts` protects all non-auth routes using Better-Auth session tokens.

### Shared Package Conventions

`@pos-sdd/shared` is consumed by both `apps/`. Key exports:
- `hashPin()` / `verifyPin()` / `validatePinFormat()` — always use these from shared, never reimplement
- `ApiResponse<T>` / `PaginatedResponse<T>` — standard response envelope types
- `BaseEntity` — base interface with `id`, `createdAt`, `updatedAt`

### NestJS API

- SWC compiler with `emitDecoratorMetadata` enabled (required for NestJS DI)
- `DatabaseModule` wraps Prisma and is imported globally
- All new feature modules go under `src/modules/`
- Guards are in `src/common/guards/`, decorators in `src/common/decorators/`

### Testing

- Vitest 2.x for all packages; test files colocated with source as `*.spec.ts` (unit) or `*.e2e-spec.ts` (e2e)
- `passWithNoTests: true` is set — tests won't fail in CI if a package has none yet
- Frontend tests use jsdom environment; API tests use node environment

## Key Configuration Notes

- TypeScript base config (`@pos-sdd/config/typescript/base`) uses strict mode and bundler module resolution
- NestJS tsconfig uses CommonJS modules (required for NestJS compatibility)
- Next.js `next.config.ts` transpiles `@pos-sdd/ui`, `@pos-sdd/shared`, and `@pos-sdd/database` packages
- `turbo.json` caches lint/type-check/test outputs; `dev` task is non-cached and persistent
