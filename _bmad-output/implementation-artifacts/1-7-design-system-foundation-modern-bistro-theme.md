# Story 1.7: Design System Foundation — "Modern Bistro" Theme

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **`packages/ui` được cấu hình với Tailwind CSS v4, Shadcn UI components, design tokens "Modern Bistro"**,
so that **tất cả views có giao diện nhất quán và đẹp mắt ngay từ đầu** (UX-DR1, UX-DR2).

## Acceptance Criteria

1. **Given** developer cần build UI
   **When** import components từ `@pos-sdd/ui`
   **Then** Shadcn UI Button, Card, Dialog, Input, Toast hoạt động với "Modern Bistro" theme (light mode, Slate & Teal/Emerald, glassmorphism, rounded-2xl)
   **And** design tokens: semantic colors (bg-alert-critical, bg-success), Inter font, spacing 8px base unit

2. **Given** design system cần nhất quán
   **When** áp dụng theme
   **Then** 4 layout templates sẵn sàng: POS (2-column touch), KDS (grid landscape), Dashboard (mobile-first), Management (desktop sidebar) (UX-DR15)
   **And** Button Hierarchy: Primary(Teal/Emerald), Secondary(trắng viền), Destructive(đỏ), Ghost(icon only) (UX-DR17)
   **And** Accessibility: contrast ratio ≥4.5:1, hit targets ≥48x48px, ARIA labels template (UX-DR16)
   **And** Loading States: Skeleton screens, Empty States with illustrations (UX-DR24, UX-DR25)

## Tasks / Subtasks

- [x] Task 1: Cài đặt Tailwind CSS v4 cho monorepo (AC: #1)
  - [x] Cài `tailwindcss` và `@tailwindcss/postcss` vào `apps/web`
  - [x] Tạo `apps/web/postcss.config.mjs` với plugin `@tailwindcss/postcss`
  - [x] Cập nhật `apps/web/app/globals.css` với `@import "tailwindcss"` + `@theme` block chứa design tokens "Modern Bistro"
  - [x] Xóa `packages/config/tailwind/index.js` placeholder (Tailwind v4 không cần config file JS)
  - [x] Verify Tailwind classes hoạt động trong `apps/web`

- [x] Task 2: Cấu hình Shadcn UI trong `packages/ui` (AC: #1)
  - [x] Chạy `npx shadcn@latest init` trong `packages/ui` (hoặc manual setup)
  - [x] Tạo `packages/ui/components.json` với cấu hình monorepo
  - [x] Cài Shadcn dependencies: `@radix-ui/*`, `lucide-react`
  - [x] Thêm Shadcn components cơ bản: Button, Card, Dialog, Input, Toast, Skeleton, Label, Separator
  - [x] Chạy `npx shadcn@latest add button card dialog input toast skeleton label separator -c packages/ui`
  - [x] Export tất cả components từ `packages/ui/src/index.ts`

- [x] Task 3: Định nghĩa Design Tokens "Modern Bistro" (AC: #1)
  - [x] Tạo `packages/ui/src/tokens/colors.ts` — semantic color constants
  - [x] Tạo `packages/ui/src/tokens/typography.ts` — Inter font scale
  - [x] Tạo `packages/ui/src/tokens/spacing.ts` — 8px base unit scale
  - [x] Tạo `packages/ui/src/tokens/index.ts` — barrel export
  - [x] Định nghĩa CSS custom properties trong globals.css cho Shadcn theme:
    - Primary: Teal/Emerald (#0D9488 / #10B981)
    - Background: Light mode (#FFFFFF, Slate-50)
    - Foreground: Slate-900
    - Destructive: Red-500 (#EF4444)
    - Warning: Amber-500 (#F59E0B)
    - Success: Emerald-500 (#10B981)
    - Muted: Slate-100/Slate-500
    - Border: Slate-200
    - Ring: Teal-500
    - Radius: 16px (rounded-2xl)

- [x] Task 4: Tạo Button variants theo UX-DR17 (AC: #2)
  - [x] Cấu hình Button component với 4 variants:
    - `default` (Primary): bg-teal-600, text-white, hover:bg-teal-700
    - `secondary`: bg-white, border border-slate-300, hover:bg-slate-50
    - `destructive`: bg-red-500, text-white, hover:bg-red-600
    - `ghost`: bg-transparent, icon only, hover:bg-slate-100
  - [x] Thêm size variants: `sm`, `default`, `lg`, `touch` (≥48x48px cho touchscreen — UX-DR16)
  - [x] Đảm bảo contrast ratio ≥4.5:1 cho tất cả variants

- [x] Task 5: Tạo Glassmorphism utilities (AC: #1)
  - [x] Tạo `packages/ui/src/utils/glassmorphism.ts` — class helpers
  - [x] Định nghĩa CSS classes: `.glass-panel`, `.glass-nav`, `.glass-card`
  - [x] Properties: `backdrop-blur-md`, `bg-white/80`, `border border-white/20`, `shadow-lg`

- [x] Task 6: Tạo 4 Layout Templates (AC: #2)
  - [x] Tạo `apps/web/app/(pos)/layout.tsx` — POS 2-column layout (Item Grid trái + Cart phải), touch-optimized, compact density
  - [x] Tạo `apps/web/app/(kds)/layout.tsx` — KDS grid landscape, auto-expand cards khi ít đơn, spacious density
  - [x] Tạo `apps/web/app/(dashboard)/layout.tsx` — Dashboard mobile-first 1-column, Bottom Navigation
  - [x] Tạo `apps/web/app/(management)/layout.tsx` — Management desktop sidebar, Data Grid ready
  - [x] Mỗi layout import Inter font từ `next/font/google`

- [x] Task 7: Tạo Skeleton & Empty State components (AC: #2)
  - [x] Verify Skeleton component từ Shadcn hoạt động đúng
  - [x] Tạo `packages/ui/src/components/empty-state.tsx` — Empty State template với icon + message + optional CTA
  - [x] Export từ `@pos-sdd/ui`

- [x] Task 8: Cấu hình Framer Motion (AC: #1)
  - [x] Cài `framer-motion` vào `apps/web`
  - [x] Tạo `packages/ui/src/utils/animations.ts` — shared animation presets:
    - `flyToCart`: item bay vào giỏ hàng (<100ms)
    - `slideIn`: sliding panel animation
    - `fadeIn`: glassmorphism transition
    - `shake`: KDS cảnh báo animation
  - [x] Export animation presets từ `@pos-sdd/ui`

- [x] Task 9: Cập nhật Root Layout với Inter font & theme provider (AC: #1, #2)
  - [x] Cập nhật `apps/web/app/layout.tsx`: import Inter font, apply className
  - [x] Thêm `<meta name="viewport">` cho touch-optimized

- [x] Task 10: Verification & Documentation (AC: #1, #2)
  - [x] `pnpm turbo build` — PASS
  - [x] `pnpm turbo type-check` — PASS
  - [x] `pnpm turbo lint` — PASS (không regression)
  - [x] `pnpm turbo test` — PASS (176 tests hiện tại không regression)
  - [x] Import `Button` từ `@pos-sdd/ui` trong `apps/web` — hoạt động
  - [x] Verify Tailwind classes render đúng trong browser

## Dev Notes

### Công nghệ & Phiên bản (PHẢI tuân thủ)

- **Tailwind CSS: v4** — CSS-first configuration, KHÔNG dùng `tailwind.config.js`
- **Shadcn UI: latest** — CLI `npx shadcn@latest`, component ownership model
- **Framer Motion: latest** — Micro-animations
- **Inter font: `next/font/google`** — KHÔNG dùng CDN link
- **Radix UI: via Shadcn** — Accessibility primitives tự động

### CRITICAL: Tailwind CSS v4 — Breaking Changes

```
Tailwind v4 KHÁC HOÀN TOÀN v3:
- KHÔNG CẦN tailwind.config.js — cấu hình qua CSS @theme directive
- KHÔNG CẦN @tailwind base/components/utilities — chỉ cần @import "tailwindcss"
- KHÔNG CẦN content array — auto-detect files
- CẦN postcss.config.mjs với @tailwindcss/postcss plugin
- CẦN cài: tailwindcss + @tailwindcss/postcss
```

**PostCSS config (BẮT BUỘC):**
```javascript
// apps/web/postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**CSS config (BẮT BUỘC):**
```css
/* apps/web/app/globals.css */
@import "tailwindcss";

@theme {
  /* Modern Bistro Design Tokens */
  --color-primary: #0D9488;        /* Teal-600 */
  --color-primary-foreground: #FFFFFF;
  --color-secondary: #F1F5F9;      /* Slate-100 */
  --color-accent: #10B981;         /* Emerald-500 */
  --color-destructive: #EF4444;    /* Red-500 */
  --color-warning: #F59E0B;        /* Amber-500 */
  --color-success: #10B981;        /* Emerald-500 */
  --color-muted: #64748B;          /* Slate-500 */
  --color-background: #FFFFFF;
  --color-foreground: #0F172A;     /* Slate-900 */
  --color-border: #E2E8F0;         /* Slate-200 */
  --color-ring: #0D9488;           /* Teal-600 */

  /* Semantic Alert Colors */
  --color-alert-critical: #EF4444;
  --color-alert-warning: #F59E0B;
  --color-alert-success: #10B981;
  --color-alert-info: #3B82F6;

  /* KDS specific */
  --color-kds-new: #10B981;
  --color-kds-warning: #F59E0B;
  --color-kds-overdue: #EF4444;

  /* Spacing (8px base unit) */
  --spacing-unit: 8px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Font */
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### CRITICAL: Shadcn UI trong Monorepo

```
Shadcn CLI hỗ trợ monorepo natively:
- Chạy: npx shadcn@latest add <component> -c packages/ui
- components.json trong packages/ui
- Import: import { Button } from "@pos-sdd/ui"
```

**components.json pattern:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "src/components",
    "utils": "src/utils",
    "ui": "src/components/ui",
    "lib": "src/lib",
    "hooks": "src/hooks"
  }
}
```

### Shadcn CSS Variables cho Theme (Shadcn + Tailwind v4)

Shadcn UI dùng CSS custom properties cho theming. Với Tailwind v4, định nghĩa trong `@theme` block hoặc `:root`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 174 84% 29%;           /* Teal-600: hsl(174, 84%, 29%) */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;       /* Slate-100 */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 160 84% 39%;            /* Emerald-500 */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;     /* Red-500 */
  --destructive-foreground: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;      /* Slate-200 */
  --input: 214.3 31.8% 91.4%;
  --ring: 174 84% 29%;              /* Teal-600 */
  --radius: 1rem;                    /* 16px = rounded-2xl */
}
```

### Package Structure cần tạo

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── ui/                      # Shadcn components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── label.tsx
│   │   │   └── separator.tsx
│   │   └── empty-state.tsx          # Custom: icon + message + CTA
│   ├── tokens/
│   │   ├── colors.ts                # Semantic color constants
│   │   ├── typography.ts            # Font scale
│   │   ├── spacing.ts              # 8px base unit
│   │   └── index.ts
│   ├── utils/
│   │   ├── glassmorphism.ts         # Glass panel classes
│   │   └── animations.ts           # Framer Motion presets
│   ├── styles/
│   │   └── globals.css              # Shadcn + design tokens CSS
│   ├── utils.ts                     # cn() utility (ĐÃ CÓ)
│   └── index.ts                     # Barrel exports
├── components.json                  # Shadcn config
├── package.json                     # CẬP NHẬT: thêm dependencies
├── tsconfig.json
└── vitest.config.ts

apps/web/
├── app/
│   ├── globals.css                  # CẬP NHẬT: Tailwind v4 + theme
│   ├── layout.tsx                   # CẬP NHẬT: Inter font + viewport
│   ├── (pos)/layout.tsx             # CẬP NHẬT: 2-column POS layout
│   ├── (kds)/layout.tsx             # CẬP NHẬT: Grid landscape
│   ├── (dashboard)/layout.tsx       # CẬP NHẬT: Mobile-first
│   └── (management)/layout.tsx      # CẬP NHẬT: Desktop sidebar
├── postcss.config.mjs               # MỚI: Tailwind v4 PostCSS
├── package.json                     # CẬP NHẬT: thêm tailwindcss, framer-motion
└── next.config.ts
```

### Layout Templates Chi Tiết

**POS Layout (2-column touch):**
```tsx
// apps/web/app/(pos)/layout.tsx
// Grid: grid-cols-[1fr_380px] hoặc grid-cols-[3fr_1fr]
// Left: Menu/Item Grid (scrollable)
// Right: Cart Panel (sticky)
// Touch: min-h-[48px] cho tất cả interactive elements
// Density: compact, gap-2
```

**KDS Layout (grid landscape):**
```tsx
// apps/web/app/(kds)/layout.tsx
// Grid: auto-fit, minmax(300px, 1fr)
// Auto-expand cards khi ít đơn
// Font size: lớn hơn 20-30% so với POS
// Density: spacious, gap-4
```

**Dashboard Layout (mobile-first):**
```tsx
// apps/web/app/(dashboard)/layout.tsx
// 1-column layout
// Bottom Navigation bar
// Cards stack vertically
// KPI widgets ở trên cùng
```

**Management Layout (desktop sidebar):**
```tsx
// apps/web/app/(management)/layout.tsx
// Sidebar: w-64, collapsible
// Main: flex-1, Data Grid ready
// Top bar: breadcrumb + user menu
```

### Existing Code để Reuse — KHÔNG Reinvent

| Cần gì | Đã có ở đâu | Cách dùng |
|--------|-------------|---------|
| `cn()` utility | `packages/ui/src/utils.ts` | ĐÃ CÓ — giữ nguyên, Shadcn components sẽ dùng |
| `clsx`, `tailwind-merge`, `class-variance-authority` | `packages/ui/package.json` | ĐÃ CÓ trong dependencies |
| Route group layouts | `apps/web/app/(pos)/layout.tsx` etc. | ĐÃ CÓ placeholder — CẬP NHẬT thành real layouts |
| Root layout | `apps/web/app/layout.tsx` | ĐÃ CÓ — CẬP NHẬT thêm Inter font |
| globals.css | `apps/web/app/globals.css` | ĐÃ CÓ — THAY THẾ hoàn toàn bằng Tailwind v4 |

### Anti-patterns cần tránh

- ❌ KHÔNG tạo `tailwind.config.js` — Tailwind v4 dùng CSS-first (`@theme`)
- ❌ KHÔNG dùng `@tailwind base/components/utilities` — dùng `@import "tailwindcss"`
- ❌ KHÔNG import font từ CDN/Google Fonts link — dùng `next/font/google`
- ❌ KHÔNG tạo components từ scratch khi Shadcn đã có — dùng `npx shadcn@latest add`
- ❌ KHÔNG đặt Shadcn components vào `apps/web` — đặt vào `packages/ui` cho shared
- ❌ KHÔNG dùng `bg-red-500` trực tiếp — dùng semantic: `bg-destructive`, `bg-alert-critical`
- ❌ KHÔNG dùng inline styles cho glassmorphism — tạo reusable CSS classes
- ❌ KHÔNG bỏ qua hit targets ≥48x48px cho POS/KDS buttons
- ❌ KHÔNG sử dụng hardcoded hex colors — luôn dùng CSS variables/Tailwind tokens
- ❌ KHÔNG cài Tailwind/PostCSS vào packages/ui — cài vào apps/web (nơi build)

### Dependencies cần cài

**`apps/web` (devDependencies):**
```bash
pnpm add -D tailwindcss @tailwindcss/postcss -F @pos-sdd/web
pnpm add framer-motion -F @pos-sdd/web
```

**`packages/ui` (dependencies — thêm vào existing):**
```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-toast lucide-react -F @pos-sdd/ui
```

**Lưu ý:** `class-variance-authority`, `clsx`, `tailwind-merge` ĐÃ CÓ trong `packages/ui/package.json`.

### Previous Story Intelligence

**Từ Story 1.6 (Store Scope):**
- 176 tests tổng — KHÔNG ĐƯỢC phá vỡ
- `pnpm turbo build`, `turbo type-check`, `turbo lint` đều PASS — phải giữ nguyên
- Story này KHÔNG có backend changes — chỉ frontend/packages

**Từ Story 1.1 (Foundation):**
- `packages/ui` đã có `cn()` utility, `package.json` với CVA + clsx + tailwind-merge
- `packages/config/tailwind/index.js` là placeholder — SẼ BỊ XÓA (Tailwind v4 không cần)
- Route group layouts đã có placeholder — SẼ ĐƯỢC CẬP NHẬT
- `apps/web/app/globals.css` có CSS cơ bản — SẼ ĐƯỢC THAY THẾ
- Next.js 16 dùng Turbopack — compatible với Tailwind v4 + PostCSS

**Debug learnings:**
- ESLint 8 không resolve scoped package sub-paths — packages dùng inline config
- Route groups không được có `page.tsx` tại cùng root path — đã moved to sub-paths
- `turbo type-check` cần `--noEmit` flag

### Git Intelligence

**Recent commits:**
- `9b9d2cf` feat 1-6
- `254f8fd` feat(1-5): role management & 4-layer RBAC setup
- `295b324` feat(1-4): user account management CRUD with code review fixes

**Commit pattern:** `feat(1-7): design system foundation modern bistro theme`

### Scope Decisions

- **Story này là FRONTEND ONLY** — không có API/database changes
- **Shadcn components cơ bản:** Button, Card, Dialog, Input, Toast, Skeleton, Label, Separator — đủ cho foundation
- **KHÔNG tạo custom components phức tạp** (Snap-Order Card, KDS Ticket, etc.) — sẽ tạo ở Epic 2, 3, 4
- **Layout templates là structure** — chưa cần UI hoàn chỉnh, chỉ cần grid/flex structure đúng
- **Framer Motion:** chỉ cài + tạo animation presets, KHÔNG implement animations thực tế (sẽ dùng ở stories sau)
- **Empty State:** template component đơn giản (icon + text + CTA), KHÔNG cần illustrations thực tế

### Testing Standards

- Story này là infrastructure/design system story — KHÔNG cần unit tests mới cho components
- PHẢI đảm bảo: `turbo build`, `turbo type-check`, `turbo lint`, `turbo test` đều PASS
- PHẢI đảm bảo 176 tests hiện tại không regression
- PHẢI verify import `@pos-sdd/ui` từ `apps/web` hoạt động

### Project Structure Notes

- `packages/ui` là shared design system — dùng cho cả POS, KDS, Dashboard, Management
- `apps/web/components/` chứa app-specific components — KHÔNG phải design system
- Tailwind v4 config nằm trong CSS (`globals.css`) — KHÔNG phải JS file
- PostCSS config nằm trong `apps/web` — KHÔNG phải root

### References

- [Source: epics.md#Story-1.7] — Design System Foundation acceptance criteria
- [Source: epics.md#UX-DR1] — Tailwind CSS + Shadcn UI + design tokens
- [Source: epics.md#UX-DR2] — "Modern Bistro" theme: Light mode, Glassmorphism, Slate & Teal/Emerald
- [Source: epics.md#UX-DR15] — 4 layout templates (POS, KDS, Dashboard, Management)
- [Source: epics.md#UX-DR16] — Accessibility WCAG 2.1 AA, contrast ≥4.5:1, hit targets ≥48x48px
- [Source: epics.md#UX-DR17] — Button Hierarchy (Primary, Secondary, Destructive, Ghost)
- [Source: epics.md#UX-DR24] — Empty States with illustrations
- [Source: epics.md#UX-DR25] — Loading States: Skeleton screens, Glassmorphism progress bars
- [Source: ux-design-specification.md#Design-System-Foundation] — Tailwind + Shadcn rationale
- [Source: ux-design-specification.md#Design-Direction-Decision] — "The Modern Bistro" chosen
- [Source: ux-design-specification.md#Color-System] — Semantic colors, Slate neutrals
- [Source: ux-design-specification.md#Typography-System] — Inter font, hierarchy
- [Source: ux-design-specification.md#Spacing-Layout-Foundation] — 8px base unit, density
- [Source: ux-design-specification.md#Button-Hierarchy] — Primary Teal, Secondary white, Destructive red, Ghost icon
- [Source: ux-design-specification.md#Responsive-Strategy] — Device-specific optimization
- [Source: ux-design-specification.md#Accessibility-Strategy] — WCAG 2.1 AA requirements
- [Source: architecture.md#Styling-Solution] — Tailwind CSS v4, Shadcn UI, Framer Motion
- [Source: architecture.md#UI-Boundary] — packages/ui chứa design system, apps/web/components chứa app-specific
- [Source: architecture.md#Project-Structure] — packages/ui/src/components/ + tokens/
- [Source: project-context.md#Visual-Excellence] — Modern Bistro aesthetics, 16px+ rounded corners, glassmorphism

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (SM/Story Context Engine)

### Debug Log References

N/A — Story chưa implement.

### Completion Notes List

- Story 1.7 là story FRONTEND ONLY đầu tiên — chỉ touch packages/ui và apps/web
- Tailwind v4 CSS-first config là breaking change lớn so với v3 — PHẢI dùng @import "tailwindcss" + @theme
- Shadcn CLI hỗ trợ monorepo native: `npx shadcn@latest add <component> -c packages/ui`
- packages/config/tailwind/index.js placeholder SẼ BỊ XÓA — không còn cần với Tailwind v4
- Sau story này, Epic 2+ có thể bắt đầu build UI components trên nền design system
- ✅ Đã cài đặt Tailwind CSS v4, Framer Motion, Radix UI.
- ✅ Khởi tạo Shadcn UI (Button, Card, Dialog, Input, Skeleton, Label, Separator, Sonner).
- ✅ Custom Button variants theo UX-DR17 (touch target 48x48).
- ✅ Thiết lập design tokens "Modern Bistro" (colors, typography, spacing).
- ✅ Tạo utilities cho Glassmorphism và Framer Motion.
- ✅ Thiết lập Layout Templates (POS, KDS, Dashboard, Management).
- ✅ Update globals.css, layout.tsx, index.ts.

### File List

- `apps/web/postcss.config.mjs` (NEW)
- `apps/web/app/globals.css` (MODIFIED)
- `apps/web/app/layout.tsx` (MODIFIED)
- `apps/web/app/(pos)/layout.tsx` (MODIFIED)
- `apps/web/app/(kds)/layout.tsx` (MODIFIED)
- `apps/web/app/(dashboard)/layout.tsx` (MODIFIED)
- `apps/web/app/(management)/layout.tsx` (MODIFIED)
- `packages/config/tailwind/index.js` (DELETED)
- `packages/ui/components.json` (NEW)
- `packages/ui/tsconfig.json` (MODIFIED)
- `packages/ui/src/styles/globals.css` (NEW)
- `packages/ui/src/components/empty-state.tsx` (NEW)
- `packages/ui/src/components/ui/*.tsx` (NEW Shadcn components)
- `packages/ui/src/tokens/colors.ts` (NEW)
- `packages/ui/src/tokens/typography.ts` (NEW)
- `packages/ui/src/tokens/spacing.ts` (NEW)
- `packages/ui/src/tokens/index.ts` (NEW)
- `packages/ui/src/utils/glassmorphism.ts` (NEW)
- `packages/ui/src/utils/animations.ts` (NEW)
- `packages/ui/src/index.ts` (MODIFIED)

## Change Log

| Date | Change | Details |
|------|--------|---------|
| 2026-05-01 | Story context created | Comprehensive developer guide for design system foundation |
| 2026-05-01 | Story implemented | Installed Tailwind v4, Shadcn UI, design tokens, layouts, and configured monorepo tools |
