# 📋 ĐẶC TẢ YÊU CẦU HỆ THỐNG (REQUIREMENTS SPECIFICATION)

> **Dự án**: WrapFit Platform (EXE101 — FPT University)

---

## 1. Yêu Cầu Chức Năng (Functional Requirements)

### 1.1. Phân Hệ Thiết Kế Bao Bì (Frontend - IT 1 & IT 2)
- **FR-01 (Khai báo kích thước)**: Người dùng nhập $L, W, H$ theo đơn vị `mm` hoặc `cm`. Hệ thống tự động giới hạn phạm vi hợp lệ ($L \ge 40\text{mm}$, $W \ge 30\text{mm}$, $H \ge 20\text{mm}$).
- **FR-02 (4 Cấu trúc hộp MVP)**: Hỗ trợ sinh bản vẽ bế tự động cho:
  1. *Tuck Top Box* (Hộp nắp gài đáy khóa).
  2. *Sleeve & Drawer Box* (Hộp kéo bao diêm).
  3. *Lid & Base Box* (Hộp âm dương).
  4. *Pillow Box* (Hộp gối).
- **FR-03 (Canvas 2D phẳng)**: Hiển thị nét cắt dao màu đỏ `#E53E3E` (solid) và nếp cấn gấp màu xanh `#3182CE` (dashed `4,4`).
- **FR-04 (Mô phỏng gập 3D)**: Cho phép xoay $360^\circ$ và kéo thanh trượt từ $0\%$ (phẳng) đến $100\%$ (hộp đóng kín hoàn toàn).
- **FR-05 (FitCheck™ Validation)**:
  - Cảnh báo nếu logo/chữ cách nếp cấn $< 3\text{mm}$.
  - Cảnh báo nếu ảnh tải lên có độ phân giải $< 200\text{ DPI}$.
  - Chấm điểm sẵn sàng in ấn trên thang điểm $100$.

### 1.2. Phân Hệ Xuất File & Backend (Backend - IT 3 & IT 2)
- **FR-06 (Xuất file vector đa lớp)**: Xuất ra định dạng SVG/PDF tách biệt Layer Nét Cắt, Nét Cấn, và Đồ họa.
- **FR-07 (Lưu trữ dự án)**: Cho phép lưu trạng thái thiết kế và tải lại theo mã ID.
- **FR-08 (Gợi ý hoa văn AI)**: Gợi ý bảng màu và hoa văn SVG theo từ khóa phong cách người dùng nhập.

---

## 2. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

- **NFR-01 (Hiệu năng 3D)**: Đảm bảo mô phỏng 3D hoạt động mượt mà ở mức tối thiểu 45–60 FPS trên trình duyệt máy tính.
- **NFR-02 (Thời gian phản hồi)**: Tính toán tham số hình học dieline hoàn tất dưới $50\text{ms}$ khi người dùng kéo thanh trượt kích thước.
- **NFR-03 (Bảo mật)**: Phân quyền truy cập tài khoản, mã hóa dữ liệu nhạy cảm.
