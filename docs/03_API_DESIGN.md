# 🌐 THIẾT KẾ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API DESIGN)

> **Base URL (Local)**: `http://localhost:8080/api`  
> **Tài liệu tương tác (Swagger)**: `http://localhost:8080/api/docs` — luôn khớp với code đang chạy.  
> **Toàn bộ danh sách endpoint theo kế hoạch** (kèm Controller, quyền truy cập, Milestone): [`07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md`, Mục 4.2 – 4.3](07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md).

---

## 1. Quy ước chung

- Mặc định **mọi route đều yêu cầu đăng nhập**. Route công khai được đánh dấu `@Public()` trong code.
- Xác thực bằng **HttpOnly Cookie** `wf_access` (path `/api`, 15 phút) và `wf_refresh` (path `/api/auth`, 7 ngày), `SameSite=Lax`. Token không bao giờ xuất hiện trong body. FE gọi thẳng cổng 8080 phải dùng `fetch(..., { credentials: 'include' })`. Chi tiết: [`be/README.md`](../be/README.md#xác-thực-bằng-httponly-cookie).
- Phân trang: `?page=1&limit=20` → `{ "items": [...], "meta": { "total", "page", "limit", "totalPages" } }`.
- Định dạng lỗi thống nhất:

```json
{ "statusCode": 401, "error": "Unauthorized", "message": "Unauthorized", "path": "/api/users/me", "timestamp": "2026-10-02T00:00:00.000Z" }
```

---

## 2. Endpoints đã triển khai

| Method | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Trạng thái server + kết nối CSDL |
| `POST` | `/api/auth/register` | Public | Đăng ký (`email`, `password`, `fullName`) → đặt cookie đăng nhập |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng email & mật khẩu → đặt cookie đăng nhập |
| `POST` | `/api/auth/refresh` | Public (cookie `wf_refresh`) | Xoay vòng refresh token, cấp access token mới |
| `POST` | `/api/auth/logout` | Public | Thu hồi phiên hiện tại, xoá cookie |
| `GET` | `/api/auth/google?redirect=/p/abc` | Public | Bắt đầu đăng nhập Google (điều hướng trình duyệt) |
| `GET` | `/api/auth/google/callback` | Public | Google gọi lại → đặt cookie → chuyển về frontend |
| `POST` | `/api/auth/logout-all` | Đã đăng nhập | Đăng xuất mọi thiết bị |
| `GET` · `PATCH` | `/api/users/me` | Đã đăng nhập | Xem / sửa hồ sơ (`fullName`, `shopName`, `avatarUrl`) |
| `GET` | `/api/users` · `/api/users/:id` | ADMIN | Danh sách (phân trang) / chi tiết người dùng |
| `PATCH` · `DELETE` | `/api/users/:id` | ADMIN | Đổi role, khóa/mở khóa / xóa người dùng |
| `POST` | `/api/projects` | Đã đăng nhập | Tạo dự án từ mẫu hộp (`templateId`, `title`, `dimensions`, tùy chọn `materialSpec`, `canvasState`, `collectionId`, `tags`) |
| `GET` | `/api/projects?status=ACTIVE&collectionId=…&q=…&sortBy=updatedAt&order=desc&page=1&limit=20` | Đã đăng nhập | Dự án của tôi (không kèm `canvasState`). `collectionId=none` = chưa thuộc thư mục nào; `q` tìm trong tiêu đề hoặc đúng 1 tag |
| `GET` · `PATCH` | `/api/projects/:id` | Chủ dự án | Xem đầy đủ / sửa `title`, `dimensions`, `materialSpec`, `canvasState`, `collectionId`, `thumbnailUrl`, `tags` |
| `DELETE` | `/api/projects/:id` | Chủ dự án | Xóa vĩnh viễn — chỉ khi dự án đang ở thùng rác (`status = DELETED`), nếu không trả `409` |
| `PATCH` | `/api/projects/:id/status` | Chủ dự án | `{ "status": "ARCHIVED" \| "DELETED" \| "ACTIVE" }` — lưu trữ / chuyển vào thùng rác / khôi phục |
| `POST` | `/api/projects/:id/duplicate` | Chủ dự án | Nhân bản thành dự án mới `[Bản sao] <tên>` (201) |
| `GET` · `POST` | `/api/projects/:id/snapshots` | Chủ dự án | Lịch sử phiên bản (mới nhất trước, không kèm canvas) / lưu mốc `{ "name", "previewUrl"? }` |
| `POST` | `/api/projects/:id/snapshots/:snapshotId/restore` | Chủ dự án | Khôi phục mốc → `{ project, backup }` |
| `DELETE` | `/api/projects/:id/snapshots/:snapshotId` | Chủ dự án | Xóa một mốc (204) |
| `PATCH` | `/api/projects/:id/visibility` | Chủ dự án | `{ "visibility"?: "PRIVATE" \| "UNLISTED" \| "PUBLIC", "allowFork"?: boolean }` — chia sẻ & cho phép Remix |
| `GET` | `/api/public/projects/:slug` | Public (nhận diện người xem nếu có cookie) | Trang xem 3D `/p/[slug]` / iframe nhúng; tăng `viewsCount` |
| `POST` | `/api/public/projects/:slug/fork` | Đã đăng nhập | Remix về tài khoản của tôi (201, trả dự án mới) |
| `POST` · `DELETE` | `/api/public/projects/:slug/like` | Đã đăng nhập | Thả tim / bỏ thả tim → `{ liked, likesCount }` |
| `GET` | `/api/templates/structures` | Public | 4 cấu trúc hộp + `dimensionLimits` (min/max từng kích thước) |
| `GET` | `/api/templates/hub?section=curated&structure=&occasion=&industry=&material=&q=&page=&limit=` | Public | Thư viện mẫu: `curated` (mẫu WrapFit) hoặc `community` (dự án PUBLIC, nhiều tim trước), phân trang |
| `GET` | `/api/templates/:id` | Public | Mẫu Curated kèm `canvasState` + `dimensionLimits` để "Dùng mẫu này" |
| `POST` | `/api/storage/presigned-upload` | Đã đăng nhập | `{ purpose, contentType, size, projectId? }` → `{ uploadUrl, headers, fileUrl, ... }` để FE upload thẳng lên S3 / R2 |
| `GET` | `/api/storage/usage` | Đã đăng nhập | `{ tier, usedBytes, quotaBytes, fileCount }` |
| `POST` | `/api/ai/pattern` | Đã đăng nhập | `{ theme, preferredColors? }` → `{ source, themeName, description, palette, tile: { size, svg }, usage }` |
| `GET` | `/api/ai/usage` | Đã đăng nhập | `{ tier, used, limit, aiEnabled }` — lượt AI trong 24 giờ qua |
| `GET` · `POST` · `DELETE` | `/api/projects/:id/unboxing` | Chủ dự án | Xem / tạo hoặc thay cấu hình mở hộp `{ recipientName, giftNote, audioTrackUrl?, particleEffect? }` (201 lần đầu, 200 khi thay) / xóa kèm file QR |
| `GET` | `/api/projects/:id/unboxing/qr?format=png\|svg` | Chủ dự án | Tải mã QR (PNG 1200 px hoặc SVG), sinh trực tiếp |
| `GET` | `/api/public/unboxing/:slug` | Public | Dữ liệu trang mở hộp khi quét QR; tăng `viewsCount` |
| `POST` | `/api/projects/:id/exports` | Chủ dự án | `{ fileType: "PDF_CMYK" \| "SVG" \| "DXF" }` → `202 { jobId, status, fitCheck }`; FitCheck lỗi → `422` |
| `GET` | `/api/projects/:id/exports` | Chủ dự án | 20 lần xuất gần nhất |
| `GET` | `/api/exports/:jobId` | Chủ dự án | `{ status, error, fileName, downloadUrl, downloadExpiresIn }` — link tải hết hạn sau 15 phút |
| `GET` · `POST` | `/api/collections` | Đã đăng nhập | Thư mục của tôi (mảng, sửa gần nhất trước, kèm `projectCount`) / tạo `{ title, description?, colorTag? }` |
| `GET` · `PATCH` · `DELETE` | `/api/collections/:id` | Chủ thư mục | Xem / sửa (`null` xóa `description`) / xóa thư mục — dự án bên trong được giữ lại, chuyển thành "chưa phân loại" |

### Ví dụ: `POST /api/auth/login`

```json
// Request
{ "email": "admin@wrapfit.vn", "password": "Admin@12345" }

// Response 200 — kèm header Set-Cookie: wf_access=…; Path=/api; HttpOnly; SameSite=Lax
//                                 Set-Cookie: wf_refresh=…; Path=/api/auth; HttpOnly; SameSite=Lax
{
  "user": { "id": "…", "email": "admin@wrapfit.vn", "fullName": "WrapFit Admin", "role": "ADMIN", "subscriptionTier": "PRO_BUSINESS", "isActive": true },
  "expiresIn": 900
}
```

### Dự án: quy tắc chính (IT3-03)

- **Quyền sở hữu**: `ProjectOwnerGuard` trả `404 Project not found` cho cả dự án không tồn tại lẫn dự án của người khác (không để lộ id nào có thật). Id sai định dạng trả `400`.
- **Kích thước**: kiểm tra theo `formula_schema.params` của mẫu hộp (vd. tuck-top: L ≥ 40, W ≥ 30, H ≥ 20, tối đa 600 mm). `paperThickness` bỏ trống thì lấy `materialSpec.caliper`.
- **Mặc định khi tạo**: `materialSpec = { type: "ivory", gsm: 300, caliper: 0.35, finish: "matte" }`, `canvasState = { elements: [] }`.
- **`canvasState`** phải đúng kiểu `CanvasElement` của `@wrapfit/shared` (tối đa 300 phần tử, ảnh là URL đã upload chứ không nhúng base64). Body JSON tối đa 1 MB.
- **Tags** được lưu dạng chữ thường, bỏ khoảng trắng và trùng lặp (tối đa 10 tag × 30 ký tự).
- `PATCH` chỉ đổi những trường được gửi; `null` xóa `collectionId` / `thumbnailUrl`. Không đổi được `templateId`. Dự án trong thùng rác không sửa được (`409`) cho tới khi khôi phục.

### Chia sẻ công khai, Remix & thả tim (IT3-06)

- **Ai xem được `/api/public/projects/:slug`**: dự án `UNLISTED` hoặc `PUBLIC` và không nằm trong thùng rác (dự án `ARCHIVED` vẫn giữ link chia sẻ). Mọi trường hợp khác, kể cả slug sai định dạng, trả `404` — chủ dự án cũng nhận `404` cho dự án `PRIVATE` (trang công khai hiển thị đúng như người ngoài thấy; chủ dự án dùng `GET /api/projects/:id`).
- **Dữ liệu trả về** không có `id`, `userId`, email, thư mục, FitCheck: chỉ `slug`, `title`, `visibility`, `allowFork`, `template`, `dimensions`, `materialSpec`, `canvasState`, `thumbnailUrl`, `tags`, `viewsCount`, `likesCount`, `author { fullName, shopName, avatarUrl }`, `forkedFrom` và `viewer { isOwner, liked }`.
- **Người xem đã đăng nhập** được nhận diện qua cookie (`@OptionalAuth()`); token sai / hết hạn → coi như khách, không trả `401`.
- **Lượt xem**: mỗi lần tải trang +1, trừ khi chính chủ xem. Bộ đếm view/like không làm đổi `updatedAt` (không xáo trộn Dashboard của chủ dự án).
- **`forkedFrom`** (ghi công tác giả gốc) chỉ hiện khi dự án gốc đang `PUBLIC`; gốc `UNLISTED` → `null` để không lộ link bí mật.
- **Remix**: chép thiết kế (giữ nguyên tên) vào tài khoản người bấm, ngoài mọi thư mục, `PRIVATE`, lưu `forkedFromId`. `allowFork = false` → `403` (riêng chủ dự án vẫn tự sao chép được). Phát sự kiện nội bộ `project.forked` `{ sourceProjectId, sourceOwnerId, forkProjectId, forkedById }` cho NotificationsModule sau này (không phát khi tự remix).
- **Thả tim**: gọi lại nhiều lần vẫn chỉ tính 1 (`@@unique([userId, projectId])`); trả `{ liked, likesCount }`.
- FE: trang `UNLISTED` nên gắn `<meta name="robots" content="noindex">`.

### Xuất file in (IT3-11)

- Luồng: `POST .../exports` → backend chạy lại FitCheck (lưu vào `fitcheckState` của dự án; vi phạm mức `error` → `422` kèm `fitCheck`) → tạo `ExportJob` `PENDING` và đẩy vào hàng đợi BullMQ (Redis) → `202 { jobId }`. Process `worker` riêng xuất file, tải lên storage → `COMPLETED` (+ tự tạo mốc phiên bản "Bản xuất in ..."). FE hỏi `GET /api/exports/:jobId` mỗi 2 giây.
- `status`: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`. Lỗi được thử lại 3 lần; chỉ lần cuối mới thành `FAILED` (kèm `error`).
- File: `PDF_CMYK` (xưởng in, kích thước thật, màu CMYK, font tiếng Việt nhúng sẵn), `SVG` (Cricut / laser, có lớp), `DXF` (máy bế CNC, mm). Chi tiết & giới hạn hiện tại (chưa có đường cắt bao ngoài từ `@wrapfit/shared`): [`be/README.md`](../be/README.md#xuất-file-in-bullmq).
- Chưa cấu hình storage → `503`; Redis không chạy → `503` (job được đánh dấu `FAILED`). Tối đa 10 yêu cầu xuất / phút.
- Lỗi `4xx` có thể kèm trường bổ sung ngoài `statusCode / error / message / path / timestamp` (vd. `fitCheck`).

### Mở hộp 3D & QR (IT3-10)

- Mỗi dự án có tối đa 1 trải nghiệm mở hộp. `slug` (12 ký tự ngẫu nhiên) được tạo một lần và **không đổi** khi sửa lời chúc, vì mã QR có thể đã được in.
- Mã QR trỏ tới `FRONTEND_URL/unbox/<slug>` (trang Next.js `fe/src/app/unbox/[slug]`), mức sửa lỗi **H** (chịu được trầy xước, nếp gấp) và lề 4 ô chuẩn. Mỗi lần lưu, backend sinh lại PNG 1200 px (~10 cm ở 300 DPI) và SVG (cho file in vector), lưu lên storage: `qrCodeUrl` (PNG), `qrCodeSvgUrl` (SVG). Chưa cấu hình storage thì hai URL là `null`, vẫn tải được qua `GET .../unboxing/qr`.
- File QR được tính vào dung lượng của chủ dự án và bị xóa khi xóa trải nghiệm hoặc xóa vĩnh viễn dự án.
- `particleEffect`: `confetti` (mặc định), `fireworks`, `hearts`, `petals`, `snow`, `none`. `audioTrackUrl` phải là `https`.
- **Trang công khai** hoạt động cả khi thiết kế đang `PRIVATE` (slug chính là "chìa khóa" cho người nhận), trả `recipientName`, `giftNote`, `audioTrackUrl`, `particleEffect`, `viewsCount`, `sender { fullName, shopName, avatarUrl }` và `box` (tiêu đề, cấu trúc, kích thước, chất liệu, canvas, thumbnail) — không có id, email. Dự án trong thùng rác → `404` (và không tạo / sửa được: `409`).

### AI sinh hoa văn (IT3-09)

- Trả bảng màu (3–8 màu `#RRGGBB`) và một ô hoa văn SVG **lặp liền mạch** (`tile.svg`, cạnh `tile.size` px) — FE dùng làm nền lặp trên mặt hộp.
- Claude chỉ trả dữ liệu hình (structured outputs); backend kiểm tra rồi tự dựng SVG, nên SVG trả về không chứa script / link / tài nguyên ngoài.
- `source: "ai"` khi Claude sinh; `"procedural"` khi chưa cấu hình AI hoặc AI lỗi (luôn có kết quả, không trả lỗi cho người dùng).
- Giới hạn lượt AI trong 24 giờ theo gói: FREE 10, STARTER 50, PRO_BUSINESS 300 → hết trả `429`. Tối đa 5 yêu cầu / phút.
- `theme` ≤ 200 ký tự; `preferredColors` tối đa 5 màu thương hiệu.

### Lưu trữ file (IT3-08)

- FE xin URL rồi `PUT` file thẳng lên bucket (backend không nhận byte file). Chữ ký khóa đúng `Content-Type` và `Content-Length` đã khai báo: gửi file khác dung lượng / khác định dạng → bucket trả `403`. URL hết hạn sau 5 phút. Ví dụ code: [`be/README.md`](../be/README.md#lưu-trữ-file-s3--cloudflare-r2).
- `purpose`: `LOGO` (PNG/JPEG/WebP/SVG/PDF, ≤ 15 MB), `IMAGE` (PNG/JPEG/WebP, ≤ 15 MB), `THUMBNAIL` / `AVATAR` (PNG/JPEG/WebP, ≤ 2 MB). Sai định dạng → `400`; quá dung lượng → `413`.
- Hạn mức theo gói: FREE 100 MB, STARTER 1 GB, PRO_BUSINESS 10 GB, tính từ lúc cấp URL. Vượt → `403`.
- `projectId` (tùy chọn) gắn file vào dự án của mình (không được ở thùng rác): file bị xóa khỏi bucket khi dự án bị xóa vĩnh viễn hoặc bị cron dọn thùng rác.
- Chưa cấu hình storage (`STORAGE_BUCKET` trống) → `503`.

### Thư viện mẫu (IT3-07)

- **Hai phân khu**: `section=curated` — bảng `design_templates` (mẫu WrapFit dựng sẵn, sắp theo `sortOrder`); `section=community` — dự án `PUBLIC` đang `ACTIVE` (không tính lưu trữ / thùng rác), sắp theo lượt tim rồi lượt xem. FE gọi 2 lần để hiển thị 2 phân khu.
- **Bộ lọc dùng chung**: `structure` (`tuck-top`…), `occasion` (`TET`, `CHRISTMAS`, `WEDDING`, `VALENTINE`, `BIRTHDAY`, `MINIMAL`), `industry` (`COSMETICS`, `CANDLES`, `BAKERY`, `JEWELRY`, `TEA_AGRI`), `material` (`ivory`, `kraft`, `duplex`), `q` (tiêu đề hoặc đúng 1 tag). FE hiển thị nhãn tiếng Việt.
- **Thẻ mẫu**: Curated có `id`; Community có `slug` (mở bằng trang công khai), `author`, `likesCount`, `viewsCount`. `usesCount` = số lần "Dùng mẫu này" (Curated) hoặc số lần được Remix (Community). Không trả `canvasState` trong danh sách.
- **Cache**: phản hồi `/api/templates/*` được cache trong bộ nhớ 60 giây theo URL — số tim / lượt dùng có thể trễ tối đa 1 phút.
- **"Dùng mẫu này" (UC-13)**: `POST /api/projects { templateId: <structure của mẫu>, designTemplateId, title, dimensions, canvasState? }`. Bỏ trống `materialSpec` / `canvasState` thì lấy từ mẫu; khi người dùng nhập kích thước món quà, FE co giãn đồ họa bằng `@wrapfit/shared` rồi gửi `canvasState` đã co giãn. `templateId` khác cấu trúc của mẫu → `400`. Mỗi lần tạo tăng `usesCount`.
- **Đưa dự án lên mẫu cộng đồng (UC-14)**: đặt `visibility: PUBLIC` và gắn `occasion` / `industry` qua `PATCH /api/projects/:id`. Kiểm duyệt FitCheck ≥ 90 trước khi lên Thư viện chưa làm (cần FitCheck chạy phía server).
- Mẫu Curated hiện được quản lý bằng seed (`be/prisma/seed.ts`, 6 mẫu) / Prisma Studio; chưa có API quản trị.

### Bộ sưu tập (IT3-05)

- Chỉ thấy và sửa được thư mục của chính mình; thư mục của người khác trả `404`. Tối đa 100 thư mục / người (`409`).
- `colorTag` dạng `#RRGGBB`, mặc định `#D4A373` (kraft). `title` ≤ 100 ký tự, `description` ≤ 500 (dùng để ghi chú thời hạn chiến dịch).
- `projectCount` không tính dự án trong thùng rác.
- Đưa dự án vào / ra thư mục (kéo thả): `PATCH /api/projects/:id { "collectionId": "<id>" | null }`. Xem dự án trong thư mục: `GET /api/projects?collectionId=<id>`.

### Dự án: vòng đời, nhân bản & phiên bản (IT3-04)

- **Trạng thái**: chuyển tự do giữa `ACTIVE`, `ARCHIVED`, `DELETED`. Vào thùng rác thì ghi `deletedAt`; rời thùng rác thì xóa `deletedAt`. Gửi lại đúng trạng thái hiện tại không thay đổi gì (không đặt lại `deletedAt`).
- **Thùng rác 30 ngày**: cron `trash-purge` chạy 02:00 (giờ Việt Nam) mỗi ngày, xóa vĩnh viễn dự án có `deletedAt` quá 30 ngày cùng snapshot, like, export… (cascade) và các file đã gắn `projectId` trên S3 / R2 (theo lô 500 dự án mỗi lần chạy). Hạn xóa = `deletedAt + 30 ngày` (FE tự tính để hiển thị).
- **Dự án trong thùng rác chỉ đọc**: sửa, nhân bản, lưu hay khôi phục mốc phiên bản đều trả `409` cho tới khi khôi phục dự án.
- **Nhân bản**: chép `template`, `dimensions`, `materialSpec`, `canvasState`, thư mục và tags; bản sao luôn `ACTIVE`, `PRIVATE`, có `id`/`slug` mới, **không** chép `thumbnailUrl` (file thuộc dự án gốc) và không đặt `forkedFromId` (chỉ dùng cho Remix).
- **Mốc phiên bản**: lưu `canvasState` + `dimensions` hiện tại, tối đa 50 mốc thủ công mỗi dự án (`409` khi đầy — xóa bớt mốc cũ). Khôi phục chạy trong 1 transaction: lưu trạng thái hiện tại thành mốc `Trước khi khôi phục: <tên>` rồi chép mốc đã chọn vào dự án; FE dùng `backup.id` để "Hoàn tác". Mốc của dự án khác trả `404`.

```json
// POST /api/projects
{ "templateId": "tuck-top", "title": "Hộp nến thơm", "dimensions": { "length": 120, "width": 80, "height": 60 }, "tags": ["tet"] }

// 400 khi kích thước ngoài khoảng của mẫu
{ "statusCode": 400, "error": "Bad Request", "message": ["dimensions.length must not be less than 40"], "path": "/api/projects", "timestamp": "…" }
```

---

## 3. Endpoints sắp triển khai (theo WBS IT 3)

| Nhóm | Endpoint chính | Task |
| :--- | :--- | :--- |
