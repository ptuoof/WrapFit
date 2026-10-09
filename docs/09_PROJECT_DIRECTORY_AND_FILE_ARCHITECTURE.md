# 📁 ĐẶC TẢ KIẾN TRÚC HỆ THỐNG THƯ MỤC & TỆP TIN CHUẨN CÔNG NGHIỆP (PROJECT DIRECTORY & FILE SPECIFICATION)

> **Dự án**: WrapFit Platform (Nền tảng Thiết kế & Đóng gói Bao bì Quà tặng Thông minh)  
> **Khóa học**: EXE101 — Trải nghiệm Khởi nghiệp Đổi mới Sáng tạo (FPT University)  
> **Mô hình kiến trúc**: **Modular Monorepo — npm workspaces (Next.js 14 App Router + Pure Domain Core `@wrapfit/shared` + NestJS 11 API & Worker)**  
> **Quy chuẩn thiết kế**: Clean Architecture, Domain-Driven Design (DDD) & Separation of Concerns (SoC)

---

## 1. TỔNG QUAN CẤU TRÚC MONOREPO CẤP CAO (HIGH-LEVEL OVERVIEW)

Hệ thống được tổ chức thành 3 khu vực mã nguồn độc lập (Decoupled Workspaces) dùng chung một hợp đồng dữ liệu chuẩn:

```
wrapfit-platform/
├── fe/               # TẦNG 1: Frontend Client, WebGL 3D Studio & 2D Canvas Editor (Phụ trách: IT 1)
├── shared/           # TẦNG 2: Động cơ Toán CAD Dieline, FitCheck™ & OOP Contracts (Phụ trách: IT 2)
├── be/               # TẦNG 3: Backend API, Prisma ORM, Cloud Storage & Workers (Phụ trách: IT 3)
├── docs/             # Tài liệu kiến trúc, đặc tả Class Diagram, WBS & Báo cáo CP1-CP4
└── .github/          # CI/CD Workflows, PR Templates & Automation Scripts
```

---

## 2. BẢN ĐỒ CÂY THƯ MỤC CHI TIẾT (COMPLETE DIRECTORY TREE)

```
d:\FPT_FALL2026\EXE101\
├── .agents/                                # Định nghĩa Agent Skills & Antigravity Rules
│   └── skills/                             # Custom Packaging Skills (fitcheck, fold, design system)
├── .github/                                # Quy trình tự động hóa GitHub Actions
│   └── workflows/
│       ├── fe-ci.yml                       # Build & Lint kiểm thử Frontend
│       └── be-ci.yml                       # Test API, Prisma validate & Docker build
├── docs/                                   # Toàn bộ tài liệu kiến trúc & báo cáo học thuật
│   ├── 00_PROJECT_OVERVIEW.md              # Giới thiệu bài toán, tầm nhìn & giá trị cốt lõi
│   ├── 01_REQUIREMENTS.md                  # Yêu cầu chức năng (FR) & phi chức năng (NFR)
│   ├── 02_DATABASE_DESIGN.md               # Thiết kế CSDL quan hệ PostgreSQL
│   ├── 03_API_DESIGN.md                    # Thiết kế danh sách Endpoints RESTful
│   ├── 04_PROGRESS.md                      # Nhật ký tiến độ Sprint
│   ├── 07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md # Báo cáo Use Cases & WBS 3 IT
│   ├── 08_PACDORA_SYSTEM_CLASS_DIAGRAM_SPECIFICATION.md # Master Class Diagram (26 Packages)
│   └── 09_PROJECT_DIRECTORY_AND_FILE_ARCHITECTURE.md    # Tài liệu này
│
├── fe/                                     # FRONTEND WORKSPACE (Next.js 14 App Router + Three.js)
│   ├── public/                             # Tài nguyên tĩnh công khai (Static Assets)
│   │   ├── fonts/                          # Phông chữ thương hiệu (Playfair, DM Sans)
│   │   ├── textures/                       # Bản đồ chất liệu PBR (kraft-roughness.jpg, paper-bump.png)
│   │   ├── presets/                        # File 3D mẫu (.gltf, .hdr ánh sáng môi trường)
│   │   ├── wrapfit-mascot.jpg              # Mascot thương hiệu BeBoxy
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/                            # Next.js 14 App Router (Routes & Layouts)
│   │   │   ├── layout.tsx                  # Root Layout (Theme, Font, Toast Provider)
│   │   │   ├── page.tsx                    # Landing Page 3D cuộn chuột (Pitching CP4)
│   │   │   ├── (auth)/                     # Nhóm Route Xác thực (Route Group)
│   │   │   │   ├── login/page.tsx          # Màn hình đăng nhập (Email / Google OAuth)
│   │   │   │   ├── register/page.tsx       # Màn hình đăng ký thành viên
│   │   │   │   ├── forgot-password/page.tsx # Màn hình quên mật khẩu
│   │   │   │   └── reset-password/page.tsx  # Xác nhận đặt lại mật khẩu mới
│   │   │   ├── editor/
│   │   │   │   ├── page.tsx                # Khởi tạo kích thước ban đầu (L, W, H, GSM)
│   │   │   │   └── [id]/page.tsx           # Phòng thu thiết kế chính 2D/3D (Studio Workspace)
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx              # Sidebar điều hướng Dashboard
│   │   │   │   ├── page.tsx                # Trang tổng quan số liệu cá nhân
│   │   │   │   ├── projects/page.tsx       # Quản lý danh sách hộp quà (Active/Archived/Trash)
│   │   │   │   ├── collections/page.tsx    # Quản lý các thư mục chiến dịch
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx            # Thông tin tài khoản & đổi mật khẩu
│   │   │   │       ├── brand-kit/page.tsx  # Cấu hình Logo, bảng màu, font của Shop
│   │   │   │       └── security/page.tsx   # Cấu hình 2FA & Quản lý thiết bị đăng nhập
│   │   │   ├── templates/
│   │   │   │   ├── page.tsx                # Thư viện mẫu hộp quà (Curated & Community)
│   │   │   │   └── [slug]/page.tsx         # Chi tiết mẫu & nút 1-Click Apply
│   │   │   ├── p/
│   │   │   │   └── [slug]/page.tsx         # Trang xem mô hình 3D công khai (Public Viewer)
│   │   │   ├── unbox/
│   │   │   │   └── [slug]/page.tsx         # Trang mở hộp quà ảo 3D qua mã QR đáy hộp
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx                # Trang thanh toán in ấn & chọn địa chỉ giao hàng
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                # Lịch sử đơn hàng in ấn
│   │   │   │   └── [id]/page.tsx           # Chi tiết đơn hàng & theo dõi mã vận đơn
│   │   │   ├── admin/                      # Cổng thông tin Quản trị viên (Chỉ Role ADMIN)
│   │   │   │   ├── page.tsx                # Tổng quan chỉ số doanh thu & DAU
│   │   │   │   ├── templates-approval/page.tsx # Hàng đợi duyệt mẫu cộng đồng
│   │   │   │   ├── users/page.tsx          # Quản lý người dùng, phân quyền & khóa tài khoản
│   │   │   │   └── audit-logs/page.tsx     # Nhật ký kiểm toán bảo mật
│   │   │   └── api/                        # Next.js API Routes (BFF - Backend for Frontend)
│   │   │       └── auth/[...nextauth]/route.ts # NextAuth handler nếu dùng session client
│   │   ├── components/                     # Hệ thống linh kiện giao diện (UI Components)
│   │   │   ├── auth/                       # Form Login, Register, OAuth Buttons, 2FA Modal
│   │   │   ├── brand/                      # Brand Kit Color Pickers, Font Selectors
│   │   │   ├── calculator/                 # Trình tính toán dung sai giấy GSM & báo giá in
│   │   │   ├── canvas/                     # Phòng thu 2D Canvas (Fabric.js / Paper.js wrapper)
│   │   │   │   ├── DielineCanvas2D.tsx     # Canvas hiển thị nét bế đỏ & nét cấn xanh
│   │   │   │   ├── CanvasToolbar.tsx       # Khay công cụ: Thêm Chữ, Logo, Mã vạch, Hoa văn
│   │   │   │   └── TransformGizmo.tsx      # Điểm neo kéo giãn & xoay đối tượng
│   │   │   ├── three/                      # Phòng thu 3D WebGL (Three.js / React Three Fiber)
│   │   │   │   ├── PackagingStage.tsx      # Sân khấu 3D chính (Canvas, OrbitControls, Camera)
│   │   │   │   ├── FoldingBoxModel.tsx     # Khối hộp gập động học theo tiến trình 0-100%
│   │   │   │   ├── TextureSynchronizer.tsx # Đồng bộ Texture Atlas từ 2D sang mặt 3D
│   │   │   │   └── StudioEnvironment.tsx   # Ánh sáng HDR, bóng đổ mềm & bối cảnh chụp ảnh
│   │   │   ├── fitcheck/                   # Giao diện cảnh báo in ấn FitCheck™
│   │   │   │   ├── PreflightDrawer.tsx     # Ngăn kéo hiển thị điểm số & danh sách vi phạm
│   │   │   │   └── FixActionDialog.tsx     # Hộp thoại xác nhận 1-Click tự động sửa lỗi
│   │   │   ├── dashboard/                  # Thẻ ProjectCard, GridView, ListFilter, TrashTab
│   │   │   ├── collections/                # Modal tạo Folder, thanh danh mục thư mục
│   │   │   ├── showcase/                   # Thẻ Bento, 3D Preview Card khi hover
│   │   │   ├── navigation/                 # Navbar, Mobile Menu, Footer, Breadcrumb
│   │   │   └── ui/                         # Base Atomic UI (Button, Modal, Input, Slider, Badge)
│   │   ├── hooks/                          # Custom React Hooks
│   │   │   ├── useDielineGeometry.ts       # Hook tính toán tọa độ bản bế
│   │   │   ├── useCanvasHistory.ts         # Hook quản lý Undo/Redo Command
│   │   │   ├── useFitCheck.ts              # Hook debounce kiểm tra lỗi in ấn
│   │   │   └── use3DAnimation.ts           # Hook điều khiển GSAP folding timeline
│   │   ├── stores/                         # Quản lý State toàn cục (Zustand / Jotai)
│   │   │   ├── editorStore.ts              # State dự án đang mở, zoom, panel active
│   │   │   ├── cartStore.ts                # State giỏ hàng, mã giảm giá
│   │   │   └── authStore.ts                # State phiên đăng nhập người dùng
│   │   ├── lib/                            # Thư viện tiện ích nội bộ Frontend
│   │   │   ├── apiClient.ts                # Axios/Fetch client bọc xác thực JWT
│   │   │   ├── audio/hapticAudio.ts        # Hiệu ứng âm thanh khi gập hộp hoặc ấn nút
│   │   │   └── utils.ts                    # Format tiền tệ VNĐ, kích thước mm
│   │   └── styles/
│   │       └── globals.css                 # Tailwind CSS directives, Luxury Craft Theme
│   ├── .env.example                        # Mẫu biến môi trường Frontend
│   ├── next.config.mjs                     # Cấu hình Next.js (Transpile shared, Remote Images)
│   ├── tailwind.config.ts                  # Cấu hình Bảng màu (Kraft, Ivory, Luxury Green, Gold)
│   ├── tsconfig.json                       # Đường dẫn alias @/* và tham chiếu @wrapfit/shared
│   └── package.json
│
├── shared/                                 # PURE DOMAIN CORE (Zero Dependency / Cross-platform)
│   ├── src/
│   │   ├── index.ts                        # Điểm xuất khẩu chính (Barrel File)
│   │   ├── core/
│   │   │   └── contracts.ts                # Toàn bộ Interface, Value Objects, Domain Events & Enums
│   │   ├── types/
│   │   │   ├── dieline.ts                  # Types hình học: BoxDimensions, PanelFace, DielineSegment
│   │   │   ├── project.ts                  # Types dự án: PackagingProject, CanvasElement, MaterialSpec
│   │   │   └── fitcheck.ts                 # Types kiểm định: FitCheckReport, Violation, SeverityLevel
│   │   ├── parametric/                     # Thuật toán tính toán hình học CAD bế hộp
│   │   │   ├── tuck-top.ts                 # Công thức hộp nắp gài đáy khóa
│   │   │   ├── sleeve-drawer.ts            # Công thức hộp kéo bao diêm
│   │   │   ├── lid-base.ts                 # Công thức hộp âm dương
│   │   │   ├── pillow.ts                   # Công thức hộp gối nắp cong
│   │   │   └── mailer-box.ts               # Công thức hộp carton gửi hàng (gập tự khóa)
│   │   ├── fitcheck/                       # Động cơ kiểm tra vật lý in ấn FitCheck™
│   │   │   ├── validator.ts                # Lớp thẩm định trung tâm (Context Engine)
│   │   │   ├── rules/
│   │   │   │   ├── safe-margin.rule.ts     # Kiểm tra khoảng cách logo/chữ tới nếp cấn >= 3mm
│   │   │   │   ├── bleed-margin.rule.ts    # Kiểm tra màu nền tràn lề >= 2mm
│   │   │   │   ├── glue-clearance.rule.ts  # Kiểm tra vùng dán keo không in mực
│   │   │   │   └── raster-dpi.rule.ts      # Kiểm tra độ phân giải ảnh raster >= 200 DPI
│   │   │   └── fixes/
│   │   │       ├── nudge-margin.fix.ts     # Tự động đẩy phần tử vào vùng an toàn
│   │   │       └── expand-bleed.fix.ts     # Tự động mở rộng nền tràn viền
│   │   └── exporter/                       # Bộ chuyển đổi tài liệu vector in ấn
│   │       ├── pdf-export.ts               # Xuất PDF CMYK 300 DPI phân tách bản kẽm Spot Color
│   │       ├── dxf-export.ts               # Xuất mã lệnh bế cho máy cắt CNC / HPGL
│   │       └── svg-export.ts               # Xuất file SVG vector chuẩn máy cắt phẳng Cricut
│   ├── tsconfig.json
│   └── package.json                        # Package name: @wrapfit/shared
│
└── be/                                     # BACKEND API & DATA INFRASTRUCTURE (IT 3) — NestJS, theo skeleton nestjs-project-structure
    ├── prisma/                             # Quản trị Cơ sở Dữ liệu Quan hệ PostgreSQL
    │   ├── schema.prisma                   # Lược đồ thực thể (Users, Projects, Templates, Exports...)
    │   ├── migrations/                     # Lịch sử các bước thay đổi cấu trúc bảng CSDL
    │   └── seed.ts                         # Dữ liệu mẫu khởi tạo (4 mẫu hộp chuẩn, tài khoản Admin)
    ├── src/
    │   ├── app.ts                          # Khởi chạy API HTTP (cổng 8080, prefix /api)
    │   ├── worker.ts                       # Process BullMQ riêng: xuất file in, gửi email
    │   ├── app.module.ts                   # Ghép module + guard / filter / interceptor toàn cục
    │   ├── app.middleware.ts               # Request id, helmet, CORS, ValidationPipe, WebSocket adapter
    │   ├── config/                         # env.validation.ts + envs/ (default, production...) + configuration.ts
    │   ├── common/                         # @Global CommonModule: ConfigService, decorators, guards, filters, dto
    │   ├── shared/                         # Nest module hạ tầng: prisma/ (PrismaService), queue/ (BullMQ)
    │   ├── auth/                           # Đăng ký, đăng nhập, refresh, Google OAuth, JwtAuthGuard
    │   ├── base/                           # GET /api/health
    │   ├── users/  collections/  templates/  public-showcase/  unboxing/  ai/  events/
    │   ├── projects/                       # 4 tầng: presentation / application / domain / infrastructure
    │   ├── storage/                        # Pre-signed upload S3 / R2, hạn mức, dọn file
    │   ├── export/                         # Hàng đợi xuất file + ExportProcessor (worker) + rendering/
    │   └── mail/                           # Đưa email vào hàng đợi + gửi SMTP (worker)
    ├── test/e2e/                           # E2E test (Jest + Supertest)
    ├── .env.example                        # Mẫu biến môi trường Backend
    ├── Dockerfile                          # Một image cho cả API (dist/app.js) và worker (dist/worker.js)
    ├── tsconfig.json
    └── package.json
```

---

## 3. PHÂN VÙNG DỮ LIỆU & QUY TẮC PHỤ THUỘC (IMPORT BOUNDARIES)

Để đảm bảo kiến trúc sạch, tuyệt đối tuân thủ quy tắc phụ thuộc một chiều (Strict Dependency Rule):

```
       ┌────────────────────────┐
       │   shared/ (Domain)     │  <── Không được import bất cứ thứ gì từ fe/ hoặc be/
       └───────────▲────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────┴────────┐ ┌────────┴────────┐
│   fe/ (Client)  │ │   be/ (Server)  │  <── fe/ và be/ KHÔNG ĐƯỢC import trực tiếp chéo nhau!
└─────────────────┘ └─────────────────┘      Giao tiếp duy nhất thông qua REST API & Contracts.
```

1. **`shared/` (Core Math & Contracts)**:
   - Là mã nguồn thuần TypeScript (Pure TypeScript), không phụ thuộc vào React, Next.js, DOM hay CSDL.
   - Chạy được ở cả Client-side (Trình duyệt) lẫn Server-side (Node.js).
2. **`fe/` (Frontend)**:
   - Import types, công thức toán và quy tắc FitCheck từ `@wrapfit/shared`.
   - Giao tiếp với `be/` qua HTTP API Client (`fe/src/api/`, trên HTTP client `fe/src/services/api/`).
3. **`be/` (Backend)**:
   - Import types, công thức dieline và FitCheck từ `@wrapfit/shared` (DTO `implements` các interface của shared).
   - Phụ thuộc vào Prisma ORM, CSDL PostgreSQL, Redis (BullMQ) và Cloud S3 / R2.

### 3.1. Ranh giới bên trong `be/src/`

Backend theo skeleton [nestjs-project-structure](https://github.com/CatsMiaow/nestjs-project-structure). Phụ thuộc cũng đi một chiều:

```
config/ + common/  ──▶  shared/prisma, shared/queue  ──▶  module nghiệp vụ  ──▶  app.module.ts / worker.ts
(tầng nền: env,           (Nest module hạ tầng)           (auth, users, projects,
 CommonModule @Global)                                     export...)
```

(mũi tên = "được import bởi"; `config/` và `common/` dùng lẫn nhau: `ConfigService` lấy kiểu `Config` từ `config/`, logger trong `config/` lấy request id từ `common/context`)

1. **`config/`, `common/`, `shared/`** là hạ tầng: không import module nghiệp vụ. Thứ nhiều module cùng cần (tên cookie, hàm băm token, decorator, DTO phân trang) đặt ở `common/`.
2. **Module nghiệp vụ** (`src/<tên>/`) có `index.ts` (barrel). Module khác import qua thư mục: `from '../projects'`, `from '../common'`, `from '../shared/prisma'` — không trỏ vào file bên trong module khác. Trong cùng module import thẳng file.
3. **Không vòng import** giữa các module: ESLint `import/no-cycle` chặn trong CI. Cần phụ thuộc ngược thì dùng Port + injection token (tài liệu 08, Mục 1.2 & 1.4) hoặc đưa phần dùng chung xuống `common/`.
4. **Chỉ `src/config/` đọc `process.env`**; phần còn lại đọc cấu hình bằng `ConfigService` của `common/`: `config.get('storage.bucket')`.
5. **Hai process, một mã nguồn**: `app.module.ts` (API) không import các `*WorkerModule`; `worker.ts` chỉ import hạ tầng (`PrismaModule`, `StorageModule`, kết nối queue) và các `*WorkerModule`. `@Cron` chỉ đăng ký trong API.

---

## 4. CHI TIẾT TÍCH HỢP DỊCH VỤ BÊN THỨ BA (3RD-PARTY INTEGRATIONS)

| Dịch Vụ Bên Thứ 3 | Mục Đích Sử Dụng | Vị Trí Triển Khai Trong Mã Nguồn | Biến Môi Trường Cần Thiết |
| :--- | :--- | :--- | :--- |
| **AWS S3 / Cloudflare R2** | Lưu trữ ảnh logo người dùng tải lên, ảnh mockup 4K và file PDF xuất in | `be/src/storage/storage.service.ts` | `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` |
| **PostgreSQL** | Cơ sở dữ liệu chính lưu thông tin User, Project, Template, Order | `be/prisma/schema.prisma` | `DATABASE_URL="postgresql://user:pass@host:5432/wrapfit"` |
| **Redis & BullMQ** | Hàng đợi tác vụ ngầm xuất PDF/Mockup và Rate Limiting chống spam | `be/src/shared/queue/`, `be/src/export/`, `be/src/mail/`, `be/src/common/guards/http-throttler.guard.ts` | `REDIS_URL="redis://localhost:6379"` |
| **VNPay / Stripe / MoMo** | Cổng thanh toán gói Pro và đơn hàng in ấn quà tặng | `be/src/payments/` (chưa có) | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `STRIPE_SECRET_KEY` |
| **GHTK / GHN API** | Tính phí ship tự động và đẩy đơn giao vận | `be/src/shipping/` (chưa có) | `GHTK_API_TOKEN`, `GHN_SHOP_ID` |
| **Resend / SendGrid** | Gửi email giao dịch (Xác thực, Quên mật khẩu, Báo đơn hàng) | `be/src/mail/` (SMTP qua worker) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |
| **Google OAuth 2.0** | Đăng nhập nhanh 1 cú nhấp chuột cho người dùng | `be/src/auth/strategies/google.strategy.ts` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| **Gemini / Stability AI** | Sinh hoa văn bao bì tự động theo chủ đề dịp tặng quà | `be/src/ai/` (Claude, dự phòng bằng thuật toán) | `ANTHROPIC_API_KEY`, `AI_MODEL` |
| **Cloudflare Turnstile** | CAPTCHA bảo vệ form đăng ký, quên mật khẩu chống bot | `fe/src/components/auth/`, `be/src/common/guards/` (chưa có) | `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |

---

## 5. QUY ƯỚC ĐẶT TÊN TỆP TIN CHUẨN (NAMING CONVENTIONS)

- **Components React**: Dùng `PascalCase.tsx` (ví dụ: `PackagingStage.tsx`, `DielineCanvas2D.tsx`).
- **Hooks & Utilities**: Dùng `camelCase.ts` (ví dụ: `useDielineGeometry.ts`, `hapticAudio.ts`).
- **Services, Controllers & Rules**: Dùng `kebab-case.suffix.ts` (ví dụ: `auth.controller.ts`, `safe-margin.rule.ts`, `storage.service.ts`).
- **Backend NestJS (`be/src/`)**: thư mục module dạng `kebab-case` (`public-showcase/`); file theo loại `<tên>.module.ts`, `.controller.ts`, `.service.ts`, `.guard.ts`, `.strategy.ts`, `.processor.ts`, `.task.ts` (`@Cron`), `.dto.ts` (trong `dto/`, plugin Swagger đọc hậu tố này), `.constants.ts`, `.port.ts` (Port + injection token). Mỗi module và mỗi thư mục con của `common/` có `index.ts`. Unit test `<file>.spec.ts` đặt cạnh file; e2e `be/test/e2e/<luồng>.e2e-spec.ts`.
- **Prisma Models**: Dùng `PascalCase` (ví dụ: `PackagingProject`, `BoxTemplate`), tên bảng CSDL dùng `snake_case` số nhiều (`@@map("packaging_projects")`).
- **Tên biến & Hàm**: Dùng `camelCase` (ví dụ: `calculateDieline`, `isReadyForProduction`).
- **Hằng số & Enums**: Dùng `UPPER_SNAKE_CASE` (ví dụ: `BOX_STRUCTURE_TYPES`, `MAKER`, `PRO_ARTISAN`).

---

> 🎯 **Kết luận nghiệm thu**: Cấu trúc thư mục trên đây đã được thiết kế chuẩn mực hóa tối đa, phân tách rõ ràng trách nhiệm cho 3 thành viên IT, đảm bảo $100\%$ tính mở rộng khi dự án phát triển từ MVP Checkpoint 2 lên quy mô nền tảng thương mại triệu người dùng phong cách Pacdora.com!
