# WrapFit Backend (NestJS)

REST API của nền tảng **WrapFit** — thiết kế & đóng gói bao bì quà tặng (tham chiếu Pacdora.com).
Đây là workspace `be/` (`@wrapfit/backend`) trong monorepo WrapFit. Kiến trúc và phân công nhiệm vụ: xem [`docs/07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md`](../docs/07_SYSTEM_BLUEPRINT_AND_TASK_BREAKDOWN.md) và [`docs/08_PACDORA_SYSTEM_CLASS_DIAGRAM_SPECIFICATION.md`](../docs/08_PACDORA_SYSTEM_CLASS_DIAGRAM_SPECIFICATION.md).

- **NestJS 11** theo kiến trúc modular monolith
- **PostgreSQL 16 + Prisma 6** — Schema v2.1 (migration, seed)
- **Auth**: email/mật khẩu + **Google OAuth 2.0**, JWT trong **HttpOnly Cookie** (refresh token xoay vòng, phát hiện dùng lại token, nhiều thiết bị) và **RBAC** theo `Role`
- **WebSocket** (Socket.IO) có xác thực JWT ở bước handshake
- **Swagger/OpenAPI** tại `/api/docs`
- **Validation** (class-validator), kiểm tra biến môi trường khi khởi động, logging request, exception filter thống nhất, rate limit, helmet, CORS
- **Docker**: image build từ gốc repo (`be/Dockerfile`), chạy cùng PostgreSQL + Frontend bằng `docker-compose.yml` ở gốc

## Trạng thái so với WBS (tài liệu 07, Mục 5.3)

| Task | Trạng thái |
| --- | --- |
| IT3-01 Khởi tạo NestJS, hạ tầng chung & Schema v2.1 | ✅ Xong (Redis thêm ở IT3-11) |
| IT3-02 Auth Google & JWT | ✅ Xong: email/mật khẩu, Google OAuth, HttpOnly Cookie, refresh token xoay vòng, RBAC, rate limit |
| IT3-03 API CRUD dự án, lọc trạng thái & thư mục | ✅ Xong: tạo / danh sách (lọc `status`, `collectionId`, tìm `q`, sắp xếp, phân trang) / xem / sửa / xóa vĩnh viễn, `ProjectOwnerGuard` |
| IT3-04 Trạng thái, nhân bản & snapshot | ✅ Xong: lưu trữ / thùng rác / khôi phục, nhân bản, lịch sử phiên bản (tạo, khôi phục kèm bản lưu dự phòng, xóa), cron 02:00 dọn thùng rác quá 30 ngày (kèm file trên S3/R2 từ IT3-08) |
| IT3-05 Bộ sưu tập (collections) | ✅ Xong: CRUD `/api/collections`, màu `#RRGGBB`, đếm dự án (không tính thùng rác), xóa thư mục giữ lại dự án |
| IT3-06 Public Showcase & Remix | ✅ Xong: quyền riêng tư `PRIVATE/UNLISTED/PUBLIC` + `allowFork`, trang công khai theo slug (đếm view), Remix (fork + sự kiện `project.forked`), thả tim |
| IT3-07 Thư viện mẫu | ✅ Xong: `/api/templates/structures`, `/hub` (Curated + Community, lọc cấu trúc / dịp lễ / ngành hàng / giấy / từ khóa, cache 60 s), `/:id`; tạo dự án từ mẫu (`designTemplateId`); bảng `design_templates` + 6 mẫu seed |
| IT3-08 Lưu trữ file S3 / R2 | ✅ Xong: pre-signed upload (khóa định dạng + dung lượng), hạn mức theo gói, xóa file khi xóa dự án / dọn thùng rác; SeaweedFS local thay MinIO (chưa có `sharp`) |
| IT3-09 AI sinh hoa văn | ✅ Xong: `/api/ai/pattern` (Claude + structured outputs, SVG dựng & làm sạch phía server, lặp liền mạch), giới hạn lượt theo gói, dự phòng sinh hoa văn bằng thuật toán khi chưa có API key |
| IT3-10 Mở hộp 3D & QR | ✅ Xong: cấu hình lời chúc / nhạc / hiệu ứng, QR (PNG 1200 px + SVG, sửa lỗi mức H) lưu lên storage và tải trực tiếp, trang công khai `/api/public/unboxing/:slug` |
| IT3-11 Xuất file in & CI/CD | ✅ Xong: `/api/projects/:id/exports` (FitCheck phía server → BullMQ), process `worker` riêng xuất PDF CMYK / SVG / DXF, thử lại 3 lần, link tải 15 phút, snapshot tự động; CI chạy unit + e2e; deploy VPS qua HTTPS (Caddy) |

## Cấu trúc thư mục

```
prisma/
  schema.prisma            # Schema v2.1: users, packaging_projects, box_templates, collections, snapshots...
  migrations/              # SQL migration
  seed.ts                  # admin + 4 mẫu hộp (tuck-top, sleeve-drawer, lid-base, pillow) + collection/dự án mẫu
src/
  main.ts                  # khởi động API (HTTP)
  worker.ts                # khởi động worker BullMQ (không mở cổng HTTP)
  app.setup.ts             # cấu hình dùng chung (prefix /api, pipe, CORS, helmet)
  swagger.setup.ts
  app.module.ts            # ghép module + guard/filter/interceptor toàn cục
  config/                  # validate biến môi trường
  prisma/                  # PrismaModule (global) + PrismaService
  common/                  # decorators, guards, filters, interceptors, dto, adapters
  modules/
    auth/                  # register, login, refresh, logout
    users/                 # hồ sơ cá nhân + quản trị user (ADMIN)
    projects/              # CRUD dự án, 4 tầng: presentation / application / domain / infrastructure
    collections/           # thư mục dự án (CRUD gọn: controller -> service -> Prisma)
    public-showcase/       # trang công khai /p/[slug], Remix (fork), thả tim
    templates/             # Thư viện mẫu Curated & Community (cache 60 s)
    storage/               # @Global: pre-signed upload lên S3 / R2, hạn mức, xóa file
    ai/                    # sinh bảng màu + hoa văn SVG (Claude hoặc thuật toán dự phòng)
    unboxing/              # trải nghiệm mở hộp 3D + mã QR in đáy hộp
    export/                # xuất file in: API (hàng đợi) + ExportProcessor (worker) + rendering/
    events/                # WebSocket gateway (thông báo realtime)
    health/                # GET /api/health
test/                      # e2e test
```

## Chạy nhanh (local)

Yêu cầu: Node.js >= 20, Docker. Các lệnh dưới đây chạy **tại gốc repo** (`WrapFit/`).

```bash
npm install                                  # cài toàn bộ workspace (fe, be, shared)
docker compose up -d postgres                # chỉ chạy database (postgres / password, db: wrapfit)
docker compose up -d seaweedfs storage-init  # lưu trữ file S3 local (cổng 8333, bucket wrapfit)
docker compose up -d redis                   # hàng đợi BullMQ (xuất file in)
cp be/.env.example be/.env                   # nhớ đổi JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
npm --workspace=be run db:generate
npm --workspace=be run db:migrate            # áp dụng migration vào database dev
npm --workspace=be run db:seed               # tạo 4 mẫu hộp + admin: admin@wrapfit.vn / Admin@12345 + dữ liệu mẫu
npm run dev:be                               # = npm --workspace=be run dev (watch mode)
npm --workspace=be run dev:worker           # terminal thứ 2: worker xuất file in
```

Hoặc `cd be` rồi dùng trực tiếp `npm run <script>`.

- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/docs`
- Health: `http://localhost:8080/api/health`

> **Vì sao cổng 8080?** Next.js (frontend) dùng cổng 3000. Trên Windows, Hyper-V/WSL thường giữ chỗ các dải cổng quanh 3500–5000 (ví dụ 4000 sẽ báo `EACCES`). Kiểm tra bằng `netsh interface ipv4 show excludedportrange protocol=tcp` nếu cần đổi cổng.

## Chạy toàn bộ bằng Docker

```bash
# tại gốc repo
cp .env.example .env            # điền JWT_ACCESS_SECRET / JWT_REFRESH_SECRET trước khi chạy
docker compose up -d --build
```

Container backend tự chạy `prisma migrate deploy` và seed 4 mẫu hộp rồi mới khởi động server. Ở production, admin chỉ được tạo khi đặt `SEED_ADMIN_PASSWORD`.

Stack gồm: `postgres`, `redis`, `seaweedfs` (+ `storage-init` tạo bucket), `backend` (API), `worker` (cùng image, lệnh `worker`, chỉ chạy hàng đợi xuất file), `frontend`.

## Biến môi trường

Xem `.env.example`. Ứng dụng sẽ **từ chối khởi động** nếu thiếu `DATABASE_URL` hoặc secret JWT ngắn hơn 32 ký tự.

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `PORT` | `8080` | Cổng server |
| `DATABASE_URL` | – | Chuỗi kết nối PostgreSQL (database `wrapfit`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | – | Secret ký token (>= 32 ký tự, hai giá trị khác nhau) |
| `JWT_ACCESS_TTL_SECONDS` | `900` | Thời hạn access token (15 phút) |
| `JWT_REFRESH_TTL_SECONDS` | `604800` | Thời hạn refresh token (7 ngày) |
| `BCRYPT_ROUNDS` | `10` | Độ khó băm mật khẩu |
| `CORS_ORIGINS` | `*` | Danh sách origin, ngăn cách bằng dấu phẩy. Phải là origin cụ thể (vd. `http://localhost:3000`) để trình duyệt gửi cookie |
| `FRONTEND_URL` | `http://localhost:3000` | Trang frontend mà trình duyệt quay về sau khi đăng nhập Google |
| `COOKIE_SECURE` | *(tự động)* | `Secure` cho cookie đăng nhập; trống = bật khi `NODE_ENV=production` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | *(trống)* | Google OAuth; để trống cả hai = tắt đăng nhập Google |
| `GOOGLE_CALLBACK_URL` | `http://localhost:8080/api/auth/google/callback` | Phải nằm trong *Authorized redirect URIs* của OAuth client |
| `SWAGGER_ENABLED` | `true` | Bật/tắt `/api/docs` |
| `THROTTLE_TTL_SECONDS` / `THROTTLE_LIMIT` | `60` / `100` | Rate limit mặc định (theo IP) |
| `STORAGE_BUCKET` | *(trống)* | Bucket S3 / R2; để trống = tắt upload (API trả `503`) |
| `STORAGE_ENDPOINT` | *(trống)* | R2: `https://<account-id>.r2.cloudflarestorage.com`; SeaweedFS local: `http://localhost:8333`; AWS S3: để trống |
| `STORAGE_PUBLIC_ENDPOINT` | *(= `STORAGE_ENDPOINT`)* | Địa chỉ ghi vào pre-signed URL khi trình duyệt truy cập storage bằng địa chỉ khác backend (Docker) |
| `STORAGE_REGION` | `auto` | `auto` cho R2, `us-east-1` cho SeaweedFS |
| `STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY` | – | Khóa API của bucket (R2: *R2 API Token*) |
| `STORAGE_PUBLIC_URL` | – | URL công khai để đọc file, vd. `https://cdn.wrapfit.vn` hoặc `http://localhost:8333/wrapfit` |
| `STORAGE_FORCE_PATH_STYLE` | `false` | `true` cho SeaweedFS |
| `ANTHROPIC_API_KEY` | *(trống)* | Khóa Claude API cho `/api/ai/pattern`; để trống = chỉ dùng hoa văn sinh bằng thuật toán (miễn phí) |
| `AI_MODEL` | `claude-opus-5-5` | Model Claude dùng để sinh hoa văn |
| `AI_TIMEOUT_MS` | `30000` | Thời gian chờ tối đa mỗi lần gọi Claude |
| `REDIS_URL` | `redis://localhost:6379` | Redis cho hàng đợi BullMQ (`rediss://` = TLS) |
| `EXPORT_CONCURRENCY` | `2` | Số job xuất file một worker chạy song song |
| `TRUST_PROXY` | `false` | `true` khi chạy sau reverse proxy (Caddy) |

## API hiện có

Mặc định mọi route đều yêu cầu đăng nhập (trừ những route ghi `public`). Xem đầy đủ và thử trực tiếp tại Swagger `/api/docs`.

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Đăng ký (`email`, `password`, `fullName`) → đặt cookie đăng nhập |
| POST | `/api/auth/login` | public | Đăng nhập email & mật khẩu → đặt cookie đăng nhập |
| POST | `/api/auth/refresh` | public (cần cookie `wf_refresh`) | Xoay vòng refresh token, cấp access token mới |
| POST | `/api/auth/logout` | public | Thu hồi phiên hiện tại, xoá cookie |
| POST | `/api/auth/logout-all` | đã đăng nhập | Đăng xuất mọi thiết bị |
| GET | `/api/auth/google?redirect=/p/abc` | public | Bắt đầu "Đăng nhập bằng Google" (điều hướng trình duyệt, không gọi bằng fetch) |
| GET | `/api/auth/google/callback` | public | Google gọi lại → đặt cookie → chuyển về `FRONTEND_URL + redirect` |
| GET/PATCH | `/api/users/me` | đã đăng nhập | Xem / sửa hồ sơ (`fullName`, `shopName`, `avatarUrl`) |
| GET | `/api/users`, `/api/users/:id` | ADMIN | Danh sách (phân trang) / chi tiết user |
| PATCH | `/api/users/:id` | ADMIN | Đổi role, khoá/mở khoá tài khoản |
| DELETE | `/api/users/:id` | ADMIN | Xoá user |
| GET | `/api/health` | public | Kiểm tra server + database |

Định dạng lỗi thống nhất (tài liệu 07, Mục 4.3):

```json
{ "statusCode": 401, "error": "Unauthorized", "message": "Unauthorized", "path": "/api/users/me", "timestamp": "..." }
```

## Xác thực bằng HttpOnly Cookie

Token **không bao giờ** nằm trong body response hay `localStorage`. Backend đặt 2 cookie `HttpOnly; SameSite=Lax` (thêm `Secure` ở production):

| Cookie | Path | Thời hạn | Vai trò |
| --- | --- | --- | --- |
| `wf_access` | `/api` | 15 phút | Access token, gửi kèm mọi request API và kết nối WebSocket |
| `wf_refresh` | `/api/auth` | 7 ngày | Refresh token, chỉ gửi tới `refresh` / `logout` |

Response của `register` / `login` / `refresh` chỉ gồm `{ user, expiresIn }`.

### Gọi API từ frontend (Next.js)

```ts
// Gọi thẳng cổng 8080 (cross-origin): bắt buộc credentials: 'include' và CORS_ORIGINS chứa origin của FE.
// Nếu dùng Next.js rewrites /api/* → backend (same-origin, khuyến nghị trong docs/07 Mục 1.2) thì cookie tự gửi.
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { credentials: 'include' });

if (res.status === 401) {
  // Access token hết hạn: xin token mới rồi thử lại 1 lần; nếu refresh cũng 401 → chuyển tới trang đăng nhập.
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
}
```

- Server Component (RSC) gọi API phải tự chuyển tiếp cookie: `headers: { cookie: cookies().toString() }`.
- Nút "Đăng nhập bằng Google" là **link điều hướng**: `window.location.href = '/api/auth/google?redirect=/p/abc'`.
- Khi đăng nhập Google thất bại, trình duyệt quay về `FRONTEND_URL/login?error=google_auth_failed` (hoặc `google_account_rejected` nếu tài khoản bị khoá / email đã gắn với tài khoản Google khác).
- **CSRF**: `SameSite=Lax` chặn cookie trên request POST/PATCH/DELETE từ site khác. Vì vậy route `GET` **không được** thay đổi dữ liệu.
- Tool không phải trình duyệt vẫn có thể gửi `Authorization: Bearer <wf_access>`.

### Luồng token

1. `login` / `register` / Google callback đặt cookie `wf_access` (ngắn hạn) và `wf_refresh` (dài hạn). Mỗi phiên lưu kèm User-Agent và IP.
2. Khi access token hết hạn, gọi `POST /api/auth/refresh` → nhận cặp cookie mới, refresh token cũ bị thu hồi (rotation).
3. Nếu một refresh token đã bị thu hồi mà vẫn bị gửi lại, hệ thống coi là có khả năng bị đánh cắp và thu hồi **toàn bộ** phiên của user đó (cookie trên trình duyệt cũng bị xoá).
4. Mỗi request, `JwtStrategy` kiểm tra lại user trong database nên việc khoá tài khoản hay đổi role có hiệu lực ngay.
5. Tài khoản chỉ đăng nhập bằng Google (`passwordHash = null`) không thể đăng nhập bằng mật khẩu.

### Đăng nhập bằng Google — cách lấy Client ID

Khi `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` để trống, server vẫn chạy bình thường và `/api/auth/google` trả `503`.

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo (hoặc chọn) một project.
2. **APIs & Services → OAuth consent screen**: chọn *External*, điền tên app "WrapFit", email hỗ trợ; ở mục *Test users* thêm email Google của các thành viên trong nhóm (app ở chế độ Testing chỉ cho phép test user đăng nhập).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → loại *Web application*.
4. **Authorized redirect URIs** — thêm đúng các URL sẽ dùng:
   - `http://localhost:8080/api/auth/google/callback` (gọi thẳng backend)
   - `http://localhost:3000/api/auth/google/callback` (nếu FE proxy `/api/*`)
   - URL production, ví dụ `https://wrapfit.vn/api/auth/google/callback`
5. Chép *Client ID* và *Client secret* vào `be/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), đặt `GOOGLE_CALLBACK_URL` trùng với một URI ở bước 4, rồi khởi động lại server.
6. Thử: mở `http://localhost:8080/api/auth/google` trên trình duyệt.

Quy tắc liên kết tài khoản: tìm theo Google ID → nếu chưa có thì gắn Google vào tài khoản có **cùng email đã được Google xác minh** → nếu vẫn chưa có thì tạo tài khoản mới (không mật khẩu, role `MAKER`).

## Lưu trữ file (S3 / Cloudflare R2)

Trình duyệt **upload thẳng lên bucket**, backend chỉ cấp chữ ký. Chữ ký khóa đúng `Content-Type` và dung lượng đã khai báo, nên không thể đổi file sau khi xin URL.

```ts
// 1. Xin URL (cookie đăng nhập đi kèm)
const ticket = await fetch(`${API_URL}/storage/presigned-upload`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ purpose: 'LOGO', contentType: file.type, size: file.size, projectId }),
}).then((r) => r.json());

// 2. Upload trực tiếp (KHÔNG gửi cookie, KHÔNG thêm header nào khác)
await fetch(ticket.uploadUrl, { method: 'PUT', headers: ticket.headers, body: file });

// 3. Dùng ticket.fileUrl trong canvasState / thumbnailUrl / avatarUrl
```

| `purpose` | Định dạng | Tối đa |
| --- | --- | --- |
| `LOGO` | PNG, JPEG, WebP, SVG, PDF | 15 MB |
| `IMAGE` | PNG, JPEG, WebP | 15 MB |
| `THUMBNAIL`, `AVATAR` | PNG, JPEG, WebP | 2 MB |

- Hạn mức theo gói: FREE 100 MB, STARTER 1 GB, PRO_BUSINESS 10 GB (`GET /api/storage/usage`). Vượt → `403`.
- Gửi `projectId` khi file thuộc một dự án (thumbnail, ảnh trên canvas): file bị xóa khỏi bucket khi dự án bị xóa vĩnh viễn hoặc bị cron dọn thùng rác. Nhân bản / Remix dùng chung file với dự án gốc.
- URL upload hết hạn sau 5 phút. Hạn mức được tính ngay khi cấp URL (kể cả khi FE không upload).

**Local**: `docker compose up -d seaweedfs storage-init` chạy [SeaweedFS](https://github.com/seaweedfs/seaweedfs) (Apache 2.0, tương thích S3) ở cổng 8333, khóa dev nằm trong `docker/seaweedfs/s3.json`. MinIO không còn phát hành image Docker bản community nên không dùng.

**Cloudflare R2 (production)**:

1. Cloudflare Dashboard → **R2 Object Storage** → bật R2 (cần thêm thẻ thanh toán, gói miễn phí 10 GB) → **Create bucket** `wrapfit`.
2. Bucket → **Settings** → **Custom Domains** → gắn `cdn.wrapfit.vn` (hoặc bật `r2.dev` chỉ để thử; domain này bị giới hạn tốc độ). Đây là `STORAGE_PUBLIC_URL`.
3. Bucket → **Settings** → **CORS Policy**:

   ```json
   [{ "AllowedOrigins": ["https://wrapfit.vn", "http://localhost:3000"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
   ```

4. **R2** → **Manage R2 API Tokens** → **Create API token**, quyền *Object Read & Write*, chỉ bucket `wrapfit` → lấy *Access Key ID* / *Secret Access Key*. *Account ID* nằm trong endpoint `https://<account-id>.r2.cloudflarestorage.com`.
5. Điền vào `.env`: `STORAGE_ENDPOINT`, `STORAGE_REGION=auto`, `STORAGE_BUCKET=wrapfit`, hai khóa, `STORAGE_PUBLIC_URL`, `STORAGE_FORCE_PATH_STYLE=false`.

## AI sinh hoa văn

`POST /api/ai/pattern { theme, preferredColors? }` trả bảng màu và **một ô hoa văn SVG lặp liền mạch** (`tile.svg`, dùng làm `background-image` hoặc phần tử `pattern` trên canvas).

- **Claude** (`ANTHROPIC_API_KEY` có giá trị): gọi model `AI_MODEL` với *structured outputs* — model chỉ trả **danh sách hình** (tròn, chữ nhật, đường, path) theo JSON schema, không trả SVG. Backend kiểm tra từng giá trị (màu `#RRGGBB`, toạ độ trong ô, `d` chỉ gồm lệnh path và số) rồi tự dựng SVG, nên SVG không thể chứa script, link hay tài nguyên ngoài. Ô được vẽ 9 lần (ô + 8 ô bên cạnh) và cắt theo `viewBox` để hình tràn mép xuất hiện lại ở mép đối diện → lặp không lộ đường nối.
- Request bật `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`): nếu bộ lọc an toàn của model từ chối, Anthropic tự chạy lại trên model dự phòng. Effort `low` vì đây là việc đơn giản. System prompt được cache.
- **Dự phòng**: chưa có API key, hoặc Claude lỗi / hết thời gian / trả kết quả không hợp lệ → dùng bộ sinh hoa văn bằng thuật toán (theo từ khóa Tết, Noel, cưới, Valentine, sinh nhật, tối giản; cùng chủ đề luôn ra cùng hoa văn). Trường `source` cho biết `ai` hay `procedural`.
- **Giới hạn**: lượt gọi Claude trong 24 giờ: FREE 10, STARTER 50, PRO_BUSINESS 300 (hết → `429`; `GET /api/ai/usage`). Thêm giới hạn 5 lần / phút. Mỗi lượt được ghi vào bảng `ai_generations` kèm số token để theo dõi chi phí.
- Lấy API key: [platform.claude.com](https://platform.claude.com) → *API Keys*. Không commit key; test e2e luôn tắt AI.

## WebSocket

Socket.IO namespace `/events` chạy ở path **`/api/socket.io`** (để nhận cookie `wf_access` và đi qua proxy `/api/*`):

```ts
import { io } from 'socket.io-client';

// Trình duyệt: cookie wf_access tự được gửi kèm
const socket = io('http://localhost:8080/events', { path: '/api/socket.io', withCredentials: true });
// Client khác: io(url, { path: '/api/socket.io', auth: { token: accessToken } })

socket.on('pong', (data) => console.log(data)); // { timestamp }
socket.emit('ping', {});
```

Mỗi kết nối tự vào room `user:<id>` (và `admins` với ADMIN). Từ service khác, inject `EventsGateway` và gọi `emitToAll` / `emitToUser`.

## Chạy test

```bash
npm --workspace=be test                 # unit test (không cần database) — CI chạy bước này

# e2e cần PostgreSQL đã áp dụng migration + Redis + SeaweedFS (upload thật). CI chạy y hệt (job `e2e`).
docker compose up -d postgres redis seaweedfs storage-init
npm --workspace=be run db:deploy
npm --workspace=be run test:e2e
```

## Thêm module mới

1. `npx nest g module modules/<ten>` (và `controller`, `service` tương ứng). Module nghiệp vụ phức tạp chia 4 thư mục `presentation/ application/ domain/ infrastructure/` (tài liệu 08, Mục 1.1–1.3).
2. Sửa `prisma/schema.prisma`, rồi `npm run db:migrate -- --name <ten>` (trong `be/`).
3. Mặc định mọi route đều yêu cầu đăng nhập; dùng `@Public()` để mở, `@Roles(Role.ADMIN)` để giới hạn theo role, `@CurrentUser()` để lấy user hiện tại.
4. DTO đặt trong `dto/`; plugin Swagger tự sinh tài liệu từ DTO có hậu tố `.dto.ts`.

## Xuất file in (BullMQ)

1. `POST /api/projects/:id/exports { fileType: "PDF_CMYK" | "SVG" | "DXF" }` — backend chạy lại **FitCheck** (kết quả lưu vào `fitcheckState`); có lỗi mức `error` → `422` kèm `fitCheck`. Hợp lệ → tạo `ExportJob` (PENDING), đẩy vào hàng đợi Redis, trả `202 { jobId }`.
2. Process **worker** (`src/worker.ts`) dựng dieline từ `@wrapfit/shared`, xuất file, tải lên storage, đánh dấu `COMPLETED` và tự tạo mốc phiên bản "Bản xuất in ...". Lỗi → BullMQ thử lại 3 lần (2 s, 4 s), lần cuối mới ghi `FAILED` + `error`. Số job song song: `EXPORT_CONCURRENCY`.
3. FE hỏi `GET /api/exports/:jobId` mỗi 2 giây; khi `COMPLETED` có `downloadUrl` (pre-signed, hết hạn 15 phút, tải về với tên `hop-nen-tet-pdf-cmyk.pdf`).

| Định dạng | Dùng cho | Nội dung |
| --- | --- | --- |
| `PDF_CMYK` | Xưởng in | Kích thước thật (1 mm = 2,8346 pt), đường cắt 0/100/100/0, đường gấp 100/0/0/0 nét đứt, chữ trên canvas (font Be Vietnam Pro nhúng sẵn) |
| `SVG` | Cricut / máy cắt laser | Lớp `info`, `crease`, `cut`, `artwork`, đơn vị mm |
| `DXF` | Máy bế CNC | R12, mm, lớp `CUT` (đỏ) và `CREASE` (xanh, nét đứt) |

**Giới hạn hiện tại (phụ thuộc IT2 / `@wrapfit/shared`)**: bộ sinh dieline mới tạo **đường gấp**, chưa có **đường cắt bao ngoài** và tai dán; chưa có hàm `exportLayeredPDF` nên backend tự vẽ PDF (chỉ chữ, chưa có ảnh / logo / hoa văn); DXF vẽ đường cong (hộp gối) thành đoạn thẳng. Khi IT2 bổ sung, chỉ cần sửa `be/src/modules/export/rendering/`.

## Triển khai production (VPS + HTTPS)

1. VPS có Docker (Compose ≥ 2.24), mở cổng 80/443, bản ghi DNS `A` của domain trỏ về VPS. Clone repo vào `~/WrapFit`.
2. `cp .env.example .env`, điền `APP_DOMAIN` (vd. `wrapfit.vn`), `ACME_EMAIL`, `JWT_*_SECRET`, các biến `STORAGE_*` của Cloudflare R2, (tùy chọn) `ANTHROPIC_API_KEY`, `GOOGLE_*`, `SEED_ADMIN_*`.
3. `bash be/deploy.sh` — có `APP_DOMAIN` thì chạy `docker-compose.yml` + `docker-compose.prod.yml`: **Caddy** tự lấy / gia hạn chứng chỉ Let's Encrypt, phục vụ frontend và `/api/*` trên **cùng một domain** (không cần CORS, cookie là first-party), đóng các cổng nội bộ (Postgres, Redis, 8080, 3000), bật `COOKIE_SECURE`, `TRUST_PROXY`, tắt Swagger.
4. GitHub: thêm secrets `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY` (hoặc `VPS_PASSWORD`), `VPS_PORT`. Workflow `Deploy WrapFit to VPS` tự chạy sau khi **CI** (build + unit + e2e) xanh trên `main`, hoặc chạy tay.
5. Google OAuth: thêm `https://<APP_DOMAIN>/api/auth/google/callback` vào *Authorized redirect URIs*. R2: thêm `https://<APP_DOMAIN>` vào CORS của bucket.

## Lưu ý khi triển khai production

- Đặt `JWT_*_SECRET` bằng giá trị ngẫu nhiên riêng (`openssl rand -base64 48`), không dùng giá trị trong `.env.example`.
- Đặt `CORS_ORIGINS` là danh sách origin cụ thể; cân nhắc `SWAGGER_ENABLED=false`.
- Chạy sau reverse proxy / load balancer: đặt `TRUST_PROXY=true` (bản prod đã bật) để rate limit tính theo IP thật của client.
- Bảng `refresh_tokens` sẽ tăng dần; nên có job định kỳ xoá các dòng đã hết hạn hoặc đã thu hồi.
- Nếu chạy nhiều instance, gateway Socket.IO cần Redis adapter để broadcast giữa các instance.
