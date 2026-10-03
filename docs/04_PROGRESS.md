# 📊 TIẾN ĐỘ THỰC HIỆN & PHÂN CÔNG (PROJECT PROGRESS)

> **Môn học**: EXE101 — Experiential Entrepreneurship (FPT University)

---

## Bảng Theo Dõi Tiến Độ 3 IT

| Nhiệm vụ | Người phụ trách | Trạng thái | Checkpoint |
| :--- | :--- | :--- | :--- |
| **Thiết lập kiến trúc Monorepo (`fe`, `be`, `shared`)** | Toàn đội IT | ✅ Đã hoàn thành | CP2 |
| **Tích hợp 5 Agent Skills cho dự án** | Toàn đội IT | ✅ Đã hoàn thành | CP2 |
| **Công thức toán học hộp Tuck Top (`shared/`)** | 👤 **IT 2** | ✅ Đã hoàn thành | CP2 |
| **Công thức hộp Bao diêm, Âm dương, Gối (`shared/`)** | 👤 **IT 2** | ✅ Đã hoàn thành | CP2 / CP3 |
| **Thuật toán kiểm định FitCheck™ (`shared/`)** | 👤 **IT 2** | ✅ Đã hoàn thành | CP3 |
| **Canvas 2D phẳng hiển thị nét cắt & cấn (`fe/`)** | 👤 **IT 1** | ✅ Đã hoàn thành | CP2 |
| **Sân khấu 3D Three.js mô phỏng khối hộp (`fe/`)** | 👤 **IT 1** | ✅ Đã hoàn thành | CP3 |
| **Thanh trượt kích thước $L, W, H$ xúc giác (`fe/`)** | 👤 **IT 1** | ✅ Đã hoàn thành | CP2 |
| **Ngăn kéo cảnh báo lỗi FitCheck™ (`fe/`)** | 👤 **IT 1** | ✅ Đã hoàn thành | CP3 |
| **Landing Page 3D cuộn chuột (Apple-style) (`fe/`)** | 👤 **IT 1** | 🔄 Đang triển khai | CP4 |
| **IT3-01 · Nền móng Backend NestJS 11, Schema v2.1 (10 bảng), Docker, CI test (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP2 |
| **IT3-02 · Xác thực: Email/Mật khẩu, JWT + Refresh Token xoay vòng, RBAC (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP2 |
| **IT3-02 · Xác thực: HttpOnly Cookie & Google OAuth (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP2 |
| **UC-02 · Brand Kit: `PATCH /api/users/me/brand-kit` (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP3 |
| **IT3-03 · API CRUD dự án, lọc trạng thái & thư mục, `ProjectOwnerGuard` (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (lọc theo cấu trúc hộp, thẻ có loại giấy & điểm FitCheck phía server) | CP3 |
| **IT3-04 · Lưu trữ, thùng rác 30 ngày (cron), nhân bản & snapshot phiên bản (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (xóa file S3/R2 khi dọn thùng rác: xong ở IT3-08) | CP3 |
| **IT3-05 · API bộ sưu tập / thư mục dự án (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP3 |
| **IT3-06 · Chia sẻ công khai, Remix (fork) & thả tim (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (thông báo cho tác giả chờ NotificationsModule) | CP4 |
| **IT3-07 · Thư viện mẫu Curated & Community, cache, "Dùng mẫu này" (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (thêm bảng `design_templates`; Thư viện cộng đồng chỉ hiện thiết kế FitCheck ≥ 90 — UC-14) | CP3 |
| **IT3-08 · Lưu trữ file S3 / Cloudflare R2: pre-signed upload, hạn mức, dọn file (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (nén thumbnail bằng `sharp` chưa làm) | CP3 |
| **IT3-09 · AI sinh bảng màu & hoa văn SVG lặp (Claude), giới hạn theo gói (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (cần `ANTHROPIC_API_KEY` để bật AI; chưa có thì dùng bộ sinh thuật toán) | CP3 |
| **IT3-10 · Trải nghiệm mở hộp 3D & sinh mã QR in đáy hộp (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành | CP4 |
| **IT3-11 · Xuất file in bất đồng bộ (BullMQ, worker riêng), CI unit + e2e, deploy VPS HTTPS (`be/`)** | 👤 **IT 3** | ✅ Đã hoàn thành (PDF / SVG có ảnh, logo, hoa văn đã upload; đường cắt bao ngoài & lớp bleed chờ IT2 bổ sung trong `@wrapfit/shared`; CI có bước lint ESLint) | CP4 |

> **Ghi chú (02/10/2026)**: Backend được chuyển từ Express sang **NestJS 11** theo kiến trúc tại [`07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md`](07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md). Các API thử nghiệm của bản Express cũ (dự án, template, upload, AI, xuất SVG/PDF) đã được gỡ khỏi `be/` và sẽ được viết lại theo từng task IT3 ở trên.
