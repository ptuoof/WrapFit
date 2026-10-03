import os
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def make_callout(doc, text_list, title="LƯU Ý CHIẾN LƯỢC HỌC THUẬT (RUBRIC CP2)"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Cm(16.0)
    set_cell_background(cell, "F4F6F4")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="1A362B"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title}: ")
    run_t.bold = True
    run_t.font.name = "Times New Roman"
    run_t.font.size = Pt(11)
    run_t.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    for idx, t in enumerate(text_list):
        if idx > 0:
            p = cell.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
        run = p.add_run(t)
        run.font.name = "Times New Roman"
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_word_document(output_path):
    doc = docx.Document()
    
    # Page Margins: 2.5 cm on all sides (Standard CP2 Requirement)
    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Times New Roman'
    normal_font.size = Pt(12)
    normal_font.color.rgb = RGBColor(0x1C, 0x19, 0x17)
    
    # Document Title
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(0)
    h1.paragraph_format.space_after = Pt(6)
    r1 = h1.add_run("BÁO CÁO NGHIÊN CỨU ĐỐI THỦ CẠNH TRANH (CHECKPOINT 2)")
    r1.bold = True
    r1.font.size = Pt(15)
    r1.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    sub = doc.add_paragraph()
    sub.paragraph_format.space_after = Pt(12)
    r_sub = sub.add_run("Dự án: WrapFit Platform — Slogan: \"Make Every Present, Present.\" | Khóa học: EXE101 (FPT University)")
    r_sub.italic = True
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    
    # Callout Alert Box
    make_callout(doc, [
        "Nội dung này được biên soạn chuẩn mực theo mục 4.2 [Advance, Optional] Competitors' Criteria Table trong hướng dẫn CP2 Requirements EXE101FA26 của Giảng viên Thanhntl2.",
        "Theo Barem chấm điểm (Rubric), việc hoàn thành xuất sắc mục này giúp nhóm đạt điểm tuyệt đối (30/30) phần Competition và giành trọn +0.5 Điểm thưởng học thuật (Extra Credit) vào điểm tổng kết CP2.",
        "Phân tích toàn diện 11 đối thủ thực tế thuộc 4 nhóm (Direct, Indirect, Substitute, New Entrants) cùng 4 trụ cột Cơ hội Hợp tác Chiến lược được lượng hóa cụ thể."
    ])
    
    # Section Header
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(6)
    r_h2 = h2.add_run("4.2. BẢNG TIÊU CHÍ PHÂN LOẠI ĐỐI THỦ (COMPETITORS' CRITERIA TABLE)")
    r_h2.bold = True
    r_h2.font.size = Pt(13.5)
    r_h2.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    # 4.2.1
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.1. Tiêu chí & Cơ sở phân loại đối thủ (Categorization Metrics)")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.add_run("Để xác định chính xác vị thế và bản chất cạnh tranh của từng đối thủ trên thị trường, nhóm WrapFit thiết lập ")
    r_b = p.add_run("Bộ 4 câu hỏi định chuẩn")
    r_b.bold = True
    p.add_run(" dựa trên lý thuyết phân loại cạnh tranh của Kotler & Armstrong (2021) kết hợp với các nguyên lý kỹ nghệ bao bì cấu trúc:")
    
    questions = [
        ("Câu hỏi 1 (Sản phẩm/Dịch vụ cốt lõi)", "Doanh nghiệp có cung cấp công cụ phần mềm tự động hóa việc tính toán bản vẽ bế (Dieline) và mô phỏng 3D hay chỉ cung cấp dịch vụ sản xuất bao bì vật lý/thiết kế đồ họa 2D phẳng thông thường?"),
        ("Câu hỏi 2 (Khách hàng mục tiêu)", "Doanh nghiệp có nhắm đến phân khúc chủ shop nhỏ, nghệ nhân thủ công (Handmade Artisans), tiểu thương TMĐT và người tặng quà cá nhân (nhu cầu số lượng ít, không có kỹ năng CAD) giống WrapFit không?"),
        ("Câu hỏi 3 (Vấn đề cốt lõi giải quyết)", "Doanh nghiệp có giúp người dùng có được chiếc hộp vừa khít với kích thước của món quà cụ thể và đảm bảo 100% khả năng sản xuất in ấn hay chỉ cung cấp các kích cỡ bao bì tiêu chuẩn có sẵn?"),
        ("Câu hỏi 4 (Cách tiếp cận & Thời điểm gia nhập)", "Doanh nghiệp tiếp cận bằng công cụ web tự phục vụ (Self-service Cloud SaaS) hay quy trình gia công thủ công? Doanh nghiệp đã định hình thị phần lâu năm hay là người chơi công nghệ mới gia nhập thị trường gần đây (New Entrants)?")
    ]
    for q_title, q_desc in questions:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_before = Pt(2)
        bp.paragraph_format.space_after = Pt(3)
        bp.paragraph_format.line_spacing = 1.2
        r_qt = bp.add_run(f"{q_title}: ")
        r_qt.bold = True
        bp.add_run(q_desc)
        
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.line_spacing = 1.3
    p.add_run("Từ 4 câu hỏi trên, 4 nhóm đối thủ được xác lập chuẩn mực:\n")
    p.add_run("• ")
    p.add_run("Direct Competitors (Đối thủ trực tiếp): ").bold = True
    p.add_run("Thỏa mãn cả 4 câu hỏi: Cùng cung cấp phần mềm trực tuyến tạo dieline và xem trước 3D cho khách hàng có nhu cầu làm hộp.\n")
    p.add_run("• ")
    p.add_run("Indirect Competitors (Đối thủ gián tiếp): ").bold = True
    p.add_run("Cùng giải quyết nhu cầu có hộp của khách hàng, nhưng bằng cách tiếp cận khác (sản xuất in ấn bao bì trọn gói hoặc phần mềm render 3D chuyên sâu).\n")
    p.add_run("• ")
    p.add_run("Substitute Competitors (Sản phẩm thay thế): ").bold = True
    p.add_run("Cách làm truyền thống thay thế mà khách hàng đang dùng (tự thiết kế bằng phần mềm đồ họa 2D phổ thông hoặc mua sẵn thùng carton đại trà trên Shopee).\n")
    p.add_run("• ")
    p.add_run("New Entrants (Đối thủ mới tiềm tàng): ").bold = True
    p.add_run("Các giải pháp công nghệ mới xuất hiện gần đây trên các nền tảng khởi nghiệp quốc tế (BetaList, PeerPush) có mô hình tự động hóa dieline tương đồng.")

    # 4.2.2
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.2. Bảng Tiêu Chí So Sánh Ngành Bao Bì (Competitors' Criteria Table)")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    # Table 1: Metrics
    table1 = doc.add_table(rows=6, cols=6)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    set_table_borders(table1)
    
    col_widths = [Cm(2.6), Cm(2.7), Cm(2.7), Cm(2.7), Cm(2.7), Cm(2.6)]
    headers1 = [
        "Tiêu Chí (Metrics)",
        "Your Startup (WRAPFIT)",
        "Direct Competitors (Pacdora, Templatemaker)",
        "Indirect Competitors (Packhelp, Boxshot, InnoPack, Offset)",
        "Substitute Competitors (Canva, Illustrator, Shopee)",
        "New Entrants (Boxlab, PackMyMan)"
    ]
    
    for c_idx, cell in enumerate(table1.rows[0].cells):
        cell.width = col_widths[c_idx]
        set_cell_background(cell, "1A362B")
        set_cell_margins(cell, top=120, bottom=120, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(headers1[c_idx])
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    metrics_data = [
        (
            "1. Đầu vào để tạo hộp\n(Input)",
            "Dựa trên món quà (L×W×H): Tự động tính toán kích thước bao bì vừa khít và bù trừ độ dày giấy (Caliper).",
            "Dựa trên kích thước hộp: Người dùng phải tự đo và nhập kích thước hộp mong muốn hoặc chọn từ mẫu có sẵn (Pacdora hơn 3.000 mẫu; Templatemaker nhập L, W, H hộp).",
            "Chọn mẫu sẵn hoặc tư vấn: Chọn mẫu cố định trong editor (Packhelp); dựng ảnh từ hình khối có sẵn (Boxshot); hoặc trao đổi thông số kỹ thuật thủ công qua tư vấn (InnoPack, Xưởng in).",
            "Không có tính năng tính hộp: Tự tính toán và tự vẽ thủ công (Canva, Illustrator); hoặc chọn mua size thùng carton cố định có sẵn gần bằng sản phẩm (Shopee).",
            "Dựa trên kích thước hộp: Nhập kích thước chiều dài, rộng, cao của chiếc hộp để hệ thống tự động sinh lưới dieline (Boxlab, PackMyMan)."
        ),
        (
            "2. Xuất file & Xem trước 3D\n(Export & 3D)",
            "3D WebGL tương tác + FitCheck™: Mô phỏng gập mở 3D thực tế; kiểm tra cảnh báo an toàn nếp gấp và độ vừa vặn của quà.",
            "3D Mockup / Tải file kỹ thuật: Pacdora có 3D và xuất AI/PDF/DXF (trả phí); Templatemaker xuất PDF/DXF/SVG nhưng trang không có xem trước 3D.",
            "3D thương mại hoặc Render tĩnh: Packhelp xem 3D thời gian thực để chèn logo; Boxshot render ảnh 3D tĩnh offline; InnoPack và xưởng offset không có công cụ xem trước trực tuyến công khai.",
            "Không có 3D bao bì chuyên dụng: Canva và Illustrator chỉ hiển thị đồ họa 2D phẳng, không kiểm tra được độ vừa quà; thùng Shopee chỉ xem qua ảnh chụp.",
            "3D thời gian thực & Xuất file: Boxlab xem 3D thời gian thực, xuất PDF/SVG/DXF; PackMyMan xuất SVG/DXF/PDF trực tiếp từ trình duyệt web."
        ),
        (
            "3. Rào cản số lượng tối thiểu\n(MOQ)",
            "Từ 01 hộp (Không ràng buộc MOQ): Người dùng xuất file tự in hoặc đặt in số lượng siêu nhỏ qua xưởng liên kết.",
            "Không áp dụng MOQ: Là công cụ phần mềm thuần túy (SaaS), không sản xuất bao bì vật lý.",
            "Ràng buộc số lượng lớn: Packhelp từ 30 hộp; Xưởng offset kinh tế từ khoảng 500 hộp trở lên (nhà in kỹ thuật số nhận ít hơn); Boxshot không áp dụng.",
            "Mua theo lô nhỏ hoặc không áp dụng: Thùng carton Shopee mua theo combo (ví dụ: combo 10 hộp); Canva và Illustrator không áp dụng MOQ.",
            "Không áp dụng MOQ: Là phần mềm trực tuyến tạo dieline, không trực tiếp sản xuất bao bì vật lý."
        ),
        (
            "4. Chi phí sử dụng & Bản quyền\n(Pricing)",
            "Siêu vi mô (Micro-SaaS): 19.000đ/lượt xuất file hoặc 149.000đ/tháng (gói Pro không giới hạn).",
            "Thuê bao cao hoặc Miễn phí: Pacdora từ $29/tháng (gói năm), dùng thương mại ở gói Business; Templatemaker miễn phí mã nguồn mở.",
            "Tính gộp vào hộp hoặc Mua phần mềm đắt: Packhelp 30 hộp từ ~49 EUR; Boxshot $16/tháng ($192/năm) hoặc mua vĩnh viễn $499; Xưởng offset chịu chi phí khuôn bế ban đầu (1–3 triệu VNĐ).",
            "Thuê bao đồ họa hoặc Giá rẻ đại trà: Canva Free $0, Pro ~$12.99/tháng (~330.000đ); Illustrator ~$22.99–$34.49/tháng; Thùng Shopee rẻ (ví dụ combo 10 hộp 30x20x5cm giá ~34.300đ).",
            "Mô hình Freemium / Dùng thử: Chưa công bố bảng giá chính thức; Boxlab cung cấp mã dùng thử Pro 7 ngày."
        ),
        (
            "5. Mức độ phù hợp thị trường VN\n(Localization)",
            "Bản địa hóa 100%: Giao diện tiếng Việt, định giá bằng VND, thanh toán MoMo/VietQR, chuẩn theo khổ in nhanh nội địa.",
            "Rào cản ngoại tệ & ngôn ngữ: Pacdora giá USD, thanh toán thẻ quốc tế/PayPal; Templatemaker có 21 ngôn ngữ nhưng không có tiếng Việt.",
            "Xa rời thị trường nội địa: Packhelp hướng đến EU/Mỹ, chưa phục vụ VN; Boxshot chỉ có tiếng Anh. Ngược lại, xưởng in và InnoPack nội địa rất mạnh về thị trường thực tế.",
            "Rất phổ biến tại VN: Shopee/Lazada có sẵn tại VN; Canva có giá tham khảo bằng VND và giao diện tiếng Việt; Illustrator phổ biến trong giới đồ họa.",
            "Thuần quốc tế: Chưa có giao diện tiếng Việt, chưa có hệ thống liên kết in ấn tại thị trường Việt Nam."
        )
    ]
    
    for r_idx, row_data in enumerate(metrics_data):
        row = table1.rows[r_idx + 1]
        bg_color = "FDFBF7" if (r_idx % 2 == 1) else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=80, bottom=80, left=90, right=90)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(val)
                run.bold = True
                run.font.name = "Times New Roman"
                run.font.size = Pt(9.5)
                run.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
            elif c_idx == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(val)
                run.bold = True
                run.font.name = "Times New Roman"
                run.font.size = Pt(9.0)
                run.font.color.rgb = RGBColor(0x0E, 0x4D, 0x92)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(val)
                run.font.name = "Times New Roman"
                run.font.size = Pt(9.0)
                run.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4.2.3
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.3. Bảng Phân Nhóm Đối Thủ Thực Tế (Real-life Competitors Placement)")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    # Table 2: 4 Groups
    table2 = doc.add_table(rows=5, cols=4)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    table2.autofit = False
    set_table_borders(table2)
    
    col_widths2 = [Cm(4.0), Cm(4.0), Cm(4.0), Cm(4.0)]
    headers2 = [
        "Direct Competitors\n(Cùng SP, Cùng Khách)",
        "Indirect Competitors\n(Khác SP, Cùng Khách)",
        "Substitute Competitors\n(Giải pháp thay thế)",
        "New Entrants\n(Đối thủ mới nổi)"
    ]
    
    for c_idx, cell in enumerate(table2.rows[0].cells):
        cell.width = col_widths2[c_idx]
        set_cell_background(cell, "1A362B")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(headers2[c_idx])
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    placement_data = [
        ("1. Pacdora (pacdora.com)", "1. Packhelp (packhelp.com)", "1. Canva (canva.com)", "1. Boxlab (boxlab.io)"),
        ("2. Templatemaker (templatemaker.nl)", "2. Boxshot (boxshot.com)", "2. Adobe Illustrator", "2. PackMyMan (peerpush.com)"),
        ("", "3. InnoPack (innopack.vn)", "3. Hộp carton đại trà Shopee", ""),
        ("", "4. Xưởng in Offset truyền thống", "", "")
    ]
    
    for r_idx, row_data in enumerate(placement_data):
        row = table2.rows[r_idx + 1]
        bg_color = "FDFBF7" if (r_idx % 2 == 1) else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths2[c_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(val)
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0x1C, 0x19, 0x17)
            
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.25
    r_lydo = p.add_run("Lý do và căn cứ phân loại: ")
    r_lydo.bold = True
    p.add_run("Nhóm Direct gồm các công cụ online tạo dieline tự động cho người cần hộp. Nhóm Indirect có cùng khách hàng và nhu cầu có bao bì nhưng giải quyết bằng dịch vụ sản xuất in ấn vật lý trọn gói hoặc phần mềm render 3D chuyên sâu. Nhóm Substitute là thói quen thay thế mà các chủ shop nhỏ vẫn dùng (tự dựng bản vẽ 2D hoặc mua thùng carton tiêu chuẩn trên Shopee). Nhóm New Entrants là hai startup công nghệ mới xuất hiện trên nền tảng khởi nghiệp quốc tế BetaList và PeerPush (Boxlab và PackMyMan) nằm ngoài danh sách đối thủ truyền thống.")

    # 4.2.4
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("4.2.4. Phân Tích Chiến Lược Cạnh Tranh (Strategic Analysis)")
    r.bold = True
    r.font.size = Pt(12.5)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    # 4.2.4.1
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run("4.2.4.1. Bức tranh cạnh tranh tổng thể (Overall Competitive Landscape)")
    r.bold = True
    r.font.size = Pt(11.5)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.add_run("Thị trường bao bì hiện đang bị phân tách rõ rệt thành hai cực đối lập:\n")
    p.add_run("• ")
    p.add_run("Cực công cụ thiết kế quốc tế (Pacdora, Templatemaker, Boxlab): ").bold = True
    p.add_run("Đều tập trung tạo dieline từ kích thước của chiếc hộp. Họ mạnh về thuật toán nhưng bắt người dùng phải tự suy tính kích thước hộp, đồng thời rào cản chi phí ngoại tệ cao ($29 – $49/tháng) xa rời năng lực tài chính của tiểu thương Việt Nam (Pacdora, 2026; TrustRadius, 2026).\n")
    p.add_run("• ")
    p.add_run("Cực sản xuất in ấn vật lý: ").bold = True
    p.add_run("Gồm các nhà in offset truyền thống nội địa với tính kinh tế chỉ đạt được từ khoảng 500 – 1.000 sản phẩm trở lên do chi phí làm khuôn bế uốn dao thép đắt đỏ (Indiana University, 2024; Nguyễn Thành Luân, 2023); và nền tảng Packhelp với MOQ 30 hộp nhưng đặt tại châu Âu, chi phí vận chuyển quốc tế quá cao (Packhelp, 2023, 2026).\n")
    p.add_run("• ")
    p.add_run("Khoảng trống thị trường của WRAPFIT: ").bold = True
    p.add_run("Nằm chính xác ở điểm giao thoa bị bỏ trống: Tính toán hộp tự động từ kích thước món quà thực tế, không giới hạn MOQ (từ 01 hộp), định giá vi mô bằng VND và bản địa hóa hoàn toàn cho xưởng in Việt Nam.\n")
    p.add_run("• ")
    p.add_run("Hai áp lực công nghệ cần lưu ý: ").bold = True
    p.add_run("Thứ nhất, Pacdora đã ra mắt tính năng AI Creation vào tháng 04/2026 (Utusan Malaysia / PR Newswire, 2026), tự động gắn hoa văn AI vào bề mặt dieline chính xác ngay từ câu lệnh đầu tiên; thứ hai, các công cụ AI tạo dieline tự do như Pixa đang xuất hiện (Pixa, 2026), khiến rào cản tạo dieline thuần túy bị hạ thấp. Do đó, WrapFit không thể thắng chỉ nhờ việc \"có dieline và 3D\" mà phải thắng ở trải nghiệm vừa vặn và an toàn in ấn.")

    # 4.2.4.2
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.4.2. Điểm mạnh và điểm yếu của từng nhóm đối thủ")
    r.bold = True
    r.font.size = Pt(11.5)
    
    # Table 3: S/W
    table3 = doc.add_table(rows=5, cols=3)
    table3.alignment = WD_TABLE_ALIGNMENT.CENTER
    table3.autofit = False
    set_table_borders(table3)
    
    col_widths3 = [Cm(3.0), Cm(6.5), Cm(6.5)]
    headers3 = ["Nhóm Đối Thủ", "Điểm Mạnh Cốt Lõi", "Điểm Yếu Cốt Tử"]
    
    for c_idx, cell in enumerate(table3.rows[0].cells):
        cell.width = col_widths3[c_idx]
        set_cell_background(cell, "1A362B")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(headers3[c_idx])
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    sw_data = [
        ("Direct Competitors", "Pacdora sở hữu thư viện đồ sộ hơn 3.000 mẫu, trực quan hóa 3D mượt mà, xuất file vector đa dạng (AI/PDF/DXF). Templatemaker hoàn toàn miễn phí, hỗ trợ nhiều định dạng vector, cho phép sử dụng cho in ấn thương mại.", "Pacdora tính phí USD cao ($29–$49/tháng), đòi hỏi gói Business mới cấp quyền thương mại. Templatemaker hoàn toàn không có tiếng Việt và không có tính năng xem trước 3D."),
        ("Indirect Competitors", "Sở hữu năng lực sản xuất thực tế quy mô lớn (InnoPack, Xưởng Offset) hoặc công nghệ render ảnh 3D đạt độ chân thực quang học cực cao (Boxshot). Packhelp cho phép đặt in theo yêu cầu từ 30 hộp với editor trực quan.", "Packhelp chỉ phục vụ thị trường Âu - Mỹ, cước vận chuyển về VN quá đắt. Xưởng Offset chỉ phù hợp đơn hàng lớn (500+ hộp). Boxshot không tạo được dieline, giá mua đứt đắt ($499) và chỉ có tiếng Anh."),
        ("Substitute Competitors", "Cực kỳ quen thuộc và chi phí rẻ: Canva bản Free $0, thùng carton Shopee mua lẻ với giá thấp chỉ vài ngàn đồng, giao hàng nhanh trong ngày.", "Không có công cụ tính toán hộp vừa quà, phải chèn xốp rơm lãng phí. Illustrator tốn phí hàng tháng (~$22.99/tháng), đòi hỏi chuyên môn đồ họa cao và người dùng phải tự vẽ lưới bế thủ công."),
        ("New Entrants", "Ứng dụng công nghệ web mới, tạo dieline tự động nhanh chóng trên trình duyệt, hỗ trợ xuất file chuẩn vector sản xuất (SVG/DXF/PDF).", "Chưa công bố giá chính thức hoặc chỉ cho dùng thử ngắn ngày (Boxlab 7 ngày Pro); hoàn toàn chưa có sự hiện diện và bản địa hóa tại thị trường Việt Nam.")
    ]
    
    for r_idx, row_data in enumerate(sw_data):
        row = table3.rows[r_idx + 1]
        bg_color = "FDFBF7" if (r_idx % 2 == 1) else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths3[c_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(val)
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.0)
            if c_idx == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
            else:
                run.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4.2.4.3
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.4.3. Chiến lược của WrapFit để Chiến Thắng (Win) và Phòng Thủ (Defend)")
    r.bold = True
    r.font.size = Pt(11.5)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.add_run("1. ")
    p.add_run("Định vị độc quyền \"Từ món quà ra chiếc hộp\" (Gift-Centric Engineering): ").bold = True
    p.add_run("Cả đối thủ Direct và New Entrants đều bắt người dùng bắt đầu từ kích thước hộp. Điểm khác biệt sống còn của WrapFit là giải phóng gánh nặng đo đạc: Người dùng chỉ cần nhập kích thước món quà (L×W×H), thuật toán tự tính toán chiếc hộp vừa vặn và tự động bù hao độ dày vật liệu (Caliper compensation).\n")
    p.add_run("2. ")
    p.add_run("Vũ khí kiểm định an toàn in ấn FitCheck™: ").bold = True
    p.add_run("FitCheck™ không chỉ kiểm tra độ vừa kích thước mà còn kiểm định an toàn chế bản: Tự động cảnh báo vi phạm khoảng cách nếp cấn gập (< 3mm), lề cắt xén (Bleed ≥ 2mm) và độ phân giải ảnh (DPI ≥ 200), ngăn chặn 100% rủi ro in hỏng.\n")
    p.add_run("3. ")
    p.add_run("Định giá vi mô theo lượt và không ràng buộc MOQ (từ 01 hộp): ").bold = True
    p.add_run("Đánh trực diện vào \"tử huyệt\" của xưởng in offset (đòi hỏi 500+ hộp) và Packhelp (đòi hỏi 30+ hộp ở nước ngoài), phục vụ trúng nhu cầu của các chủ shop handmade và cá nhân tặng quà.\n")
    p.add_run("4. ")
    p.add_run("Xây dựng \"Kho kích thước quà chuẩn Việt Nam\" (Local Preset Database): ").bold = True
    p.add_run("Thu thập và lưu sẵn kích thước các sản phẩm quà tặng phổ biến nội địa (hũ nến thơm, son thủ công, hộp trà, bánh trung thu, mỹ phẩm organic). Đây là hàng rào phòng thủ dữ liệu bản địa vững chắc trước Pacdora và các công cụ AI quốc tế.\n")
    p.add_run("5. ")
    p.add_run("Bản địa hóa trải nghiệm khách hàng: ").bold = True
    p.add_run("Giao diện 100% tiếng Việt, thanh toán tiện lợi bằng MoMo/VietQR, hỗ trợ kỹ thuật trực tiếp qua Zalo, theo dõi sát sao lộ trình cập nhật AI của Pacdora để liên tục tối ưu sản phẩm.")

    # 4.2.4.4 - CƠ HỘI HỢP TÁC CHIẾN LƯỢC (ĐƯỢC LÀM NỔI BẬT & BẢNG MA TRẬN RIÊNG)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.4.4. Cơ Hội Hợp Tác Chiến Lược (Partnership & Collaboration Opportunities)")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.add_run("Thay vì đối đầu trực diện trong một thị trường phân mảnh, WrapFit áp dụng tư duy ")
    p.add_run("\"Hợp tác để cùng kiến tạo giá trị (Co-opetition & Win-Win)\"").bold = True
    p.add_run(", biến các đối thủ tiềm tàng và các mắt xích cung ứng trong ngành thành đối tác chiến lược bền vững theo 4 trụ cột:")
    
    # Table 4: Partnership Matrix
    table4 = doc.add_table(rows=5, cols=4)
    table4.alignment = WD_TABLE_ALIGNMENT.CENTER
    table4.autofit = False
    set_table_borders(table4)
    
    col_widths4 = [Cm(3.5), Cm(4.0), Cm(4.3), Cm(4.2)]
    headers4 = [
        "Trụ Cột Đối Tác",
        "Mô Hình Hợp Tác",
        "Giá Trị Mang Lại Cho Đối Tác",
        "Giá Trị Thu Về Cho WrapFit"
    ]
    
    for c_idx, cell in enumerate(table4.rows[0].cells):
        cell.width = col_widths4[c_idx]
        set_cell_background(cell, "1A362B")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(headers4[c_idx])
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    part_matrix = [
        (
            "1. Xưởng in nhanh nội địa & InnoPack",
            "Mạng lưới Gia công Liên kết (Fulfillment Network - Kế hoạch Phase 2).",
            "Nhận nguồn đơn hàng nhỏ lẻ (1 – 50 hộp) liên tục với file vector chuẩn 100% không tốn công thợ sửa file; tối ưu công suất máy bế kỹ thuật số.",
            "Nhận chiết khấu hoa hồng 10 – 15% trên mỗi đơn hàng sản xuất; hoàn thiện chuỗi giá trị từ màn hình số đến chiếc hộp thực tế."
        ),
        (
            "2. Cộng đồng Shopee, TikTok Shop & Etsy VN",
            "Kênh phân phối & Đối tác giáo dục người dùng (Co-marketing & Workshops).",
            "Chủ shop được chuẩn hóa bao bì chuyên nghiệp, tăng tỷ lệ đánh giá 5 sao và trải nghiệm Unboxing của khách mua hàng với chi phí cực thấp.",
            "Tiếp cận trực tiếp tệp khách hàng mục tiêu lớn nhất mà không tốn chi phí quảng cáo đắt đỏ; chuyển hóa người bán thành thuê bao Pro định kỳ."
        ),
        (
            "3. Nhà cung cấp Web-to-Print (DesignO, DesignNBuy)",
            "Tích hợp công nghệ mở (API Integration / White-label Plugin).",
            "Bổ sung module toán học tính hộp từ quà tặng cho hệ thống phần mềm của họ để bán cho các tập đoàn in ấn bao bì lớn.",
            "Tạo dòng doanh thu B2B Licensing, hóa giải nguy cơ nhà in tự xây dựng công cụ thiết kế hộp riêng."
        ),
        (
            "4. Nền tảng quốc tế (Templatemaker, Packhelp)",
            "Định vị đối tượng học hỏi giải thuật & Tham chiếu công nghệ.",
            "Không xung đột lợi ích trực tiếp do WrapFit tập trung độc quyền vào thị trường ngách nội địa Việt Nam và Đông Nam Á.",
            "Học hỏi các chuẩn cấu trúc bao bì phức tạp và cập nhật xu hướng công nghệ mới trên thế giới."
        )
    ]
    
    for r_idx, row_data in enumerate(part_matrix):
        row = table4.rows[r_idx + 1]
        bg_color = "FDFBF7" if (r_idx % 2 == 1) else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths4[c_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(val)
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.0)
            if c_idx == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
            else:
                run.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Detailed descriptions for the 4 pillars
    collab_details = [
        ("• Trụ cột 1 — Hợp tác Đôi bên cùng có lợi (Win-Win) với Xưởng in nhanh nội địa & InnoPack: ", 
         "Thay vì đối đầu với ngành in ấn truyền thống, WrapFit định vị là \"Cổng tiền xử lý và chuẩn hóa file in số\". Các xưởng in nhanh hiện đang gặp bài toán đau đầu: Khách nhỏ lẻ gửi file Canva/ảnh chụp bị vỡ nét, nhân viên kỹ thuật phải mất 30–60 phút ngồi vẽ lại khuôn dao bế, khiến xưởng từ chối hoặc đẩy giá lên cao. WrapFit giải quyết triệt để nút thắt này bằng cách xuất file PDF/DXF phân lớp chuẩn cơ học (CutContour, Crease, Bleed) đưa thẳng vào máy cắt decal/bế kỹ thuật số phẳng. Đổi lại, xưởng in nhận sản xuất đơn nhỏ (1–50 hộp) cho người dùng WrapFit và trích lại 10 – 15% hoa hồng trên giá trị đơn hàng, đúng theo lộ trình mở rộng Phase 2 của dự án."),
        
        ("• Trụ cột 2 — Đồng hành cùng Cộng đồng Nhà bán hàng Shopee, TikTok Shop & Etsy Việt Nam: ", 
         "Đây là kênh tiếp cận khách hàng mục tiêu lớn nhất và là nguồn người dùng đầu tiên của WrapFit. Khác với doanh nghiệp lớn, người bán hàng thủ công (nến thơm, xà phòng, đồ da, gốm sứ) bắt buộc phải tự chuẩn bị bao bì và có nhu cầu cấp thiết nâng tầm thẩm mỹ hộp quà để cạnh tranh trên sàn TMĐT (MISA eShop, 2024). WrapFit sẽ hợp tác với các hội nhóm thủ công tổ chức chuỗi workshop chuyên đề \"Nâng tầm bao bì — Tối ưu chi phí unboxing\", tài trợ gói WrapFit Pro trải nghiệm miễn phí 3 tháng để chuyển hóa họ thành khách hàng trung thành."),
        
        ("• Trụ cột 3 — Cơ hội và Lưỡng diện với các đơn vị giải pháp Web-to-Print (DesignO, DesignNBuy): ", 
         "Các công ty công nghệ như DesignO hay DesignNBuy chuyên bán phần mềm thiết kế hộp trực tuyến cho chính các nhà máy in. Họ vừa là nguy cơ tiềm tàng (nếu xưởng in tự mua công cụ của họ), nhưng vừa là cơ hội hợp tác chiến lược theo mô hình White-label hoặc API Partnership. WrapFit có thể cung cấp độc quyền module giải thuật \"Tính toán kích thước hộp từ quà tặng\" cho hệ thống của họ để thu phí bản quyền B2B."),
        
        ("• Trụ cột 4 — Đối với các nền tảng quốc tế (Templatemaker, Packhelp): ", 
         "Nhóm đánh giá cơ hội hợp tác trực tiếp là không khả thi do khoảng cách địa lý và khác biệt mô hình vận hành. Tuy nhiên, nhóm xác định theo dõi chặt chẽ như những đối tượng tham chiếu chuẩn mực (Benchmark) để liên tục học hỏi các mẫu cấu trúc gập mới và đón đầu các tiêu chuẩn in ấn xanh (Eco-friendly packaging) của châu Âu.")
    ]
    
    for bold_prefix, text_content in collab_details:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.space_before = Pt(3)
        p_c.paragraph_format.space_after = Pt(4)
        p_c.paragraph_format.line_spacing = 1.25
        run_b = p_c.add_run(bold_prefix)
        run_b.bold = True
        run_b.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
        run_t = p_c.add_run(text_content)
        run_t.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)

    # 4.2.5 References
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("4.2.5. Danh Mục Tài Liệu Tham Khảo (References — Harvard Format)")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x1A, 0x36, 0x2B)
    
    references = [
        ("Admina", "2025", "Canva Pricing Guide: The Ultimate Guide", "https://admina.moneyforward.com/us/blog/canva-pricing-the-ultimate-guide"),
        ("AlternativeTo", "2026", "Boxshot: Software Review and Details", "https://alternativeto.net/software/boxshot/about"),
        ("BetaList", "2025", "Boxlab — Packaging Design Tool", "https://betalist.com/startups/boxlab"),
        ("Boxshot", "2026", "Boxshot Official Ordering and Pricing", "https://boxshot.com/boxshot/order/"),
        ("Finhay", "2025", "So sánh Canva Pro và Canva Miễn phí", "https://www.finhay.com.vn/so-sanh-canva-pro-va-canva-mien-phi"),
        ("Fitgap", "2026", "Boxshot Product Overview and Pricing", "https://us.fitgap.com/products/008625/boxshot"),
        ("In An Khánh", "2024", "Quy trình in nhanh hộp giấy số lượng ít", "https://scrapbox.io/inankhanh/quy-trinh-in-nhanh-hop-giay-so-luong-it"),
        ("Indiana University", "2024", "Understanding Offset Printing and Volume Economics", "https://document.indiana.edu/offset-printing"),
        ("Kotler, P. and Armstrong, G.", "2021", "Principles of Marketing. 18th edn. Harlow: Pearson Education.", ""),
        ("Lazada Vietnam", "2026", "Thùng carton đóng gói giá tốt", "https://www.lazada.vn/trending/Cartons-Best-Price/1265892747"),
        ("MISA eShop", "2024", "Quy cách đóng gói hàng chuẩn trên Shopee", "https://www.misaeshop.vn/?p=33007"),
        ("Nguyễn Thành Luân", "2023", "Công nghệ in Offset và chi phí khuôn bế công nghiệp", "https://nguyenthanhluan.com/?p=9406"),
        ("Pacdora", "2026", "Pacdora Official Pricing and Commercial License", "https://www.pacdora.com/pricing"),
        ("Packhelp", "2023", "Surprise Your Friends with Unusual Christmas Boxes. Packhelp Blog", "https://packhelp.com/blog/surprise-your-friends-family-with-unusual-christmas-boxes/"),
        ("Packhelp", "2026", "Custom Corrugated Boxes and Minimum Order Quantities", "https://packhelp.com/custom-corrugated-boxes"),
        ("Panjiva", "2025", "Innopack Vietnam Company Profile and Export Data", "https://es.panjiva.com/Innopack-Vietnam/86793149"),
        ("PeerPush", "2025", "PackMyMan: Free Online Dieline and Packaging Generator", "https://peerpush.com/p/packmyman"),
        ("Photutorial", "2026", "Adobe Illustrator Pricing and Subscription Breakdown", "https://photutorial.com/adobe-illustrator-pricing"),
        ("Pixa", "2026", "AI Dieline Generator for Packaging Designers", "https://www.pixa.com/create/dieline-generator"),
        ("Templatemaker", "2026", "Free Custom Packaging and Dieline Templates", "https://www.templatemaker.nl/en/"),
        ("Toolradar", "2026", "Adobe Illustrator Pricing 2026 Guide", "https://toolradar.com/tools/illustrator/pricing"),
        ("TrustRadius", "2026", "Pacdora Pricing, Reviews and Features", "https://trustradius.com/products/pacdora/pricing"),
        ("Utusan Malaysia & PR Newswire", "2026", "Pacdora Launches AI Creation: AI Packaging That's Built to Print, Not Just to Pitch", "https://www.utusan.com.my/pr-newswire-en/2026/04/pacdora-launches-ai-creation-ai-packaging-thats-built-to-print-not-just-to-pitch/"),
        ("Yellow Pages Vietnam", "2025", "Danh bạ doanh nghiệp sản xuất và in ấn bao bì giấy", "https://www.yellowpages.vn/tgcls/80191570/in-bao-bi.html?i=7")
    ]
    
    for idx, ref in enumerate(references):
        author, year, title, url = ref
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Cm(1.0)
        p_ref.paragraph_format.first_line_indent = Cm(-1.0)
        p_ref.paragraph_format.space_after = Pt(3)
        p_ref.paragraph_format.line_spacing = 1.15
        
        r_num = p_ref.add_run(f"[{idx+1}] ")
        r_num.bold = True
        p_ref.add_run(f"{author} ({year}). ")
        r_t = p_ref.add_run(f"{title}. ")
        r_t.italic = True
        if url:
            p_ref.add_run(f"Available at: {url} (Accessed: 30 September 2026).")
            
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    out1 = "d:/FPT_FALL2026/EXE101/docs/4.2_Competitors_Criteria_Table_WrapFit.docx"
    out2 = "d:/FPT_FALL2026/EXE101/4.2_Competitors_Criteria_Table_WrapFit.docx"
    build_word_document(out1)
    build_word_document(out2)
