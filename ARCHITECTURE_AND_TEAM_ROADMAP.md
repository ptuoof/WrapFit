# 🏛️ Kiến Trúc Hệ Thống & Phân Công Nhiệm Vụ 3 IT — WrapFit Platform
> **Dự án**: WrapFit Platform (Nền tảng Đóng gói Quà tặng Thông minh & Cá nhân hóa)  
> **Môn học**: EXE101 — Khởi nghiệp đổi mới sáng tạo (FPT University)  
> **Slogan**: *"Make Every Present, Present."*

---

## 1. Sơ Đồ Kiến Trúc Hệ Thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Modular Monorepo (Next.js 14 App Router + Pure Domain Core)** giúp 3 thành viên IT phát triển độc lập, không bị chồng chéo code:

```
┌───────────────────────────────────────────────────────────────────────────┐
│               TẦNG 1: GIAO DIỆN & TƯƠNG TÁC (Phụ trách: IT 1)             │
│  • Landing Page 3D (GSAP ScrollTrigger)    • 2D Visual Canvas Editor      │
│  • 3D Box Folding Simulation (Three.js)    • UI/UX Design System (Figma)  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Sử dụng contracts: src/types/*
┌─────────────────────────────────────▼─────────────────────────────────────┐
│             TẦNG 2: ĐỘNG CƠ CỐT LÕI (CORE ENGINES) (Phụ trách: IT 2)      │
│  • Parametric Dieline Engine (Công thức toán học L, W, H, Caliper t)       │
│  • FitCheck™ Engine (Kiểm tra Safe Margin >=3mm, Bleed >=2mm, DPI >=200)   │
│  • Vector Export Service (Xuất PDF CMYK đa lớp, SVG, DXF chuẩn bế)        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Lưu trữ & Truy xuất dữ liệu
┌─────────────────────────────────────▼─────────────────────────────────────┐
│            TẦNG 3: HẠ TẦNG DỮ LIỆU & BÊN THỨ 3 (Phụ trách: IT 3)          │
│  • API Endpoints (Next.js App Router / Server Actions)                    │
│  • PostgreSQL Database (Prisma ORM): Users, Projects, Templates, Jobs     │
│  • Cloud Object Storage (S3 / R2): Lưu trữ logo vector & file PDF xuất in │
│  • AI Pattern Integration: Sinh hoa văn nền theo chủ đề dịp tặng          │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phân Chia Phạm Vi & Trách Nhiệm Chi Tiết Cho 3 IT

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│          IT 1           │          IT 2           │          IT 3           │
│   Frontend & 3D Web     │  Core Math & In Ấn      │    Backend & Cloud      │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • 2D Canvas Editor      │ • Thuật toán Dieline    │ • API & Prisma DB       │
│ • Three.js 3D Fold      │ • FitCheck™ Validation  │ • S3 Asset Storage      │
│ • GSAP Animation        │ • PDFKit CMYK Export    │ • AI Pattern API        │
│ • Figma UI Component    │ • Dung sai giấy GSM     │ • Auth & User Profile   │
│                         │                         │                         │
│ 📁 fe/                  │ 📁 shared/              │ 📁 be/                  │
│ 🌿 feature/it1-ui-3d    │ 🌿 feature/it2-engine   │ 🌿 feature/it3-backend  │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### 👤 IT 1: Frontend Lead & 2D/3D Packaging Studio
- **Trọng tâm**: Trải nghiệm thị giác, tương tác kéo thả 2D và mô phỏng 3D thời gian thực.
- **Thư mục làm việc độc quyền**:
  - `fe/src/features/studio/components/canvas/`: Canvas 2D kéo thả logo, chữ, sticker, hoa văn.
  - `fe/src/features/studio/components/three/`: Sân khấu 3D render khối hộp, texture map và nếp gập.
  - `fe/src/views/editor/studio/`: Trang phòng thu thiết kế (Studio workspace, route `/editor/[id]`).
  - `fe/src/views/home/`: Landing Page 3D cuộn chuột phục vụ Pitching CP4.
- **Agent Skills hỗ trợ**: `packaging-threejs-fold`, `wrapfit-design-system`, `scroll-storytelling`.
- **Nhánh Git**: `feature/it1-editor-3d`

---

### 👤 IT 2: Core Engineering & Print Physics Lead
- **Trọng tâm**: Toán học bao bì, thuật toán kiểm duyệt in ấn và động cơ xuất file vector.
- **Thư mục làm việc độc quyền**:
  - `shared/src/parametric/`: Công thức tính tọa độ vector của 4 loại hộp:
    1. *Tuck Top Box* (Hộp nắp gài đáy khóa).
    2. *Sleeve / Drawer Box* (Hộp kéo bao diêm).
    3. *Lid & Base Box* (Hộp âm dương).
    4. *Pillow Box* (Hộp gối).
  - `shared/src/fitcheck/`: Thuật toán kiểm tra vi phạm vật lý: Bleed $\ge 2\text{mm}$, Safe margin $\ge 3\text{mm}$, DPI $\ge 200$, flap collision.
  - `shared/src/types/`: Các định nghĩa kiểu dữ liệu dùng chung cho cả fe và be.
- **Agent Skills hỗ trợ**: `fitcheck-validator`.
- **Nhánh Git**: `feature/it2-parametric-fitcheck`

---

### 👤 IT 3: Backend, Data Infrastructure & Cloud BaaS Lead
- **Trọng tâm**: CSDL, API lưu trữ, Cloud Storage, Authentication và tích hợp AI bên ngoài.
- **Thư mục làm việc độc quyền**:
  - `be/prisma/schema.prisma` + `be/prisma/migrations/`: Thiết kế và quản trị CSDL PostgreSQL (qua migration).
  - `be/src/<tên>/`: Mỗi phân hệ là một NestJS Module (controller, service, DTO, `index.ts`) — xem `docs/08`, Mục 1 & 7. Cấu trúc theo skeleton [nestjs-project-structure](https://github.com/CatsMiaow/nestjs-project-structure), quy ước trong `be/README.md`.
  - `be/src/common/`: Guard, decorator, filter, interceptor, `ConfigService` dùng chung (RBAC, định dạng lỗi).
  - `be/src/config/`: Kiểm tra biến môi trường + cấu hình theo `NODE_ENV`. `be/src/shared/`: Prisma, hàng đợi BullMQ.
  - `be/src/app.ts`: Khởi chạy NestJS REST API server (cổng 8080, prefix `/api`).
- **Agent Skills hỗ trợ**: `insforge-backend-flow`.
- **Nhánh Git**: `feature/it3-backend-auth-storage`

---

## 3. Hợp Đồng Dữ Liệu Chung (Single Source of Truth)

Để 3 IT không bị đụng độ mã nguồn (merge conflict), toàn bộ giao tiếp giữa 3 tầng được chuẩn hóa tại thư mục:  
📁 `src/types/`:
- `src/types/dieline.ts`: Cấu trúc tọa độ các mặt hộp, nét cắt (Cut), nét cấn (Crease).
- `src/types/project.ts`: Cấu trúc dự án bao bì, kích thước $(L, W, H)$, chất liệu giấy và các phần tử thiết kế.
- `src/types/fitcheck.ts`: Cấu trúc báo cáo lỗi in ấn và cảnh báo an toàn.

---

## 4. Kế Hoạch Sprint Theo Các Checkpoint Môn EXE101

| Giai đoạn | Mục tiêu IT 1 (Frontend & 3D) | Mục tiêu IT 2 (Core Math & Print) | Mục tiêu IT 3 (Backend & Cloud) |
| :--- | :--- | :--- | :--- |
| **Checkpoint 2** *(Báo cáo Ý tưởng & Đặc tả Kỹ thuật)* | • Thiết kế Design System trên Figma.<br>• Wireframe màn hình Web Editor. | • Viết xong công thức tham số cho hộp *Tuck Top Box*.<br>• Định nghĩa bộ luật FitCheck. | • Tạo Schema CSDL PostgreSQL (Prisma).<br>• Cấu hình môi trường S3 & Next.js. |
| **Checkpoint 3** *(Bảo vệ MVP Hoạt động)* | • Hoàn thiện Editor 2D (kéo thả logo).<br>• Hoạt ảnh gập hộp 3D bằng Three.js. | • Tích hợp FitCheck™ cảnh báo lỗi trực tiếp.<br>• Xuất file PDF vector CMYK chuẩn bế. | • API lưu & tải project.<br>• API sinh hoa văn AI & Upload ảnh S3. |
| **Checkpoint 4** *(Pitch Deck & Ra mắt)* | • Hoàn thiện Landing Page 3D cuộn chuột để pitching trước ban giám khảo. | • Hỗ trợ thêm kiểu hộp *Bao diêm* & *Âm dương*.<br>• Tối ưu dung sai giấy GSM. | • Triển khai hệ thống lên Cloud (Vercel/Cloud Run).<br>• Đo lường hiệu năng & uptime. |

---

## 5. Quy Trình Phối Hợp Git Chuẩn (Git Workflow)

1. **Tuyệt đối không commit trực tiếp vào nhánh `main`**.
2. Khi bắt đầu tính năng mới, tạo nhánh từ `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/itX-ten-tinh-nang
   ```
3. Sau khi hoàn thành và kiểm tra kỹ lưỡng, đẩy nhánh lên GitHub và tạo **Pull Request (PR)** vào `main`.
4. Ít nhất 1 thành viên IT khác phải Review và Approve trước khi Merge vào `main`.
