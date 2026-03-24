---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-pos-sdd-2026-03-13.md"
  - "_bmad-output/planning-artifacts/research/domain-Commerce-Domain-POS-cho-FnB-research-2026-03-13.md"
  - "docs/pos-feature-brife.md"
workflowType: 'prd'
briefCount: 1
researchCount: 1
projectDocsCount: 1
projectContextCount: 0
date: '2026-03-13'
user_name: 'Tuan.nguyen'
classification:
  projectType: saas_b2b
  domain: commerce_retail_fnb
  complexity: medium-high
  projectContext: greenfield
---

# Product Requirements Document - pos-sdd

**Author:** Tuan.nguyen
**Date:** 2026-03-13

## Executive Summary

**pos-sdd** là hệ thống POS (Point of Sale) thế hệ mới, miễn phí, được thiết kế như một Command Center thời gian thực cho chuỗi nhà hàng F&B và bán lẻ tại Việt Nam. Hệ thống giải quyết bài toán cốt lõi: **tối ưu hóa dòng chảy giao dịch từ Order → Processing → Payment → Fulfillment → Reporting**, đảm bảo mỗi cửa hàng xử lý được tối đa lượng đơn hàng trong cùng một khoảng thời gian với tỷ lệ sai sót tiệm cận bằng không.

Sản phẩm phục vụ 3 nhóm người dùng chính: **Thu ngân (Cashier)** — cần tốc độ order cực nhanh (10-15s/chu kỳ, ≤5 clicks); **Nhân viên bếp (Kitchen Staff)** — cần màn hình KDS trực quan với phân luồng trạng thái realtime; và **Cửa hàng trưởng (Store Manager)** — cần nắm bắt tình hình vận hành trong 30 giây qua Dashboard. Mô hình kinh doanh **Free POS** (miễn phí hoàn toàn) xóa bỏ rào cản gia nhập, tạo lợi thế cạnh tranh quyết định so với các đối thủ hiện hữu trên thị trường Việt Nam (KiotViet, Sapo POS, iPOS) vốn đều thu phí subscription.

### What Makes This Special

1. **Offline-First Architecture (Bất khả chiến bại khi mất mạng):** Hệ thống hoạt động đầy đủ tính năng trong 4-24 giờ mất internet, buffer ≥5,000 orders, sync recovery <2 phút. Đây là Aha Moment cốt lõi — khi mạng sập, pos-sdd vẫn đứng vững, trong khi đối thủ gây thiệt hại nghiêm trọng cho cửa hàng.
2. **Throughput Optimization (Tối đa hóa thông lượng):** Mọi tính năng hướng tới việc xử lý nhiều đơn hơn — không phải nhiều tính năng hơn. Mục tiêu 240-300 orders/giờ/thu ngân, kết nối không khoảng cách POS ↔ KDS ↔ Dashboard.
3. **Free POS Model (Rào cản gia nhập = 0):** Cho phép mọi cửa hàng F&B tiếp cận công nghệ POS chuyên nghiệp mà không cần chi phí ban đầu, tạo hiệu ứng lan tỏa nhanh trên thị trường.
4. **Kiến trúc module hóa (Commerce → Catalog → Operations → Customer → Management):** Sẵn sàng mở rộng từ cửa hàng đơn lẻ lên chuỗi đa chi nhánh khi doanh nghiệp lớn mạnh.

## Project Classification

| Thuộc tính | Giá trị |
|---|---|
| **Project Type** | SaaS B2B (với đặc điểm Web App mạnh ở POS Terminal & KDS) |
| **Domain** | Commerce/Retail F&B với Payment Processing |
| **Complexity** | Medium-High (Offline sync, real-time, high-throughput, payment integration) |
| **Project Context** | Greenfield — xây dựng hoàn toàn mới |
| **Target Market** | Chuỗi nhà hàng F&B và bán lẻ tại Việt Nam |
| **Business Model** | Free POS |

## Success Criteria

### User Success

Hệ thống thành công khi người dùng trực tiếp cảm nhận được tốc độ, sự dễ dàng và xóa bỏ hoàn toàn áp lực giờ cao điểm:

| Chỉ số | Mục tiêu | Đo lường |
|---|---|---|
| Order Cycle Time | **10-15 giây** từ chọn món → thanh toán xong | Thời gian trung bình trên hệ thống |
| Thao tác mỗi order | **≤5 clicks/taps** cho order tiêu chuẩn | Đếm sự kiện UI |
| Throughput Thu ngân | **240-300 orders/giờ** trong giờ cao điểm | Đếm orders hoàn thành |
| Onboarding Thu ngân mới | Hiểu và sử dụng trong **≤1 giờ** | Quan sát thực tế |
| Onboarding KDS (Bếp) | Làm quen trong **≤30 phút** | Quan sát thực tế |
| Đứng ca độc lập | Sau **≤2 giờ** đào tạo | Nhân viên tự hoàn thành ca không cần hỗ trợ |
| Manager Awareness | Nắm bắt tình hình trong **≤30 giây** nhìn Dashboard | Khảo sát Manager |

### Business Success

| Mốc thời gian | Mục tiêu | Chỉ số đo |
|---|---|---|
| **3 tháng** | **50 cửa hàng** sử dụng Free POS | Số lượng cửa hàng active |
| **6 tháng** | 150+ cửa hàng, bắt đầu thu thập dữ liệu adoption patterns | Retention rate, daily active stores |
| **12 tháng** | 500+ cửa hàng, triển khai monetization từ premium add-ons | Revenue từ premium features |
| Tăng công suất phục vụ | **+15% đến +25%** orders trong giờ cao điểm | So sánh trước/sau triển khai |
| Giảm lỗi chế biến/hủy bill | **-40% đến -70%** | Tỷ lệ void/cancel trên hệ thống |
| Tăng doanh thu cửa hàng | **+10% đến +20%** (cùng nhân sự) | Doanh thu hàng tháng cửa hàng pilot |

### Technical Success

| Chỉ số | Mục tiêu | Mức độ |
|---|---|---|
| Offline Mode Duration | **4-24 giờ** hoạt động đầy đủ | Critical |
| Offline Buffer | **≥5,000 orders** lưu trữ cục bộ | Critical |
| Sync Recovery | **<2 phút** đồng bộ lại về server | Critical |
| POS → KDS Latency (Human Awareness) | **10-20 giây** | High |
| Manager Dashboard Latency | **≤30 giây** | High |
| Chain Analytics Latency | **≤60 giây** | Medium |
| System Uptime | **≥99.5%** (online mode) | High |
| Peak Load Handling | **300 orders/giờ/thu ngân** không lag | Critical |

### Measurable Outcomes

MVP được xem là thành công khi đạt đồng thời:
1. **Adoption:** 50 cửa hàng active trong 3 tháng đầu (Free POS model).
2. **Performance:** Duy trì ổn định 300 orders/giờ/thu ngân tại cửa hàng pilot giờ cao điểm.
3. **User Satisfaction:** Nhân viên thực tế xác nhận Onboarding <1 giờ và Order Cycle <15 giây.
4. **Reliability:** Offline mode hoạt động liên tục 4+ giờ trong bài test thực tế, sync recovery <2 phút.
5. **Real-time:** Manager nắm bắt tình hình qua Dashboard trong ≤30 giây.

## Product Scope

### MVP - Minimum Viable Product

*(Xem chi tiết tại [Project Scoping & Phased Development](#project-scoping--phased-development))*
**9 modules** tạo thành dòng chảy giao dịch hoàn chỉnh cho F&B:

| # | Module | Mô tả cốt lõi |
|---|---|---|
| 1 | **Menu Management** | Quản lý thực đơn, modifier groups, category |
| 2 | **Order Management** | Luồng tạo/sửa đơn (≤5 thao tác), hold/resume order |
| 3 | **Table Management** | Sơ đồ bàn, chọn bàn, gộp bàn, chuyển bàn (F&B) |
| 4 | **Kitchen Display (KDS)** | Màn hình bếp realtime, phân luồng station, timer, bump order |
| 5 | **Payment** | Tiền mặt + VietQR in trên bill (chưa tích hợp API gateway phức tạp) |
| 6 | **Inventory Basic** | Tồn kho cơ bản, tự động trừ kho theo công thức |
| 7 | **Reporting** | Dashboard thời gian thực (30s Business Awareness) |
| 8 | **User Management** | Tài khoản, RBAC, phân quyền Thu ngân/Quản lý |
| 9 | **Promotion Basic** | Giảm giá %, giảm trực tiếp số tiền, món tặng kèm — tự động áp dụng |

**Tính năng xuyên suốt MVP:** Offline Mode (4-24h), Sync Recovery (<2 phút), Real-time data flow.

### Growth Features (Post-MVP)

Ưu tiên triển khai ngay sau khi MVP thành công, theo thứ tự:

| Ưu tiên | Feature | Giá trị |
|---|---|---|
| 1 | **CRM & Loyalty** | Tích điểm, thẻ thành viên, lịch sử mua hàng → tăng retention |
| 2 | **Multi-branch Management** | Quản lý đa chi nhánh, chuyển kho, báo cáo toàn chuỗi → scale up |
| 3 | **Promotion Engine Nâng cao** | Khuyến mãi chéo đa điều kiện, voucher, mã đối tác → tăng doanh thu |
| 4 | **Payment Gateway Integration** | Tích hợp API VNPay, Momo, ZaloPay → mở rộng thanh toán |
| 5 | **Analytics Nâng cao** | Báo cáo tùy chỉnh, BI dashboard → data-driven decisions |

### Vision (Future)

| Giai đoạn | Mục tiêu | Mô tả |
|---|---|---|
| **Scale Up** | Chain Management Platform | Nền tảng quản lý chuỗi hoàn chỉnh, Multi-branch + CRM mạnh mẽ |
| **Intelligence** | Data Mining + AI | Dự báo nguyên liệu, sắp xếp nhân sự tự động, gợi ý tối ưu vận hành |
| **Commercialization** | SaaS Platform | Đóng gói subscription cho mọi chuỗi F&B và Bán lẻ |

## User Journeys

### Journey 1: Thu ngân giờ cao điểm — "Linh và cơn bão trưa"

**Persona:** Linh, 22 tuổi, Thu ngân tại quán phở chuỗi "Phở Ông Hùng" chi nhánh Quận 1. Mới vào làm được 2 tuần, tính cách nhanh nhẹn nhưng dễ hoảng khi áp lực cao. Trước đó từng dùng một POS cũ hay bị treo máy vào giờ trưa.

**Opening Scene:** 11h30 trưa thứ Hai. Linh vừa đến ca, đăng nhập POS bằng mã PIN 4 số. Màn hình sáng lên, menu quen thuộc hiện ra — phân chia rõ ràng theo category: Phở, Bún, Nước uống, Tráng miệng. Hàng đợi bắt đầu kéo dài ra cửa.

**Rising Action:** Khách đầu tiên: "Cho 1 phở bò tái nạm, thêm hành, 1 trà đá." Linh tap [Phở] → [Phở bò tái nạm] → modifier popup → tap [Thêm hành] → [Trà đá] → [Thanh toán]. Tổng: 75,000đ. Khách đưa tiền mặt 100,000đ. Linh nhập số tiền → hệ thống tự tính tiền thối 25,000đ → [In bill]. Toàn bộ: **12 giây, 4 taps**. Ngay lập tức, đơn hàng xuất hiện trên KDS trong bếp với âm thanh "Ting!". Khách tiếp theo thanh toán QR — mã QR in trên bill → khách quét → xong. **15 giây**. 12h00 — Cao điểm thực sự. Một khách đổi ý: "Bỏ trà đá, đổi sang nước cam." Linh tap vào order → [Void] trà đá → [Thêm Nước cam] → xong. **3 giây sửa đổi**.

**Climax:** Linh liếc nhìn góc dưới màn hình — thấy trạng thái order bàn 7: 🟢 "Phở gà #1 - Done", 🟡 "Bún bò - Preparing". Khách bàn 7 hỏi "Món của em xong chưa?". Linh tự tin trả lời: "Phở gà xong rồi ạ, bún bò đang nấu, khoảng 2 phút nữa!". Lần đầu tiên cô có thể trả lời chính xác mà không cần chạy vào bếp hỏi.

**Resolution:** 12h45 — Cơn bão trưa qua đi. Linh đã xử lý **47 đơn trong 45 phút** mà không một lần bị "đơ" hệ thống. "Hệ thống này nhanh hơn đếm tiền bằng tay."

> **Capabilities revealed:** Quick order creation, modifier management, table selection, multi-payment (cash/QR), real-time order status, void/edit item, receipt printing.

---

### Journey 2: Thu ngân gặp sự cố mất mạng — "Linh và 45 phút mất internet"

**Persona:** Linh (cùng persona journey 1), đang trong ca trưa.

**Opening Scene:** 12h15, đang giữa giờ cao điểm. Biểu tượng wifi trên màn hình POS chuyển sang 🔴 đỏ. Dòng chữ nhỏ góc trên: "Offline Mode — Đang lưu cục bộ". Linh nhớ lại lần trước dùng POS cũ, mất mạng = đứng hình = khách bỏ đi.

**Rising Action:** Linh thử tap tạo order mới — **hoạt động bình thường**. Chọn món, thêm modifier, thanh toán tiền mặt — tất cả đều nhanh như khi có mạng. Bill vẫn in ra bình thường. Order vẫn được đẩy sang KDS qua mạng nội bộ (LAN). Thanh toán QR tạm không khả dụng (cần internet) — hệ thống tự động chuyển sang gợi ý tiền mặt.

**Climax:** 45 phút trôi qua. Linh đã xử lý **38 đơn hoàn toàn offline** mà không bỏ sót một đơn nào. Mọi dữ liệu được lưu an toàn trong bộ nhớ cục bộ.

**Resolution:** 12h58 — Internet phục hồi. Biểu tượng wifi chuyển 🟢 xanh. Dòng chữ: "Đang đồng bộ... 38 orders". Trong vòng **90 giây**, toàn bộ 38 đơn hàng được sync lên server. Dashboard cập nhật ngay lập tức. "Cuối cùng cũng có hệ thống hiểu mình cần gì."

> **Capabilities revealed:** Offline mode activation, local storage buffer, graceful payment fallback, LAN-based KDS communication, automatic sync recovery, zero data loss.

---

### Journey 3: Bếp nhận và xử lý order — "Minh và dây chuyền không hỗn loạn"

**Persona:** Minh, 28 tuổi, Bếp trưởng station bếp nóng tại "Phở Ông Hùng". 5 năm kinh nghiệm, ghét nhất là bill giấy bị nhòe mực và order lộn xộn không biết ưu tiên cái nào.

**Opening Scene:** 11h45 — Minh đứng trước màn hình KDS cảm ứng 15 inch gắn tường bếp nóng. Màn hình sáng, chia thành các cột order rõ ràng. Màu nền mặc định: 🟢 Xanh (mới vào). Bên cạnh là đồng hồ đếm ngược (timer) cho mỗi order.

**Rising Action:** "Ting!" — Order mới từ Linh: Bàn 7 — 2 Phở gà, 1 Bún bò. Phở gà và Bún bò thuộc station bếp nóng → hiển thị trên màn hình của Minh. Nước cam thuộc station bar → tự chuyển sang màn hình bar. Minh nấu Phở gà #1, timer đếm: 0:00 → 5:00. Khi xong, Minh tap → [Bump] → trạng thái chuyển ✅ Done. Màn hình Linh ngoài quầy ngay lập tức hiện 🟢. 12h05 — 8 orders trên màn hình. Order bàn 3 timer **8 phút** → nền 🟡 Vàng. Order bàn 12 timer **12 phút** → nền 🔴 Đỏ. Minh lập tức ưu tiên bàn 12.

**Climax:** Order phức tạp vào: Phở bò tái nạm + Thêm gầu + Không hành + Nước dùng riêng. Trên KDS, tất cả modifier hiển thị rõ ràng bằng font chữ lớn, màu cam nổi bật ngay dưới tên món. Minh đọc một lượt — hiểu ngay, không nhầm.

**Resolution:** 13h00 — Ca trưa kết thúc. **Không một món nào bị làm sai**. Trước đây trung bình 3-5 món/ca bị sai modifier. "Chỉ cần nhìn màn hình là biết phải làm gì tiếp theo."

> **Capabilities revealed:** KDS real-time display, station-based routing, order timer with color coding, bump functionality, modifier highlight, POS↔KDS status sync.

---

### Journey 4: Cửa hàng trưởng giám sát vận hành — "Hải và 30 giây nắm bắt tất cả"

**Persona:** Hải, 35 tuổi, Cửa hàng trưởng "Phở Ông Hùng" Quận 1. Chịu trách nhiệm doanh thu, chất lượng phục vụ và nhân sự.

**Opening Scene:** 14h00 — Hải vừa kết thúc cuộc họp. Mở tablet, đăng nhập Dashboard pos-sdd. Thời gian từ lúc mở app đến lúc nắm bắt tình hình: mục tiêu ≤30 giây.

**Rising Action:** Dashboard hiện 4 phần chính: 📊 Doanh thu hôm nay: 12,500,000đ (↑18% so với cùng ngày tuần trước). 🍳 Hiệu suất Bếp: Thời gian chế biến trung bình 6 phút, 2 order trạng thái 🔴 trễ (>10 phút). 📦 Tồn kho cảnh báo: Thịt bò tái — còn 2.5kg (dưới mức cảnh báo 5kg). 👥 Nhân sự: Ca chiều đủ 3 thu ngân, 2 bếp.

**Climax:** Hải nhận notification: "⚠️ Void rate ca trưa: 4.2% (cao hơn trung bình 2.5%)". Nhấn vào → thấy Thu ngân mới (Trang) void 5 món trong 1 giờ. Hải hiểu: Trang chưa quen modifier, cần đào tạo thêm. Toàn bộ quá trình: **28 giây** từ lúc mở Dashboard đến lúc có đủ thông tin ra quyết định.

**Resolution:** Hải đóng tablet với sự an tâm. Ngồi bất cứ đâu cũng quản lý được. "30 giây là đủ để biết cửa hàng đang khỏe hay cần can thiệp."

> **Capabilities revealed:** Real-time dashboard, revenue tracking, kitchen performance metrics, inventory alerts, staff performance, void rate monitoring, notification system.

---

### Journey 5: Chủ chuỗi xem báo cáo đa chi nhánh — "Ông Thành và bức tranh toàn cảnh"

**Persona:** Ông Thành, 48 tuổi, chủ chuỗi "Phở Ông Hùng" 5 chi nhánh tại TP.HCM. Không am hiểu công nghệ, cần thông tin đơn giản, trực quan, nhanh chóng.

**Opening Scene:** 20h00 tối — Ông Thành ngồi ở nhà sau bữa cơm tối. Mở laptop, truy cập Dashboard tổng hợp chuỗi. Muốn biết: "Hôm nay chuỗi làm ăn thế nào?"

**Rising Action:** Dashboard hiện tổng quan 5 chi nhánh với doanh thu, số orders, giá trị trung bình. Tổng doanh thu: 50,000,000đ / 1,103 orders. Quận 1 dẫn đầu, Bình Thạnh thấp nhất.

**Climax:** Ông Thành nhấn vào chi nhánh Bình Thạnh → void rate 6.8% (bất thường), thời gian chế biến trung bình 9 phút (chậm hơn 50%). Nhấn sâu hơn → phát hiện: Bếp trưởng nghỉ ốm 2 ngày, nhân viên thay thế chưa quen, khách hủy vì chờ lâu. Ông Thành lập tức gọi điện điều bếp phụ sang hỗ trợ.

**Resolution:** Trong vòng **60 giây**, phát hiện vấn đề, xác định nguyên nhân gốc, ra quyết định hành động — tất cả từ xa. "Trước đây phải đến từng quán mới biết, giờ ngồi nhà mà thấy hết."

> **Capabilities revealed:** Multi-store dashboard, cross-branch comparison, drill-down analytics, anomaly detection, performance benchmarking, chain-level reporting.

---

### Journey Requirements Summary

Từ 5 hành trình trên, các capabilities cốt lõi được hé lộ:

| Domain | Capabilities |
|---|---|
| **Commerce (POS/Order)** | Quick order creation, modifier management, table selection, hold/resume, void/edit, multi-payment (cash/QR), receipt printing |
| **Commerce (Payment)** | Cash handling with change calculation, VietQR generation, graceful offline payment fallback |
| **Operations (KDS)** | Real-time order display, station routing, timer with color alerts, bump order, modifier highlighting |
| **Operations (Offline)** | Offline mode auto-activation, local storage buffer (≥5,000 orders), LAN-based KDS, automatic sync recovery |
| **Catalog (Menu)** | Category-based menu display, modifier groups, product status |
| **Operations (Inventory)** | Stock level tracking, low stock alerts, auto-deduct on order |
| **Management (Reporting)** | Real-time dashboard, revenue tracking, kitchen performance, staff metrics, void rate monitoring |
| **Management (Multi-store)** | Chain-level dashboard, cross-branch comparison, drill-down analytics, anomaly detection |
| **Management (Staff)** | Staff accounts, role-based access, performance tracking, notification system |

## Domain-Specific Requirements

### Compliance & Regulatory

| Yêu cầu | Mô tả | Mức độ |
|---|---|---|
| **Hóa đơn điện tử (E-Invoice)** | Tuân thủ Nghị định 123/2020/NĐ-CP về hóa đơn điện tử tại Việt Nam. Hệ thống phải hỗ trợ xuất hóa đơn VAT điện tử khi khách yêu cầu. | MVP chuẩn bị, Growth triển khai |
| **Bảo mật thanh toán (PCI DSS awareness)** | Dù MVP chỉ hỗ trợ VietQR (in trên bill, không xử lý card trực tiếp), kiến trúc cần sẵn sàng cho PCI DSS compliance khi tích hợp payment gateway sau này. | Growth |
| **Bảo vệ dữ liệu khách hàng** | Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Dữ liệu khách hàng (nếu thu thập ở phase CRM) phải được mã hóa và có cơ chế consent. | Growth |
| **Thuế & Kế toán** | Hệ thống báo cáo phải hỗ trợ đối soát doanh thu theo yêu cầu kế toán Việt Nam (cuối ca, cuối ngày, cuối tháng). | MVP |

### Technical Constraints

| Ràng buộc | Chi tiết | Lý do |
|---|---|---|
| **Offline-First Architecture** | Toàn bộ luồng POS/KDS phải hoạt động offline. Dữ liệu menu, giá cả, công thức tồn kho phải được cache cục bộ. | Hạ tầng mạng tại Việt Nam không ổn định, đặc biệt ở các khu vực ngoại thành |
| **Low-Bandwidth Optimization** | Sync data phải tối ưu băng thông. Chỉ sync delta (thay đổi), không full sync. | Nhiều cửa hàng dùng 4G/wifi yếu |
| **Multi-Device Support** | POS chạy trên tablet (Android/iPad), KDS trên màn hình cảm ứng, Dashboard trên web. Phải responsive và touch-optimized. | Đa dạng thiết bị tại cửa hàng |
| **Print Integration** | Hỗ trợ máy in nhiệt (thermal printer) qua USB/Bluetooth/Network. Bill phải in được cả online và offline. | Phần cứng phổ biến tại VN |
| **Real-time Communication** | WebSocket hoặc tương đương cho POS↔KDS↔Dashboard sync. Fallback qua LAN khi mất internet. | Yêu cầu cốt lõi của sản phẩm |

### Integration Requirements

| Hệ thống | Mục đích | Phase |
|---|---|---|
| **Máy in nhiệt (ESC/POS)** | In bill, in phiếu bếp | MVP |
| **VietQR** | Tạo mã QR thanh toán in trên bill | MVP |
| **VNPay / Momo / ZaloPay** | Payment gateway API | Growth |
| **Hóa đơn điện tử (VNPT/Viettel)** | Xuất e-invoice | Growth |
| **GrabFood / ShopeeFood** | Nhận đơn từ delivery platform | Growth |
| **Accounting Software** | Đồng bộ doanh thu với phần mềm kế toán | Vision |

### Risk Mitigations

| Rủi ro | Tác động | Biện pháp giảm thiểu |
|---|---|---|
| **Data loss khi offline** | Mất đơn hàng = mất doanh thu | Write-ahead log (WAL), local DB persistence, multiple backup layers |
| **Sync conflict** | 2 thiết bị sửa cùng dữ liệu offline → conflict khi sync | Last-writer-wins cho orders (immutable), CRDT cho inventory counts |
| **Payment fraud** | Sửa giá, void không phép | Audit log bất biến, RBAC nghiêm ngặt, Manager approval cho void/discount |
| **Hardware failure** | Tablet hỏng giữa ca → mất dữ liệu | Auto-backup mỗi 5 phút lên local storage, hot-swap device support |
| **Peak load** | 300 orders/giờ → overload | Performance testing, horizontal scaling cho backend, client-side processing cho POS |

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Hybrid Offline-First Architecture (Kiến trúc Offline-First lai ghép):** Trong khi 95% POS trên thị trường được thiết kế cloud-first với offline như một fallback, pos-sdd triển khai kiến trúc Hybrid: **Offline-First cho Transaction Layer (POS, KDS)** và **Cloud-First cho Management Layer (Dashboard, Menu, Settings)**. Mô hình Event Sourcing: `POS App → Local DB → Event Log → Sync Service → Cloud Platform`. Transaction ghi trực tiếp vào Local DB với latency <10ms, Event Log append-only triệt tiêu hoàn toàn conflict resolution. Management Layer chạy Cloud-First đảm bảo tính toàn vẹn dữ liệu cho chuỗi.

2. **Free POS Business Model Disruption:** Mọi đối thủ trực tiếp trên thị trường Việt Nam (KiotViet, Sapo POS, iPOS) đều thu phí subscription. pos-sdd loại bỏ hoàn toàn rào cản gia nhập. Cloud Management Layer là "rương chứa vàng" cho monetization tương lai (Data Analytics, AI Forecasting, Premium Add-ons).

3. **Throughput-Centric Design Philosophy:** Mọi quyết định thiết kế quy chiếu về metric: "Bao nhiêu đơn/giờ?". Local DB write đảm bảo latency <10ms, màn hình POS tối giản tuyệt đối, chỉ phục vụ mục tiêu duy nhất: tốc độ bán hàng.

### Market Context & Competitive Landscape

- Thị trường POS F&B toàn cầu: 15-24 tỷ USD (2024), CAGR 6.8-9.5%
- APAC là khu vực tăng trưởng nhanh nhất
- Toast (Mỹ) đã chứng minh Free POS model hoạt động — chưa có ai áp dụng tại Đông Nam Á
- Chưa có POS nào tại Việt Nam triển khai Event Sourcing + Offline-First cho Transaction Layer

### Validation Approach

| Innovation | Cách xác nhận | Timeline |
|---|---|---|
| Hybrid Offline-First | Stress test 24h offline liên tục tại 1 cửa hàng pilot, đo data integrity sau sync | Trước MVP launch |
| Event Sourcing Sync | Benchmark sync 5,000 events, verify zero data loss, measure recovery time <2 phút | Alpha testing |
| Free POS Model | Đo tốc độ adoption (target: 50 cửa hàng / 3 tháng) | 3 tháng sau launch |
| Throughput | Benchmark 300 orders/giờ tại môi trường thực tế giờ cao điểm | MVP pilot |

### Innovation Risk Mitigation

| Rủi ro Innovation | Fallback |
|---|---|
| Offline-First quá phức tạp | **Kiến trúc Hybrid:** Offline-First CHỈ cho Transaction Layer (POS, KDS) với Event Log append-only. Cloud-First cho Management Layer (Dashboard, Menu, Settings). Triệt tiêu conflict resolution. |
| Sync conflict dữ liệu | **Event Sourcing pattern:** Orders là immutable events (append-only log), server chỉ replay. Inventory trừ tương đối ở POS, Source of Truth trên Cloud. |
| Free POS không tạo ra revenue | Chuyển sang freemium sau 6 tháng nếu cần. Cloud Management Layer là nền tảng monetization (Data Analytics, AI Forecasting). |
| Throughput target quá cao (300/giờ) | Local DB write latency <10ms, không phụ thuộc network. Hạ target về 200/giờ cho MVP, tối ưu dần. |

## SaaS B2B Specific Requirements

### Project-Type Overview

pos-sdd là một SaaS B2B platform với đặc thù kết hợp Web App (POS Terminal & KDS) và Cloud Platform (Dashboard & Management). Hệ thống phục vụ mô hình chuỗi F&B multi-tenant, nơi mỗi chuỗi là một tenant và mỗi chi nhánh là một store trong tenant.

### Multi-Tenant Model

| Thuộc tính | Quy định |
|---|---|
| **Isolation Level** | Logical isolation — shared database, tenant-scoped queries |
| **Tenant** | 1 Chuỗi (Chain) = 1 Tenant |
| **Store** | 1 Chi nhánh = 1 Store trong Tenant |
| **Data Isolation** | Mọi query đều filter theo `tenant_id` + `store_id` |
| **Config Isolation** | Mỗi tenant tùy chỉnh: menu, giá, promotion, limit rules, RBAC |
| **Cross-tenant** | Không bao giờ cho phép truy cập dữ liệu chéo tenant |

### Permission Model: RBAC + Store Scope + Limit Rules + Approval Override

#### Layer 1: RBAC (Role-Based Access Control)

| Role | Mô tả | Quyền cốt lõi |
|---|---|---|
| **Cashier** | Thu ngân | Tạo order, thanh toán, in bill, xem KDS status |
| **Kitchen** | Nhân viên bếp | Xem KDS, bump order, cập nhật trạng thái món |
| **Shift Lead** | Trưởng ca | = Cashier + void/cancel giới hạn, xem báo cáo ca, đóng/mở ca |
| **Store Manager** | Cửa hàng trưởng | = Shift Lead + quản lý menu, nhân sự, inventory, báo cáo store |
| **Chain Owner** | Chủ chuỗi | = Store Manager + quản lý đa chi nhánh, báo cáo chuỗi, cấu hình hệ thống |
| **System Admin** | Quản trị viên | Full access + quản lý tenant, cấu hình kỹ thuật |

#### Layer 2: Store Scope

| Scope | Mô tả |
|---|---|
| **Single Store** | Chỉ thấy/thao tác dữ liệu 1 cửa hàng |
| **Store Group** | Nhóm cửa hàng chỉ định |
| **All Stores** | Toàn bộ chuỗi |

Quy tắc: `Role + Scope = Quyền thực tế`. Scope giới hạn phạm vi dữ liệu, Role giới hạn chức năng.

#### Layer 3: Limit Rules

| Hành động | Cashier | Shift Lead | Store Manager | Chain Owner |
|---|---|---|---|---|
| **Void item** | ❌ | ≤50,000đ | ≤500,000đ | Không giới hạn |
| **Discount %** | ❌ | ≤10% | ≤30% | ≤100% |
| **Discount amount** | ❌ | ≤20,000đ/order | ≤200,000đ/order | Không giới hạn |
| **Cancel order** | ❌ | ≤100,000đ | Không giới hạn | Không giới hạn |
| **Refund** | ❌ | ❌ | ≤500,000đ | Không giới hạn |
| **Edit price** | ❌ | ❌ | ±20% | Không giới hạn |

Limit rules có thể tùy chỉnh theo chuỗi — Chain Owner cấu hình ngưỡng phù hợp với quy mô.

#### Layer 4: Approval Override

Khi hành động vượt Limit Rules, hệ thống kích hoạt Approval Flow: người có quyền cao hơn nhập PIN 4 số trên cùng thiết bị (≤3 giây). Mọi override đều tạo audit log bất biến ghi nhận: requester, approver, action, amount, timestamp, reason.

#### Luồng kiểm tra quyền

```
User Action → [RBAC] → [Store Scope] → [Limit Rules] → ✅ Execute
                                              ↓ Vượt ngưỡng
                                    [Approval Override] → PIN → ✅ Execute + Audit Log
                                              ↓ Rejected
                                           ❌ Block + Log
```

### Subscription Tiers

| Tier | Giá | Bao gồm | Target |
|---|---|---|---|
| **Free** | 0đ | 9 MVP modules, 1 store, basic reporting | Cửa hàng đơn lẻ, startup nhỏ |
| **Pro** | TBD | CRM, Promotion Engine nâng cao, Priority Support | Cửa hàng lớn |
| **Chain** | TBD | Multi-branch, Chain Analytics, API Access | Chuỗi multi-store |

### Integration Architecture

| Phase | Integrations | Phương thức |
|---|---|---|
| **MVP** | Thermal Printer (ESC/POS), VietQR | Direct protocol / QR generation |
| **Growth** | VNPay, Momo, ZaloPay, E-Invoice (VNPT/Viettel), GrabFood/ShopeeFood | REST API, Webhook |
| **Vision** | Accounting Software, BI Tools | REST API, Data Export |

### Implementation Considerations

- **Tenant Provisioning:** Self-service signup → auto-create tenant + default store → ready in <60 giây
- **Data Migration:** Hỗ trợ import menu/product từ Excel/CSV cho cửa hàng chuyển đổi từ POS cũ
- **White-label Ready:** Kiến trúc sẵn sàng cho white-label (logo, color theme) ở tier Chain
- **API-First Design:** Mọi chức năng Management Layer expose qua REST API cho integration
- **Offline Authentication:** PIN-based auth cached locally, session token refresh khi có mạng

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — Chứng minh: "POS này bán hàng nhanh hơn, không sợ mất mạng, và miễn phí." Ra thị trường nhanh nhất với trải nghiệm hoàn chỉnh.

**Quyết định scope:** 9 modules ra mắt đồng thời, vì cửa hàng F&B cần luồng vận hành khép kín từ ngày 1.

### MVP Feature Set (Phase 1) — 9 Modules

#### Module 1: Menu Management

**Must-Have MVP:**
- **Category management** — CRUD categories, sắp xếp thứ tự
- **Menu item management** — CRUD products: tên, giá, mô tả, hình ảnh
- **Modifier/topping system** — modifier groups, required/optional, giá modifier
- **Combo/set menu** — tạo combo nhiều items, giá combo
- **Availability control** — available/sold out, tắt tự động khi hết kho
- **Kitchen routing config** — gắn item/category → KDS station

**Deferred (Growth):** Time-based menu, Store-specific menu, Bulk import, Product variants nâng cao

#### Module 2: Order Management

**Must-Have MVP:**
- **Order creation** — tạo order ≤5 taps, chọn bàn, thêm items + modifiers
- **Order lifecycle** — Draft → Sent → Preparing → Ready → Served → Paid → Closed
- **Order editing** — thêm/bớt/sửa item, cập nhật KDS realtime
- **Split/merge bill** — chia bill theo item hoặc theo %, gộp bill nhiều bàn
- **Promotion application** — tự động áp khuyến mãi từ Promotion Basic khi tạo order
- **Kitchen routing** — auto-split items theo station, đẩy tới KDS tương ứng
- **Void/cancel** — void item + cancel order, theo Limit Rules + Approval Override + audit log

**Deferred (Growth):** Delivery orders, Pre-order/scheduled orders, Order notes nâng cao

#### Module 3: Table Management

**Must-Have MVP:**
- **Floor plan management** — tạo layout tầng/khu vực, CRUD bàn: số bàn, sức chứa, vị trí, drag-drop sắp xếp
- **Table status tracking** — Available / Occupied / Reserved / Dirty, màu sắc trực quan, thời gian ngồi
- **Table order assignment** — gắn order vào bàn, hiển thị tổng tiền + items trên bàn
- **Table transfer** — chuyển order sang bàn khác
- **Merge/split table** — gộp nhiều bàn thành group, tách group ra bàn riêng, order theo
- **Staff assignment** — gắn nhân viên phụ trách khu/bàn, tracking theo ca

**Deferred (Growth):** Reservation integration, Waitlist management

#### Module 4: Kitchen Display System (KDS)

**Must-Have MVP:**
- **Realtime order receiving** — WebSocket/LAN, âm thanh thông báo, nhấp nháy order mới
- **Kitchen station routing** — auto-route items theo config từ Menu, mỗi station nhận đúng items
- **Item status tracking** — New → In Progress → Ready → Served, tap chuyển trạng thái
- **Order queue management** — FIFO mặc định, pending count, ưu tiên order trễ lên đầu
- **Cooking timer & SLA** — timer mỗi order, SLA config theo món, cảnh báo 🟢Normal → 🟡Warning → 🔴Late
- **Multi-screen support** — mỗi screen gắn 1+ station, filter hiển thị theo station
- **Order update sync** — POS↔KDS bidirectional, hoạt động offline qua LAN
- **Kitchen analytics** — avg. cooking time, SLA compliance, top slow items → Reporting module

**Deferred (Growth):** Multi-screen layout customization, Recipe display, Voice notification

#### Module 5: Payment

**Must-Have MVP:**
- **Multi payment methods** — Cash + VietQR, mixed payment 1 order nhiều phương thức
- **Split payment** — chia thanh toán theo item, theo %, hoặc theo số tiền tùy ý
- **Cash handling** — nhập tiền khách đưa, auto tính thối, mệnh giá gợi ý nhanh 50k/100k/200k/500k
- **QR integration** — VietQR generation in trên bill, xác nhận thủ công
- **Refund/void** — void item chưa thanh toán + refund order đã thanh toán, theo Limit Rules + Approval Override + audit log
- **Receipt management** — in bill khách, in phiếu bếp, reprint, tùy chỉnh template
- **Cash shift management** — mở ca: khai báo tiền đầu ca, đóng ca: đếm tiền cuối ca, chênh lệch, báo cáo ca
- **Settlement & reconciliation** — tổng kết cuối ngày: cash vs system, QR vs bank, báo cáo đối soát

**Deferred (Growth):** Card terminal (VNPay/Momo/ZaloPay API), Auto QR verification, E-wallet, Tip management

#### Module 6: Inventory Basic

**Must-Have MVP:**
- **Inventory item management** — CRUD nguyên liệu/vật tư: tên, đơn vị, giá nhập, category
- **Store-level inventory** — tồn kho theo store, kiến trúc sẵn sàng multi-store
- **Stock in/out** — nhập kho từ nhà cung cấp, xuất kho: hủy/hao hụt, audit trail
- **Stock adjustment** — kiểm kê, điều chỉnh thực tế, ghi lý do chênh lệch
- **Recipe mapping** — gắn nguyên liệu + định lượng vào menu item, hỗ trợ combo
- **Auto deduction from sales** — trừ kho tự động theo recipe khi bán, hoạt động offline
- **Low stock alert** — config ngưỡng mỗi item, notification cho Manager, auto tắt món khi hết
- **Inventory reporting** — tồn kho hiện tại, nhập/xuất theo ngày, hao hụt, giá trị tồn kho

**Deferred (Growth):** Purchase Order, Supplier management, Inter-store transfer, Waste tracking, Inventory forecast

#### Module 7: Reporting

**Must-Have MVP:**
- **Sales reporting** — doanh thu theo giờ/ca/ngày/tuần/tháng, số orders, avg. order value, so sánh cùng kỳ
- **Product performance** — top bán chạy, top doanh thu, món không bán, trend theo thời gian
- **Order analytics** — order count theo giờ/peak hours, avg. items/order, avg. order time, void/cancel rate
- **Payment reports** — breakdown cash vs QR, đối soát settlement, refund summary
- **Inventory reports** — tồn kho hiện tại, nhập/xuất, hao hụt, giá trị tồn kho, items cần đặt hàng
- **Staff performance** — orders/giờ, doanh thu, void rate, avg. order time theo nhân viên
- **Real-time dashboard** — live widgets: doanh thu hôm nay, orders pending, kitchen status, low stock alerts, void rate (≤30s awareness)

**Deferred (Growth):** Multi-store comparison, Custom reports, Export PDF/Excel, Scheduled reports, BI dashboard

#### Module 8: User Management

**Must-Have MVP:**
- **User account management** — CRUD users, profile, active/deactive, reset PIN
- **Role management** — 6 default roles + CRUD custom roles cho Chain Owner
- **Permission management** — 4-layer: RBAC + Store Scope + Limit Rules + Approval Override, UI cấu hình
- **Store assignment** — gắn user vào Single Store / Store Group / All Stores
- **Authentication system** — PIN 4-6 số cho POS, email/password cho Dashboard, offline PIN cache, auto-lock timeout
- **Shift management** — mở ca: khai báo tiền + gắn nhân viên, đóng ca: đếm tiền + chênh lệch, lịch sử ca, ca chồng
- **Activity logging** — audit log bất biến: void, discount, refund, login/logout, filter theo user/action/time
- **Manager approval workflow** — PIN override, escalation chain, pending queue, audit trail

**Deferred (Growth):** SSO, 2FA, Biometric login, Employee scheduling, Payroll integration

#### Module 9: Promotion Basic

**Must-Have MVP:**
- **Percentage discount** — giảm % cho item/order/category
- **Fixed discount** — giảm số tiền cố định
- **Product discount** — giảm giá sản phẩm cụ thể, giá khuyến mãi
- **Buy X get Y** — mua X tặng Y, tự động áp khi đủ điều kiện
- **Combo promotion** — mua đủ combo items → giá đặc biệt
- **Time-based promotion** — auto bật/tắt theo giờ: happy hour, early bird, weekend
- **Coupon code** — nhập mã, tracking usage, giới hạn lần dùng
- **Promotion conditions** — min order amount, items/categories cụ thể, ngày/giờ, max usage, stackable/non-stackable

**Deferred (Growth):** Loyalty points, Partner vouchers, Multi-condition engine, A/B testing, Auto-suggest

### Cross-cutting MVP Features

- **Offline Mode** — Transaction Layer hoạt động đầy đủ offline 4-24h, buffer ≥5,000 orders
- **Event Sourcing Sync** — Local DB → Event Log → Sync Service → Cloud, recovery <2 phút
- **LAN Communication** — POS↔KDS qua mạng nội bộ khi mất internet
- **Thermal Print** — ESC/POS protocol, USB/Bluetooth/Network, online và offline

### Post-MVP Features

#### Phase 2 — Growth (Tháng 4-12)

| Ưu tiên | Feature | Trigger |
|---|---|---|
| 1 | **CRM & Loyalty** | Khi đạt 50+ stores, cần tăng retention |
| 2 | **Multi-branch Management** | Khi khách hàng chuỗi yêu cầu |
| 3 | **Promotion Engine Nâng cao** | Khi cần tăng doanh thu per store |
| 4 | **Payment Gateway API** | VNPay/Momo/ZaloPay integration |
| 5 | **E-Invoice** | Khi compliance yêu cầu (NĐ 123/2020) |

#### Phase 3 — Expansion (Năm 2+)

| Feature | Mục tiêu |
|---|---|
| **Chain Analytics Platform** | BI dashboard, benchmark, anomaly detection |
| **GrabFood/ShopeeFood Integration** | Nhận đơn delivery trực tiếp vào POS |
| **AI Forecasting** | Dự báo nguyên liệu, gợi ý tối ưu nhân sự |
| **Accounting Integration** | Đồng bộ tự động với phần mềm kế toán |
| **White-label/Marketplace** | Đối tác bán POS dưới thương hiệu riêng |

### Risk Mitigation Strategy

#### Technical Risks

| Rủi ro | Xác suất | Biện pháp |
|---|---|---|
| Offline sync phức tạp hơn dự kiến | Trung bình | Kiến trúc Hybrid + Event Sourcing append-only. Fallback: giảm offline duration về 4h |
| Performance không đạt 300 orders/giờ | Thấp | Local DB write <10ms. Stress test sớm. Fallback: 200 orders/giờ cho MVP |
| Multi-device sync không ổn định | Trung bình | LAN offline + WebSocket online. Test với 3+ devices đồng thời |

#### Market Risks

| Rủi ro | Xác suất | Biện pháp |
|---|---|---|
| Free POS không đủ hấp dẫn | Thấp | Nhấn mạnh Offline-First + Throughput là giá trị khác biệt |
| Không đạt 50 stores / 3 tháng | Trung bình | Pilot 5 stores trước, lấy case study. Referral program |
| Đối thủ phản ứng bằng free tier | Thấp | Offline-First là moat kỹ thuật khó copy nhanh |

#### Resource Risks

| Rủi ro | Xác suất | Biện pháp |
|---|---|---|
| Thiếu nhân lực phát triển | Trung bình | Cần team 3-5 devs + 1 designer. Nếu thiếu: ưu tiên 6 core modules, bổ sung 3 sau 1-2 tháng |
| Timeline vượt dự kiến | Trung bình | Sprint 2 tuần, demo mỗi sprint. Cut scope: giữ happy path, defer edge cases |

## Functional Requirements

### 1. Menu & Product Management

- **FR1:** Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa các danh mục sản phẩm (categories) với thứ tự hiển thị tùy chỉnh
- **FR2:** Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa các món/sản phẩm (items) bao gồm tên, giá, mô tả và hình ảnh
- **FR3:** Cửa hàng trưởng có thể định nghĩa các nhóm món thêm (modifier groups - bắt buộc/tùy chọn) với giá món thêm riêng biệt
- **FR4:** Cửa hàng trưởng có thể tạo thực đơn combo/set kết hợp nhiều món với mức giá ưu đãi đặc biệt
- **FR5:** Cửa hàng trưởng có thể bật/tắt trạng thái món (còn hàng/hết hàng), tích hợp tự động tắt món khi tồn kho bằng 0
- **FR6:** Cửa hàng trưởng có thể cấu hình điều hướng bếp bằng cách gán món/danh mục cho các màn hình bếp (KDS stations) cụ thể
- **FR7:** Hệ thống tự động đồng bộ dữ liệu thực đơn xuống thiết bị POS để truy cập ngoại tuyến (offline)

### 2. Order Processing

- **FR8:** Thu ngân có thể tạo đơn hàng mới bằng cách chọn bàn, thêm món và các món thêm trong ≤5 lần chạm (cho đơn tiêu chuẩn)
- **FR9:** Hệ thống quản lý vòng đời đơn hàng qua các trạng thái: Bản nháp (Draft) → Đã gửi (Sent) → Đang chế biến (Preparing) → Sẵn sàng (Ready) → Đã phục vụ (Served) → Đã thanh toán (Paid) → Đã đóng (Closed)
- **FR10:** Thu ngân có thể chỉnh sửa đơn hàng hiện có (thêm/bớt/sửa món) với cập nhật thời gian thực xuống bếp (KDS)
- **FR11:** Thu ngân có thể tách hóa đơn theo món, theo phần trăm hoặc theo số tiền tùy chỉnh
- **FR12:** Thu ngân có thể gộp hóa đơn từ nhiều bàn thành một hóa đơn duy nhất
- **FR13:** Hệ thống tự động áp dụng các khuyến mãi đủ điều kiện vào đơn hàng dựa trên các quy tắc đã cấu hình
- **FR14:** Hệ thống tự động điều hướng các món trong đơn hàng đến đúng màn hình bếp (KDS station) tương ứng
- **FR15:** Người dùng có thẩm quyền có thể hủy món (void item) hoặc hủy toàn bộ đơn hàng, tuân theo giới hạn phân quyền và quy trình phê duyệt

### 3. Table & Floor Management

- **FR16:** Cửa hàng trưởng có thể thiết kế sơ đồ mặt bằng bằng cách kéo-thả vị trí bàn qua nhiều khu vực/tầng
- **FR17:** Hệ thống theo dõi và hiển thị trạng thái bàn (Trống/Có khách/Đã đặt/Chưa dọn) với mã màu trực quan và thời gian ngồi
- **FR18:** Thu ngân có thể gán đơn hàng cho bàn cụ thể và xem tóm tắt đơn hàng (tổng tiền, danh sách món) theo bàn
- **FR19:** Thu ngân có thể chuyển đơn hàng từ bàn này sang bàn khác
- **FR20:** Thu ngân có thể gộp nhiều bàn thành một nhóm hoặc tách nhóm thành các bàn riêng lẻ
- **FR21:** Cửa hàng trưởng có thể gán nhân viên phụ trách các khu vực bàn cụ thể để theo dõi trách nhiệm theo ca

### 4. Kitchen Display & Production

- **FR22:** Màn hình bếp (KDS) nhận và hiển thị đơn hàng thời gian thực qua WebSocket (online) hoặc mạng LAN (offline) kèm thông báo âm thanh
- **FR23:** KDS chỉ hiển thị các món được gán cho trạm (station) tương ứng
- **FR24:** Nhân viên bếp có thể cập nhật trạng thái chế biến (Mới → Đang nấu → Sẵn sàng → Đã phục vụ) bằng cách chạm
- **FR25:** KDS quản lý hàng đợi theo thứ tự vào trước ra trước (FIFO) với cơ chế tự động đôn ưu tiên cho các đơn hàng quá hạn
- **FR26:** KDS hiển thị đồng hồ đếm ngược cho mỗi đơn hàng với cảnh báo màu dựa trên SLA (xanh/vàng/đỏ)
- **FR27:** Hệ thống hỗ trợ nhiều màn hình KDS, mỗi màn hình lọc hiển thị theo trạm được gán
- **FR28:** KDS đồng bộ trạng thái hai chiều với POS theo thời gian thực, bao gồm cả trong chế độ ngoại tuyến (offline)

### 5. Payment & Financial

- **FR29:** Thu ngân có thể xử lý thanh toán bằng tiền mặt hoặc VietQR, bao gồm cả thanh toán hỗn hợp (nhiều phương thức) cho một đơn hàng
- **FR30:** Thu ngân có thể tách thanh toán qua nhiều phương thức hoặc nhiều người trả
- **FR31:** Hệ thống tính tiền thối cho thanh toán tiền mặt với các nút chọn nhanh mệnh giá
- **FR32:** Hệ thống tạo mã VietQR in trực tiếp trên hóa đơn để khách hàng quét
- **FR33:** Người dùng có thẩm quyền có thể thực hiện trả hàng/hoàn tiền (refund) cho đơn hàng đã hoàn tất, tuân theo giới hạn phân quyền và quy trình phê duyệt
- **FR34:** Thu ngân có thể in hóa đơn cho khách, phiếu chế biến cho bếp, và in lại hóa đơn cũ với các mẫu (templates) có thể cấu hình
- **FR35:** Thu ngân có thể mở và đóng ca tiền mặt với các khai báo tiền đầu ca/cuối ca và báo cáo chênh lệch
- **FR36:** Hệ thống tạo báo cáo quyết toán cuối ngày đối soát tiền mặt và thanh toán điện tử với số liệu hệ thống

### 6. Inventory & Stock

- **FR37:** Cửa hàng trưởng có thể tạo, chỉnh sửa và xóa danh mục nguyên liệu/vật tư (tên, đơn vị tính, giá nhập, nhóm)
- **FR38:** Hệ thống theo dõi số lượng tồn kho tại cấp độ cửa hàng
- **FR39:** Cửa hàng trưởng có thể ghi nhận các giao dịch nhập kho (mua hàng) và xuất kho (hủy/hao hụt) kèm nhật ký kiểm soát
- **FR40:** Cửa hàng trưởng có thể điều chỉnh số lượng tồn kho với lý do bắt buộc khi có chênh lệch kiểm kê
- **FR41:** Cửa hàng trưởng có thể định nghĩa công thức (recipes) gắn món ăn với định lượng nguyên liệu tương ứng
- **FR42:** Hệ thống tự động trừ kho nguyên liệu khi đơn hàng hoàn tất, bao gồm cả trong chế độ ngoại tuyến (offline)
- **FR43:** Hệ thống cảnh báo Cửa hàng trưởng khi nguyên liệu xuống dưới ngưỡng tối thiểu, kèm tùy chọn tự động tạm ngắt các món liên quan
- **FR44:** Hệ thống tạo báo cáo kho (tồn hiện tại, biến động, hao hụt, giá trị tồn kho)

### 7. Reporting & Analytics

- **FR45:** Hệ thống cung cấp báo cáo bán hàng theo giờ, ca, ngày, tuần và tháng với so sánh cùng kỳ
- **FR46:** Hệ thống cung cấp báo cáo hiệu suất sản phẩm (món bán chạy, đóng góp doanh thu, món không tiêu thụ, xu hướng)
- **FR47:** Hệ thống cung cấp phân tích đơn hàng (số lượng đơn theo giờ/giờ cao điểm, số món trung bình per đơn, thời gian phục vụ trung bình, tỷ lệ hủy đơn)
- **FR48:** Hệ thống cung cấp báo cáo thanh toán chi tiết theo phương thức và đối soát quyết toán
- **FR49:** Hệ thống cung cấp báo cáo hiệu suất nhân viên (đơn hàng/giờ, doanh thu, tỷ lệ hủy đơn theo từng nhân viên)
- **FR50:** Hệ thống cung cấp bảng điều khiển (Dashboard) thời gian thực với các chỉ số KPI đạt mức nhận diện tình huống ≤30 giây cho quản lý
- **FR51:** Các phân tích bếp (thời gian chế biến trung bình, tỷ lệ tuân thủ SLA, các món chậm nhất) luôn sẵn có trong báo cáo

### 8. User & Access Management

- **FR52:** Quản trị viên hệ thống có thể tạo, chỉnh sửa, vô hiệu hóa và đặt lại mã PIN cho tài khoản người dùng
- **FR53:** Hệ thống hỗ trợ 6 vai trò mặc định (Thu ngân, Bếp, Trưởng ca, Cửa hàng trưởng, Chủ chuỗi, Quản trị hệ thống) và khả năng tạo vai trò tùy chỉnh
- **FR54:** Hệ thống thực thi mô hình phân quyền 4 lớp: Quyền theo vai trò → Phạm vi cửa hàng → Quy tắc giới hạn → Phê duyệt vượt ngưỡng
- **FR55:** Quản trị viên có thể gán người dùng vào phạm vi cửa hàng cụ thể (Một cửa hàng, Nhóm cửa hàng, Toàn chuỗi)
- **FR56:** Người dùng xác thực qua mã PIN (tại POS) hoặc email/mật khẩu (tại Dashboard), hỗ trợ xác thực PIN ngoại tuyến
- **FR57:** Người dùng có thể mở và đóng ca làm việc với khai báo tiền mặt, gán nhân sự và lịch sử ca
- **FR58:** Hệ thống duy trì nhật ký kiểm soát (audit log) bất biến cho mọi hành động nhạy cảm (hủy món, giảm giá, hoàn tiền, đăng nhập/xuất) có thể lọc theo user/ hành động/ thời gian
- **FR59:** Hệ thống hỗ trợ quy trình phê duyệt vượt ngưỡng, cho phép người dùng quyền cao hơn ủy quyền bằng cách nhập PIN trực tiếp trên thiết bị

### 9. Promotion & Discount

- **FR60:** Cửa hàng trưởng có thể tạo giảm giá theo phần trăm áp dụng cho món, đơn hàng hoặc danh mục
- **FR61:** Cửa hàng trưởng có thể tạo giảm giá theo số tiền cố định
- **FR62:** Cửa hàng trưởng có thể tạo giá khuyến mãi riêng cho từng sản phẩm cụ thể
- **FR63:** Cửa hàng trưởng có thể tạo khuyến mãi "Mua X Tặng Y" với cơ chế tự động áp dụng khi đủ điều kiện
- **FR64:** Cửa hàng trưởng có thể tạo khuyến mãi combo (mua kết hợp các món cụ thể → giá đặc biệt)
- **FR65:** Cửa hàng trưởng có thể tạo khuyến mãi theo khung giờ với tính năng tự động kích hoạt/đóng theo lịch trình
- **FR66:** Thu ngân có thể áp dụng mã giảm giá (coupon) khi thanh toán với quản lý lượt dùng và giới hạn cấu hình
- **FR67:** Cửa hàng trưởng có thể định nghĩa các điều kiện khuyến mãi (giá trị đơn tối thiểu, món/danh mục áp dụng, ngày/giờ hiệu lực, lượt dùng tối đa, quy tắc cộng dồn)

### Cross-Cutting Capabilities

- **FR68:** Hệ thống vận hành hoàn toàn ngoại tuyến cho các giao dịch (đơn hàng, thanh toán, bếp, in ấn) trong 4-24 giờ với bộ nhớ đệm ≥5,000 đơn
- **FR69:** Hệ thống tự động đồng bộ dữ liệu ngoại tuyến lên đám mây trong vòng 2 phút sau khi có mạng lại mà không mất dữ liệu
- **FR70:** Hệ thống liên lạc giữa POS và KDS qua mạng LAN khi không có internet
- **FR71:** Hệ thống hỗ trợ in nhiệt qua USB, Bluetooth hoặc Mạng trong cả chế độ online và offline
- **FR72:** Hệ thống cách ly dữ liệu khách hàng (multi-tenant) đảm bảo không truy cập chéo, mọi truy vấn đều được đóng gói theo tenant và store

## Non-Functional Requirements

### Performance

| Chỉ số | Mục tiêu | Đo lường |
|---|---|---|
| **POS UI response** | Mọi thao tác UI phản hồi trong ≤200ms | p95 response time |
| **Local DB write** | Ghi order vào local DB trong ≤10ms | p95 write latency |
| **Order creation end-to-end** | Từ tap → order confirmed ≤500ms (offline) | p95 end-to-end |
| **KDS order display** | Order xuất hiện trên KDS ≤1 giây sau khi gửi (LAN) | p95 delivery time |
| **Dashboard load** | Dashboard + widgets load ≤3 giây (cloud) | p95 page load |
| **Report generation** | Báo cáo ngày/tuần render ≤5 giây | p95 render time |
| **Concurrent POS devices** | Hỗ trợ ≥5 POS + 3 KDS đồng thời trên 1 LAN | Load test target |
| **Throughput** | ≥300 orders/giờ/thu ngân trong giờ cao điểm | Orders/giờ thực tế |

### Security

| Yêu cầu | Mức độ | Chi tiết |
|---|---|---|
| **Data encryption in transit** | Bắt buộc | TLS 1.2+ cho mọi communication Cloud ↔ POS |
| **Data encryption at rest** | Bắt buộc | Encrypt local DB trên POS device (AES-256) |
| **Authentication** | Bắt buộc | PIN hashed (bcrypt/PBKDF2), never stored plaintext. Session timeout configurable |
| **Authorization** | Bắt buộc | 4-layer RBAC enforced at API level, not just UI |
| **Audit trail immutability** | Bắt buộc | Audit logs append-only, không thể sửa/xóa, retention ≥12 tháng |
| **Tenant isolation** | Bắt buộc | Row-level security, no cross-tenant data leakage |
| **PCI DSS awareness** | Khuyến nghị | Không lưu trữ card data. VietQR = redirect, không xử lý trực tiếp |
| **Input validation** | Bắt buộc | Sanitize mọi user input, chống SQL injection, XSS |

### Reliability & Availability

| Yêu cầu | Mục tiêu | Chi tiết |
|---|---|---|
| **Cloud platform uptime** | ≥99.5% (≤43.8h downtime/năm) | SLA cho Management Layer |
| **POS offline availability** | 100% trong 4-24h offline | Transaction Layer không phụ thuộc cloud |
| **Data durability** | Zero data loss | Event log append-only + local backup mỗi 5 phút |
| **Sync recovery** | ≤2 phút sau khi có mạng trở lại | Benchmark với 5,000 buffered orders |
| **Mean time to recovery** | ≤15 phút cho cloud services | Auto-restart, health checks |
| **Graceful degradation** | Có | Mất cloud → POS vẫn chạy đủ feature Transaction Layer |
| **Local backup** | Auto mỗi 5 phút | Hỗ trợ hot-swap device: plug tablet mới vào, restore data trong ≤5 phút |

### Scalability

| Yêu cầu | Mục tiêu | Chi tiết |
|---|---|---|
| **Tenant capacity** | ≥500 tenants trên shared infrastructure | Year 1 target |
| **Store capacity** | ≥2,000 stores total | Growth target |
| **Concurrent users** | ≥1,000 concurrent POS sessions (cloud) | Load test |
| **Data retention** | ≥24 tháng order history per tenant | Archival strategy cho data cũ hơn |
| **Horizontal scaling** | Cloud backend scale horizontally | API + DB read replicas |
| **Event log throughput** | ≥10,000 events/phút sync capacity | Peak sync khi nhiều stores online đồng thời |

### Integration

| Yêu cầu | Mục tiêu | Chi tiết |
|---|---|---|
| **Printer protocol** | ESC/POS standard | Tương thích 90%+ thermal printers trên thị trường VN |
| **Printer connectivity** | USB, Bluetooth, Network | Tự detect & connect |
| **VietQR format** | Chuẩn NAPAS VietQR | Generate đúng format QR cho mọi ngân hàng VN |
| **API response format** | RESTful JSON | Chuẩn bị cho integration Phase 2+ |
| **Webhook support** | Có | Cho payment verification, delivery platform integration |
| **Data export** | CSV, JSON | Cho kế toán, migration |

### Hardware Compatibility

#### Thiết bị tối thiểu & khuyến nghị

| Loại thiết bị | Yêu cầu tối thiểu (Minimum) | Khuyến nghị (Recommended) |
|---|---|---|
| **POS Terminal (Tablet)** | Android 9.0+, 3GB RAM, màn hình 10" | Android 11+, 4GB RAM, màn hình 12" |
| **POS Terminal (Desktop)** | Windows 10, Core i3, 4GB RAM | Windows 10/11, Core i5, 8GB RAM |
| **KDS Screen** | Android 8.0+, 2GB RAM, màn hình 15" | Android 11+, 4GB RAM, màn hình 21" (Touch) |
| **Printer (Bếp/Thu ngân)** | Khổ 58mm (K58), 203 DPI | Khổ 80mm (K80), auto-cutter, LAN/WiFi |
| **Network Router** | Router chuẩn N, 100Mbps LAN | Router chuẩn AC/AX (WiFi 6), Gigabit LAN |

#### POS & KDS Devices

- **Cross-Platform:** Chạy trên trình duyệt Chrome/Edge (Chromium-based) để tận dụng phần cứng cũ của khách hàng
- **Form Factor:** Tối ưu giao diện cho Tablet (Landscape) và Touchscreen Monitor. Không hỗ trợ điện thoại màn hình nhỏ cho nghiệp vụ Thu ngân (chỉ hỗ trợ xem báo cáo)

#### Peripheral Standards (Thiết bị ngoại vi)

- **Printer Protocol:** Hỗ trợ chuẩn **ESC/POS** (tiêu chuẩn ngành)
- **Interface Support:**
  - **USB:** Kết nối trực tiếp máy tính bàn/POS chuyên dụng
  - **LAN/WiFi:** Kết nối không dây cho máy in bếp (KDS fallback)
  - **Bluetooth:** Cấp thiết cho các quầy kiosk nhỏ dùng máy in cầm tay
- **Cash Drawer:** Kết nối qua cổng RJ11 của máy in hóa đơn, tự động bật ngăn kéo khi hoàn tất thanh toán tiền mặt

#### Network Infrastructure

- **Offline Sync:** Yêu cầu các thiết bị POS và KDS phải nằm trong cùng một mạng LAN (subnet) để giao tiếp nội bộ khi mất internet
- **Stability:** Khuyến nghị dùng dây LAN cho trạm Thu ngân và Bếp để đảm bảo độ trễ (latency) <10ms

#### QR Scanning

- **Camera-based:** Sử dụng camera của tablet để quét coupon hoặc mã giảm giá
- **HID Scanner:** Hỗ trợ đầu đọc mã vạch chuẩn USB HID (plug-and-play)
