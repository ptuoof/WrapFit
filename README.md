# 🎁 WrapFit Platform — Make Every Present, Present.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![3D Engine: Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-blue?logo=three.js)](https://threejs.org/)
[![Animation: GSAP](https://img.shields.io/badge/Motion-GSAP%203-88CE02?logo=greensock)](https://greensock.com/)
[![Project: EXE101](https://img.shields.io/badge/Academic-EXE101%20FPT%20University-orange)](https://fpt.edu.vn/)

> **WrapFit** là nền tảng đóng gói quà tặng thông minh & cá nhân hóa (*Packaging Personalization & Intelligence Platform*). Chúng tôi giải quyết bài toán bao bì sản xuất số lượng ít (micro-batch) bằng cách biến quy trình thiết kế thành luồng làm việc tham số hóa chuẩn xác, hỗ trợ mô phỏng gập 3D tương tác và xuất file vector sẵn sàng in ấn/cắt bế thực tế.

---

## 📌 Bối cảnh & Nỗi đau thị trường (The Problem)

- **MOQ & Chi phí khuôn bế quá cao**: Các shop quà tặng handmade và cá nhân muốn đặt hộp riêng thường bị xưởng in từ chối do số lượng tối thiểu (thường từ 500 - 1.000 hộp) hoặc chi phí làm khuôn dao bế riêng dao động từ 1.000.000đ - 3.000.000đ/kích thước.
- **Công cụ thiết kế 2D "mù" về vật lý bao bì**: Các phần mềm như Canva hay Photoshop không hiểu đường cấn gấp (crease line), mép dán (glue flap) hay độ co giãn của vật liệu (GSM/caliper), dẫn đến việc file thiết kế đẹp trên màn hình nhưng khi in và bế ra thực tế bị rách, lệch khớp hoặc đứt chữ.

---

## ✨ Tính Năng Đột Phá (Core Moat)

### 1. 📐 Parametric Dieline Engine (Động cơ Tham số hóa Bản vẽ Bế)
- Thay vì sử dụng template cố định, hệ thống tự động tính toán tọa độ vector của toàn bộ các mặt hộp, tai nắp, mép dán theo hàm số toán học dựa trên kích thước thật:
  $$\text{Tọa độ nếp gấp} = f(\text{Dài } L, \text{Rộng } W, \text{Cao } H, \text{Độ dày giấy } t)$$

### 2. 🧊 3D Fold Simulation (Mô phỏng Gập hộp 3D bằng Three.js & GSAP)
- Chuyển đổi mượt mà giữa mặt phẳng 2D và không gian 3D.
- Diễn hoạt chuỗi hoạt ảnh gập nắp hộp tuần tự với độ đàn hồi vật lý chân thực.
- Xem trước trực quan góc nhìn $360^\circ$ khi đặt món quà vào bên trong.

### 3. 🛡️ FitCheck™ Engine (Kiểm duyệt Rủi ro In ấn & Gập)
- **Safe Margin Check**: Cảnh báo tức thì nếu logo/văn bản nằm cách đường cấn gấp $< 3\text{mm}$.
- **Bleed Validation**: Đảm bảo vùng tràn lề màu nền tối thiểu $2\text{mm}$ chống lộ viền trắng khi xén.
- **DPI Resolution Check**: Cảnh báo ảnh đầu vào có độ phân giải $< 200\text{ DPI}$.

### 4. 🖨️ Production-Ready Vector Export
- Xuất file chuẩn in ấn vector đa lớp (PDF, SVG, DXF) phân tách rõ ràng:
  - 🔴 **Nét cắt (Cut line)**
  - 🔵 **Nét cấn gấp (Crease / Score line)**
  - 🟢 **Vùng tràn lề (Bleed line)**
  - 🎨 **Lớp đồ họa CMYK 300 DPI**

---

## 🛠️ Công Nghệ Phát Triển (Tech Stack)

| Lớp kiến trúc | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS | Giao diện Web Editor & Landing Page |
| **2D Canvas** | Paper.js / Fabric.js / SVG.js | Trình biên tập kéo thả đồ họa vector 2D |
| **3D Rendering** | Three.js / React Three Fiber | Render khối hộp và texture thời gian thực |
| **Motion & UX** | GSAP (Timeline, ScrollTrigger, Flip) | Diễn hoạt gập nắp hộp & Landing Page |
| **Backend & Data**| Node.js / FastAPI, PostgreSQL, Supabase/S3 | Quản lý dự án, tài khoản & Cloud Storage |
| **AI Integration** | Model Context Protocol (MCP), LLM APIs | Gợi ý Theme hoa văn & Hỗ trợ FitCheck |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản `>= 20.x`
- **npm** hoặc **pnpm / yarn**

```bash
# 1. Clone repository
git clone https://github.com/ptuoof/WrapFit.git
cd WrapFit

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env.local

# 4. Khởi chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.

---

## 👥 Đội Ngũ Phát Triển (Project Team — EXE101 FA26)

- **Quy mô đội ngũ**: 6 thành viên (3 IT, 2 Kinh Tế, 1 Marketing)
- **Môn học**: EXE101 - Khởi nghiệp đổi mới sáng tạo (FPT University)
- **Slogan**: *"Make Every Present, Present."*
