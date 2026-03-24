---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "docs/pos-feature-brife.md"
  - "_bmad-output/planning-artifacts/research/domain-Commerce-Domain-POS-cho-FnB-research-2026-03-13.md"
date: "2026-03-13"
author: Tuan.nguyen
---

# Product Brief: pos-sdd

## Executive Summary

**pos-sdd** là hệ thống quản lý điểm bán hàng (POS) thế hệ mới được thiết kế đặc biệt cho các chuỗi nhà hàng (F&B) và bán lẻ, hoạt động như một trung tâm điều khiển (Command Center) hiện đại. Hệ thống giải quyết bài toán cốt lõi là tối ưu hóa dòng chảy giao dịch theo thời gian thực (Order → Processing → Payment → Fulfillment → Reporting). Bằng việc tinh gọn triệt để thao tác của Thu ngân (Cashier), đồng bộ lập tức với quy trình chế biến của Bếp (Kitchen/KDS), và tổng hợp dữ liệu thời gian thực cho Quản lý (Manager), **pos-sdd** hướng đến mục tiêu tối thượng: Giúp các cửa hàng bán được nhiều đơn hàng hơn trong cùng một khoảng thời gian, giảm thiểu sai sót và tối ưu hóa công sức vận hành để dễ dàng mở rộng chuỗi.

---

## Core Vision

### Problem Statement

Trong môi trường bán lẻ và dịch vụ ăn uống (F&B), yếu tố sống còn là tốc độ và sự liền mạch. Vấn đề cốt lõi hiện nay là: **Làm thế nào để dòng chảy giao dịch bán hàng diễn ra nhanh, chính xác, đồng bộ và kiểm soát được hoàn toàn trong môi trường thời gian thực?** Khi luồng dữ liệu giữa các bộ phận (Thu ngân - Bếp - Quản lý - Khách hàng) bị đứt gãy hoặc chậm trễ, toàn bộ quy trình vận hành cửa hàng sẽ đối mặt với rủi ro ách tắc nghiêm trọng.

### Problem Impact

Sự cố hoặc sự chậm trễ trong dòng chảy giao dịch tạo ra "nút thắt cổ chai" ảnh hưởng đến mọi đối tượng:
- **Thu ngân (Cashier) & Nhân viên Bếp:** Chịu áp lực nặng nề nhất (Mức độ: Rất cao). Order hệ thống chậm khiến thu ngân bị khách phàn nàn trực tiếp; Bếp nhận order sai hoặc trễ gây rối loạn dây chuyền chế biến.
- **Quản lý cửa hàng (Store Manager):** Phải gánh hậu quả (Mức độ: Cao) thông qua việc xử lý khiếu nại khách hàng, sai lệch doanh thu và tổn thất tồn kho.
- **Chủ chuỗi / Quản lý vận hành (Owner):** Thiếu tầm nhìn (Mức độ: Trung bình - Cao) vì thiếu báo cáo thời gian thực, khó kiểm soát gian lận và rủi ro vận hành đa chi nhánh.
- **Khách hàng (Customer):** Gánh chịu hệ quả cuối cùng thông qua trải nghiệm kém: Chờ đợi lâu, nhận sai món, dẫn đến sự không hài lòng.

### Why Existing Solutions Fall Short

Dựa trên nghiên cứu thị trường hiện hành, các hệ thống POS truyền thống hiện nay đang gặp các vấn đề lớn:
1. **Thiếu sự đồng bộ (Silos):** Gặp khó khăn lớn trong việc tích hợp nhiều kênh bán hàng (Online, Offline, Delivery) và các hệ thống nội bộ (KDS, Inventory) vào cùng một luồng dữ liệu.
2. **Kém ổn định lúc cao điểm:** Hay gặp tình trạng rớt mạng hoặc lỗi hệ thống vào giờ cao điểm, hoặc không có chế độ Offline Mode hiệu quả, gây thiệt hại nghiêm trọng.
3. **Thiếu nền tảng dữ liệu (Data Platform):** Quá chú trọng vào "tính tiền" mà thiếu khả năng phân tích, cung cấp dữ liệu báo cáo thời gian thực giúp chủ doanh nghiệp ra quyết định.

### Proposed Solution

**pos-sdd** cung cấp một giải pháp POS toàn diện giải quyết triệt để sự đứt gãy trong quá trình vận hành:
- **Thu ngân:** Trải nghiệm order cực nhanh, trực quan, hỗ trợ đa phương thức thanh toán và hoạt động ngay cả khi rớt mạng (Offline mode).
- **Nhà bếp (KDS):** Màn hình hiển thị bếp tự động, trực quan hóa luồng chế biến, đồng bộ hóa thời gian thực và loại bỏ sai sót (Kitchen không nhầm món).
- **Quản lý / Chủ chuỗi:** Cung cấp Dashboard vận hành thời gian thực, hợp nhất bán hàng đa kênh vào một hệ thống và được thiết kế theo kiến trúc module (Commerce, Catalog, Operations, Customer, Management) để dễ dàng triển khai, dễ dàng mở rộng khi chuỗi lớn mạnh.

### Key Differentiators

Sự khác biệt lớn nhất (Unfair Advantage) của **pos-sdd** là:
1. **Tối đa hóa thông lượng đơn hàng (Throughput Optimization):** Mọi tính năng đều hướng tới việc giúp cửa hàng xử lý được nhiều đơn hơn trong một khoảng thời gian so với các đối thủ khác, với tỷ lệ sai sót giảm về bằng không.
2. **Vận hành tự động hóa (Automated Workflow):** Kết nối không khoảng cách toàn bộ kênh bán và quá trình chế biến, giải phóng sức lao động.
3. **Mở rộng dễ dàng (Scalable Architecture):** Kiến trúc sẵn sàng cho mức doanh nghiệp (Enterprise-ready) phục vụ chuỗi đa chi nhánh, cung cấp nền tảng dữ liệu tập trung giúp dễ dàng đưa ra quyết định kinh doanh.

---

## Target Users

### Primary Users

#### 1. Thu ngân (Cashier) - "Người tiền tuyến"
- **Bối cảnh & Vai trò:** Là người hứng chịu mọi áp lực đầu tiên tại quầy khi cửa hàng đông khách. Họ phải thao tác liên tục trên màn hình POS, đối mặt với tiếng ồn và sự hối thúc của khách hàng.
- **Nỗi đau (Pain points):** Cực kỳ bực bội khi POS bị "lag" hoặc treo lúc đông khách. Mất quá nhiều bước (clicks) chỉ để sửa đổi (modifier) hoặc hủy (void) một món ăn. Khổ sở vì không biết trạng thái order của khách đang ở công đoạn nào để trả lời.
- **Aha Moment (Khoảnh khắc vỡ òa):** Thao tác sửa đổi order, thêm modifier chỉ trong 1-2 giây. Hệ thống phản hồi tức thì ngay cả khi mất mạng. Nhìn thấy trạng thái order (Preparing/Done) realtime ngay trên màn hình thu ngân, khiến họ phải thốt lên: *"Cuối cùng cũng có hệ thống hiểu mình cần gì."*

#### 2. Nhân viên bếp / Pha chế (Kitchen/Bar Staff) - "Khối động cơ"
- **Bối cảnh & Vai trò:** Làm việc trong môi trường căng thẳng, nóng bức, ẩm ướt và bị bủa vây bởi sự hối thúc.
- **Nỗi đau (Pain points):** Nhận bill giấy dễ thất lạc hoặc nhòe mực. Không biết đơn nào cần ưu tiên (Prioritize), các món ăn đi kèm không được nhóm lại gây ra tình trạng rối loạn dây chuyền.
- **Aha Moment (Khoảnh khắc vỡ òa):** Nhận đơn qua màn hình cảm ứng KDS chuyên dụng với âm thanh báo order mới. Nhìn thấy queue order rõ ràng, màu sắc trạng thái trực quan, phân luồng theo từng station (bếp nóng/bếp lạnh) với đồng hồ đếm ngược (timer). Họ cảm giác: *"Chỉ cần nhìn màn hình là biết phải làm gì tiếp theo."*

#### 3. Cửa hàng trưởng (Store Manager) - "Người cầm lái trực tiếp"
- **Bối cảnh & Vai trò:** Chịu trách nhiệm về doanh thu cục bộ, kiểm soát sự phàn nàn của khách, và giữ cho hoạt động của cả cửa hàng trên đà trơn tru.
- **Nỗi đau (Pain points):** Mù mờ thông tin khi xảy ra sự cố (hết nguyên liệu, lỗi hệ thống) nếu không có mặt tại quán. Rất khó đo lường hiệu suất (service quality) của nhân viên ngay lúc đó.
- **Aha Moment (Khoảnh khắc vỡ òa):** Mọi thứ tuân theo nguyên tắc "30-second business awareness". Chỉ cần 30 giây nhìn vào bảng điều khiển (Dashboard) trên điện thoại hoặc máy tính bảng để biết ngay: Cửa hàng đang có vấn đề gì, doanh thu đang tốt hay xấu, chất lượng phục vụ và tình trạng tồn kho nhạy cảm ra sao để ra quyết định lập tức.

### Secondary Users

#### 1. Chủ chuỗi / Quản lý vận hành (Owner / Operations Manager)
- **Bối cảnh & Vai trò:** Không có mặt trực tiếp tại cửa hàng, họ nhìn dòng chảy giao dịch từ góc nhìn đại cục, quan tâm đến việc mở rộng chuỗi, cắt giảm chi phí và chống gian lận.
- **Cách sản phẩm mang lại giá trị:** Cung cấp cho họ một "Data Platform" thời gian thực. Báo cáo doanh thu đa chi nhánh (Multi-store), phát hiện bất thường ngay lập tức (cảnh báo gian lận) và có cái nhìn tổng quan về sức khỏe toàn hệ thống (System health).

#### 2. Khách hàng (End-customer)
- **Bối cảnh & Vai trò:** Người gián tiếp trải nghiệm hệ thống nhưng lại mang lại nguồn sống cho nhà hàng.
- **Cách sản phẩm mang lại giá trị:** Giảm thiểu triệt để thời gian chờ đợi (Queue time), không bị nhận sai món ăn (mất trải nghiệm) và được liền mạch thanh toán đa phương thức (Payment đa dạng).

### User Journey (Hành trình trải nghiệm cốt lõi)

Hành trình dòng chảy giao dịch hoàn hảo trên **pos-sdd**:
- **Discovery & Onboarding:** Thu ngân / Quản lý đến ca làm việc, đăng nhập vào Web POS / App POS nhanh thông qua mã PIN hoặc thẻ từ. Giao diện trực quan đến mức chỉ mất 5 phút để một nhân viên mới học cách order.
- **Core Usage (Giờ cao điểm):** Khách hàng dồn dập vào order. Thu ngân thao tác liên tục bằng màn hình cảm ứng, thanh toán chớp nhoáng (QR/Thẻ). Đơn hàng **realtime đẩy ngay lập tức** sang màn hình hiển thị nhà bếp (KDS). Âm báo "Ting", Bếp nhìn màu sắc ưu tiên (Đỏ/Vàng/Xanh) và hoàn thành món. Bếp bấm "Bump", màn hình Thu ngân chuyển trạng thái "Đã xong" để gọi khách.
- **Success Moment:** Sự cố mất mạng Internet xảy ra! Thu ngân không hề luống cuống vì Offline mode tự động kích hoạt, vẫn order, in bill và lưu đơn như bình thường.
- **Long-term Value:** Quản lý mở Dashboard trên điện thoại, trong vòng 30 giây nắm bắt đầy đủ tình hình doanh thu, thông số hàng hủy và hiệu suất Bếp để điều chỉnh ca làm việc ngày mai.

---

## Success Metrics

### User Success Metrics
Hệ thống thành công khi người dùng trực tiếp (Thu ngân, Bếp) cảm nhận được tốc độ, sự dễ dàng và loại bỏ được áp lực giờ cao điểm. Thành công của họ được đo lường thông qua:
1. **Thông lượng Order (Order Cycle Efficiency):**
   - Hoàn thành một chu kỳ Order (từ chọn món đến thanh toán) chỉ mất **10 - 15 giây**.
   - Tối đa chỉ cần **≤5 Clicks** cho mỗi order tiêu chuẩn.
   - Mỗi thu ngân có thể xử lý được **240 - 300 orders / giờ** trong thời gian cao điểm.
2. **Khả năng đào tạo (Onboarding Time):**
   - Thu ngân mới có thể hiểu và sử dụng hệ thống trong vòng **≤1 giờ**.
   - Nhân viên bếp/bar làm quen với KDS trong vòng **≤30 phút**.
   - Nhân viên có thể tự đứng ca độc lập (Independent shift) chỉ sau **≤2 giờ** đào tạo.

### Business Objectives
Mục tiêu cốt lõi của **pos-sdd** là mở rộng thông lượng phục vụ mà không cần tăng chi phí vận hành, đồng thời loại bỏ các điểm nghẽn kỹ thuật:
- **Tăng công suất phục vụ:** Tăng trưởng **+15% đến +25%** công suất đáp ứng trong giờ cao điểm nhờ kiến trúc dòng chảy mượt mà (Order → KDS).
- **Tối ưu chi phí lỗi hỏng:** Giảm mạnh mẽ **-40% đến -70%** tỷ lệ chế biến sai món hoặc hủy bill do nhầm lẫn order hoặc gián đoạn luồng thông tin.
- **Tăng trưởng Doanh thu trực tiếp:** Các yếu tố trên (giảm 20% thời gian xử lý đơn) kỳ vọng mang lại mức tăng doanh thu của cửa hàng thực tế từ **+10% đến +20%** với cùng một số lượng nhân sự.

### Key Performance Indicators
Để hệ thống vận hành đúng như một "Command Center" không đứt gãy, các chỉ số kỹ thuật và báo cáo phải đạt được các điểm chuẩn:
1. **Mức độ bền bỉ ngoại tuyến (Offline Mode & Recovery):**
   - Hệ thống POS phải có khả năng hoạt động đầy đủ tính năng trong thời gian rớt mạng từ **4 - 24 giờ**, với bộ đệm lưu trữ cục bộ ít nhất **≥5.000 orders**.
   - Thời gian đồng bộ lại (Sync recovery) về Master DB khi có mạng trở lại là cực nhanh: **< 2 phút**.
2. **Độ trễ Dữ liệu (Real-time Dashboard Latency):**
   - **Tác vụ cửa hàng (Store operations):** Độ trễ tối đa **10 - 20 giây** (ví dụ thông báo có món mới từ POS xuống Bếp).
   - **Cửa hàng trưởng (Store Manager):** Độ trễ báo cáo Dashboard bán hàng tại cửa hàng **≤30 giây** (Business Awareness trong 30 giây).
   - **Chủ chuỗi (Chain Analytics):** Độ trễ báo cáo tổng hợp hệ thống (doanh thu đa chi nhánh) **≤60 giây**.

---

## MVP Scope

### Core Features (Phạm vi cốt lõi cho Phase 1)
Để đảm bảo nguyên tắc "Phiên bản nhỏ nhất giải quyết được nỗi đau lớn nhất", MVP của **pos-sdd** chỉ tập trung vào 8 module cốt lõi tạo thành dòng chảy giao dịch bất khả chiến bại:
1. **Menu Management:** Quản lý thực đơn cơ bản và modifier.
2. **Order Management:** Luồng tạo đơn, sửa đơn (dưới 5 thao tác) và thanh toán chớp nhoáng (10-15s/chu kỳ).
3. **Kitchen (KDS / Ticket):** Màn hình bếp cơ bản đẩy đơn realtime, phân biệt trạng thái bằng màu sắc.
4. **Payment:** Thanh toán linh hoạt với Tiền mặt và các cổng quét VietQR cơ bản in trên Bill (Chưa tích hợp cổng API thanh toán phức tạp).
5. **Inventory Basic:** Quản lý tồn kho cơ bản và tự động trừ kho nguyên liệu theo công thức cốt lõi.
6. **Reporting:** Dashboard báo cáo thời gian thực, tuân thủ nguyên tắc 30s Business Awareness.
7. **User Management:** Quản lý tài khoản, phân quyền thao tác (RBAC) cho Nhân viên/Thu ngân/Quản lý.
8. **Promotion Basic:** Động cơ khuyến mãi cơ bản (ví dụ: giảm giá theo % đơn hàng, giảm trực tiếp số tiền, món tặng kèm) tự động áp dụng để không làm chậm thao tác quầy.

### Out of Scope for MVP (Nằm ngoài phạm vi MVP)
Để tránh rủi ro phình to dự án và mất tập trung vào tốc độ xử lý giao dịch, các tính năng sau bị **từ chối (Say No)** trong phiên bản MVP Phase 1:
- CRM & Loyalty (Tích điểm, thẻ thành viên, chăm sóc khách hàng).
- Promotion Engine Phức tạp (Khuyến mãi chéo đa điều kiện, Voucher đa tầng, tích hợp mã đối tác thứ 3).
- Multi-branch Management (Quản lý và điều phối luồng hàng đa chi nhánh/kho).
- Analytics Nâng cao (Báo cáo tùy chỉnh chuyên sâu bằng cách kéo thả BI).

### MVP Success Criteria (Tiêu chuẩn nghiệm thu MVP)
MVP này được xem là thành công và sẵn sàng để tung ra thị trường (hoặc mở khóa đầu tư cho Phase tiếp theo) khi:
- Hệ thống duy trì sự ổn định ngay cả trong giờ cao điểm với khối lượng 300 orders/giờ/thu ngân tại môi trường test hoặc 1 cửa hàng thí điểm (Pilot).
- Nhận được phản hồi tích cực từ nhân viên thực tế về Thời gian học cách sử dụng (< 1 giờ) và Tốc độ xử lý (Aha Moment của Thu Ngân).
- Cửa hàng trưởng quản lý được sự cố realtime thông qua Dashboard (<30 giây độ trễ).

### Future Vision (Tầm nhìn Tương lai)
Nếu bản MVP chứng minh được sự thành công vang dội tại mốc 10 cửa hàng, **pos-sdd** sẽ tiến hóa chiến lược như sau:
- **Giai đoạn 1 (Scale Up):** Chuyển đổi thành Nền tảng Quản lý Chuỗi (Chain Management Platform) hoàn chỉnh, bổ sung các tính năng Multi-branch và CRM mạnh mẽ.
- **Giai đoạn 2 (Intelligence):** Rót dữ liệu thu thập được vào mô hình Data Mining + AI để đưa ra gợi ý tối ưu vận hành (Dự báo nguyên liệu, Sắp xếp nhân sự tự động).
- **Giai đoạn 3 (Commercialization):** Đóng gói thành mô hình SaaS hóa nền tảng POS hoàn thiện để bán bản quyền (Subscription) cho mọi chuỗi F&B và Bán lẻ trên thị trường.

<!-- Content will be appended sequentially through collaborative workflow steps -->