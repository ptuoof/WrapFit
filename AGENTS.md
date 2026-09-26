# WrapFit Platform — AI Agent Development Guidelines

> **Project**: WrapFit Platform (Packaging Personalization & Intelligence Platform)  
> **Course**: EXE101 — Experiential Entrepreneurship (FPT University)  
> **Slogan**: *"Make Every Present, Present."*  
> **Core Value**: Packaging-specific workflow — designing the box around the gift, ensuring 100% production feasibility.

---

## 1. Domain Knowledge & Packaging Physics

When generating code or designing interfaces for WrapFit, you MUST adhere to physical packaging constraints:

1. **Parametric Box Geometry $(L, W, H, t)$**:
   - Every box panel is derived mathematically from physical gift dimensions: Length ($L$), Width ($W$), Depth/Height ($H$), and Paper Thickness ($t$ in mm, based on 250–350 GSM paper).
   - Never use static mockups. All dielines must maintain exact coordinate relationships between panels, tuck flaps, and glue flaps.

2. **Dieline Layering Standards**:
   - 🔴 **Cut Line (`#E53E3E`, Solid)**: Outer perimeter knife cuts.
   - 🔵 **Crease / Score Line (`#3182CE`, Dashed `stroke-dasharray="4,4"`)**: Fold lines where paper bends.
   - 🟢 **Bleed Line (`#38A169`, Dotted)**: Background artwork must extend $\ge 2\text{mm}$ beyond cut lines.
   - 🟡 **Safe Margin Area**: Critical text, logos, and barcodes must sit $\ge 3\text{mm}$ inside crease and cut lines.

3. **Supported MVP Box Structures**:
   - **Tuck Top Box (Hộp nắp gài đáy khóa)**: Standard retail/gift box.
   - **Sleeve / Drawer Box (Hộp bao diêm)**: Outer sleeve with sliding tray.
   - **Lid & Base Box (Hộp âm dương)**: Rigid two-piece gift box.
   - **Pillow Box (Hộp gối)**: Curved folding pouch for jewelry and small accessories.

---

## 2. UI/UX Craftsmanship (Anti-AI-Slop & Design Direction)

WrapFit targets handmade shop owners, crafters, and thoughtful gift givers. Avoid generic, lazy "AI templates":

- **Typography**: Do NOT use default system fonts or plain Inter everywhere. Pair an elegant display serif (Playfair Display, Cormorant Garamond, or Lora) for headings with a legible grotesque sans-serif (Plus Jakarta Sans or DM Sans) for UI controls.
- **Palette**: Use warm, tactile material tones:
  - *Warm Kraft*: `#D4A373`, `#E9D8A6`
  - *Ivory / Cotton Paper*: `#FAEDCD`, `#FEFAE0`
  - *Deep Forest / Luxury Green*: `#1A3026`, `#2D5A27`
  - *Rich Espresso*: `#2B1E16`
  - *Gold Foil Accent*: `#D4AF37`
- **Component Polish**: Subtle inner borders, debossed/embossed card accents, tactile slider controls, and smooth micro-interactions.

---

## 3. Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **2D Canvas**: Paper.js / Fabric.js / SVG DOM manipulation.
- **3D Engine**: Three.js / React Three Fiber for procedural folding animation.
- **Motion Engine**: GSAP (Timeline, ScrollTrigger, Flip) for smooth 60fps folding and scroll unboxing.
- **Backend / DB**: PostgreSQL with Prisma / Supabase schema, Cloud S3 asset storage.
- **Vector Export**: Headless PDFKit / SVG-to-PDF vector generation in CMYK 300 DPI.
