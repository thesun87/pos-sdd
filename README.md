# POS SDD - Point of Sale System

Hệ thống quản lý bán hàng (POS) hiện đại được xây dựng với Turborepo monorepo, Next.js 16, và NestJS 11.

## Prerequisites

- **Node.js** 24 LTS trở lên
- **pnpm** 9.x trở lên (`npm install -g pnpm`)
- **Docker Desktop** (cho PostgreSQL và Redis)
- **Git**

## Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd pos-sdd
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Cấu hình environment

```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần thiết
```

### 4. Khởi động services (PostgreSQL + Redis)

```bash
docker-compose up -d
```

Kiểm tra services đang chạy:

```bash
docker-compose ps
```

## Development Commands

```bash
# Khởi động tất cả apps (Next.js trên :3000, NestJS trên :3001)
pnpm dev

# Build tất cả packages và apps
pnpm build

# Chạy linting
pnpm lint

# Chạy type checking
pnpm type-check

# Chạy tests
pnpm test
```

### Chạy từng app riêng lẻ

```bash
# Chỉ chạy web (Next.js)
pnpm turbo dev --filter=@pos-sdd/web

# Chỉ chạy api (NestJS)
pnpm turbo dev --filter=@pos-sdd/api
```

## Project Structure

```
pos-sdd/
├── apps/
│   ├── web/          # Next.js 16 App Router (port 3000)
│   └── api/          # NestJS 11 REST API (port 3001)
├── packages/
│   ├── shared/       # @pos-sdd/shared - Types, constants, validators, utils
│   ├── database/     # @pos-sdd/database - Prisma client
│   ├── ui/           # @pos-sdd/ui - Shadcn UI components
│   └── config/       # @pos-sdd/config - ESLint, TypeScript, Tailwind configs
├── .github/
│   └── workflows/    # GitHub Actions CI/CD
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router + Turbopack) |
| Backend | NestJS 11 (SWC compiler) |
| Database | PostgreSQL 16 (via Prisma ORM) |
| Cache | Redis 7 |
| Monorepo | Turborepo 2.x + pnpm workspaces |
| Language | TypeScript 6.0+ (strict mode) |
| Testing | Vitest + React Testing Library |
| CI/CD | GitHub Actions |

## Ports

| Service | Port |
|---------|------|
| Next.js Web | 3000 |
| NestJS API | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## Packages

- `@pos-sdd/shared` - Shared types, constants, validators, và utilities
- `@pos-sdd/database` - Prisma client (setup ở Story 1.2)
- `@pos-sdd/ui` - Shadcn UI components (setup ở Story 1.7)
- `@pos-sdd/config` - ESLint, TypeScript, và Tailwind configurations

## Contributing

Xem [BMAD documentation](_bmad-output/) để biết thêm về workflow và architecture.
