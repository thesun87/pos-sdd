---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# pos-sdd - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for pos-sdd, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Menu & Product Management (FR1-FR7)**
- FR1: Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa các danh mục sản phẩm (categories) với thứ tự hiển thị tùy chỉnh
- FR2: Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa các món/sản phẩm (items) bao gồm tên, giá, mô tả và hình ảnh
- FR3: Cửa hàng trưởng có thể định nghĩa các nhóm món thêm (modifier groups - bắt buộc/tùy chọn) với giá món thêm riêng biệt
- FR4: Cửa hàng trưởng có thể tạo thực đơn combo/set kết hợp nhiều món với mức giá ưu đãi đặc biệt
- FR5: Cửa hàng trưởng có thể bật/tắt trạng thái món (còn hàng/hết hàng), tích hợp tự động tắt món khi tồn kho bằng 0
- FR6: Cửa hàng trưởng có thể cấu hình điều hướng bếp bằng cách gán món/danh mục cho các màn hình bếp (KDS stations) cụ thể
- FR7: Hệ thống tự động đồng bộ dữ liệu thực đơn xuống thiết bị POS để truy cập ngoại tuyến (offline)

**2. Order Processing (FR8-FR15)**
- FR8: Thu ngân có thể tạo đơn hàng mới bằng cách chọn bàn, thêm món và các món thêm trong ≤5 lần chạm (cho đơn tiêu chuẩn)
- FR9: Hệ thống quản lý vòng đời đơn hàng qua các trạng thái: Draft → Sent → Preparing → Ready → Served → Paid → Closed
- FR10: Thu ngân có thể chỉnh sửa đơn hàng hiện có (thêm/bớt/sửa món) với cập nhật thời gian thực xuống bếp (KDS)
- FR11: Thu ngân có thể tách hóa đơn theo món, theo phần trăm hoặc theo số tiền tùy chỉnh
- FR12: Thu ngân có thể gộp hóa đơn từ nhiều bàn thành một hóa đơn duy nhất
- FR13: Hệ thống tự động áp dụng các khuyến mãi đủ điều kiện vào đơn hàng dựa trên các quy tắc đã cấu hình
- FR14: Hệ thống tự động điều hướng các món trong đơn hàng đến đúng màn hình bếp (KDS station) tương ứng
- FR15: Người dùng có thẩm quyền có thể hủy món (void item) hoặc hủy toàn bộ đơn hàng, tuân theo giới hạn phân quyền và quy trình phê duyệt

**3. Table & Floor Management (FR16-FR21)**
- FR16: Cửa hàng trưởng có thể thiết kế sơ đồ mặt bằng bằng cách kéo-thả vị trí bàn qua nhiều khu vực/tầng
- FR17: Hệ thống theo dõi và hiển thị trạng thái bàn (Trống/Có khách/Đã đặt/Chưa dọn) với mã màu trực quan và thời gian ngồi
- FR18: Thu ngân có thể gán đơn hàng cho bàn cụ thể và xem tóm tắt đơn hàng (tổng tiền, danh sách món) theo bàn
- FR19: Thu ngân có thể chuyển đơn hàng từ bàn này sang bàn khác
- FR20: Thu ngân có thể gộp nhiều bàn thành một nhóm hoặc tách nhóm thành các bàn riêng lẻ
- FR21: Cửa hàng trưởng có thể gán nhân viên phụ trách các khu vực bàn cụ thể để theo dõi trách nhiệm theo ca

**4. Kitchen Display & Production (FR22-FR28)**
- FR22: Màn hình bếp (KDS) nhận và hiển thị đơn hàng thời gian thực qua WebSocket (online) hoặc mạng LAN (offline) kèm thông báo âm thanh
- FR23: KDS chỉ hiển thị các món được gán cho trạm (station) tương ứng
- FR24: Nhân viên bếp có thể cập nhật trạng thái chế biến (Mới → Đang nấu → Sẵn sàng → Đã phục vụ) bằng cách chạm
- FR25: KDS quản lý hàng đợi theo thứ tự vào trước ra trước (FIFO) với cơ chế tự động đôn ưu tiên cho các đơn hàng quá hạn
- FR26: KDS hiển thị đồng hồ đếm ngược cho mỗi đơn hàng với cảnh báo màu dựa trên SLA (xanh/vàng/đỏ)
- FR27: Hệ thống hỗ trợ nhiều màn hình KDS, mỗi màn hình lọc hiển thị theo trạm được gán
- FR28: KDS đồng bộ trạng thái hai chiều với POS theo thời gian thực, bao gồm cả trong chế độ ngoại tuyến (offline)

**5. Payment & Financial (FR29-FR36)**
- FR29: Thu ngân có thể xử lý thanh toán bằng tiền mặt hoặc VietQR, bao gồm cả thanh toán hỗn hợp (nhiều phương thức) cho một đơn hàng
- FR30: Thu ngân có thể tách thanh toán qua nhiều phương thức hoặc nhiều người trả
- FR31: Hệ thống tính tiền thối cho thanh toán tiền mặt với các nút chọn nhanh mệnh giá
- FR32: Hệ thống tạo mã VietQR in trực tiếp trên hóa đơn để khách hàng quét
- FR33: Người dùng có thẩm quyền có thể thực hiện trả hàng/hoàn tiền (refund) cho đơn hàng đã hoàn tất, tuân theo giới hạn phân quyền và quy trình phê duyệt
- FR34: Thu ngân có thể in hóa đơn cho khách, phiếu chế biến cho bếp, và in lại hóa đơn cũ với các mẫu (templates) có thể cấu hình
- FR35: Thu ngân có thể mở và đóng ca tiền mặt với các khai báo tiền đầu ca/cuối ca và báo cáo chênh lệch
- FR36: Hệ thống tạo báo cáo quyết toán cuối ngày đối soát tiền mặt và thanh toán điện tử với số liệu hệ thống

**6. Inventory & Stock (FR37-FR44)**
- FR37: Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa danh mục nguyên liệu/vật tư (tên, đơn vị tính, giá nhập, nhóm)
- FR38: Hệ thống theo dõi số lượng tồn kho tại cấp độ cửa hàng
- FR39: Cửa hàng trưởng có thể ghi nhận các giao dịch nhập kho (mua hàng) và xuất kho (hủy/hao hụt) kèm nhật ký kiểm soát
- FR40: Cửa hàng trưởng có thể điều chỉnh số lượng tồn kho với lý do bắt buộc khi có chênh lệch kiểm kê
- FR41: Cửa hàng trưởng có thể định nghĩa công thức (recipes) gắn món ăn với định lượng nguyên liệu tương ứng
- FR42: Hệ thống tự động trừ kho nguyên liệu khi đơn hàng hoàn tất, bao gồm cả trong chế độ ngoại tuyến (offline)
- FR43: Hệ thống cảnh báo Cửa hàng trưởng khi nguyên liệu xuống dưới ngưỡng tối thiểu, kèm tùy chọn tự động tạm ngắt các món liên quan
- FR44: Hệ thống tạo báo cáo kho (tồn hiện tại, biến động, hao hụt, giá trị tồn kho)

**7. Reporting & Analytics (FR45-FR51)**
- FR45: Hệ thống cung cấp báo cáo bán hàng theo giờ, ca, ngày, tuần và tháng với so sánh cùng kỳ
- FR46: Hệ thống cung cấp báo cáo hiệu suất sản phẩm (món bán chạy, đóng góp doanh thu, món không tiêu thụ, xu hướng)
- FR47: Hệ thống cung cấp phân tích đơn hàng (số lượng đơn theo giờ/giờ cao điểm, số món trung bình per đơn, thời gian phục vụ trung bình, tỷ lệ hủy đơn)
- FR48: Hệ thống cung cấp báo cáo thanh toán chi tiết theo phương thức và đối soát quyết toán
- FR49: Hệ thống cung cấp báo cáo hiệu suất nhân viên (đơn hàng/giờ, doanh thu, tỷ lệ hủy đơn theo từng nhân viên)
- FR50: Hệ thống cung cấp bảng điều khiển (Dashboard) thời gian thực với các chỉ số KPI đạt mức nhận diện tình huống ≤30 giây cho quản lý
- FR51: Các phân tích bếp (thời gian chế biến trung bình, tỷ lệ tuân thủ SLA, các món chậm nhất) luôn sẵn có trong báo cáo

**8. User & Access Management (FR52-FR59)**
- FR52: Quản trị viên hệ thống có thể tạo, chỉnh sửa, vô hiệu hóa và đặt lại mã PIN cho tài khoản người dùng
- FR53: Hệ thống hỗ trợ 6 vai trò mặc định (Thu ngân, Bếp, Trưởng ca, Cửa hàng trưởng, Chủ chuỗi, Quản trị hệ thống) và khả năng tạo vai trò tùy chỉnh
- FR54: Hệ thống thực thi mô hình phân quyền 4 lớp: Quyền theo vai trò → Phạm vi cửa hàng → Quy tắc giới hạn → Phê duyệt vượt ngưỡng
- FR55: Quản trị viên có thể gán người dùng vào phạm vi cửa hàng cụ thể (Một cửa hàng, Nhóm cửa hàng, Toàn chuỗi)
- FR56: Người dùng xác thực qua mã PIN (tại POS) hoặc email/mật khẩu (tại Dashboard), hỗ trợ xác thực PIN ngoại tuyến
- FR57: Người dùng có thể mở và đóng ca làm việc với khai báo tiền mặt, gán nhân sự và lịch sử ca
- FR58: Hệ thống duy trì nhật ký kiểm soát (audit log) bất biến cho mọi hành động nhạy cảm (hủy món, giảm giá, hoàn tiền, đăng nhập/xuất) có thể lọc theo user/hành động/thời gian
- FR59: Hệ thống hỗ trợ quy trình phê duyệt vượt ngưỡng, cho phép người dùng quyền cao hơn ủy quyền bằng cách nhập PIN trực tiếp trên thiết bị

**9. Promotion & Discount (FR60-FR67)**
- FR60: Cửa hàng trưởng có thể tạo giảm giá theo phần trăm áp dụng cho món, đơn hàng hoặc danh mục
- FR61: Cửa hàng trưởng có thể tạo giảm giá theo số tiền cố định
- FR62: Cửa hàng trưởng có thể tạo giá khuyến mãi riêng cho từng sản phẩm cụ thể
- FR63: Cửa hàng trưởng có thể tạo khuyến mãi "Mua X Tặng Y" với cơ chế tự động áp dụng khi đủ điều kiện
- FR64: Cửa hàng trưởng có thể tạo khuyến mãi combo (mua kết hợp các món cụ thể → giá đặc biệt)
- FR65: Cửa hàng trưởng có thể tạo khuyến mãi theo khung giờ với tính năng tự động kích hoạt/đóng theo lịch trình
- FR66: Thu ngân có thể áp dụng mã giảm giá (coupon) khi thanh toán với quản lý lượt dùng và giới hạn cấu hình
- FR67: Cửa hàng trưởng có thể định nghĩa các điều kiện khuyến mãi (giá trị đơn tối thiểu, món/danh mục áp dụng, ngày/giờ hiệu lực, lượt dùng tối đa, quy tắc cộng dồn)

**Cross-Cutting Capabilities (FR68-FR72)**
- FR68: Hệ thống vận hành hoàn toàn ngoại tuyến cho các giao dịch (đơn hàng, thanh toán, bếp, in ấn) trong 4-24 giờ với bộ nhớ đệm ≥5,000 đơn
- FR69: Hệ thống tự động đồng bộ dữ liệu ngoại tuyến lên đám mây trong vòng 2 phút sau khi có mạng lại mà không mất dữ liệu
- FR70: Hệ thống liên lạc giữa POS và KDS qua mạng LAN khi không có internet
- FR71: Hệ thống hỗ trợ in nhiệt qua USB, Bluetooth hoặc Mạng trong cả chế độ online và offline
- FR72: Hệ thống cách ly dữ liệu khách hàng (multi-tenant) đảm bảo không truy cập chéo, mọi truy vấn đều được đóng gói theo tenant và store

### NonFunctional Requirements

**Performance:**
- NFR1: Mọi thao tác POS UI phản hồi trong ≤200ms (p95)
- NFR2: Ghi order vào local DB trong ≤10ms (p95)
- NFR3: Order creation end-to-end từ tap → order confirmed ≤500ms (offline, p95)
- NFR4: Order xuất hiện trên KDS ≤1 giây sau khi gửi qua LAN (p95)
- NFR5: Dashboard + widgets load ≤3 giây (cloud, p95)
- NFR6: Báo cáo ngày/tuần render ≤5 giây (p95)
- NFR7: Hỗ trợ ≥5 POS + 3 KDS đồng thời trên 1 LAN
- NFR8: ≥300 orders/giờ/thu ngân trong giờ cao điểm

**Security:**
- NFR9: TLS 1.2+ cho mọi communication Cloud ↔ POS (data encryption in transit)
- NFR10: Encrypt local DB trên POS device bằng AES-256 (data encryption at rest)
- NFR11: PIN hashed (bcrypt/PBKDF2), never stored plaintext. Session timeout configurable
- NFR12: 4-layer RBAC enforced at API level, not just UI
- NFR13: Audit logs append-only, không thể sửa/xóa, retention ≥12 tháng
- NFR14: Row-level security, no cross-tenant data leakage (tenant isolation)
- NFR15: Không lưu trữ card data. VietQR = redirect, không xử lý trực tiếp (PCI DSS awareness)
- NFR16: Sanitize mọi user input, chống SQL injection, XSS (input validation)

**Reliability & Availability:**
- NFR17: Cloud platform uptime ≥99.5% (≤43.8h downtime/năm)
- NFR18: POS offline availability 100% trong 4-24h offline
- NFR19: Zero data loss — Event log append-only + local backup mỗi 5 phút
- NFR20: Sync recovery ≤2 phút sau khi có mạng trở lại (benchmark 5,000 orders)
- NFR21: Mean time to recovery ≤15 phút cho cloud services
- NFR22: Graceful degradation — mất cloud → POS vẫn chạy đủ feature Transaction Layer
- NFR23: Local backup auto mỗi 5 phút, hỗ trợ hot-swap device restore ≤5 phút

**Scalability:**
- NFR24: ≥500 tenants trên shared infrastructure (Year 1)
- NFR25: ≥2,000 stores total (Growth target)
- NFR26: ≥1,000 concurrent POS sessions (cloud)
- NFR27: ≥24 tháng order history per tenant (data retention)
- NFR28: Cloud backend scale horizontally (API + DB read replicas)
- NFR29: ≥10,000 events/phút sync capacity (peak sync)

**Integration:**
- NFR30: Hỗ trợ chuẩn ESC/POS, tương thích 90%+ thermal printers trên thị trường VN
- NFR31: Printer connectivity qua USB, Bluetooth, Network — tự detect & connect
- NFR32: VietQR format chuẩn NAPAS cho mọi ngân hàng VN
- NFR33: RESTful JSON API response format
- NFR34: Webhook support cho payment verification, delivery platform integration
- NFR35: Data export CSV, JSON cho kế toán, migration

**Hardware Compatibility:**
- NFR36: POS chạy trên Android 9.0+/3GB RAM (min), Windows 10/Core i3/4GB RAM (min)
- NFR37: KDS chạy trên Android 8.0+/2GB RAM/15" (min)
- NFR38: Cross-platform trên trình duyệt Chrome/Edge (Chromium-based)
- NFR39: Tối ưu giao diện cho Tablet (Landscape) và Touchscreen Monitor
- NFR40: Cash Drawer kết nối qua cổng RJ11 của máy in, tự động bật ngăn kéo khi thanh toán tiền mặt

### Additional Requirements

**Từ Architecture Document:**

- Starter template: Turborepo Monorepo + Next.js 16 + NestJS 11 (Sprint 0 Foundation)
- Initialization command: `npx create-turbo@latest pos-sdd --use-pnpm`
- Local Database: SQLite via OPFS + wa-sqlite cho offline-first
- Sync Protocol: Hybrid Event Sourcing (orders) + Last-Write-Wins (menu/settings) + CRDT (inventory)
- Authorization: NestJS Guards Pipeline + DB-driven Policy Service (4-layer)
- Real-time Communication: Socket.IO (online) + LAN WebSocket + mDNS discovery (offline)
- Multi-tenant Isolation: Prisma middleware (application-level), auto inject WHERE tenant_id
- State Management: Zustand (client) + TanStack Query (server state)
- API Pattern: REST + Swagger auto-generation, RFC 7807 error format
- Offline Auth: Cached JWT + PIN local verification (bcrypt hash trong SQLite)
- Performance: Code splitting + Service Worker + Web Workers (SQLite + Sync chạy trên Web Worker)
- Database: PostgreSQL (cloud) + Prisma 7.x, Redis cho caching
- Authentication: Better-Auth 1.5 (Plugin-based, TypeScript-first)
- Testing: Vitest (NestJS), React Testing Library, Playwright (E2E)
- Deployment Phase 1: Vercel (Next.js) + Railway/Render (NestJS + PostgreSQL)
- CI/CD: Vercel auto-deploy + GitHub Actions cho NestJS
- Error Monitoring: Sentry (FE+BE) + NestJS ConsoleLogger JSON
- UUID v7 cho primary keys (time-sortable)
- Currency luôn là integer (VND)
- Docker Compose local only cho dev (PostgreSQL + Redis)
- Naming conventions: DB snake_case, API camelCase, React PascalCase, NestJS kebab-case
- Co-located test files (*.spec.ts / *.test.tsx)
- Feature-based component organization

### UX Design Requirements

- UX-DR1: Triển khai Design System Foundation — Tailwind CSS + Shadcn UI với design tokens (semantic colors, typography scale Inter, spacing scale 8px base unit)
- UX-DR2: Triển khai hướng thiết kế "The Modern Bistro" — Light mode, Glassmorphism (backdrop-blur), rounded corners (16px+), bảng màu Slate & Teal/Emerald
- UX-DR3: Xây dựng custom component "Snap-Order Card" — Ảnh nền mờ, giá ở góc trên, tên món ở dưới, badge số lượng, chạm là bay vào giỏ hàng (<100ms)
- UX-DR4: Xây dựng custom component "KDS Ticket" — Hỗ trợ đa chế độ xem (Order View / Batch Item View), Auto-Progressive Color Coding (New xanh → Warning vàng >10p → Overdue đỏ nháy), modifier highlighting
- UX-DR5: Xây dựng custom component "Contextual Action Sheet" — Long press/Vuốt trái trên món trong giỏ hàng → bảng hành động (Void, Discount, Ghi chú) mà không mất ngữ cảnh
- UX-DR6: Xây dựng custom component "Global Order Toolbar" — Thanh công cụ cấp đơn hàng (chọn khách hàng, gộp/tách bàn, giảm giá toàn đơn) tại khu vực Giỏ hàng
- UX-DR7: Xây dựng custom component "Visual Floor Plan" — Sơ đồ mặt bằng tương tác: kéo thả gộp bàn, chạm giữ xem nhanh (Peek Tooltip), phân khu (zoning), điều hướng tầng
- UX-DR8: Xây dựng custom component "Table Widget (Smart Seat)" — Hiển thị trạng thái bàn real-time: Available(trắng), Occupied(Teal + giá đơn & giờ ngồi), Waiting(icon bếp nháy), Billing(Amber), Dirty(xám + chổi)
- UX-DR9: Xây dựng custom component "Multi-branch Comparison Chart" — Biểu đồ cột xếp hạng doanh thu/tốc độ bếp/tỷ lệ hủy đơn giữa các chi nhánh, Anomaly Detection indicators, drill-down
- UX-DR10: Xây dựng custom component "Global Configuration Workspace" — Quản trị Master Data toàn chuỗi với cơ chế "Global-Local Override"
- UX-DR11: Xây dựng custom component "Unified Reconciliation Grid" — Data Grid đối soát: Doanh thu hệ thống | Tiền mặt khai báo | Thanh toán điện tử, "Save View" cho kế toán
- UX-DR12: Triển khai Zero-Confirm Workflow — Chạm chọn món → tự động vào giỏ hàng (không popup confirm), vuốt phải để bỏ món
- UX-DR13: Triển khai Contextual Sliding Modifiers — Bảng modifier trượt ra ngay dưới món thay vì mở popup/trang mới, giữ nguyên ngữ cảnh giỏ hàng
- UX-DR14: Triển khai Heat-map KDS — Cards order "nóng lên" (đậm màu dần) dựa trên thời gian thực
- UX-DR15: Triển khai Responsive Device-Specific Optimization:
  - POS: 2-column layout (Item Grid trái + Cart phải), touch-optimized, compact density
  - KDS: Grid landscape, auto-giãn thẻ khi ít đơn, spacious density
  - Dashboard: Mobile-first 1-column, Bottom Navigation
  - Management Portal: Desktop sidebar, Data Grid
- UX-DR16: Triển khai Accessibility WCAG 2.1 AA — Contrast ratio ≥4.5:1 text / ≥3:1 icons, hit targets ≥48x48px cho nút khẩn cấp, ARIA labels cho custom components, keyboard support (Enter/Esc/Số)
- UX-DR17: Triển khai Button Hierarchy — Primary(Teal/Emerald), Secondary(trắng viền), Destructive(đỏ), Ghost(icon only)
- UX-DR18: Triển khai Feedback Patterns — Snap-toast 3s cho thành công, Modal đỏ cho lỗi + nút Thử lại, Animation shake cho KDS cảnh báo
- UX-DR19: Triển khai Navigation Patterns — Contextual Drawers (1/3 màn hình từ phải), Action Sheets (bottom sheet trên tablet)
- UX-DR20: Triển khai micro-animations bằng Framer Motion — hiệu ứng bay vào giỏ hàng, sliding panels, glassmorphism transitions
- UX-DR21: Triển khai OfflineIndicator component — Icon mạng (Online xanh / Offline xám) luôn hiển thị thầm lặng ở góc, không gây gián đoạn luồng làm việc
- UX-DR22: Triển khai Sound UI — Âm thanh "Ting!" KDS báo đơn mới (dứt khoát nhưng dễ chịu), "Cash register" nhẹ khi thanh toán thành công
- UX-DR23: Triển khai Form Patterns tối ưu cảm ứng — Numeric Keypad lớn với gợi ý mệnh giá (50k/100k/200k/500k), Quick-Search autocomplete, In-place editing trong giỏ hàng
- UX-DR24: Triển khai Empty States thân thiện — Hình minh họa + thông điệp hướng dẫn rõ ràng khi không có dữ liệu
- UX-DR25: Triển khai Loading States — Glassmorphism progress bars, Skeleton screens cho mọi data loading
- UX-DR26: Triển khai Audit & Anti-Fraud UX — Immutable audit log UI, "From Insight to Action" CTAs kèm thông số bất thường, Approval Dashboard tập trung

### FR Coverage Map

- FR1: Epic 2 - Tạo/sửa/xóa danh mục sản phẩm
- FR2: Epic 2 - Tạo/sửa/xóa sản phẩm (tên, giá, mô tả, hình)
- FR3: Epic 2 - Định nghĩa modifier groups
- FR4: Epic 2 - Tạo combo/set menu
- FR5: Epic 2 - Bật/tắt trạng thái món, auto tắt khi hết kho
- FR6: Epic 2 - Cấu hình kitchen routing (gán món → KDS station)
- FR7: Epic 2 - Đồng bộ menu xuống POS offline
- FR8: Epic 3 - Tạo đơn hàng ≤5 taps
- FR9: Epic 3 - Quản lý vòng đời đơn hàng (Draft→Closed)
- FR10: Epic 3 - Chỉnh sửa đơn hàng, cập nhật KDS real-time
- FR11: Epic 3 - Tách hóa đơn (theo món/% /số tiền)
- FR12: Epic 3 - Gộp hóa đơn từ nhiều bàn
- FR13: Epic 6 - Tự động áp dụng khuyến mãi vào đơn hàng
- FR14: Epic 3 - Auto điều hướng món đến KDS station
- FR15: Epic 3 - Void item/cancel order theo RBAC + approval
- FR16: Epic 3 - Thiết kế sơ đồ mặt bằng kéo thả
- FR17: Epic 3 - Theo dõi trạng thái bàn với mã màu
- FR18: Epic 3 - Gán đơn hàng cho bàn, xem tóm tắt theo bàn
- FR19: Epic 3 - Chuyển order sang bàn khác
- FR20: Epic 3 - Gộp/tách nhóm bàn
- FR21: Epic 3 - Gán nhân viên phụ trách khu vực bàn
- FR22: Epic 4 - KDS nhận đơn real-time (WebSocket/LAN) + âm thanh
- FR23: Epic 4 - KDS lọc hiển thị theo station
- FR24: Epic 4 - Cập nhật trạng thái chế biến bằng chạm
- FR25: Epic 4 - Hàng đợi FIFO + auto đôn ưu tiên đơn trễ
- FR26: Epic 4 - Timer đếm ngược + cảnh báo SLA (xanh/vàng/đỏ)
- FR27: Epic 4 - Hỗ trợ nhiều màn hình KDS
- FR28: Epic 4 - Đồng bộ trạng thái 2 chiều POS↔KDS (cả offline)
- FR29: Epic 5 - Thanh toán tiền mặt + VietQR + hỗn hợp
- FR30: Epic 5 - Tách thanh toán nhiều phương thức/người trả
- FR31: Epic 5 - Tính tiền thối + gợi ý mệnh giá nhanh
- FR32: Epic 5 - Tạo mã VietQR in trên bill
- FR33: Epic 5 - Refund theo RBAC + approval
- FR34: Epic 5 - In hóa đơn/phiếu bếp/reprint + template cấu hình
- FR35: Epic 5 - Mở/đóng ca tiền mặt + báo cáo chênh lệch
- FR36: Epic 5 - Báo cáo quyết toán cuối ngày đối soát
- FR37: Epic 7 - Tạo/sửa/xóa nguyên liệu/vật tư
- FR38: Epic 7 - Theo dõi tồn kho cấp cửa hàng
- FR39: Epic 7 - Nhập kho/xuất kho + audit trail
- FR40: Epic 7 - Điều chỉnh tồn kho + lý do bắt buộc
- FR41: Epic 7 - Định nghĩa công thức (recipe mapping)
- FR42: Epic 7 - Tự động trừ kho khi bán (cả offline)
- FR43: Epic 7 - Cảnh báo tồn kho thấp + auto tắt món
- FR44: Epic 7 - Báo cáo kho (tồn, biến động, hao hụt, giá trị)
- FR45: Epic 9 - Báo cáo bán hàng theo giờ/ca/ngày/tuần/tháng
- FR46: Epic 9 - Báo cáo hiệu suất sản phẩm
- FR47: Epic 9 - Phân tích đơn hàng (giờ cao điểm, void rate)
- FR48: Epic 9 - Báo cáo thanh toán chi tiết + đối soát
- FR49: Epic 9 - Báo cáo hiệu suất nhân viên
- FR50: Epic 9 - Dashboard real-time (≤30s awareness)
- FR51: Epic 9 - Phân tích bếp (cooking time, SLA compliance)
- FR52: Epic 1 - CRUD user accounts + reset PIN
- FR53: Epic 1 - 6 vai trò mặc định + custom roles
- FR54: Epic 1 - 4-layer RBAC enforcement
- FR55: Epic 1 - Gán user vào store scope
- FR56: Epic 1 - Authentication PIN (POS) + email/password (Dashboard)
- FR57: Epic 10 - Mở/đóng ca làm việc + gán nhân sự
- FR58: Epic 10 - Audit log bất biến cho mọi hành động nhạy cảm
- FR59: Epic 10 - Quy trình phê duyệt vượt ngưỡng (PIN override)
- FR60: Epic 6 - Giảm giá theo phần trăm
- FR61: Epic 6 - Giảm giá theo số tiền cố định
- FR62: Epic 6 - Giá khuyến mãi sản phẩm
- FR63: Epic 6 - Khuyến mãi Mua X Tặng Y
- FR64: Epic 6 - Khuyến mãi combo
- FR65: Epic 6 - Khuyến mãi theo khung giờ
- FR66: Epic 6 - Áp dụng mã coupon
- FR67: Epic 6 - Điều kiện khuyến mãi (min order, stackable...)
- FR68: Epic 8 - Offline mode 4-24h, buffer ≥5,000 đơn
- FR69: Epic 8 - Sync recovery <2 phút, zero data loss
- FR70: Epic 8 - POS↔KDS giao tiếp qua LAN offline
- FR71: Epic 8 - In nhiệt USB/BT/Network online+offline
- FR72: Epic 1 - Multi-tenant isolation

## Epic List

### Epic 1: Foundation & Project Setup
Thiết lập nền tảng dự án monorepo (Turborepo + Next.js 16 + NestJS 11), database schema (PostgreSQL + Prisma), hệ thống authentication (Custom Auth + PIN), design system ("Modern Bistro" theme), 4-layer RBAC Guards Pipeline + Policy Service, và multi-tenant isolation. Sau epic này, team có thể đăng nhập, phân quyền, và bắt đầu xây dựng nghiệp vụ trên nền tảng nhất quán.
**FRs covered:** FR52, FR53, FR54, FR55, FR56, FR72
**UX-DRs:** UX-DR1, UX-DR2, UX-DR15, UX-DR16, UX-DR17, UX-DR24, UX-DR25
**NFRs:** NFR9, NFR10, NFR11, NFR12, NFR14, NFR16, NFR33, NFR36-40

### Epic 2: Menu Management & Catalog
Cửa hàng trưởng có thể thiết lập và quản lý toàn bộ thực đơn: tạo categories, sản phẩm (tên/giá/mô tả/hình), modifier groups, combo/set menu, cấu hình kitchen routing, bật/tắt trạng thái món, và đồng bộ menu xuống POS offline. Sau epic này, dữ liệu thực đơn sẵn sàng cho POS sử dụng.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7
**UX-DRs:** UX-DR24

### Epic 3: POS Order Creation & Table Management
Thu ngân có thể tạo đơn hàng nhanh (≤5 taps) với giao diện Snap-Order Card, quản lý bàn qua Visual Floor Plan, chọn bàn gán order, chỉnh sửa đơn hàng, tách/gộp bill, gộp/tách bàn, chuyển bàn, void/cancel theo RBAC, và auto điều hướng món đến KDS station. Luồng bán hàng cốt lõi hoạt động hoàn chỉnh.
**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21
**UX-DRs:** UX-DR3, UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR12, UX-DR13, UX-DR15 (POS), UX-DR18, UX-DR19, UX-DR20, UX-DR23
**NFRs:** NFR1, NFR2, NFR3, NFR8

### Epic 4: Kitchen Display System (KDS)
Nhân viên bếp nhận đơn hàng real-time trên KDS (WebSocket/LAN), xem danh sách theo station, cập nhật trạng thái chế biến bằng chạm, quản lý hàng đợi FIFO, theo dõi timer SLA (xanh/vàng/đỏ), hỗ trợ nhiều màn hình, và đồng bộ trạng thái 2 chiều với POS. Luồng chế biến không giấy tờ hoàn chỉnh.
**FRs covered:** FR22, FR23, FR24, FR25, FR26, FR27, FR28
**UX-DRs:** UX-DR4, UX-DR14, UX-DR15 (KDS), UX-DR18, UX-DR22
**NFRs:** NFR4, NFR7

### Epic 5: Payment & Cash Shift Management
Thu ngân có thể thanh toán bằng tiền mặt hoặc VietQR (kể cả hỗn hợp), tách thanh toán, tính tiền thối với gợi ý mệnh giá nhanh, tạo mã VietQR in trên bill, refund theo RBAC, in hóa đơn/phiếu bếp (cấu hình template), quản lý ca tiền mặt (mở/đóng ca + khai báo), và đối soát cuối ngày. Luồng tài chính khép kín.
**FRs covered:** FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36
**UX-DRs:** UX-DR11, UX-DR23 (Numeric Keypad)
**NFRs:** NFR15, NFR30, NFR31, NFR32, NFR40

### Epic 6: Promotion & Discount Engine
Cửa hàng trưởng có thể tạo và quản lý đa dạng khuyến mãi (giảm %, giảm tiền, giá đặc biệt, Buy X Get Y, combo, theo khung giờ, coupon) với điều kiện linh hoạt. Hệ thống tự động áp dụng khuyến mãi đủ điều kiện vào đơn hàng.
**FRs covered:** FR13, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67
**UX-DRs:** UX-DR10

### Epic 7: Inventory & Stock Management
Cửa hàng trưởng quản lý nguyên liệu/vật tư (CRUD), theo dõi tồn kho cấp cửa hàng, nhập/xuất kho với audit trail, điều chỉnh kiểm kê, định nghĩa công thức (recipe mapping), hệ thống tự động trừ kho khi bán (kể cả offline), cảnh báo tồn kho thấp và auto tắt món hết nguyên liệu.
**FRs covered:** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44
**UX-DRs:** UX-DR24

### Epic 8: Offline Mode & Data Sync
Hệ thống hoạt động hoàn toàn offline 4-24h (buffer ≥5,000 đơn), tự động đồng bộ dữ liệu lên cloud <2 phút khi có mạng (zero data loss), POS↔KDS giao tiếp qua LAN khi mất internet, in nhiệt qua USB/BT/Network offline. "Bất khả chiến bại khi mất mạng."
**FRs covered:** FR68, FR69, FR70, FR71
**UX-DRs:** UX-DR21
**NFRs:** NFR17-23, NFR29

### Epic 9: Reporting & Real-time Dashboard
Quản lý nắm bắt tình hình kinh doanh trong ≤30 giây qua Dashboard real-time, xem báo cáo bán hàng/hiệu suất sản phẩm/phân tích đơn hàng/thanh toán/hiệu suất nhân viên/phân tích bếp. Chủ chuỗi so sánh đa chi nhánh với anomaly detection.
**FRs covered:** FR45, FR46, FR47, FR48, FR49, FR50, FR51
**UX-DRs:** UX-DR9, UX-DR15 (Dashboard + Management), UX-DR26
**NFRs:** NFR5, NFR6, NFR35

### Epic 10: User Management, Audit & Shift Operations
Quản trị viên quản lý ca làm việc (mở/đóng ca, gán nhân sự, lịch sử ca), hệ thống duy trì audit log bất biến cho mọi hành động nhạy cảm, và hỗ trợ quy trình phê duyệt vượt ngưỡng (PIN override) với Approval Dashboard tập trung.
**FRs covered:** FR57, FR58, FR59
**UX-DRs:** UX-DR26
**NFRs:** NFR13

## Epic 1: Foundation & Project Setup

Thiết lập nền tảng dự án monorepo (Turborepo + Next.js 16 + NestJS 11), database schema (PostgreSQL + Prisma), hệ thống authentication (Custom Auth + PIN), design system ("Modern Bistro" theme), 4-layer RBAC Guards Pipeline + Policy Service, và multi-tenant isolation. Sau epic này, team có thể đăng nhập, phân quyền, và bắt đầu xây dựng nghiệp vụ trên nền tảng nhất quán.

### Story 1.1: Khởi tạo Turborepo Monorepo & Dev Environment

As a **developer**,
I want **dự án monorepo được khởi tạo hoàn chỉnh với Turborepo + pnpm, cấu trúc apps/ và packages/, Docker Compose cho PostgreSQL + Redis, và CI/CD cơ bản**,
So that **team có môi trường phát triển nhất quán để bắt đầu code ngay**.

**Acceptance Criteria:**

**Given** developer clone repo mới
**When** chạy `pnpm install` và `docker-compose up`
**Then** PostgreSQL + Redis khởi động thành công, Turborepo task pipeline (`dev`, `build`, `lint`, `test`) hoạt động
**And** cấu trúc thư mục đúng theo Architecture: `apps/web` (Next.js 16), `apps/api` (NestJS 11), `packages/shared`, `packages/database`, `packages/ui`, `packages/config`
**And** TypeScript 6.0+, ESLint, Prettier được cấu hình đúng cho toàn bộ monorepo
**And** `turbo.json` định nghĩa task pipelines (build, dev, lint, test) với dependencies chính xác

### Story 1.2: Database Schema Foundation & Prisma Setup

As a **developer**,
I want **Prisma 7.x được cấu hình trong `packages/database` với schema cơ bản (tenants, stores, users, roles, policies) và migration đầu tiên**,
So that **các module nghiệp vụ có thể mở rộng schema khi cần, tuân thủ naming conventions**.

**Acceptance Criteria:**

**Given** PostgreSQL đang chạy qua Docker Compose
**When** chạy `pnpm prisma migrate dev`
**Then** database được tạo với các bảng: `tenants`, `stores`, `users`, `roles`, `user_roles`, `policies`, `audit_logs`
**And** tất cả tables dùng snake_case, UUID v7 cho primary keys, `tenant_id` + `store_id` trên mọi bảng scoped
**And** `@pos-sdd/database` export Prisma client sẵn sàng import từ `apps/web` và `apps/api`
**And** Prisma middleware auto-inject `WHERE tenant_id = ?` trên mọi query (multi-tenant isolation — FR72)

### Story 1.3: Authentication System — Custom Auth + PIN Login

As a **nhân viên cửa hàng**,
I want **đăng nhập vào hệ thống bằng email/mật khẩu (Dashboard) hoặc mã PIN (POS) qua Custom Auth**,
So that **tôi truy cập được chức năng phù hợp với vai trò của mình một cách nhanh chóng và bảo mật** (FR56).

**Acceptance Criteria:**

**Given** user account đã tồn tại trong hệ thống
**When** user đăng nhập qua email/password trên Dashboard
**Then** Custom AuthService xác thực thành công, trả về session cookie (HttpOnly), redirect về Dashboard
**And** password được hash bằng bcrypt (NFR11)

**Given** thu ngân có PIN 4-6 số
**When** nhập PIN trên màn hình POS
**Then** hệ thống verify PIN hash (bcrypt), tạo JWT token, mở giao diện POS
**And** PIN cache vào SQLite local cho xác thực offline (NFR10 — AES-256 encrypt)

**Given** session đang active
**When** hết thời gian timeout cấu hình
**Then** hệ thống auto-lock, yêu cầu nhập lại PIN/password

### Story 1.4: User Account Management (CRUD)

As a **quản trị viên hệ thống**,
I want **tạo, chỉnh sửa, vô hiệu hóa, và đặt lại mã PIN cho tài khoản nhân viên**,
So that **tôi quản lý được đội ngũ nhân viên trên hệ thống** (FR52).

**Acceptance Criteria:**

**Given** quản trị viên đã đăng nhập Management Portal
**When** tạo user mới với thông tin (tên, email, PIN, vai trò)
**Then** user được tạo trong database với `tenant_id` đúng, PIN được hash bcrypt
**And** validation: email unique trong tenant, PIN 4-6 chữ số

**Given** user account tồn tại
**When** quản trị viên vô hiệu hóa (deactivate) user
**Then** user không thể đăng nhập nữa, session hiện tại bị thu hồi

**Given** nhân viên quên PIN
**When** quản trị viên reset PIN
**Then** PIN mới được set, PIN cũ vô hiệu ngay lập tức

### Story 1.5: Role Management & 4-Layer RBAC Setup

As a **quản trị viên hệ thống**,
I want **hệ thống có 6 vai trò mặc định và model phân quyền 4 lớp (RBAC → Store Scope → Limit Rules → Approval Override)**,
So that **mọi hành động được kiểm soát chặt chẽ theo vai trò, phạm vi cửa hàng và ngưỡng giới hạn** (FR53, FR54).

**Acceptance Criteria:**

**Given** hệ thống mới được khởi tạo
**When** tenant được tạo
**Then** 6 vai trò mặc định (Cashier, Kitchen, Shift Lead, Store Manager, Chain Owner, System Admin) được seed vào database với permissions mặc định

**Given** NestJS API nhận request
**When** request đi qua Guards Pipeline
**Then** thứ tự kiểm tra: AuthGuard → PolicyLoaderInterceptor → RoleGuard → StoreScopeGuard → LimitGuard → ApprovalGuard (NFR12)
**And** Policy Service đọc rules từ bảng `policies` (DB-driven)

**Given** Chain Owner muốn tạo custom role
**When** tạo role mới với permissions tùy chỉnh
**Then** role được lưu vào database, có thể gán cho users trong tenant

### Story 1.6: Store Scope Assignment & Multi-tenant Isolation

As a **quản trị viên hệ thống**,
I want **gán nhân viên vào phạm vi cửa hàng (Single Store / Store Group / All Stores) và đảm bảo dữ liệu không bị truy cập chéo tenant**,
So that **nhân viên chỉ thấy và thao tác dữ liệu trong phạm vi được phân quyền** (FR55, FR72).

**Acceptance Criteria:**

**Given** user được gán scope "Single Store" cho Store A
**When** user query bất kỳ dữ liệu nào
**Then** chỉ trả về dữ liệu của Store A, không bao giờ thấy dữ liệu Store B (NFR14)

**Given** user từ Tenant X
**When** cố gắng truy cập resource của Tenant Y (dù biết ID)
**Then** trả về 403 Forbidden, audit log ghi nhận attempt

**Given** quản trị viên gán user vào Store Group
**When** user đăng nhập
**Then** user thấy dropdown chọn store trong group, dữ liệu filter đúng scope

### Story 1.7: Design System Foundation — "Modern Bistro" Theme

As a **developer**,
I want **`packages/ui` được cấu hình với Tailwind CSS v4, Shadcn UI components, design tokens "Modern Bistro"**,
So that **tất cả views có giao diện nhất quán và đẹp mắt ngay từ đầu** (UX-DR1, UX-DR2).

**Acceptance Criteria:**

**Given** developer cần build UI
**When** import components từ `@pos-sdd/ui`
**Then** Shadcn UI Button, Card, Dialog, Input, Toast hoạt động với "Modern Bistro" theme (light mode, Slate & Teal/Emerald, glassmorphism, rounded-2xl)
**And** design tokens: semantic colors (bg-alert-critical, bg-success), Inter font, spacing 8px base unit

**Given** design system cần nhất quán
**When** áp dụng theme
**Then** 4 layout templates sẵn sàng: POS (2-column touch), KDS (grid landscape), Dashboard (mobile-first), Management (desktop sidebar) (UX-DR15)
**And** Button Hierarchy: Primary(Teal/Emerald), Secondary(trắng viền), Destructive(đỏ), Ghost(icon only) (UX-DR17)
**And** Accessibility: contrast ratio ≥4.5:1, hit targets ≥48x48px, ARIA labels template (UX-DR16)
**And** Loading States: Skeleton screens, Empty States with illustrations (UX-DR24, UX-DR25)

### Story 1.8: API Foundation — REST + Error Handling + Swagger

As a **developer**,
I want **NestJS 11 API được cấu hình với REST endpoints cơ bản, Swagger auto-generation, RFC 7807 error format, và common guards/interceptors/filters**,
So that **mọi module nghiệp vụ sau này có baseline nhất quán để xây dựng** (NFR33).

**Acceptance Criteria:**

**Given** NestJS app khởi động
**When** truy cập `/api/docs`
**Then** Swagger UI hiển thị với tất cả endpoints hiện có

**Given** request gây lỗi validation
**When** server trả về error
**Then** format RFC 7807: `{ type, title, status, detail, errorCode, timestamp }` (NFR16)

**Given** API nhận request
**When** response trả về
**Then** format: `{ data: {...}, meta: { page, limit, total } }` cho list, `{ data: {...} }` cho single item
**And** JSON fields camelCase, dates ISO 8601, currency integer (VND), null rõ ràng

**Given** common infrastructure
**When** module mới được tạo
**Then** có sẵn: TenantInterceptor (inject tenant_id), LoggingInterceptor, ValidationPipe, HttpExceptionFilter

## Epic 2: Menu Management & Catalog

Cửa hàng trưởng có thể thiết lập và quản lý toàn bộ thực đơn: tạo categories, sản phẩm (tên/giá/mô tả/hình), modifier groups, combo/set menu, cấu hình kitchen routing, bật/tắt trạng thái món, và đồng bộ menu xuống POS offline. Sau epic này, dữ liệu thực đơn sẵn sàng cho POS sử dụng.

### Story 2.1: Category Management (CRUD + Sắp xếp)

As a **cửa hàng trưởng**,
I want **tạo, chỉnh sửa, xóa các danh mục sản phẩm và sắp xếp thứ tự hiển thị**,
So that **thực đơn trên POS được tổ chức khoa học, thu ngân tìm món nhanh** (FR1).

**Acceptance Criteria:**

**Given** cửa hàng trưởng đăng nhập Management Portal
**When** tạo category mới (tên, icon, thứ tự)
**Then** category được lưu vào DB với `tenant_id` + `store_id`, hiển thị trong danh sách

**Given** danh sách categories đã tồn tại
**When** kéo thả để sắp xếp lại thứ tự
**Then** thứ tự mới được lưu, POS hiển thị theo thứ tự mới

**Given** category có chứa sản phẩm
**When** xóa category
**Then** hệ thống cảnh báo và yêu cầu chuyển sản phẩm sang category khác trước khi xóa

### Story 2.2: Menu Item Management (CRUD + Hình ảnh)

As a **cửa hàng trưởng**,
I want **tạo, chỉnh sửa và xóa sản phẩm bao gồm tên, giá, mô tả và hình ảnh**,
So that **thực đơn đầy đủ thông tin để thu ngân và khách hàng nhìn thấy** (FR2).

**Acceptance Criteria:**

**Given** cửa hàng trưởng trong Management Portal
**When** tạo product mới (tên, giá VND integer, mô tả, category, hình ảnh)
**Then** product được lưu với `tenant_id`, hình ảnh được upload và resize cho POS display

**Given** product đã tồn tại
**When** chỉnh sửa giá
**Then** giá mới có hiệu lực ngay, menu sync xuống POS

**Given** product đang bị gán trong combo hoặc order active
**When** xóa product
**Then** hệ thống cảnh báo dependencies, chỉ cho phép soft-delete (deactivate)

### Story 2.3: Modifier Groups & Topping System

As a **cửa hàng trưởng**,
I want **định nghĩa nhóm món thêm (modifier groups) bắt buộc/tùy chọn với giá riêng, gắn vào sản phẩm**,
So that **thu ngân có thể thêm topping/size/đường đá khi tạo order** (FR3).

**Acceptance Criteria:**

**Given** cửa hàng trưởng tạo modifier group
**When** set modifier group là "bắt buộc" (required) với min/max selection
**Then** POS bắt buộc chọn ít nhất min modifier khi thêm món có group này

**Given** modifier có giá riêng (vd: +5,000đ cho Thêm phô mai)
**When** thu ngân chọn modifier trên POS
**Then** giá modifier được cộng vào tổng giá món

**Given** 1 modifier group cần gắn cho nhiều products
**When** gán modifier group cho nhiều products cùng lúc
**Then** tất cả products đó hiển thị modifier group khi order

### Story 2.4: Combo/Set Menu Management

As a **cửa hàng trưởng**,
I want **tạo combo/set menu kết hợp nhiều món với giá ưu đãi**,
So that **cửa hàng có thể bán combo với giá hấp dẫn hơn mua lẻ** (FR4).

**Acceptance Criteria:**

**Given** cửa hàng trưởng tạo combo
**When** chọn 2+ items + set giá combo
**Then** combo hiển thị trên POS với giá combo (thấp hơn tổng giá lẻ)

**Given** combo chứa items có modifier groups
**When** thu ngân chọn combo trên POS
**Then** thu ngân vẫn có thể chọn modifiers cho từng item trong combo

**Given** 1 item trong combo bị hết hàng
**When** item đó `is_active = false`
**Then** combo tự động bị tạm ẩn trên POS, hiển thị lại khi item có hàng

### Story 2.5: Availability Control & Kitchen Station Routing

As a **cửa hàng trưởng**,
I want **bật/tắt trạng thái món (còn hàng/hết hàng) và gán món cho KDS station**,
So that **POS chỉ hiển thị món còn hàng, và bếp nhận đúng order thuộc station mình** (FR5, FR6).

**Acceptance Criteria:**

**Given** sản phẩm đang available
**When** cửa hàng trưởng tắt sang "Hết hàng" (sold out)
**Then** sản phẩm hiển thị greyed-out trên POS, không thể order

**Given** tồn kho nguyên liệu của một sản phẩm = 0 (từ Inventory module)
**When** hệ thống detect kho hết
**Then** sản phẩm tự động chuyển "Hết hàng" trên POS (FR5)

**Given** cửa hàng có 3 KDS stations (Bếp nóng, Bếp nguội, Bar)
**When** cửa hàng trưởng gán category "Phở" → Bếp nóng, "Nước uống" → Bar
**Then** khi order có Phở + Nước cam, Phở chỉ hiện trên KDS Bếp nóng, Nước cam chỉ hiện trên KDS Bar (FR6)

### Story 2.6: Menu Sync to POS Offline

As a **thu ngân**,
I want **dữ liệu thực đơn được tự động đồng bộ xuống POS để tôi luôn có menu mới nhất, kể cả khi offline**,
So that **tôi có thể order với thông tin chính xác dù mất mạng** (FR7).

**Acceptance Criteria:**

**Given** POS mở lên khi có mạng
**When** menu trên server có thay đổi kể từ lần sync cuối
**Then** POS tự động pull delta changes (Last-Write-Wins), cập nhật SQLite local

**Given** POS đang offline
**When** thu ngân mở menu
**Then** menu từ SQLite local được hiển thị đầy đủ (categories, items, modifiers, combos, giá, hình ảnh)

**Given** cửa hàng trưởng thay đổi giá 1 sản phẩm
**When** POS reconnect sau offline
**Then** giá mới được sync xuống, order mới dùng giá mới (order cũ giữ giá cũ)

## Epic 3: POS Order Creation & Table Management

Thu ngân có thể tạo đơn hàng nhanh (≤5 taps) với giao diện Snap-Order Card, quản lý bàn qua Visual Floor Plan, chọn bàn gán order, chỉnh sửa đơn hàng, tách/gộp bill, gộp/tách bàn, chuyển bàn, void/cancel theo RBAC, và auto điều hướng món đến KDS station. Luồng bán hàng cốt lõi hoạt động hoàn chỉnh.

### Story 3.1: POS Layout & Snap-Order Card UI

As a **thu ngân**,
I want **màn hình POS 2-column (Menu Grid trái + Cart phải) với Snap-Order Card hiển thị ảnh/tên/giá, chạm là bay vào giỏ hàng**,
So that **tôi tìm và chọn món trong <100ms, tối đa tốc độ phục vụ** (FR8, UX-DR3, UX-DR12).

**Acceptance Criteria:**

**Given** thu ngân đăng nhập POS
**When** màn hình Order mở ra
**Then** layout 2-column: bên trái hiển thị menu grid (categories tabs + Snap-Order Cards), bên phải hiển thị Cart panel
**And** Snap-Order Card có: ảnh nền mờ, giá góc trên, tên món ở dưới, badge số lượng nếu >1

**Given** thu ngân chạm vào Snap-Order Card
**When** item không có required modifier
**Then** item "bay" vào giỏ hàng ngay lập tức (<100ms), không popup confirm (Zero-Confirm Workflow — UX-DR12)
**And** micro-animation bay vào cart bằng Framer Motion (UX-DR20)

**Given** thu ngân chạm vào item CÓ required modifier
**When** modifier group là required
**Then** Contextual Sliding panel trượt ra ngay dưới item, thu ngân chọn modifiers rồi item mới vào cart (UX-DR13)

### Story 3.2: Order Creation & Lifecycle Management

As a **thu ngân**,
I want **tạo đơn hàng mới, hệ thống quản lý vòng đời đơn từ Draft → Closed**,
So that **mỗi đơn hàng được theo dõi trạng thái chính xác xuyên suốt** (FR8, FR9).

**Acceptance Criteria:**

**Given** thu ngân đã thêm items vào cart
**When** nhấn "Gửi đơn" (Send)
**Then** order chuyển từ Draft → Sent, lưu vào local DB (≤10ms — NFR2), và đẩy items đến KDS stations tương ứng (FR14)
**And** đơn hàng end-to-end từ tap → order confirmed ≤500ms (NFR3)

**Given** order đã được Sent
**When** bếp bắt đầu chế biến
**Then** trạng thái chuyển Preparing → Ready → Served theo cập nhật từ KDS

**Given** order đã Served
**When** thu ngân hoàn tất thanh toán
**Then** trạng thái chuyển Paid → Closed, order không thể chỉnh sửa nữa

### Story 3.3: Order Editing & Real-time KDS Update

As a **thu ngân**,
I want **chỉnh sửa đơn hàng đang active (thêm/bớt/sửa món) với cập nhật ngay xuống bếp**,
So that **khách đổi ý được phục vụ nhanh mà bếp không bị nhầm** (FR10).

**Acceptance Criteria:**

**Given** order đang ở trạng thái Draft hoặc Sent
**When** thu ngân thêm món mới vào order
**Then** món mới xuất hiện trên KDS ngay lập tức (real-time), items cũ không bị ảnh hưởng

**Given** order đang Sent, món chưa bắt đầu chế biến
**When** thu ngân xóa món khỏi order
**Then** món bị remove khỏi KDS, số lượng/tổng tiền cập nhật

**Given** món đang ở trạng thái "Đang nấu" (In Progress)
**When** thu ngân cố xóa món
**Then** hệ thống cảnh báo "Món đang được chế biến", yêu cầu xác nhận void

### Story 3.4: Cart Actions — Contextual Action Sheet & Global Order Toolbar

As a **thu ngân**,
I want **thao tác nhanh trên item (void, ghi chú, giảm giá) và trên cấp đơn hàng (chọn khách, gộp/tách bàn, discount toàn đơn)**,
So that **tôi xử lý mọi tình huống phức tạp mà không rời màn hình order** (FR15, UX-DR5, UX-DR6).

**Acceptance Criteria:**

**Given** item đã trong cart
**When** thu ngân long-press hoặc vuốt trái
**Then** Contextual Action Sheet hiện ra: Void (đỏ), Discount, Ghi chú (UX-DR5)
**And** void item tuân theo Limit Rules + Approval Override nếu vượt ngưỡng (FR15)

**Given** order đang active
**When** thu ngân sử dụng Global Order Toolbar
**Then** các chức năng: Chọn khách hàng, Gộp/Tách bàn, Giảm giá toàn đơn hoạt động (UX-DR6)

**Given** thu ngân void item vượt ngưỡng giới hạn
**When** hệ thống yêu cầu approval
**Then** người có quyền cao hơn nhập PIN trực tiếp trên thiết bị (≤3s), override được ghi audit log

### Story 3.5: Floor Plan Design & Table CRUD

As a **cửa hàng trưởng**,
I want **thiết kế sơ đồ mặt bằng bằng kéo-thả, tạo nhiều khu vực/tầng, CRUD bàn**,
So that **layout cửa hàng phản ánh thực tế, thu ngân dễ chọn bàn** (FR16, UX-DR7).

**Acceptance Criteria:**

**Given** cửa hàng trưởng mở Floor Plan editor
**When** tạo khu vực mới (Tầng 1, Sân thượng)
**Then** khu vực hiển thị trên canvas, có thể chuyển đổi giữa các tầng

**Given** canvas khu vực đang mở
**When** thêm bàn mới (số bàn, sức chứa, hình dạng)
**Then** bàn xuất hiện trên canvas, có thể kéo-thả đến vị trí mong muốn (UX-DR7)

**Given** sơ đồ đã hoàn thiện
**When** lưu layout
**Then** layout hiển thị trên POS cho thu ngân chọn bàn khi tạo order

### Story 3.6: Table Status Tracking & Table Widget

As a **thu ngân**,
I want **xem trạng thái bàn real-time (Trống/Có khách/Đang chờ/Đang tính tiền/Chưa dọn) trên sơ đồ**,
So that **tôi biết ngay bàn nào trống để xếp khách** (FR17, FR18, UX-DR8).

**Acceptance Criteria:**

**Given** POS hiển thị Floor Plan
**When** bàn có order active
**Then** Table Widget hiển thị: Occupied (Teal) + tổng tiền đơn + thời gian ngồi (UX-DR8)

**Given** bếp hoàn tất món cho bàn 7
**When** KDS bump order xong
**Then** Table Widget bàn 7 chuyển icon "Waiting → sẵn sàng phục vụ" (UX-DR8)

**Given** thu ngân chạm vào bàn Occupied
**When** mở chi tiết bàn
**Then** hiển thị tóm tắt: danh sách món, tổng tiền, trạng thái từng món (FR18)

**Given** order đã thanh toán xong
**When** bàn chuyển trạng thái
**Then** Table Widget hiển thị Dirty (xám + icon chổi), quay lại Available khi nhân viên đánh dấu đã dọn

### Story 3.7: Table Transfer, Merge & Split

As a **thu ngân**,
I want **chuyển order sang bàn khác, gộp nhiều bàn thành nhóm, và tách nhóm bàn**,
So that **khách đổi chỗ hay ngồi ghép bàn được xử lý nhanh gọn** (FR19, FR20).

**Acceptance Criteria:**

**Given** bàn 5 có order đang active
**When** thu ngân chuyển order sang bàn 8
**Then** order gắn vào bàn 8, bàn 5 chuyển Available, bàn 8 chuyển Occupied (FR19)

**Given** khách nhóm 10 cần 3 bàn liền
**When** thu ngân chọn bàn 3, 4, 5 → "Gộp bàn"
**Then** 3 bàn thành 1 group, order chung 1 bill, Table Widget hiển thị nhóm (FR20)

**Given** nhóm bàn đã gộp
**When** thu ngân tách nhóm
**Then** mỗi bàn trở thành bàn riêng, order có thể split bill theo bàn

### Story 3.8: Split Bill & Merge Bill

As a **thu ngân**,
I want **tách hóa đơn theo món/phần trăm/số tiền và gộp hóa đơn từ nhiều bàn**,
So that **nhóm khách chia tiền hoặc thanh toán gộp được phục vụ linh hoạt** (FR11, FR12).

**Acceptance Criteria:**

**Given** order có 5 items, 2 khách muốn chia tiền
**When** thu ngân chọn "Tách bill" → chọn items cho mỗi khách
**Then** hệ thống tạo 2 bill riêng biệt, tổng 2 bill = tổng order gốc (FR11)

**Given** thu ngân chọn tách theo %
**When** nhập 60% - 40%
**Then** hệ thống chia đều tổng tiền theo tỷ lệ, làm tròn VND (integer)

**Given** bàn 3 và bàn 5 muốn thanh toán chung
**When** thu ngân chọn "Gộp bill"
**Then** 2 orders merge thành 1 bill duy nhất, hiển thị tổng tất cả items (FR12)

## Epic 4: Kitchen Display System (KDS)

Nhân viên bếp nhận đơn hàng real-time trên KDS (WebSocket/LAN), xem danh sách theo station, cập nhật trạng thái chế biến bằng chạm, quản lý hàng đợi FIFO, theo dõi timer SLA (xanh/vàng/đỏ), hỗ trợ nhiều màn hình, và đồng bộ trạng thái 2 chiều với POS. Luồng chế biến không giấy tờ hoàn chỉnh.

### Story 4.1: KDS Layout & Auto-Station Filtering

As a **nhân viên bếp**,
I want **màn hình KDS hiển thị layout dạng grid (nhiều thẻ order) và chỉ hiển thị các món được gán cho trạm của tôi**,
So that **tôi tập trung chế biến đúng phần việc mà không bị nhiễu thông tin** (FR23, FR27, UX-DR15).

**Acceptance Criteria:**

**Given** nhân viên bếp đăng nhập KDS
**When** chọn trạm (vd: Bếp nóng)
**Then** KDS load layout dạng grid landscape, tự động giãn thẻ khi ít đơn
**And** chỉ hiển thị các order có chứa món thuộc category/routing của "Bếp nóng"

**Given** order có "Phở" (Bếp nóng) và "Nước cam" (Bar)
**When** order được gửi lên KDS
**Then** thẻ order hiển thị trên KDS Bếp nóng chỉ có món "Phở", trên KDS Bar chỉ có món "Nước cam"

**Given** KDS nhận order
**When** thu ngân xóa 1 món thuộc station khác
**Then** order trên station này không bị ảnh hưởng

### Story 4.2: Real-time Order Reception & Sound Alert

As a **nhân viên bếp**,
I want **nhận order mới ngay lập tức qua WebSocket/LAN kèm theo âm thanh thông báo**,
So that **tôi không bị lỡ đơn và bắt đầu chế biến nhanh nhất** (FR22, NFR4, UX-DR22).

**Acceptance Criteria:**

**Given** KDS đang mở
**When** POS nhấn "Gửi đơn"
**Then** thẻ order xuất hiện trên KDS trong ≤1 giây (NFR4) (qua WebSocket nếu online, LAN nếu offline)
**And** phát ra âm thanh "Ting!" báo đơn mới (UX-DR22)

**Given** mạng internet bị rớt
**When** POS gửi đơn qua LAN
**Then** KDS vẫn nhận được đơn real-time và phát âm thanh bình thường

### Story 4.3: KDS Ticket UI & Progression States

As a **nhân viên bếp**,
I want **mỗi thẻ đơn hàng (KDS Ticket) hiển thị rõ tên món, số lượng, modifiers, và có thể cập nhật trạng thái chế biến bằng chạm**,
So that **tôi đọc order dễ dàng và tương tác thuận tiện khi tay đang bẩn/ướt** (FR24, UX-DR4).

**Acceptance Criteria:**

**Given** order xuất hiện trên KDS
**When** nhân viên bếp nhìn vào thẻ
**Then** hiển thị rõ ràng: Text lớn, modifiers được thụt lề dưới món chính
**And** hỗ trợ 2 chế độ xem: Order View (tất cả món trong order) / Batch Item View (từng món riêng biệt)

**Given** món đang ở trạng thái New
**When** nhân viên bếp chạm vào (bump)
**Then** món chuyển sang Đang nấu (In Progress)

**Given** món đã nấu xong
**When** nhân viên bếp chạm lần nữa
**Then** món chuyển sang Sẵn sàng (Ready), gửi trạng thái ngược lại cho POS (FR28)

### Story 4.4: SLA Countdown & Heat-map Indicators

As a **nhân viên bếp**,
I want **mỗi thẻ order có đồng hồ đếm ngược và đổi màu cảnh báo khi sắp trễ/quá hạn**,
So that **tôi biết đơn nào cần ưu tiên xử lý để đảm bảo SLA** (FR26, UX-DR4, UX-DR14).

**Acceptance Criteria:**

**Given** order mới vào
**When** thời gian trôi qua
**Then** đồng hồ đếm ngược hiển thị trên thẻ (so với target time cấu hình)

**Given** order sắp quá hạn (vd: >10p cho target 15p)
**When** kiểm tra UI
**Then** thẻ order chuyển sang màu vàng (Warning), "nóng lên" đậm hơn (Heat-map)

**Given** order đã quá hạn SLA
**When** thời gian đếm về 0
**Then** thẻ order chuyển màu đỏ (Overdue), icon nháy nhẹ (Animation shake) kèm âm thanh nhắc nhở (UX-DR18)

### Story 4.5: FIFO Queue Management & Auto-Prioritization

As a **nhân viên bếp**,
I want **danh sách order tự động sắp xếp theo thứ tự vào trước (FIFO) và đôn ưu tiên các đơn quá hạn**,
So that **tôi phục vụ công bằng và không để khách đợi quá lâu** (FR25).

**Acceptance Criteria:**

**Given** nhiều orders đến cùng lúc
**When** hiển thị trên KDS
**Then** sắp xếp mặc định theo thứ tự thời gian tạo (cũ nhất ở trên cùng bên trái)

**Given** có order sắp/đã vượt SLA (màu đỏ)
**When** order mới tới (còn thời gian)
**Then** order SLA đỏ vẫn được neo giữ vị trí ưu tiên đầu tiên dù thứ tự sắp xếp có thể thay đổi

**Given** màn hình KDS đã đầy thẻ
**When** order mới đến
**Then** có chỉ báo scroll rõ ràng để xem tiếp, các đơn cũ nhất vẫn nằm ở focus point

## Epic 5: Payment & Cash Shift Management

Thu ngân có thể thanh toán bằng tiền mặt hoặc VietQR (kể cả hỗn hợp), tách thanh toán, tính tiền thối với gợi ý mệnh giá nhanh, tạo mã VietQR in trên bill, refund theo RBAC, in hóa đơn/phiếu bếp (cấu hình template), quản lý ca tiền mặt (mở/đóng ca + khai báo), và đối soát cuối ngày. Luồng tài chính khép kín.

### Story 5.1: Payment Processing (Cash & Mixed)

As a **thu ngân**,
I want **xử lý thanh toán bằng tiền mặt, hỗ trợ tính tiền thối thông qua Numeric Keypad lớn, và thanh toán hỗn hợp**,
So that **quy trình thu tiền diễn ra cực kỳ nhanh và không bị nhầm lẫn** (FR29, FR30, FR31, UX-DR23).

**Acceptance Criteria:**

**Given** thu ngân đang ở màn hình thanh toán
**When** chọn phương thức Tiền mặt
**Then** Numeric Keypad lớn hiện ra cùng các nút gợi ý mệnh giá tiền (vd: bill 85k → gợi ý 100k, 200k, 500k) (UX-DR23)

**Given** khách đưa 500,000đ cho hóa đơn 230,000đ
**When** thu ngân nhập 500,000
**Then** hệ thống tự độ tính tiền thối lại là 270,000đ hiển thị to rõ

**Given** hóa đơn 1,000,000đ, khách muốn trả 500k tiền mặt + 500k thẻ
**When** thu ngân nhập 500k tiền mặt
**Then** hệ thống ghi nhận, phần còn lại (500k) vẫn hiển thị chờ thanh toán phương thức khác (FR30)

**Given** thanh toán tiền mặt thành công
**When** order chuyển sang Paid
**Then** hệ thống trigger mở ngăn kéo đựng tiền qua cổng RJ11 của máy in (NFR40)

### Story 5.2: VietQR Payment Integration

As a **thu ngân**,
I want **hệ thống tạo mã VietQR chuẩn xác với số tiền và nội dung chuyển khoản**,
So that **khách hàng có thể quét mã thanh toán ngay mà không cần tôi đọc số tài khoản** (FR29, FR32).

**Acceptance Criteria:**

**Given** thu ngân chọn phương thức thanh toán VietQR
**When** màn hình chờ quét mã hiện lên
**Then** hệ thống generate mã VietQR (chuẩn NAPAS) chứa thông tin tài khoản ngân hàng của cửa hàng + tổng tiền bill + nội dung là Order ID (NFR32)

**Given** khách muốn quét từ hóa đơn giấy
**When** thu ngân chọn in tạm tính
**Then** mã VietQR được in trực tiếp trên bill giấy (FR32)

**Given** chính sách bảo mật
**When** giao dịch qua thẻ/QR
**Then** hệ thống POS không lưu trữ hay xử lý bất kỳ dữ liệu thẻ/tài khoản cá nhân nào (NFR15)

### Story 5.3: Receipt & Ticket Auto-Printing

As a **thu ngân**,
I want **hệ thống tự động in hóa đơn cho khách và in lại khi cần thiết**,
So that **tôi không phải thực hiện quá nhiều thao tác sau khi nhận tiền** (FR34).

**Acceptance Criteria:**

**Given** máy POS đã kết nối với máy in nhiệt qua USB/Bluetooth/LAN (tương thích ESC/POS)
**When** order được chuyển sang trạng thái Paid
**Then** máy in tự động in hóa đơn khách hàng (Receipt template) (NFR30, NFR31)

**Given** khách muốn xin lại hóa đơn cũ
**When** thu ngân tìm đơn trong Lịch sử và chọn "In lại"
**Then** máy in xuất hóa đơn với đánh dấu "Bản sao / Reprint" (FR34)

**Given** network offline
**When** in hóa đơn
**Then** lệnh in vẫn được gửi trực tiếp từ POS qua USB/Bluetooth/LAN tới máy in (FR71)

### Story 5.4: Shift & Cash Drawer Management

As a **thu ngân**,
I want **mở ca với số tiền đầu ngày, và đóng ca với thao tác kiểm đếm**,
So that **tiền trong ngăn kéo được đối khớp với doanh thu ghi nhận trên máy** (FR35).

**Acceptance Criteria:**

**Given** thu ngân đăng nhập ca mới
**When** hộp thoại "Mở ca" hiện lên
**Then** thu ngân phải nhập số tiền mặt có sẵn trong két (Tiền lẻ đầu ca) mới được bắt đầu bán hàng

**Given** thu ngân kết thúc ca làm việc
**When** bấm "Đóng ca"
**Then** hệ thống yêu cầu nhập số đếm tiền mặt thực tế trong két
**And** in ra báo cáo chênh lệch: Tiền thực tế so với (Tiền đầu ca + Tiền mặt thu được - Tiền hoàn/chi) (FR35)

### Story 5.5: Unified Reconciliation Grid (Đối soát tự động)

As a **kế toán / cửa hàng trưởng**,
I want **xem báo cáo quyết toán gộp dữ liệu hệ thống, khai báo tiền mặt của thu ngân, và dữ liệu thanh toán điện tử trên một lưới (grid) duy nhất**,
So that **tôi check chênh lệch (anomaly) cực nhanh cuối ngày** (FR36, UX-DR11).

**Acceptance Criteria:**

**Given** kế toán mở tab "Đối soát" (Reconciliation)
**When** chọn ngày hôm qua
**Then** Unified Reconciliation Grid hiển thị 3 cột chính: Data Hệ thống | Khai báo Thu ngân | Chênh lệch (UX-DR11)

**Given** ca sáng có lệch 5,000đ tiền mặt
**When** dòng đó hiển thị
**Then** số 5,000đ (chênh thiếu) bị highlight màu Đỏ (Destructive color), hiển thị rõ ràng để kế toán follow up

**Given** có các giao dịch refund trong ngày
**When** kiểm tra báo cáo
**Then** mọi giao dịch refund (FR33) được bóc tách riêng khỏi doanh thu thuần

## Epic 6: Promotion & Discount Engine

Cửa hàng trưởng có thể tạo và quản lý đa dạng khuyến mãi (giảm %, giảm tiền, giá đặc biệt, Buy X Get Y, combo, theo khung giờ, coupon) với điều kiện linh hoạt. Hệ thống tự động áp dụng khuyến mãi đủ điều kiện vào đơn hàng.

### Story 6.1: Basic Discounts Management (%, Tiền mặt, Giá đặc biệt)

As a **cửa hàng trưởng**,
I want **tạo các chương trình giảm giá cơ bản (theo % hoặc số tiền cố định) áp dụng cho món/danh mục/đơn hàng, và set giá khuyến mãi riêng**,
So that **cửa hàng có thể chạy các campaign giảm giá thông thường** (FR60, FR61, FR62).

**Acceptance Criteria:**

**Given** cửa hàng trưởng chọn tạo Khuyến mãi
**When** chọn loại "Giảm %" hoặc "Giảm số tiền" (vd: Giảm 20% toàn menu, hoặc Giảm 30k cho bill)
**Then** chương trình lưu vào DB với các điều kiện tương ứng

**Given** chương trình đang active
**When** thu ngân tạo order thỏa điều kiện trên POS
**Then** hệ thống tự động tính toán và hiển thị số tiền được giảm rõ ràng trong Cart (FR13)

**Given** một món có giá trị 50k
**When** cửa hàng trưởng set "Giá khuyến mãi" là 39k
**Then** POS hiển thị giá mới là 39k, lưu lại mức chênh lệch vào report khuyến mãi

### Story 6.2: Advanced Rules: Buy X Get Y & Combos

As a **cửa hàng trưởng**,
I want **tạo khuyến mãi mua X tặng Y (hoặc mua X được giảm Y) và các rule combo động**,
So that **tôi kích thích khách hàng mua nhiều hơn** (FR63, FR64).

**Acceptance Criteria:**

**Given** chương trình "Mua 2 Trà Sữa tặng 1 Bánh mì" đang active
**When** thu ngân thêm 2 Trà Sữa vào order
**Then** POS hiển thị gợi ý (prompt) báo khách đủ điều kiện nhận 1 Bánh mì

**Given** thu ngân thêm Bánh mì vào order chứa 2 Trà Sữa
**When** giỏ hàng cập nhật
**Then** Bánh mì tự động có giá 0đ kèm nhãn "Quà tặng" (FR63)

**Given** chương trình "Combo Động: 1 Nước + 1 Bánh = 45k"
**When** thu ngân thêm bất kỳ 1 Nước (30k) và 1 Bánh (25k) vào order
**Then** hệ thống tự động gom 2 món này lại, giảm tổng tiền xuống 45k (thay vì 55k) (FR64)

### Story 6.3: Scheduled Promotions (Happy Hour)

As a **cửa hàng trưởng**,
I want **cài đặt khuyến mãi theo khung giờ và ngày trong tuần (vd: Happy Hour)**,
So that **khuyến mãi tự động bật/tắt đúng giờ, thu ngân không cần nhớ** (FR65).

**Acceptance Criteria:**

**Given** khuyến mãi "Happy Hour Giảm 50% Bia" được set từ 16:00 đến 18:00 hàng ngày
**When** đồng hồ là 15:59
**Then** giá Bia trên POS là giá gốc

**Given** đồng hồ chuyển sang 16:00
**When** thu ngân thêm Bia vào đơn
**Then** hệ thống tự động áp dụng giảm 50%

**Given** order chứa Bia tạo lúc 17:55 nhưng thanh toán lúc 18:05
**When** thanh toán
**Then** giá giảm 50% vẫn được giữ nguyên (khóa giá lúc order)

### Story 6.4: Promotion Conditions & Stacking Rules

As a **cửa hàng trưởng**,
I want **thiết lập các điều kiện ngặt nghèo (bill tối thiểu, lượt dùng) và quy tắc cộng dồn (stacking) cho khuyến mãi**,
So that **cửa hàng không bị lỗ khi khách áp dụng quá nhiều offer cùng lúc** (FR67).

**Acceptance Criteria:**

**Given** khuyến mãi có điều kiện "Bill tối thiểu 200k"
**When** order hiện tại là 180k
**Then** khuyến mãi chưa được áp dụng, hệ thống có thể hiển thị hint "Mua thêm 20k để được giảm..."

**Given** chương trình có giới hạn "Tối đa 50 lượt dùng"
**When** lượt dùng đạt 50
**Then** chương trình tự động chuyển sang trạng thái "Hết lượt", không áp dụng cho đơn tiếp theo

**Given** 2 khuyến mãi cùng active: "Giảm 10% thẻ VIP" (Cho phép dồn) và "Voucher 50k" (Không cho dồn)
**When** order đủ điều kiện cả 2
**Then** hệ thống dùng thuật toán (Policy Service) chọn ra mức giảm có lợi nhất cho khách, trừ khi rules chỉ định ngược lại

### Story 6.5: Coupon & Voucher Codes

As a **thu ngân**,
I want **nhập mã giảm giá (coupon) từ khách hàng vào hệ thống**,
So that **hệ thống kiểm tra mã có hợp lệ không và tự động trừ tiền** (FR66).

**Acceptance Criteria:**

**Given** khách đưa mã coupon "WELCOME50"
**When** thu ngân gõ (hoặc quét barcode) mã này vào ô Coupon trên POS
**Then** hệ thống call API (hoặc check local DB nếu offline) để xác thực mã

**Given** mã hợp lệ
**When** áp dụng thành công
**Then** hệ thống trừ tiền trên bill, đánh dấu lượt dùng (nếu online) hoặc lưu trữ offline sync sau

**Given** mã hết hạn hoặc đã tiêu
**When** thu ngân nhập mã
**Then** POS hiển thị lỗi rõ ràng (vd: "Mã giảm giá đã hết hạn vào dd/mm")

## Epic 7: Inventory & Stock Management

Cửa hàng trưởng quản lý nguyên liệu/vật tư (CRUD), theo dõi tồn kho cấp cửa hàng, nhập/xuất kho với audit trail, điều chỉnh kiểm kê, định nghĩa công thức (recipe mapping), hệ thống tự động trừ kho khi bán (kể cả offline), cảnh báo tồn kho thấp và auto tắt món hết nguyên liệu.

### Story 7.1: Ingredient/Material Management (CRUD)

As a **cửa hàng trưởng**,
I want **tạo, chỉnh sửa, xóa danh mục nguyên liệu/vật tư (tên, đơn vị tính, giá nhập trung bình)**,
So that **hệ thống có Master Data để theo dõi tồn kho** (FR37).

**Acceptance Criteria:**

**Given** cửa hàng trưởng trong Management Portal
**When** tạo mới một nguyên liệu (vd: Cà phê hạt, Đơn vị: gram, Giá: 200đ/g)
**Then** hệ thống lưu dữ liệu vào bảng `ingredients` với `tenant_id`

**Given** danh sách nguyên liệu trống
**When** hiển thị màn hình Inventory
**Then** hiển thị Empty State thân thiện kèm hướng dẫn tạo mới (UX-DR24)

**Given** nguyên liệu đã tham gia vào công thức (recipe)
**When** cố gắng xóa nguyên liệu
**Then** hệ thống chặn lại, hiển thị danh sách các món đang dùng nguyên liệu này

### Story 7.2: Inventory Stock Tracking & Transactions (Nhập/Xuất)

As a **cửa hàng trưởng**,
I want **ghi nhận các giao dịch nhập kho, xuất hủy, điều chỉnh kiểm kê để hệ thống cập nhật số lượng tồn**,
So that **số dư kho trên phần mềm luôn khớp với thực tế** (FR38, FR39, FR40).

**Acceptance Criteria:**

**Given** cửa hàng tạo phiếu "Nhập hàng"
**When** thêm 5kg (5000g) Cà phê hạt vào kho
**Then** số lượng tồn kho của Cà phê hạt tăng lên 5000g, lưu nhật ký giao dịch (FR38, FR39)

**Given** cuối tháng kiểm kê thực tế lệch với máy (thiếu 200g)
**When** tạo phiếu "Điều chỉnh kiểm kê"
**Then** hệ thống bắt buộc nhập "Lý do", cập nhật số lượng thực tế, lưu audit trail (FR40)

**Given** giao dịch kho đã hoàn tất
**When** thủ kho xem lịch sử
**Then** không ai có quyền sửa/xóa các giao dịch cũ, chỉ có thể tạo phiếu xuất/điều chỉnh mới

### Story 7.3: Recipe Mapping (Định nghĩa công thức)

As a **cửa hàng trưởng**,
I want **định nghĩa công thức (recipe) cho món/sản phẩm bằng cách gán định lượng nguyên liệu cụ thể**,
So that **hệ thống biết cần trừ đi bao nhiêu nguyên liệu cho mỗi đơn vị sản phẩm bán ra** (FR41).

**Acceptance Criteria:**

**Given** sản phẩm "Cà phê sữa đá"
**When** mở tab "Công thức"
**Then** có thể thêm nguyên liệu: Cà phê hạt (18g), Sữa đặc (30ml)

**Given** một món thêm (modifier) "Thêm Sữa"
**When** định nghĩa công thức cho modifier
**Then** có thể thêm nguyên liệu Sữa đặc (20ml) cho riêng modifier này

**Given** sản phẩm đang active
**When** lưu công thức
**Then** hệ thống bắt đầu áp dụng công thức này cho các đơn hàng tiếp theo

### Story 7.4: Auto-Deduction (POS-to-Inventory Sync)

As a **quản lý**,
I want **hệ thống tự động trừ kho số lượng nguyên liệu tương ứng ngay khi đơn hàng hoàn tất**,
So that **kho được đối trừ real-time hoặc ngay sau khi có mạng lại** (FR42).

**Acceptance Criteria:**

**Given** order "Cà phê sữa đá" đã thanh toán (Paid)
**When** background job xử lý
**Then** tồn kho của "Cà phê hạt" giảm 18g, "Sữa đặc" giảm 30ml (FR42)

**Given** order được tạo khi hệ thống đang Offline
**When** POS sync log lên Cloud sau khi có mạng
**Then** Inventory service sử dụng CRDT để trừ kho bù một cách chính xác mà không bị conflict

**Given** order chứa món bị mâu thuẫn tồn kho (âm kho)
**When** inventory job chạy
**Then** cho phép kho âm để không block luồng bán hàng, nhưng trigger alert đánh dấu anomaly

### Story 7.5: Low Stock Alerts & Inventory Reports

As a **cửa hàng trưởng**,
I want **nhận cảnh báo khi tồn kho dưới ngưỡng an toàn, tự động tắt món trên POS, và xem báo cáo tồn kho**,
So that **tôi kịp thời nhập hàng bù và không bị gián đoạn bán ra** (FR43, FR44).

**Acceptance Criteria:**

**Given** mức tồn an toàn của Cà phê hạt là 1000g
**When** trừ kho làm Cà phê dưới 1000g
**Then** hiển thị cảnh báo (UI badge/Dashboard) cho cửa hàng trưởng

**Given** cấu hình "Tự động ngưng món khi hết nguyên liệu" = True
**When** tồn kho = 0
**Then** tất cả các món dùng nguyên liệu này tự động chuyển "Hết hàng" (Sold out), sync xuống POS (FR43)

**Given** cửa hàng trưởng mở tab "Báo cáo Kho"
**When** chọn xuất báo cáo tháng
**Then** hệ thống hiển thị: Tồn đầu kỳ, Tổng Nhập, Tổng Xuất (bán), Hao hụt, Tồn cuối kỳ, Giá trị kho (FR44)

## Epic 8: Offline Mode & Data Sync

Hệ thống hoạt động hoàn toàn offline 4-24h (buffer ≥5,000 đơn), tự động đồng bộ dữ liệu lên cloud <2 phút khi có mạng (zero data loss), POS↔KDS giao tiếp qua LAN khi mất internet, in nhiệt qua USB/BT/Network offline. "Bất khả chiến bại khi mất mạng."

### Story 8.1: SQLite Offline Database & Service Worker Setup

As a **thu ngân**,
I want **POS hoạt động hoàn toàn offline với local database (SQLite via OPFS), có thể tạo order, thanh toán, và in bill khi mất mạng**,
So that **doanh nghiệp không bao giờ bị gián đoạn bán hàng vì mất internet** (FR68).

**Acceptance Criteria:**

**Given** POS đã đăng nhập thành công khi online
**When** internet bị ngắt
**Then** POS tiếp tục hoạt động bình thường: tạo order, thêm/sửa/xóa món, tính tiền, thanh toán tiền mặt
**And** SQLite local (wa-sqlite via OPFS) lưu trữ tất cả giao dịch, buffer ≥5,000 đơn (NFR18)

**Given** Web Worker chạy SQLite engine
**When** thu ngân ghi order
**Then** local DB write ≤10ms (NFR2), UI thread không bị block

**Given** Service Worker đã cached
**When** mất mạng
**Then** toàn bộ app shell, assets, menu data load từ cache, không hiển thị lỗi mạng
**And** OfflineIndicator icon chuyển sang xám (UX-DR21), không gây gián đoạn luồng làm việc

### Story 8.2: LAN Communication (POS ↔ KDS Offline)

As a **nhân viên bếp**,
I want **nhận order từ POS qua mạng LAN nội bộ khi không có internet**,
So that **bếp vẫn nhận đơn real-time ngay cả khi mất kết nối cloud** (FR70).

**Acceptance Criteria:**

**Given** POS và KDS cùng kết nối mạng LAN (WiFi/Ethernet)
**When** internet bị mất
**Then** POS tự động phát hiện (mDNS discovery) và kết nối trực tiếp đến KDS qua LAN WebSocket (FR70)

**Given** POS gửi order qua LAN
**When** KDS nhận
**Then** order hiển thị trên KDS trong ≤1 giây (NFR4), bao gồm cả cập nhật trạng thái 2 chiều (KDS bump → POS cập nhật)

**Given** POS kết nối lại internet
**When** LAN connection vẫn đang hoạt động
**Then** hệ thống ưu tiên Cloud WebSocket (Socket.IO), LAN chuyển sang fallback/backup

### Story 8.3: Data Sync Engine & Conflict Resolution

As a **quản lý**,
I want **khi internet được khôi phục, hệ thống tự động đồng bộ toàn bộ dữ liệu offline lên cloud mà không mất dữ liệu**,
So that **mọi giao dịch offline đều được ghi nhận chính xác trên hệ thống trung tâm** (FR69).

**Acceptance Criteria:**

**Given** POS đã hoạt động offline 4 tiếng với 200 orders
**When** internet phục hồi
**Then** Sync Engine (chạy trên Web Worker) tự động push toàn bộ event log lên cloud
**And** sync hoàn tất trong ≤2 phút cho 5,000 orders (NFR20), zero data loss (NFR19)

**Given** 2 POS cùng offline, cùng điều chỉnh tồn kho
**When** cả 2 POS đồng bộ lên cloud
**Then** Inventory conflict được giải quyết bằng CRDT, không mất dữ liệu

**Given** menu/settings thay đổi trên cloud trong lúc POS offline
**When** POS sync
**Then** Last-Write-Wins strategy áp dụng cho menu/settings, POS cập nhật dữ liệu mới nhất

**Given** order event log
**When** đồng bộ lên cloud
**Then** Event Sourcing append-only, không sửa/xóa event cũ, cloud replay để build state chính xác

### Story 8.4: Local Backup & Device Recovery

As a **cửa hàng trưởng**,
I want **hệ thống tự động backup local mỗi 5 phút và hỗ trợ khôi phục trên thiết bị mới**,
So that **nếu thiết bị hỏng, tôi có thể hot-swap máy mới trong ≤5 phút** (NFR23).

**Acceptance Criteria:**

**Given** POS đang hoạt động
**When** mỗi 5 phút trôi qua
**Then** hệ thống auto-backup SQLite database vào OPFS snapshot (NFR23)

**Given** thiết bị POS bị hỏng
**When** thay máy mới, đăng nhập cùng tài khoản
**Then** hệ thống pull data từ cloud (nếu online) hoặc restore từ backup file
**And** POS sẵn sàng hoạt động trong ≤5 phút

**Given** backup đang chạy
**When** thu ngân đang tạo order
**Then** backup chạy trên Web Worker, không ảnh hưởng performance UI

## Epic 9: Reporting & Real-time Dashboard

Quản lý nắm bắt tình hình kinh doanh trong ≤30 giây qua Dashboard real-time. Hệ thống cung cấp báo cáo doanh thu, hiệu suất sản phẩm, thông kê thanh toán, và cho phép so sánh đa chi nhánh.

### Story 9.1: Real-time Dashboard & KPI Widgets

As a **cửa hàng trưởng / chủ chuỗi**,
I want **Dashboard thời gian thực hiển thị KPI tổng quan (doanh thu hôm nay, số đơn, giá trị trung bình, tỷ lệ hủy) trong ≤30 giây đầu tiên**,
So that **tôi nhận diện tình huống kinh doanh ngay khi mở app** (FR50).

**Acceptance Criteria:**

**Given** quản lý đăng nhập Dashboard (mobile-first layout)
**When** trang Dashboard load
**Then** hiển thị widgets KPI: Doanh thu hôm nay, Số đơn, Avg. Ticket, Tỷ lệ hủy, Bếp SLA Compliance
**And** Dashboard + widgets load ≤3 giây (NFR5)

**Given** POS đang bán hàng
**When** có order mới hoàn tất
**Then** KPI widgets cập nhật real-time (via WebSocket hoặc polling 30s)

**Given** quản lý xem Dashboard trên điện thoại
**When** xoay ngang
**Then** layout responsive: mobile-first 1 column, tablet 2 columns, desktop full grid (UX-DR15)

### Story 9.2: Sales & Revenue Reports

As a **cửa hàng trưởng**,
I want **xem báo cáo bán hàng theo giờ/ca/ngày/tuần/tháng với so sánh cùng kỳ**,
So that **tôi biết xu hướng doanh thu và lên kế hoạch nhân sự/hàng hóa** (FR45).

**Acceptance Criteria:**

**Given** quản lý mở tab "Báo cáo bán hàng"
**When** chọn khoảng thời gian (vd: Tuần này)
**Then** hiển thị biểu đồ doanh thu theo ngày + bảng chi tiết (giờ/ca/ngày)
**And** báo cáo render ≤5 giây (NFR6)

**Given** xem báo cáo tháng 3
**When** bật "So sánh cùng kỳ"
**Then** hiển thị overlay tháng 3 năm ngoái, tính % tăng/giảm

**Given** quản lý muốn xuất dữ liệu
**When** bấm "Export"
**Then** hệ thống xuất file CSV hoặc JSON (NFR35)

### Story 9.3: Product Performance & Order Analytics

As a **cửa hàng trưởng**,
I want **xem báo cáo hiệu suất sản phẩm (bán chạy, doanh thu, xu hướng) và phân tích đơn hàng (giờ cao điểm, thời gian phục vụ)**,
So that **tôi biết món nào bán tốt để đẩy mạnh và giờ nào cần tăng nhân sự** (FR46, FR47).

**Acceptance Criteria:**

**Given** quản lý mở "Phân tích sản phẩm"
**When** chọn tuần hiện tại
**Then** hiển thị bảng xếp hạng: Top 10 món bán chạy, Bottom 10 món không bán, đóng góp doanh thu theo % (FR46)

**Given** quản lý mở "Phân tích đơn hàng"
**When** xem biểu đồ
**Then** hiển thị: Số đơn theo giờ (heatmap), giờ cao điểm highlight, số món trung bình/đơn, thời gian phục vụ trung bình, tỷ lệ hủy (FR47)

### Story 9.4: Payment & Staff Performance Reports

As a **cửa hàng trưởng**,
I want **xem báo cáo thanh toán theo phương thức và hiệu suất nhân viên**,
So that **tôi đối soát thanh toán và đánh giá nhân viên dựa trên dữ liệu** (FR48, FR49).

**Acceptance Criteria:**

**Given** quản lý mở "Báo cáo thanh toán"
**When** chọn ngày
**Then** hiển thị chi tiết: Tiền mặt vs VietQR, số lượng giao dịch, refund breakdown (FR48)

**Given** quản lý mở "Hiệu suất nhân viên"
**When** chọn tuần
**Then** hiển thị bảng: Tên nhân viên | Số đơn/giờ | Doanh thu | Tỷ lệ void | Avg. thời gian xử lý (FR49)

**Given** nhân viên A có tỷ lệ void > 5%
**When** hiển thị trong bảng
**Then** highlight đỏ kèm icon cảnh báo "Insight to Action" (UX-DR26)

### Story 9.5: Kitchen Analytics & Multi-branch Comparison

As a **chủ chuỗi**,
I want **xem phân tích bếp (thời gian nấu, SLA compliance) và so sánh hiệu suất giữa các chi nhánh**,
So that **tôi tối ưu vận hành bếp và phát hiện chi nhánh yếu** (FR51, UX-DR9).

**Acceptance Criteria:**

**Given** quản lý mở "Phân tích bếp"
**When** chọn khoảng thời gian
**Then** hiển thị: Thời gian chế biến TB, SLA compliance %, Top 5 món chậm nhất (FR51)

**Given** chủ chuỗi có 5 chi nhánh
**When** mở "So sánh chi nhánh"
**Then** Multi-branch Comparison Chart hiển thị: biểu đồ cột xếp hạng doanh thu/tốc độ bếp/tỷ lệ hủy đơn (UX-DR9)
**And** Anomaly Detection indicators đánh dấu chi nhánh có chỉ số lệch chuẩn >2σ

**Given** chi nhánh Quận 1 có SLA compliance chỉ 60%
**When** quản lý click vào chi nhánh
**Then** drill-down hiển thị chi tiết: giờ nào chậm nhất, món nào chậm nhất, nhân viên bếp nào chậm nhất

## Epic 10: Shift Operations & System Configuration

Quản lý cài đặt thông tin cửa hàng chung, mã số thuế gốc, hóa đơn chuẩn, cấu hình thuế phí, phân công nhân viên theo khu vực ca và xem xét audit log để đảm bảo tuân thủ.

### Story 10.1: Shift & Area Assignment for Staff

As a **cửa hàng trưởng**,
I want **phân công nhân viên phụ trách nhận/phục vụ một hoặc nhiều khu vực bàn cụ thể trong ca làm việc**,
So that **quy trình phục vụ rõ ràng và hệ thống có thể tính KPI đúng người** (FR21).

**Acceptance Criteria:**

**Given** cửa hàng trưởng mở quản lý phân ca
**When** chọn nhân viên A
**Then** có thể tick chọn các khu vực (vd: Tầng 1, Sân thuợng) để gán cho nhân viên này

**Given** nhân viên A đăng nhập POS
**When** hiển thị sơ đồ bàn
**Then** các bàn thuộc khu vực được phân công sẽ được highlight hoặc mặc định filter sẵn

**Given** nhân viên A tạo order
**When** dữ liệu lưu vào DB
**Then** order tự động gắn tag `handled_by: A`, `area: Tầng 1` để phục vụ tracking KPI (FR49)

### Story 10.2: Global Configuration Workspace

As a **quản lý**,
I want **một workspace tập trung để cấu hình mọi thông số hệ thống, từ tên cửa hàng đến các cờ (flags) hoạt động**,
So that **những setup quan trọng hiển thị trực quan, ít bị sai sót** (FR59, UX-DR10).

**Acceptance Criteria:**

**Given** quản lý vào phần Cài đặt
**When** trang Global Configuration tải xong
**Then** giao diện sử dụng toggle switch rõ ràng (VD: "Bật Offline Mode", "Cho phép âm kho") có giải thích tooltip bên cạnh (UX-DR10)

**Given** quản lý bật tính năng "Cần approve khi void"
**When** setup được lưu
**Then** thay đổi có hiệu lực ngay lập tức xuống các client POS qua WebSocket

### Story 10.3: Tax & Surcharge Routing (VAT & Phí dịch vụ)

As a **cửa hàng trưởng**,
I want **thiết lập các loại thuế (vd: VAT 8% hoặc 10%) và các loại phí dịch vụ (vd: 5% service charge), có thể cấu hình auto áp dụng theo điều kiện**,
So that **hệ thống tự động tính đúng Pháp luật và chính sách quán mà thu ngân không cần nhớ** (FR58).

**Acceptance Criteria:**

**Given** quản lý tạo 1 loại Thuế: "VAT 8%"
**When** gán loại thuế này cho danh mục "Cà phê"
**Then** POS tự động cộng thêm 8% khi bán bất kỳ món nào trong danh mục "Cà phê"

**Given** quản lý cài đặt "Phí dịch vụ 5% áp dụng biểu giá ban đêm (Sau 22h)"
**When** order phát sinh lúc 22:15
**Then** POS tự cộng 5% surcharge vào tổng bill hiển thị rõ "Phí DV ban đêm"

**Given** order đang active trên POS
**When** tổng tiền thay đổi (thêm món/giảm giá)
**Then** VAT và Surcharge được tính lại ngay lập tức (real-time)

### Story 10.4: Receipt Identity & Print Templates

As a **cửa hàng trưởng**,
I want **cấu hình thông vị tin in trên bill (Logo, Tên quán, Địa chỉ, Wifi, Footer Message)**,
So that **hóa đơn chuyên nghiệp và cung cấp đủ thông tin hữu ích cho khách** (FR57).

**Acceptance Criteria:**

**Given** trang Cài đặt hóa đơn
**When** quản lý upload Logo (định dạng monochrome) và nhập text
**Then** hiển thị màn hình Preview mô phỏng chính xác bản in nhiệt (Preview Mode) (FR57)

**Given** template đã lưu
**When** POS in bill
**Then** bill in ra chứa đủ: Header (Logo + Info), Body (Items + Tax), Footer (Message + Mã VietQR) phù hợp tiêu chuẩn giấy in nhiệt 58mm hoặc 80mm

### Story 10.5: Global Audit Trail & Compliance Logging

As a **chủ hệ thống / quản trị viên**,
I want **mọi thao tác quan trọng (sửa/xóa dòng tiền, tồn kho, phân quyền) đều được log lại chi tiết (Ai, Khi nào, Làm gì, Dữ liệu cũ/mới)**,
So that **tôi có thể truy vết khi có gian lận hoặc sai sót** (NFR13, NFR34).

**Acceptance Criteria:**

**Given** nhân viên A đổi giá sản phẩm X từ 50k xuống 40k
**When** thao tác hoàn tất
**Then** một record được lưu vào bản `audit_logs`: `user_id: A`, `action: update_price`, `target: product_X`, `old: 50k`, `new: 40k`, `timestamp` (NFR13)

**Given** nhân viên B void một order
**When** có người quản lý C nhập PIN override
**Then** audit log lưu rõ: "B void order, C approved override"

**Given** chủ hệ thống vào màn hình Nhật ký hoạt động
**When** search theo ngày hoặc user
**Then** hệ thống truy vấn và hiển thị log đầy đủ trong ≤5 giây (NFR34)
