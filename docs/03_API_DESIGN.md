# 🌐 THIẾT KẾ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API DESIGN)

> **Base URL (Local)**: `http://localhost:5000/api`

---

## Danh Sách Endpoints

### 1. `GET /api/health`
- **Mô tả**: Kiểm tra trạng thái hoạt động của Backend và kết nối CSDL PostgreSQL.
- **Phản hồi mẫu**:
```json
{
  "status": "ok",
  "database": "connected",
  "service": "WrapFit Backend",
  "timestamp": "2026-09-27T00:00:00.000Z"
}
```

---

### 2. `GET /api/templates`
- **Mô tả**: Lấy danh sách 4 loại cấu trúc hộp quà tặng MVP.
- **Phản hồi mẫu**:
```json
[
  {
    "id": "tuck-top",
    "name": "Hộp nắp gài đáy khóa (Tuck Top Box)",
    "description": "Hộp quà bán lẻ tiêu chuẩn",
    "isActive": true
  }
]
```

---

### 3. `POST /api/projects`
- **Mô tả**: Lưu dự án thiết kế bao bì mới vào CSDL.
- **Body**:
```json
{
  "title": "Hộp Nến Thơm Mùa Đông",
  "templateId": "tuck-top",
  "dimensions": { "length": 120, "width": 80, "height": 60, "paperThickness": 0.38 },
  "materialSpec": { "type": "kraft", "gsm": 300, "caliper": 0.42 }
}
```

---

### 4. `POST /api/ai/pattern`
- **Mô tả**: Gợi ý bảng màu và hoa văn vector lặp theo chủ đề người dùng nhập.
- **Body**: `{ "theme": "Giáng sinh" }`
- **Phản hồi**:
```json
{
  "themeName": "Lễ Hội Giáng Sinh (Festive Pine)",
  "palette": ["#1A362B", "#C1121F", "#FDFBF7", "#D4AF37"],
  "patternSvgTile": "<svg ...></svg>",
  "description": "Họa tiết cây thông noel tối giản trên nền giấy trắng ngà"
}
```

---

### 5. `POST /api/export`
- **Mô tả**: Tạo bản vẽ vector bế (SVG / PDF) theo kích thước thực tế.
- **Body**: `{ "structureType": "tuck-top", "dimensions": { "length": 120, "width": 80, "height": 60, "paperThickness": 0.38 } }`
- **Phản hồi**:
```json
{
  "status": "completed",
  "downloadUrl": "/uploads/dieline_tuck-top_1790443000.svg",
  "dielineSpecs": {
    "boundingBox": { "width": 415, "height": 229 }
  }
}
```
