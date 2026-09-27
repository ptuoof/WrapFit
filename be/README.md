# 🗄️ @wrapfit/backend — Backend APIs, Database & Storage

> **Phụ trách chính**: 👤 **IT 3** (Backend, Data Infrastructure & Cloud BaaS Lead)  
> **Tech Stack**: Express.js / TypeScript, PostgreSQL (Prisma ORM), S3 Storage, Auth.

---

## ❓ `prisma/schema.prisma` Dùng Để Làm Gì?

`schema.prisma` chính là **"Bản thiết kế cấu trúc dữ liệu" (Data Blueprint)** của toàn bộ nền tảng WrapFit:

1. **Định nghĩa các bảng trong PostgreSQL**:
   - `User`: Lưu thông tin tài khoản và gói đăng ký (Free, Pro, Business).
   - `BoxTemplate`: Lưu các mẫu cấu trúc hộp (Tuck top, Sleeve, Lid & Base) và công thức toán học.
   - `PackagingProject`: Lưu dự án thiết kế của khách hàng (kích thước $L, W, H$, chất liệu giấy, tọa độ logo/chữ trên canvas).
   - `ExportJob`: Lưu lịch sử xuất file vector (PDF/SVG/DXF) và link tải S3.

2. **Cách code Backend sử dụng Prisma**:
   Code TypeScript **không import trực tiếp** file `.prisma`, mà Prisma CLI sẽ đọc file `schema.prisma` để tự động sinh ra thư viện TypeScript `@prisma/client`.
   - File kết nối tập trung: `src/lib/prisma.ts`
   - Gọi trực tiếp trong API (`src/index.ts`):
     ```typescript
     import { prisma } from "./lib/prisma";

     // Lấy danh sách dự án
     const projects = await prisma.packagingProject.findMany();

     // Lưu dự án mới vào CSDL
     const newProject = await prisma.packagingProject.create({ data: { ... } });
     ```

---

## Cấu trúc thư mục `be/`:

```text
be/
├── prisma/
│   ├── schema.prisma           # CSDL PostgreSQL (Users, Projects, Templates, Jobs)
│   └── seed.ts                 # Script nạp dữ liệu mẫu (BoxTemplates & DemoUser)
├── src/
│   ├── lib/
│   │   └── prisma.ts           # Khởi tạo PrismaClient kết nối PostgreSQL
│   ├── schemas/
│   │   └── project.schema.ts   # Zod validation schema cho Projects & Canvas elements
│   ├── controllers/            # HTTP Request Handlers (Project, Asset, Template, AI, Export)
│   ├── routes/                 # Express Routers modular theo domain
│   ├── services/               # StorageService, ProjectService, ExportService (PDFKit), AI
│   ├── middlewares/            # Multer upload & Global error handler
│   ├── test-endpoints.ts       # Smoke test tự động kiểm tra toàn bộ API
│   └── index.ts                # Server API chính
├── uploads/                    # Thư mục lưu trữ assets & exports cục bộ
├── .env.example                # Mẫu cấu hình DATABASE_URL
├── package.json
└── tsconfig.json
```

---

## 🚀 Danh Sách API Endpoints (Dành Cho IT 1 & IT 2 Tích Hợp)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra tình trạng server và kết nối CSDL PostgreSQL |
| `GET` | `/api/templates` | Lấy danh sách các mẫu cấu trúc hộp active |
| `GET` | `/api/templates/:id` | Lấy chi tiết mẫu cấu trúc hộp (`tuck-top`, `sleeve-drawer`,...) |
| `POST` | `/api/projects` | Tạo dự án bao bì mới (kèm validation Zod & FitCheck ban đầu) |
| `GET` | `/api/projects` | Lấy danh sách dự án (hỗ trợ query `?userId=...&page=...&limit=...`) |
| `GET` | `/api/projects/:id` | Xem chi tiết dự án (kèm thông tin template và lịch sử export) |
| `PUT` | `/api/projects/:id` | Cập nhật dự án (kích thước, canvas elements, tự động audit FitCheck) |
| `DELETE` | `/api/projects/:id` | Xóa dự án bao bì |
| `POST` | `/api/projects/:id/audit` | Chạy kiểm toán FitCheck™ thủ công và cập nhật điểm số |
| `POST` | `/api/assets/upload` | Upload logo/ảnh (hỗ trợ multipart `file` hoặc base64 `{ base64, fileName }`) |
| `DELETE` | `/api/assets` | Xóa file asset (`{ url }`) |
| `POST` | `/api/ai/pattern` | Gợi ý bảng màu và pattern SVG lặp vô tận theo chủ đề (`{ theme }`) |
| `POST` | `/api/export` | Xuất file vector bế SVG hoặc PDF CMYK (PDFKit chuẩn 300 DPI) |

---

## Các Lệnh Thao Tác Với Cơ Sở Dữ Liệu (Dành Cho IT 3):

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env từ file mẫu và điền link PostgreSQL
cp .env.example .env

# 3. Đồng bộ cấu trúc bảng từ schema.prisma lên PostgreSQL (không cần viết SQL thủ công)
npx prisma db push

# 4. Mở giao diện trực quan quản lý dữ liệu trên trình duyệt (Prisma Studio)
npx prisma studio

# 5. Khởi chạy Backend server
npm run dev
```
