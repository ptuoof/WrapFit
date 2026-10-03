# 📊 BẢNG KHẢO SÁT THỊ TRƯỜNG CHUẨN HỌC THUẬT (FINAL REVISED) — WRAPFIT PLATFORM
> **Học phần**: EXE101 — Khởi nghiệp đổi mới sáng tạo (FPT University)  
> **Giai đoạn**: Checkpoint 2 (Paper Report & Presentation)  
> **Hiệu đính**: Tuân thủ 100% nhận xét phương pháp luận của giảng viên Nguyễn Trần Lê Thanh  
> **Quy mô mẫu cam kết**: $N \ge 100$ phản hồi hợp lệ (Có email xác thực, đã qua bộ lọc làm sạch dữ liệu)

---

## I. TỔNG HỢP CÁC NỘI DUNG ĐÃ HIỆU CHỈNH THEO NHẬN XÉT CỦA GIẢNG VIÊN

| Tiêu chí | Bản ban đầu (Lỗi phương pháp) | Bản hiệu chỉnh hoàn chỉnh (Chuẩn học thuật) | Cơ sở học thuật & Mục đích |
| :--- | :--- | :--- | :--- |
| **1. Tuổi & Thu nhập** | Chia sẵn các khung trắc nghiệm (< 18, 18-22, < 5tr...) | **Người trả lời TỰ ĐIỀN con số thực tế** (Dạng Short Answer). | Dữ liệu dạng số liên tục (Continuous ratio data) giúp chạy kiểm định thống kê chuyên sâu (Mean, Median, Correlation) thay vì dữ liệu rời rạc. |
| **2. Phân luồng đối tượng** | Để chung 1 luồng câu hỏi cho cả người mua và người bán. | **Phân thành 2 luồng độc lập qua tính năng rẽ nhánh**: Nhánh B2B (Chủ shop) vs Nhánh B2C (Cá nhân). | Tránh hiện tượng nhiễu hành vi; chủ shop quan tâm đến MOQ, chi phí khuôn, khách sỉ; cá nhân quan tâm đến dịp lễ, độ tiện lợi. |
| **3. Rào cản / Nỗi đau** | Cho sẵn các checkbox để tích chọn. | **Để câu hỏi mở dạng Đoạn (Paragraph) cho TỰ ĐIỀN**. | Tránh "mớm cung" (Leading bias); phản ánh 100% tiếng nói thực tế của khách hàng (Unbiased Voice of Customer). |
| **4. Kiểm tra chú ý** | Chưa có câu hỏi lọc bot/đánh lụi. | **Thêm câu hỏi số học đơn giản**: `20 x 3 = ?` (Đáp án: 60). | Loại bỏ triệt để các phản hồi bấm bừa/bot tự động trong bước làm sạch dữ liệu (Data Cleaning). |
| **5. Kiểm tra tính nhất quán** | Chưa có cơ chế đối chứng độ trung thực. | **Hỏi lại cùng 1 bản chất câu hỏi 2 lần** (Lần 1 ở đầu form, Lần 2 ở gần cuối form). | Đo lường độ tin cậy (Test-retest reliability); loại bỏ các câu trả lời mâu thuẫn (trên chấm 5 sao, dưới chấm 1 sao). |

---

## II. SƠ ĐỒ LUỒNG PHÂN NHÁNH TRÊN GOOGLE FORMS

```
               [PHẦN 1: Thông tin chung & Nhân khẩu học tự điền]
                                      │
                        (Câu 5: Bạn là ai?)
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   [PHẦN 2: Dành riêng cho B2B]              [PHẦN 3: Dành riêng cho B2C]
   - Quy mô, sản phẩm của shop               - Thói quen tặng quà cá nhân
   - Rào cản B2B (TỰ ĐIỀN)                   - Rào cản B2C (TỰ ĐIỀN)
   - Kiểm tra nhất quán (LẦN 1)              - Kiểm tra nhất quán (LẦN 1)
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
             [PHẦN 4: Giải pháp WrapFit & 2 Bẫy chất lượng]
             - BẪY CHÚ Ý: Phép tính 20 x 3 = ?
             - Đánh giá 5 tính năng cốt lõi (Likert)
             - BẪY NHẤT QUÁN (LẦN 2): Lặp lại câu hỏi kiểm tra
                                      │
                                      ▼
             [PHẦN 5: Sẵn sàng chi trả (WTP tự điền) & Phỏng vấn]
             - Mức giá WTP theo lượt / theo tháng (TỰ ĐIỀN)
             - Đăng ký phỏng vấn sâu 1-1 lấy điểm cộng Rubric
```

---

## III. NỘI DUNG CHI TIẾT BẢNG KHẢO SÁT HOÀN CHỈNH (TỪNG SECTION)

### 🟢 PHẦN 1: THÔNG TIN CHUNG & PHÂN LUỒNG ĐỐI TƯỢNG (SECTION 1)
* **Tiêu đề Form**: `KHẢO SÁT NHU CẦU ĐÓNG GÓI & CÁ NHÂN HÓA HỘP QUÀ TẶNG — WRAPFIT`
* **Mô tả Form**:
  ```text
  Chào bạn! Chúng mình là nhóm nghiên cứu dự án WrapFit — Nền tảng Đóng gói Quà tặng Thông minh & Cá nhân hóa (Môn Khởi nghiệp EXE101 - ĐH FPT).
  Bảng khảo sát này nhằm lắng nghe những khó khăn thực tế của bạn khi chuẩn bị hộp quà để nhóm hoàn thiện giải pháp đóng gói vừa vặn, thẩm mỹ và tiết kiệm chi phí.
  ⏳ Thời gian: 3 - 5 phút.
  🔒 Cam kết bảo mật: Mọi thông tin chỉ phục vụ nghiên cứu môn học EXE101 và sẽ được tiêu hủy sau khi kết thúc môn.
  🎁 Quà tri ân: Bạn sẽ nhận được 03 tháng sử dụng miễn phí phiên bản WrapFit Pro ngay khi ra mắt!
  ```

* **Câu 1 (Bắt buộc). Địa chỉ Email của bạn:**  
  *Loại*: **Trả lời ngắn (Short answer)**

* **Câu 2 (Bắt buộc — TỰ ĐIỀN TUỔI). Bạn bao nhiêu tuổi?**  
  *Loại*: **Trả lời ngắn (Short answer)**  
  *Mô tả*: `Vui lòng nhập số tuổi của bạn (Ví dụ: 21, 28,...)`

* **Câu 3 (Bắt buộc). Giới tính của bạn:**  
  *Loại*: **Trắc nghiệm (Multiple choice)**  
  - [ ] Nữ  
  - [ ] Nam  
  - [ ] Khác / Không muốn tiết lộ  

* **Câu 4 (Bắt buộc — TỰ ĐIỀN THU NHẬP/DOANH THU). Mức thu nhập hàng tháng của bạn (hoặc Doanh thu trung bình/tháng nếu bạn kinh doanh):**  
  *Loại*: **Trả lời ngắn (Short answer)**  
  *Mô tả*: `Nhập số tiền ước tính theo tháng (Ví dụ: 8 triệu, 15 triệu, 30 triệu/tháng...)`

* **Câu 5 (BẮT BUỘC — CÂU HỎI RẼ NHÁNH). Bạn tham gia khảo sát với tư cách nào chủ yếu?**  
  *Loại*: **Trắc nghiệm (Multiple choice)**  
  - [ ] **A. Chủ cửa hàng / Người kinh doanh nhỏ** (Shop quà tặng, handmade, nến thơm, mỹ phẩm, phụ kiện...)  
        $\rightarrow$ *(Cài đặt: Chuyển đến Phần 2)*  
  - [ ] **B. Khách hàng cá nhân** (Người mua quà và tự chuẩn bị hộp quà tặng bạn bè, người thân vào các dịp)  
        $\rightarrow$ *(Cài đặt: Chuyển đến Phần 3)*  

---

### 🔵 PHẦN 2: DÀNH CHO CHỦ SHOP / KINH DOANH (SECTION 2 - B2B)
*(Chỉ người chọn phương án A ở Câu 5 mới vào phần này)*

* **Tiêu đề Phần 2**: `PHẦN 2: KHẢO SÁT THỰC TRẠNG ĐÓNG GÓI CỦA CỬA HÀNG`
* **Mô tả**: `Dành riêng cho chủ shop quà tặng, đồ handmade, phụ kiện và thủ công.`

* **Câu 6_B2B. Shop của bạn đang kinh doanh mặt hàng chính nào?**  
  *Loại*: **Trả lời ngắn (Short answer)** *(Ví dụ: Nến thơm, trang sức bạc, đồ da thủ công...)*

* **Câu 7_B2B. Trung bình mỗi tháng shop cần đóng gói bao nhiêu hộp quà/sản phẩm?**  
  *Loại*: **Trả lời ngắn (Short answer)** *(Ví dụ: 50 hộp, 200 hộp...)*

* **Câu 8_B2B (RÀO CẢN TỰ ĐIỀN — KHÔNG MỚM CUNG). Khi đặt làm hoặc chuẩn bị bao bì/hộp đựng cho sản phẩm, những khó khăn và trở ngại lớn nhất mà shop gặp phải là gì?**  
  *Loại*: **Đoạn (Paragraph)**  
  *Mô tả*: `Vui lòng chia sẻ cụ thể trải nghiệm thực tế (về số lượng tối thiểu MOQ, chi phí làm khuôn, thời gian, sự vừa vặn, lỗi in ấn...)`

* **Câu 9_B2B. Chi phí trung bình hiện tại shop đang chi trả cho 01 chiếc hộp bao bì là bao nhiêu?**  
  *Loại*: **Trả lời ngắn (Short answer)** *(Ví dụ: 15.000đ/hộp, 40.000đ/hộp...)*

* **Câu 10_B2B (CÂU KIỂM TRA NHẤT QUÁN — LẦN 1). Đánh giá mức độ đồng ý của bạn với nhận định sau:**  
  > *"Một chiếc hộp quà vừa vặn chính xác với món quà sẽ làm tăng đáng kể giá trị cảm xúc của người nhận."*  
  *Loại*: **Thang đo tuyến tính (Linear scale 1 đến 5)**  
  - `1`: Hoàn toàn không đồng ý  
  - `5`: Rất đồng ý  

*(Cài đặt dưới chân Phần 2: "Sau phần 2" $\rightarrow$ Chọn **Chuyển đến Phần 4**)*

---

### 🟣 PHẦN 3: DÀNH CHO KHÁCH HÀNG CÁ NHÂN (SECTION 3 - B2C)
*(Chỉ người chọn phương án B ở Câu 5 mới vào phần này)*

* **Tiêu đề Phần 3**: `PHẦN 3: KHẢO SÁT TRẢI NGHIỆM CHUẨN BỊ QUÀ CÁ NHÂN`
* **Mô tả**: `Dành cho cá nhân có nhu cầu tự chuẩn bị hộp quà tặng bạn bè, người thân.`

* **Câu 6_B2C. Trong 1 năm vừa qua, bạn tự tay chuẩn bị hộp quà khoảng bao nhiêu lần?**  
  *Loại*: **Trả lời ngắn (Short answer)** *(Ví dụ: 3 lần, 6 lần...)*

* **Câu 7_B2C (RÀO CẢN TỰ ĐIỀN — KHÔNG MỚM CUNG). Khi cần tìm hoặc chuẩn bị một chiếc hộp để đựng quà, điều gì khiến bạn cảm thấy khó khăn, bất tiện hoặc không hài lòng nhất?**  
  *Loại*: **Đoạn (Paragraph)**  
  *Mô tả*: `Chia sẻ chân thực về sự vừa vặn của hộp, mẫu mã, thời gian tìm kiếm hoặc chi phí...`

* **Câu 8_B2C. Món quà khó tìm được chiếc hộp vừa vặn nhất mà bạn từng gặp phải là gì?**  
  *Loại*: **Trả lời ngắn (Short answer)** *(Ví dụ: Cốc gốm có quai, gấu bông, lọ nước hoa dáng lạ...)*

* **Câu 9_B2C (CÂU KIỂM TRA NHẤT QUÁN — LẦN 1). Đánh giá mức độ đồng ý của bạn với nhận định sau:**  
  > *"Một chiếc hộp quà vừa vặn chính xác với món quà sẽ làm tăng đáng kể giá trị cảm xúc của người nhận."*  
  *Loại*: **Thang đo tuyến tính (Linear scale 1 đến 5)**  
  - `1`: Hoàn toàn không đồng ý  
  - `5`: Rất đồng ý  

*(Cài đặt dưới chân Phần 3: Mặc định chuyển tiếp đến **Phần 4**)*

---

### 🟠 PHẦN 4: ĐÁNH GIÁ Ý TƯỞNG & 2 BẪY CHẤT LƯỢNG (SECTION 4 - CHUNG)
*(Cả 2 nhánh B2B và B2C đều hội tụ về đây)*

* **Tiêu đề Phần 4**: `PHẦN 4: GIẢI PHÁP WRAPFIT & ĐÁNH GIÁ TÍNH NĂNG`
* **Mô tả**:  
  ```text
  WrapFit là nền tảng đóng gói quà thông minh:
  1. Nhập kích thước quà (L x W x H) -> Tự động tính toán dung sai và đề xuất kiểu hộp vừa khít.
  2. Tùy biến trực quan: AI gợi ý hoa văn độc quyền, chèn logo, ảnh, lời chúc.
  3. Mô phỏng 3D: Xoay 360 độ và kéo thanh trượt xem hộp mở/gập nắp thực tế.
  4. FitCheck™ kiểm lỗi in ấn & Xuất file vector (PDF/SVG) chuẩn nét cắt dao và nếp cấn để mang ra tiệm in làm được ngay.
  ```

* **Câu 11 (BẮT BUỘC — BẪY KIỂM TRA CHÚ Ý / CHỐNG ĐÁNH LỤI):**  
  **Câu hỏi xác nhận: Để đảm bảo bạn đang đọc kỹ các câu hỏi khảo sát, kết quả của phép tính 20 x 3 bằng bao nhiêu?**  
  *Loại*: **Trắc nghiệm (Multiple choice)**  
  - [ ] 40  
  - [ ] 50  
  - [ ] **60** *(Đáp án chính xác — ai chọn khác sẽ bị loại khi lọc dữ liệu)*  
  - [ ] 70  

* **Câu 12. Bạn đánh giá mức độ hữu ích của các tính năng sau của WrapFit như thế nào?**  
  *Loại*: **Lưới trắc nghiệm (Multiple-choice grid)**  
  *Cột (Columns)*: `1. Không hữu ích` | `2. Ít hữu ích` | `3. Bình thường` | `4. Hữu ích` | `5. Cực kỳ hữu ích`  
  *Hàng (Rows)*:  
  - Hàng 1: `Tự động tính toán bản vẽ bế vừa khít món quà từ thông số L, W, H`  
  - Hàng 2: `Mô phỏng 3D thời gian thực xem nếp gập hộp trước khi in`  
  - Hàng 3: `FitCheck™ cảnh báo lỗi nếp cấn, lề an toàn và ảnh mờ trước khi mang in`  
  - Hàng 4: `AI Pattern tự sinh hoa văn nền theo chủ đề dịp tặng`  
  - Hàng 5: `Xuất file vector đa lớp (PDF/SVG) chuẩn kỹ thuật xưởng in`  

* **Câu 13 (BẮT BUỘC — BẪY KIỂM TRA TÍNH NHẤT QUÁN — LẦN 2):**  
  **Đánh giá mức độ đồng ý của bạn với nhận định sau:**  
  > *"Một chiếc hộp quà vừa vặn chính xác với món quà sẽ làm tăng đáng kể giá trị cảm xúc của người nhận."*  
  *Loại*: **Thang đo tuyến tính (Linear scale 1 đến 5)**  
  - `1`: Hoàn toàn không đồng ý  
  - `5`: Rất đồng ý  
  *(🔍 Đối chiếu: So sánh điểm câu này với Câu 10_B2B hoặc Câu 9_B2C. Nếu chênh lệch $\ge 3$ điểm $\rightarrow$ Loại vì trả lời không trung thực).*

---

### 🟡 PHẦN 5: ĐO LƯỜNG SẴN SÀNG CHI TRẢ (WTP) & PHỎNG VẤN (SECTION 5 - CHUNG)

* **Tiêu đề Phần 5**: `PHẦN 5: MỨC GIÁ SẴN SÀNG CHI TRẢ & ĐỒNG HÀNH`

* **Câu 14 (TỰ ĐIỀN WTP THEO LƯỢT). Nếu sử dụng WrapFit để thiết kế và xuất 01 file in hoàn chỉnh (chuẩn nét cắt, nếp cấn, hoa văn 300 DPI sẵn sàng in ngay), bạn sẵn sàng chi trả tối đa bao nhiêu tiền cho lượt xuất file này?**  
  *Loại*: **Trả lời ngắn (Short answer)**  
  *Mô tả*: `Nhập số tiền VNĐ bạn thấy hợp lý (Ví dụ: 20.000đ, 35.000đ, 50.000đ...)`

* **Câu 15 (TỰ ĐIỀN WTP THEO THÁNG CHO SHOP). Nếu bạn là chủ shop, mức phí thuê bao hàng tháng (dùng không giới hạn thiết kế và xuất file) bao nhiêu là hợp lý với bạn?**  
  *Loại*: **Trả lời ngắn (Short answer)**  
  *Mô tả*: `Nhập số tiền VNĐ/tháng (Hoặc ghi "Không có nhu cầu" nếu bạn là khách cá nhân)`

* **Câu 16 (Điểm cộng Phỏng vấn sâu). Bạn có sẵn lòng tham gia một buổi phỏng vấn ngắn trực tuyến (10-15 phút) để nhóm khảo sát sâu hơn và nhận thêm quà tri ân đặc biệt không?**  
  *Loại*: **Trắc nghiệm (Multiple choice)**  
  - [ ] Sẵn sàng! Hãy liên hệ qua Email ở Câu 1  
  - [ ] Sẵn sàng! Số điện thoại/Zalo của tôi là: [ .................... ]  
  - [ ] Hiện tại tôi chưa tiện tham gia  
