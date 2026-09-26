# 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN) — PostgreSQL & Prisma

> **Phụ trách**: 👤 **IT 3** (Backend & Data Infrastructure)

---

## 1. Sơ Đồ Thực Thể Quan Hệ (ERD Diagram)

```mermaid
erDiagram
    User ||--o{ PackagingProject : "sở hữu"
    BoxTemplate ||--o{ PackagingProject : "làm mẫu cho"
    PackagingProject ||--o{ ExportJob : "sinh ra"

    User {
        uuid id PK
        string email UK
        string shop_name
        string subscription_tier "free | pro | business"
        datetime created_at
    }

    BoxTemplate {
        string id PK "tuck-top | sleeve-drawer | lid-base | pillow"
        string name
        string description
        jsonb formula_schema
        boolean is_active
    }

    PackagingProject {
        uuid id PK
        uuid user_id FK
        string template_id FK
        string title
        jsonb dimensions "{ length, width, height, paperThickness }"
        jsonb material_spec "{ type, gsm, caliper }"
        jsonb canvas_state "{ elements: [...] }"
        jsonb fitcheck_state "{ isValid, score, violations }"
        string thumbnail_url
        datetime created_at
        datetime updated_at
    }

    ExportJob {
        uuid id PK
        uuid project_id FK
        string file_type "pdf | svg | dxf"
        string storage_url
        string status "completed | failed"
        datetime created_at
    }
```

---

## 2. Chi Tiết Các Bảng Dữ Liệu

1. **Bảng `users`**: Quản lý hồ sơ người dùng cá nhân hoặc chủ shop handmade.
2. **Bảng `box_templates`**: Định nghĩa 4 mẫu cấu trúc bao bì MVP cùng công thức toán học tham số.
3. **Bảng `packaging_projects`**: Lưu toàn bộ thông số hộp, kích thước, và các phần tử thiết kế (chữ, logo, hoa văn) trên từng mặt hộp.
4. **Bảng `export_jobs`**: Lưu vết các lần xuất file in chuẩn vector và đường link tải về từ S3.
