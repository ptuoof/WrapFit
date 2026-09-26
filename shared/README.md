# 📐 @wrapfit/shared — Core Packaging Math & Types

> **Phụ trách chính**: 👤 **IT 2** (Core Engineering & Print Physics)  
> **Nhiệm vụ**: Thư viện chứa các định nghĩa kiểu dữ liệu chung (TypeScript Types), công thức toán học hình học phẳng (Parametric Dieline) và bộ luật kiểm duyệt in ấn (FitCheck™ Validation).

---

## Cấu trúc thư mục `shared/`:

```text
shared/
├── src/
│   ├── types/                  # Các giao diện hợp đồng chung
│   │   ├── dieline.ts          # Tọa độ mặt hộp, nét cấn, nét cắt
│   │   ├── project.ts          # Dự án bao bì, phần tử đồ họa
│   │   └── fitcheck.ts         # Cấu trúc báo cáo lỗi in ấn
│   ├── parametric/             # Động cơ toán học tính tọa độ hộp
│   │   ├── tuck-top.ts         # Hộp nắp gài đáy khóa
│   │   ├── sleeve-drawer.ts    # Hộp bao diêm (sắp tới)
│   │   ├── lid-base.ts         # Hộp âm dương (sắp tới)
│   │   └── pillow.ts           # Hộp gối (sắp tới)
│   ├── fitcheck/               # Động cơ kiểm duyệt in ấn
│   │   └── validator.ts        # Kiểm tra Bleed, Safe Margin, DPI
│   └── index.ts                # Entrypoint xuất ra cho fe và be
├── package.json
└── tsconfig.json
```
