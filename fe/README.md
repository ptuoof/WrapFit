# 🖥️ @wrapfit/frontend — 2D & 3D Packaging Design Studio

> **Phụ trách chính**: 👤 **IT 1** (Frontend Lead & 2D/3D Packaging Studio)  
> **Tech Stack**: Next.js 14 (App Router), React Three Fiber / Three.js, GSAP 3, Tailwind CSS, Lucide Icons.

---

## Cấu trúc thư mục `fe/`:

Theo mẫu [Windaroundd/react-structure](https://github.com/Windaroundd/react-structure), chỉnh cho Next.js App Router:
`src/pages/` của mẫu đổi thành `src/views/` (Next.js dành tên `pages/` cho Pages Router), còn `src/app/` chỉ giữ routing.

```text
fe/
├── src/
│   ├── app/                    # Next.js App Router: CHỈ routing — page.tsx mỏng, metadata, layout.tsx
│   ├── views/                  # (≈ pages/ của mẫu) UI từng màn hình, cùng cây thư mục với route
│   │   ├── home/               #   /               Landing page
│   │   ├── editor/studio/      #   /editor/[id]    Studio 2D + 3D
│   │   ├── unbox/              #   /unbox/[slug]   Trang mở hộp 3D QR
│   │   └── …                   #   admin/, auth/, checkout/, dashboard/… (đa số sinh từ Stitch)
│   ├── api/                    # Hàm gọi endpoint, mỗi module backend một thư mục
│   │   ├── projects/ ai/ exports/ storage/ unboxing/
│   │   ├── auth/ users/ common/
│   │   └── index.ts            #   `apiClient` gom mọi endpoint
│   ├── assets/
│   │   ├── fonts/              # next/font (Playfair, Plus Jakarta Sans, JetBrains Mono)
│   │   ├── styles/             # globals.css + stitch/ (CSS sinh từ Stitch)
│   │   ├── icons/ images/
│   ├── components/             # Component dùng chung, không thuộc tính năng nào
│   │   ├── common/             #   GoiMascot, Button
│   │   ├── layout/             #   BottomNavBar
│   │   ├── modals/             #   MobileBottomSheet
│   │   ├── charts/ forms/
│   ├── config/                 # Biến môi trường (API_BASE_URL)
│   ├── constants/
│   ├── features/               # Code theo tính năng
│   │   ├── studio/             #   components/{canvas,three,fitcheck,copilot}, utils/
│   │   ├── intro/              #   BlueprintIntro
│   │   ├── stitch/             #   runtime + behaviors của màn hình Stitch
│   │   └── auth/ dashboard/ profile/ settings/
│   ├── helpers/
│   ├── hooks/                  # data/ dom/ shared/ ui/
│   ├── layouts/                # main/ (MainLayout dùng trong app/layout.tsx), admin/, auth/
│   ├── services/               # api/ (HTTP client, ApiError), audio/ (tactileAudio), analytics/, storage/
│   ├── store/                  # actions/ reducers/ selectors/ slices/
│   ├── types/                  # api/ (DTO của backend), components/, store/
│   └── utils/                  # animation/ text-layout/ formatting/ helpers/ validation/
├── stitch/                     # Nguồn HTML Stitch (xem docs/11_STITCH_PARITY_AUDIT.md)
├── scripts/stitch/             # Generator `npm run stitch:sync`
├── package.json
└── tailwind.config.ts
```

Quy tắc:
- Route mới: tạo UI trong `src/views/<route>/index.tsx`, rồi `src/app/<route>/page.tsx` chỉ re-export (`export { default } from '@/views/<route>'`).
- Component chỉ một tính năng dùng thì đặt trong `src/features/<tính năng>/components/`; dùng ở nhiều nơi thì đặt trong `src/components/`.
- Thư mục chỉ có `index.ts` rỗng là khung chờ code, giữ theo mẫu.

## Chạy thử nghiệm:

```bash
cd fe
npm install
npm run dev
```
Truy cập `http://localhost:3000` để xem giao diện.
