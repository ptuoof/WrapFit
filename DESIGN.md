---
name: WrapFit Joyful Craft & High-Performance Design System
description: Modern, bright, cute, and high-performance design system for packaging personalization & dieline engineering. Inspired by Heron AI (Mobbin), Dribbble pastel trends, and DESIGN.md standards.
tokens:
  colors:
    # 1. Base Surfaces (Bright, Crisp, Clean Paper)
    background: '#FAF9F5'
    surface: '#FFFFFF'
    surface-dim: '#F4F2EB'
    surface-bright: '#FFFFFF'
    surface-border: '#E8E5DD'
    
    # 2. Text & Readability (High Contrast WCAG AAA)
    on-surface: '#18181B'        # Deep ink charcoal for maximum legibility
    on-surface-variant: '#52525B'# Refined muted zinc
    on-surface-subtle: '#71717A' # Light annotations
    
    # 3. Joyful Pastel Accents (Cute, Friendly, Delightful)
    pastel:
      peach:
        bg: '#FFE8E1'
        border: '#FFC8BA'
        accent: '#FF6B6B'
        text: '#9E2A2B'
      matcha:
        bg: '#EAF7ED'
        border: '#C2E8CC'
        accent: '#40916C'
        text: '#1B4332'
      butter:
        bg: '#FEF9C3'
        border: '#FDE047'
        accent: '#EAB308'
        text: '#854D0E'
      lavender:
        bg: '#F3E8FF'
        border: '#DDD6FE'
        accent: '#8B5CF6'
        text: '#581C87'
      sky:
        bg: '#E0F2FE'
        border: '#BAE6FD'
        accent: '#0284C7'
        text: '#075985'
      rose:
        bg: '#FCE7F3'
        border: '#FBCFE8'
        accent: '#EC4899'
        text: '#831843'
        
    # 4. Brand & Manufacturing Accents
    brand:
      gold: '#D4AF37'
      espresso: '#2B1E16'
      kraft: '#D4A373'
      cotton: '#FAEDCD'
      
    # 5. Dieline Technical Standards (FitCheck™ 4-Layer)
    dieline:
      cut: '#E53E3E'             # Outer perimeter knife cut (Solid)
      crease: '#3182CE'          # Fold / bend lines (Dashed 4,4)
      bleed: '#38A169'           # Artwork print bleed >= 2mm (Dotted)
      safe: '#D97706'            # Safe margin >= 3mm inside folds
      
  typography:
    display-xl:
      fontFamily: Playfair Display
      fontSize: 48px
      fontWeight: '700'
      lineHeight: 56px
      letterSpacing: -0.02em
    display-lg:
      fontFamily: Playfair Display
      fontSize: 36px
      fontWeight: '700'
      lineHeight: 44px
      letterSpacing: -0.01em
    headline-lg:
      fontFamily: Plus Jakarta Sans
      fontSize: 24px
      fontWeight: '700'
      lineHeight: 32px
    headline-md:
      fontFamily: Plus Jakarta Sans
      fontSize: 20px
      fontWeight: '600'
      lineHeight: 28px
    body-lg:
      fontFamily: Plus Jakarta Sans
      fontSize: 16px
      fontWeight: '400'
      lineHeight: 24px
    body-md:
      fontFamily: Plus Jakarta Sans
      fontSize: 14px
      fontWeight: '400'
      lineHeight: 20px
    code-metric:
      fontFamily: JetBrains Mono
      fontSize: 13px
      fontWeight: '600'
      letterSpacing: 0.04em
      
  radii:
    card: '24px'
    button: '16px'
    pill: '9999px'
    chip: '12px'
    
  shadows:
    soft-clay: '0 8px 24px -4px rgba(24, 24, 27, 0.06), 0 4px 12px -2px rgba(24, 24, 27, 0.04)'
    card-hover: '0 16px 32px -8px rgba(24, 24, 27, 0.1), 0 6px 16px -4px rgba(24, 24, 27, 0.06)'
    tactile-press: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
---

# WrapFit Design Philosophy: Joyful Craft & High Performance

## 1. Nguồn Cảm Hứng & Thẩm Mỹ (Inspirations)

1. **Heron AI (Mobbin Reference)**:
   - **Product-Led & Tangible AI**: Thay vì văn bản mô tả khô khan, đưa tương tác thực tế lên hàng đầu. Khách hàng nhìn thấy mô hình 3D xoay lật, nắp mở, pháo hoa giấy nổ ngay trên màn hình.
   - **Purposeful Restraint**: Giữ không gian thoáng đãng, phân cấp thị giác mạch lạc, không làm phân tán sự chú ý vào các hiệu ứng thừa thãi.

2. **Dribbble & Mobbin Trending (Bright & Cute Aesthetic)**:
   - **Bảng màu tươi sáng, dễ thương (Pastel Palettes)**: Matcha Kem (`#EAF7ED`), Peach Blossom (`#FFE8E1`), Butter Daisy (`#FEF9C3`), Lavender Mist (`#F3E8FF`), Sky Blue (`#E0F2FE`).
   - **Chi tiết thủ công đáng yêu**: Thẻ bo tròn mềm mại (`rounded-3xl`), tem nhãn sticker xinh xắn, dải ruy băng lụa ảo, nút bấm tactile nảy nhẹ.

3. **High-Performance & Legibility (TopGit / Developer Standards)**:
   - **Độ tương phản cao**: Chữ mực than chì đậm (`#18181B`) trên nền giấy sáng ngà (`#FAF9F5`), đạt chuẩn WCAG AAA.
   - **Số đo kỹ thuật chính xác**: Kích thước $(L, W, H, t)$ và dung sai bế khuôn hiển thị bằng font `JetBrains Mono` sắc nét.
   - **Tốc độ 60 FPS**: Tối ưu hóa GPU, thời gian tải trang nhanh, không layout shifts.

4. **DESIGN.md Standards (designmd.ai / designmd.app)**:
   - Quy chuẩn hóa tokens cho AI coding agents, đảm bảo mọi màn hình sinh ra đều giữ trọn DNA thiết kế thống nhất.

## 2. Quy Tắc Ứng Dụng (Do's & Don'ts)

### DO:
- Sử dụng nền trắng ngà ấm áp (`#FAF9F5`) và các thẻ card trắng tinh khôi viền mỏng (`#E8E5DD`).
- Dùng các thẻ chip màu pastel tươi sáng để phân loại danh mục, trạng thái và vật liệu hộp.
- Áp dụng bo góc lớn (`rounded-2xl`, `rounded-3xl`) tạo cảm giác thân thiện, dễ thương và mời gọi chạm vuốt.
- Đảm bảo các con số kỹ thuật (mm, GSM, °) luôn to rõ và dễ đọc trên mọi thiết bị.

### DON'T:
- Không dùng nền đen u ám, lạnh lẽo hoặc màu xám xịt công nghiệp làm nền chính.
- Không dùng font mờ nhạt gây mỏi mắt (tương phản phải luôn $\ge 4.5:1$ cho body và $\ge 3:1$ cho tiêu đề).
- Không lạm dụng hiệu ứng đổ bóng quá nặng hoặc gradient quá gắt kiểu AI-slop.
