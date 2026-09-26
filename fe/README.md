# 🖥️ @wrapfit/frontend — 2D & 3D Packaging Design Studio

> **Phụ trách chính**: 👤 **IT 1** (Frontend Lead & 2D/3D Packaging Studio)  
> **Tech Stack**: Next.js 14 (App Router), React Three Fiber / Three.js, GSAP 3, Tailwind CSS, Lucide Icons.

---

## Cấu trúc thư mục `fe/`:

```text
fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing Page 3D (GSAP ScrollTrigger)
│   │   └── editor/[id]/        # Trang Studio biên tập 2D & 3D
│   ├── components/
│   │   ├── canvas/             # Trình biên tập 2D phẳng (Fabric.js / SVG)
│   │   ├── three/              # Sân khấu 3D & hiệu ứng gập hộp (Three.js)
│   │   └── ui/                 # Các component nguyên tử (Buttons, Sliders, Modals)
│   ├── hooks/                  # Custom React hooks (useDieline, use3DFold)
│   └── styles/                 # Tailwind CSS & Fonts
├── package.json
└── tailwind.config.ts
```

## Chạy thử nghiệm:

```bash
cd fe
npm install
npm run dev
```
Truy cập `http://localhost:3000` để xem giao diện.
