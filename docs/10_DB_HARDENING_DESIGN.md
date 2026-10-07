# 10 — Thiết kế đợt củng cố Database (DB hardening batch)

> Trạng thái: **ĐÃ TRIỂN KHAI** (backend, 2026-10-07). Frontend chưa sửa: hợp đồng API giữ nguyên trừ đăng ký / đăng nhập.
> Môi trường: MVP chạy local, chưa có dữ liệu production. Migration `20261008000100` → `20261008000500`.

## Khác với bản thiết kế bên dưới (quyết định khi triển khai)

1. **Chưa xác minh email thì không đăng nhập được** (quyết định của product owner), thay cho việc chỉ chặn chia sẻ
   PUBLIC / UNLISTED. Hệ quả: đăng ký không mở phiên; `login` trả `403 EMAIL_NOT_VERIFIED`; `refresh` từ chối tài
   khoản chưa xác minh; `verify-email/resend` thành route public nhận `{ email }` và luôn trả `202`. Tài khoản mật
   khẩu tạo trước migration phải xác minh lại; admin của seed được đánh dấu đã xác minh.
2. **Link trong email suy ra từ `auth_tokens.id` bằng HMAC** (khóa `JWT_REFRESH_SECRET`): job trong Redis chỉ chứa
   `authTokenId`, worker tự đọc người nhận và dựng link. Không còn mã gốc hay địa chỉ email nằm trong Redis.
3. **Khóa ngoại `project_file_refs.stored_file_id` là `NO ACTION`**, không phải `RESTRICT`: `RESTRICT` kiểm tra ngay
   giữa câu lệnh nên làm hỏng chính việc xóa dự án (ref của dự án và file của dự án bị cascade trong cùng câu lệnh).
   `NO ACTION` kiểm tra cuối câu lệnh: vẫn chặn được việc xóa file mà dự án khác còn hiển thị.
4. **Không có bước "quét file không còn ref"** khi xóa dự án: file không gắn dự án nào có thể là ảnh trong thư viện
   của người dùng, xóa theo ref sẽ mất ảnh. Giữ ngữ nghĩa cũ: file gắn dự án bị xóa cùng dự án, trừ file dự án khác
   còn hiển thị (được tách khỏi dự án).
5. **Không retry khi xung đột khóa ngoại** lúc xóa dự án: cửa sổ race chỉ vài mili giây; cron dọn thùng rác chạy lại
   hôm sau, xóa tay nhận lỗi và thử lại.
6. **Frontend chưa sửa** (đang thiết kế lại): chưa có trang `/verify-email`, `/forgot-password`, `/reset-password`.
7. **Email production: Resend qua SMTP, gửi từ `mail.wrapfit.vn`** (quyết định 2026-10-07). Local vẫn dùng Mailpit;
   `docker-compose.prod.yml` bắt buộc `SMTP_HOST` + `MAIL_FROM`.
   - Lý do: gói miễn phí (3.000 mail/tháng, tối đa 100/ngày) đủ cho MVP/pilot; Resend tự chặn gửi lại địa chỉ bị
     bounce / báo spam, còn Amazon SES bắt buộc tự xử lý bounce qua SNS và xin thoát sandbox.
   - Chuyển sang Amazon SES ($0.10 / 1.000 mail) khi vượt khoảng 3.000 mail/tháng hoặc chi phí đáng kể: chỉ đổi
     biến `SMTP_*`, không sửa code. Theo dõi giới hạn 100 mail/ngày khi chạy quảng cáo (vượt thì mail ngừng gửi).
   - Gửi từ subdomain `mail.wrapfit.vn`, không gửi từ domain gốc: uy tín gửi mail không ảnh hưởng domain chính.
   - DNS (giá trị chính xác lấy trong dashboard Resend): SPF (TXT + MX cho bounce) trên `mail.wrapfit.vn`,
     DKIM `resend._domainkey.mail.wrapfit.vn`, DMARC `_dmarc.wrapfit.vn` = `v=DMARC1; p=none; rua=mailto:dmarc@wrapfit.vn`,
     nâng lên `p=quarantine` sau 2–4 tuần không lỗi.
   - Cấu hình: `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=resend`,
     `SMTP_PASS=<API key chỉ có quyền gửi>`, `MAIL_FROM=WrapFit <no-reply@mail.wrapfit.vn>`.
   - Điều kiện: nhóm sở hữu domain `wrapfit.vn` (cần xác nhận trước khi cấu hình DNS).
   - Kiểm tra cấu hình: worker log `mail.smtp_ready` / `mail.smtp_unreachable` lúc khởi động; gửi thư thử bằng
     `npm --workspace=be run mail:test -- you@example.com` (dev) hoặc
     `docker compose exec worker node dist/mail-test.js you@example.com` (production), rồi xem thư có vào Spam không.
> Nền: xây tiếp trên các thay đổi chưa commit của migration `20261007090000_reliability_fixes`
> (`refresh_tokens.replaced_by_id`, `packaging_projects.version`, `stored_files.confirmed_at`, `orphaned_objects`,
> `StorageMaintenanceTask`, `AppLogger`, `runWithRequestId`).

## Tóm tắt phạm vi

1. Chặn chiếm tài khoản trước khi chủ thật đăng ký (pre-account-takeover) khi gắn Google vào tài khoản có mật khẩu chưa xác minh.
2. Xác minh email và đặt lại mật khẩu: bảng `auth_tokens`, 4 endpoint, hàng đợi BullMQ `mail`, nodemailer SMTP, Mailpit chạy local.
3. Mọi cột thời gian chuyển sang `timestamptz(3)`.
4. Bảng `project_file_refs` thay cho các truy vấn quét `strpos(canvas_state::text, key)`.
5. Phiên bản công thức hộp (`formula_version`) và registry dieline trong `shared/`.
6. Ràng buộc CHECK.
7. Index còn thiếu trên khóa ngoại.
8. Lưu key thay vì URL. Hợp đồng API giữ nguyên: response vẫn trả `*Url`.
9. Khóa chính mặc định `uuid(7)`.

Kèm theo: cron dọn token hết hạn, giữ tối đa 20 snapshot tự động cho mỗi dự án.

---

## 0. Corrections to the originally decided scope

1. **SMTP retry semantics**: SMTP 4xx (421/450/451) is transient, so retry. SMTP 5xx (550) is permanent, so throw BullMQ `UnrecoverableError`. Network errors (ETIMEDOUT/ECONNECTION) are retried.
2. **`project_file_refs.stored_file_id` is `ON DELETE RESTRICT`**, not CASCADE.
   - With CASCADE, a deletion racing with a fork could silently delete the forker's file.
   - With RESTRICT, the race becomes a retryable FK error: retry once on 23503/40P01.
   - `project_id` stays CASCADE.
3. **The zero-ref sweep never touches fresh uploads.**
   - Candidates are files that were referenced by the deleted projects, are detached (`project_id IS NULL`), and now have no refs.
   - Keys used in `users.brand_kit->>'logoKey'` are always excluded.
4. **The refs backfill runs inside migration SQL**, using the same recompute SQL as the app. No boot backfill task is needed: local data, and migration and code deploy together.
5. **The unverified gate covers both PUBLIC and UNLISTED visibility**, plus `UnboxingService.save`.
   - The check reads `emailVerifiedAt` from the DB, not from a JWT claim.
   - Failure is 403 `EMAIL_NOT_VERIFIED`.
6. **`StorageService.confirmPendingUploads` writes `size = ContentLength ?? 0`**, which would violate `CHECK size > 0`. Treat a 0-byte object as never uploaded: delete the row and record the key in `orphaned_objects`.
7. **The raw SQL in `deleteTrashed` (prisma-project.repository.ts) uses `AT TIME ZONE 'UTC'`.** After the timestamptz change, compare `deleted_at < ${cutoff}::timestamptz` directly. This is the only raw timestamp site.
8. **Register race**: `register()` does find-then-create. Catch Prisma `P2002` and return 409, not 500.
9. **`unboxing_experiences.qr_code_url` is derivable** from the deterministic key `projects/<id>/unboxing/qr-<slug>.png`. Drop the column and compute the URL at serialization.
10. **`social_mockups` has no code in `be/src`**, so it is a column rename only (`render_url` → `render_key`).
11. **These stay URLs**: `design_templates.thumbnail_url` (static assets), `audio_track_url`, `preview_3d_url`.
12. **`refresh_tokens.id` is the JWT `jti`**, so the code keeps passing `randomUUID()`. Only Prisma-generated ids move to `uuid(7)`.

## 1. Context

- **Components**:
  - an offline schema change shipped as 4 migrations
  - sync HTTP auth endpoints
  - one BullMQ `mail` worker (outbound SMTP integration)
  - one daily cron (`AuthMaintenanceTask`)
  - data-layer changes
- **Load**: MVP.
- **Delivery and safety**:
  - Each migration is atomic: Prisma runs a migration file as one implicit transaction, so never use `CONCURRENTLY`.
  - Mail is at-least-once and idempotent.
  - The cron is safe to run on several instances.

## 2. Data model

### (a) Schema diff (Prisma)

```
// every DateTime -> @db.Timestamptz(3); every Prisma-generated uuid id -> @default(uuid(7))
enum AuthTokenPurpose { VERIFY_EMAIL RESET_PASSWORD }
User:   + emailVerifiedAt DateTime? @map("email_verified_at") @db.Timestamptz(3)
        + avatarKey String? @map("avatar_key")      // avatarUrl stays = external (Google) source
        + @@index([referredById])  + authTokens AuthToken[]
RefreshToken: + @@index([expiresAt])
BoxTemplate:  + formulaVersion Int @default(1) @map("formula_version")
PackagingProject: + formulaVersion Int @map("formula_version")  // no @default: every create site must set it
        thumbnailUrl -> thumbnailKey String? @map("thumbnail_key")
        + @@index([forkedFromId]) + @@index([templateId]) + fileRefs ProjectFileRef[]
ProjectSnapshot: previewUrl -> previewKey String? @map("preview_key")
SocialMockup: renderUrl -> renderKey @map("render_key");  + @@index([userId])
UnboxingExperience: - qrCodeUrl   (derived)
DesignTemplate: + @@index([boxTemplateId])
StoredFile: + refs ProjectFileRef[]
model AuthToken {
  id String @id @default(uuid(7)) @db.Uuid
  userId String @map("user_id") @db.Uuid
  purpose AuthTokenPurpose
  tokenHash String @unique @map("token_hash")
  expiresAt DateTime @map("expires_at") @db.Timestamptz(3)
  consumedAt DateTime? @map("consumed_at") @db.Timestamptz(3)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  user User @relation(fields:[userId], references:[id], onDelete: Cascade)
  @@index([userId, purpose, createdAt]) @@index([expiresAt]) @@map("auth_tokens")
}
model ProjectFileRef {
  projectId String @map("project_id") @db.Uuid
  storedFileId String @map("stored_file_id") @db.Uuid
  project PackagingProject @relation(..., onDelete: Cascade)
  storedFile StoredFile @relation(..., onDelete: Restrict)
  @@id([projectId, storedFileId]) @@index([storedFileId]) @@map("project_file_refs")
}
```

`users.brand_kit` JSON: `logoUrl` → `logoKey`. The API still returns `logoUrl`.

### (b) Migration outline

There are 4 files after `20261007090000_reliability_fixes`. Each is atomic.

**1. `20261008000100_hardening_types_checks`**
- **Timestamps**: `ALTER COLUMN ... TYPE timestamptz(3) USING c AT TIME ZONE 'UTC'` on all 16 DateTime columns.
- **Fix violating rows**:
  - Lowercase the emails.
  - Set an out-of-range `fitcheck_score` to NULL, together with `fitcheck_state`.
  - Apply `GREATEST(x,0)` to the counters.
  - For `size <= 0`: move the key to `orphaned_objects`, then delete the row.
  - Make `deleted_at` agree with `status`.
- **CHECKs**:
  - `email = lower(email)`
  - `fitcheck_score` between 0 and 100
  - counters >= 0
  - `size > 0`
  - tokens >= 0
  - `(status='DELETED') = (deleted_at IS NOT NULL)`
  - `orphaned_objects.attempts >= 0`
  - `formula_version >= 1`
- **`formula_version`**: add the column with `DEFAULT 1`, then drop the default on `packaging_projects`.
- **FK indexes**:
  - `packaging_projects(forked_from_id)`
  - `packaging_projects(template_id)`
  - `users(referred_by_id)`
  - `social_mockups(user_id)`
  - `design_templates(box_template_id)`
  - `refresh_tokens(expires_at)`

**2. `20261008000200_auth_email_verification`**
- Add `email_verified_at`.
- Backfill: `= created_at WHERE google_id IS NOT NULL`.
- Create the enum and the `auth_tokens` table.
- Add `CHECK (expires_at > created_at)`.
- Add the partial unique index `ON auth_tokens(user_id, purpose) WHERE consumed_at IS NULL`.

**3. `20261008000300_asset_keys`**
- Renames: `thumbnail_url` → `thumbnail_key`, `preview_url` → `preview_key`, `render_url` → `render_key`.
- Add `users.avatar_key`. Drop `unboxing_experiences.qr_code_url`.
- Convert values with the strict regex below and take group 2:
  ```
  ^https?://[^/]+/(.*/)?(users/[0-9a-f-]{36}/(logo|image|thumbnail|avatar)/[0-9a-f-]{36}\.[a-z0-9]+)$
  ```
- Rewrite `canvas_state->'elements'` with `jsonb_array_elements WITH ORDINALITY` and `jsonb_agg ORDER BY ord`. This applies to `type IN ('logo','image','pattern')` in projects, snapshots and design_templates.
- Rewrite `brand_kit` (`logoUrl` → `logoKey`).
- Safety CHECK on every key column: `IS NULL OR LIKE 'users/%'`.

**4. `20261008000400_project_file_refs`**
- Create the table: `stored_file_id` with RESTRICT, `project_id` with CASCADE.
- Backfill with the same recompute SQL the app uses.

**Prisma drift**: Prisma does not model CHECKs or partial indexes. `migrate dev` does not report them as drift and does not drop them. Hand-edit the generated SQL for the renames. Acceptance check after all 4 migrations:

```
prisma migrate diff --from-migrations ... --to-schema-datamodel --exit-code
```

The output must be empty.

## 3. Failure modes

| Failure | Detect | Surface | Recover |
|---|---|---|---|
| Migration violates a constraint | `migrate deploy` error | non-zero exit, file rolled back | fix the data, rerun |
| Token unknown or superseded | consume UPDATE returns 0 rows | 400 `AUTH_TOKEN_INVALID` | request a new mail |
| Token expired | `expires_at <= now` | 400 `AUTH_TOKEN_EXPIRED` | resend / forgot |
| Token already used | `consumed_at` set | reset: 400 `AUTH_TOKEN_CONSUMED`; verify: 200 | — |
| SMTP 5xx | `responseCode >= 500` | `UnrecoverableError`, log `mail.failed permanent` | user resends |
| SMTP 4xx / timeout | 4xx or ETIMEDOUT/ECONNECTION | BullMQ retries 5 times, exponential from 10s | log `mail.retry attempt=n` |
| Redis down at enqueue | enqueue throws | register/forgot: log and continue; resend: 503 `MAIL_UNAVAILABLE` | user retries |
| Rate limit | DB count / `@Throttle` | 429 `AUTH_RESEND_RATE_LIMITED` + `Retry-After`; forgot stays 202 | wait |
| S3 delete fails | `tryDeleteObjects` result | warn log | `orphaned_objects` + `StorageMaintenanceTask` |
| Ref race (23503/40P01) | Prisma `P2003`/`P2034` | internal | retry the tx once, then 503 |
| URL/key not allowed | `resolveInputKey` | 400 `FILE_URL_NOT_ALLOWED` / `FILE_NOT_OWNED` | upload via presign |
| Version conflict | existing | 409 `PROJECT_VERSION_CONFLICT` | client reloads |
| Unknown formula version | `UnsupportedFormulaVersionError` | 500 (data bug) | fix the data |

## 4. Authorization

- **Principals**:
  - `verify-email`, `password/forgot` and `password/reset` are public. The credential is a single-use token, stored as SHA-256 only.
  - `verify-email/resend` requires authentication.
- **Google link** (`UsersService.linkGoogleAccount`), in one tx:
  1. Re-read the user with `FOR UPDATE`.
  2. If `password_hash` is set and `email_verified_at` is null: clear `password_hash`, revoke all refresh tokens, and log WARN `auth.google_link_cleared_unverified_password`.
  3. Always set `email_verified_at = COALESCE(email_verified_at, now())` and `google_id`.
- **Google account creation**: `createFromGoogle` also sets `email_verified_at = now()`. A `P2002` on `google_id` returns 409.
- **Asset input**: `thumbnailUrl`, `previewUrl`, `avatarUrl` and `logoUrl` must meet all three conditions:
  - the URL is in our bucket
  - a `stored_files` row exists with `user_id = caller`
  - the purpose matches
- **Canvas input**: the same rules apply, plus one extra case. A file is also accepted if a `project_file_refs` row already exists for that project. This covers images from a forked project that belong to someone else.
- **Server-internal copies**: fork and restore only convert URL → key, with no ownership check.
- **Email-verified gate**: `ProjectsService.changeVisibility` and `UnboxingService.save` call `assertEmailVerified(userId)`.

## 5. Idempotence and concurrency

- **Replay**:
  - verify replay → 200.
  - reset replay → 400 `AUTH_TOKEN_CONSUMED`.
  - Mail: `jobId = authToken.id`, and the job re-checks that the token is unconsumed and unexpired before sending.
  - The ref sync is set-based. The cron deletes only expired rows.
- **Token issue**: in one tx, mark earlier tokens consumed, then INSERT. The partial unique index guarantees one active token per purpose. A `P2002` means a parallel issue won; treat it as rate-limited.
- **Ref sync**: run `SELECT ... FOR UPDATE` on the project, then this SQL:
  ```
  INSERT INTO project_file_refs SELECT $1, f.id FROM stored_files f
   WHERE f.key IN (<keys of project canvas UNION all its snapshots' canvases>) ON CONFLICT DO NOTHING;
  DELETE FROM project_file_refs WHERE project_id=$1 AND stored_file_id NOT IN (<same ids>);
  ```
  The key set comes from `jsonb_path_query(canvas_state,'$.elements[*]?(@.type=="logo"||@.type=="image"||@.type=="pattern").content')`.
- **Canvas save**: the existing `updateMany WHERE version=$n` already locks the row. Sync refs in the same interactive tx.
- **Deletion** (`purgeExpiredTrash`, `remove`, `UsersService.remove`):
  1. In one tx, lock the LOGO/IMAGE files with `FOR UPDATE`. A concurrent fork's ref insert takes an FK KEY SHARE lock and waits.
  2. Detach files that still have refs from outside the set (`project_id = NULL`).
  3. Collect the keys, then delete the projects.
  4. Sweep the candidates: `DELETE ... RETURNING key`.
  5. After commit, call `deleteObjects`. Failures go to `orphaned_objects`.
  6. Retry the tx once on `P2003`/`P2034`.
- **Cron**: `DELETE ... WHERE id IN (SELECT id ... WHERE expires_at<now() LIMIT 5000 FOR UPDATE SKIP LOCKED)`, in a loop.
- **Shared files** (an upload referenced by someone else's fork):
  - `user_id` stays the original uploader, who keeps carrying the quota.
  - The owner deleting their project only detaches the file. The file is deleted once the last ref is gone.
  - Before a user is deleted, files still referenced by others are reassigned to the owner of the oldest referencing project.
- **Outbox**: none. Enqueue runs after commit; on failure, log it and let the user resend. Revisit when mail becomes critical (invoices).
- **Snapshot retention**: in the tx that inserts an automatic snapshot, delete everything after the 20 newest (`ORDER BY created_at DESC, id DESC OFFSET 20`), then sync refs. This applies in `export.processor.ts` and to the restore backup in `prisma-snapshot.repository.ts`.

## 6. Observability

- **Logs**: `Logger` (AppLogger) with `key=value` messages. Jobs run in `runWithRequestId(job.data.requestId ?? 'job:'+id)`. Events:
  - `auth.verify_email.ok`
  - `auth.password_reset.ok sessionsRevoked=n`
  - `auth.google_link_cleared_unverified_password`
  - `mail.sent`
  - `mail.retry attempt=n code=`
  - `mail.failed permanent`
  - `auth.cleanup deleted=n ms=`
  - `refs.sync projectId added removed`
  - `storage.sweep deleted=n orphaned=n`
- **Sensitive data**: never log raw tokens. Mask emails as `a***@d***.com`.
- **Log-based metrics**:
  - mail sent / failed / retries
  - tokens issued / consumed / expired
  - cron rows and duration
  - `COUNT(*) FROM orphaned_objects`
- **Healthcheck**: unchanged. Mail and SMTP are not part of readiness. The worker heartbeat already covers the worker.

## (c) Change list by module

- **`be/prisma/schema.prisma`**: the diff above.
- **New `be/src/common/assets/asset-keys.ts`**:
  - `initAssetBase(publicUrl)`, called from the `StorageService` constructor.
  - `assetUrl(key)`, `expandCanvas(canvas)`, and `toStoredCanvas(canvas)` (pure URL → key).
- **`storage.service.ts`**:
  - Add `resolveInputKey(url, {purpose, userId, projectId?})`.
  - Replace `detachSharedFiles`, `listUserFiles` and the delete flow with the procedure in section 5.
  - Fix the 0-byte upload case.
- **New `projects/infrastructure/project-file-refs.ts`**: `syncProjectFileRefs(tx, projectId)`.
- **`prisma-project.repository.ts`**:
  - `create` copies `formulaVersion` and syncs refs.
  - `updateContent` runs in an interactive tx and syncs refs when the canvas changes.
  - Use `toStoredCanvas`, and `thumbnailKey` instead of `thumbnailUrl`.
  - `deleteTrashed`: drop `AT TIME ZONE`.
- **`project.select.ts`**: map `thumbnailUrl = assetUrl(key)` and `canvasState = expandCanvas(...)`.
- **`prisma-snapshot.repository.ts`**: `previewKey`. Create and restore run in interactive txs with prune and sync.
- **`projects.service.ts` / `snapshots.service.ts`**:
  - Call `resolveInputKeys` before saving.
  - `copy()` sets `formulaVersion: source.formulaVersion`.
  - Extend the `IProjectFiles` port.
- **DTOs**: field names stay (`thumbnailUrl`, `previewUrl`). The API contract is unchanged.
- **`public-showcase/public-projects.service.ts`**: `thumbnailKey`, `avatarKey`, `expandCanvas`.
- **`templates.service.ts`**: keep `_count: { forks: true }`; with the `forked_from_id` index it is one grouped query per page. Denormalize `forks_count` only once the hub passes ~10k public projects.
- **`unboxing.service.ts`**:
  - Remove the `qrCodeUrl` write and derive the URL from the key.
  - `publicView` expands URLs.
  - `save` calls `assertEmailVerified`.
- **`export.processor.ts`**:
  - Read `formulaVersion`.
  - Expand the canvas only for `buildPrintLayout`.
  - The snapshot stores the **unexpanded** canvas.
  - Interactive tx with prune and sync.
- **`export.service.ts`**: pass `formulaVersion` to `checkProject`.
- **Users**:
  - `user.select.ts` adds `emailVerifiedAt` and `avatarKey`.
  - `toSafeUser` maps `avatarUrl = avatarKey ? assetUrl(avatarKey) : avatarUrl` and `brandKit.logoKey` → `logoUrl`.
  - Every `userSelect` consumer goes through that mapper.
  - `updateProfile`: a URL from our bucket sets `avatar_key`; `null` clears both columns; any other URL is rejected.
- **Auth**:
  - New `auth-tokens.service.ts` (issue / consume, `sha256`, `randomBytes(32).toString('base64url')`).
  - New `account-recovery.service.ts` (verify, resend, forgot, reset).
  - DTOs: `verify-email.dto.ts`, `forgot-password.dto.ts`, `reset-password.dto.ts`.
  - `auth.constants.ts`: verify TTL 24h, reset TTL 30 min, resend limits 1/min and 5/day.
  - `register`: `$transaction` of create user + VERIFY token, then enqueue after commit.
  - `auth.controller.ts`: 4 endpoints. Reset clears the cookies and does not auto-login.
  - New `auth-maintenance.task.ts`:
    - `@Cron('0 3 * * *', {timeZone:'Asia/Ho_Chi_Minh'})`.
    - Deletes `refresh_tokens WHERE expires_at<now()` and `auth_tokens WHERE expires_at < now() - 7 days`.
    - Revoked tokens that have not yet expired are kept for theft detection.
- **New `be/src/modules/mail/`**:
  - `MAIL_QUEUE='mail'`.
  - `MailModule` (producer): `attempts:5`, exponential backoff 10s, `jobId`, `removeOnComplete:true`, `removeOnFail:{age:3600}`.
  - `MailWorkerModule`: `MailProcessor`, `SmtpTransport` (nodemailer), and Vietnamese HTML + text templates.
  - Imported in `be/src/worker.ts`.
- **Config**:
  - `env.validation.ts`: `SMTP_HOST` (localhost), `SMTP_PORT` (1025), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`. Credentials are required in production.
  - `.env.example`.
  - `docker-compose.yml`: a `mailpit` service (1025 / UI 8025).
- **Formula versioning**:
  - New `shared/src/parametric/registry.ts`: `generateDieline(structure, dimensions, formulaVersion)`, with the registry `{1: {...current four}}`.
  - Add `UnsupportedFormulaVersionError`.
  - Thread `formulaVersion` through `dielinePieces`, `checkProject` and `fitCheckOf` (`project-fitcheck.ts`), `buildPrintLayout`, and every caller.
  - Expose it in `ProjectDetail`/`ProjectSummary` and `shared/src/types/project.ts`.
  - `seed.ts`: `formulaVersion: 1`.
- **Frontend**:
  - `apiClient.ts`: `verifyEmail`, `resendVerification`, `forgotPassword`, `resetPassword`, and `emailVerifiedAt`.
  - New pages `fe/src/app/verify-email`, `forgot-password`, `reset-password`.
  - New `EmailVerificationBanner`, mounted in dashboard and editor.
  - Handle `EMAIL_NOT_VERIFIED` in the share UI.
  - The upload flow stays unchanged.

## (d) Endpoint contracts (`/api`)

| Endpoint | Auth | Request | Success | Errors |
|---|---|---|---|---|
| `POST /auth/verify-email` | public, 10/min/IP | `{token}` | 200 `{verified:true}` (idempotent) | 400 `AUTH_TOKEN_INVALID` / `AUTH_TOKEN_EXPIRED` |
| `POST /auth/verify-email/resend` | cookie | — | 202 `{}`; already verified: 200 `{alreadyVerified:true}` | 429 `AUTH_RESEND_RATE_LIMITED` (+`Retry-After`); 503 `MAIL_UNAVAILABLE` |
| `POST /auth/password/forgot` | public, 5/min/IP | `{email}` | always 202 `{}` | 400 malformed email only |
| `POST /auth/password/reset` | public, 10/min/IP | `{token,newPassword}` | 200 `{}` + clears cookies | 400 `AUTH_TOKEN_INVALID`/`EXPIRED`/`CONSUMED`; 400 password policy |

- **Forgot**:
  - No mail is sent if the email is unknown. Silently skipped if the last RESET token is under 60s old, or after 5 per day.
  - A Google-only account may use this flow to set a first password.
- **Reset**, in one tx:
  - consume the token
  - set `password_hash`
  - set `email_verified_at`
  - revoke all refresh tokens
  - consume sibling RESET tokens
- **Error body**: `{code, message}`. The gate returns 403 `EMAIL_NOT_VERIFIED`.

## (e) Build sequence (each step can be verified on its own)

1. **Migration 1, the deleteTrashed fix and the 0-byte fix.** Verify:
   - `migrate reset` succeeds and the drift diff is empty.
   - Existing unit and e2e tests pass.
   - `\d` shows `timestamptz(3)`.
2. **`uuid(7)`.** Verify: a test checks the version nibble = 7.
3. **Formula version seam.** Verify: dieline and FitCheck specs are unchanged, plus a new unsupported-version test.
4. **Migration 2 and `AuthTokensService`.** Verify: unit tests for issue/consume and for the partial unique index.
5. **Google-link fix.** This is the security fix and can ship on its own.
6. **Mail module and Mailpit.** Verify: enqueue a job by hand and see the mail at :8025.
7. **Endpoints, register change, `AuthMaintenanceTask`, gate, e2e helper that marks users verified.** Verify: the e2e test reads the token through the Mailpit API.
8. **FE pages and banner.** Verify by hand: register → Mailpit → verify; forgot → reset.
9. **Migration 3 (asset keys) and every read/write path.** Verify:
   - A before/after snapshot of API responses shows the same shape.
   - The CHECK rejects `http...`.
10. **Migration 4 (file refs), `syncProjectFileRefs` and replacing `strpos`.** Verify: deleting the original project leaves the fork's image intact.
11. **Snapshot pruning.** Verify: after 25 automatic snapshots, 20 remain.
12. **Docs**: note the raw-SQL CHECKs, and update the `insforge-backend-flow` SKILL on keys vs URLs.

## (f) Test plan

**Unit**
- `auth-tokens.service.spec`: only the hash is stored; TTLs; expired, consumed and invalid tokens; a superseded token is rejected.
- `account-recovery.service.spec`:
  - verify replay → 200
  - reset replay → 400
  - reset revokes sessions and sets `email_verified_at`
  - forgot with an unknown email → 202 and no enqueue
  - rate limit
- `auth.service.spec`:
  - Google link on an unverified account with a password clears the hash and revokes sessions.
  - On a verified account it keeps the password.
  - A new Google user is verified.
  - `P2002` on register → 409.
- `mail.processor.spec`: 4xx and timeout retry; 5xx is unrecoverable; skips when the token is consumed; email is masked in logs.
- `asset-keys.spec`: URL → key over http and https, with a query string, and with a foreign host; canvas round-trip.
- `storage.service.spec`: the sweep skips brand-kit logos and fresh uploads; the 0-byte case; S3 failure goes to `orphaned_objects`.
- `auth-maintenance.task.spec`: only expired rows are deleted; batching; revoked-but-unexpired rows are kept.
- Snapshot prune: keeps the 20 newest automatic snapshots and never touches manual ones.

**E2E**
- `auth.e2e`:
  - register → verify via Mailpit
  - forgot → reset → the old refresh token fails
  - resend → 429
  - pre-hijack scenario: attacker registers first, victim signs in with Google, attacker loses access
- `projects.e2e`:
  - an unverified user gets 403 when publishing
  - a canvas with a foreign key is rejected
  - a fork re-saving the foreign key is accepted
  - refs are correct after save, fork, snapshot, restore
  - deleting the original keeps the fork's image
  - deleting a user reassigns shared files
- `storage.e2e`: 0-byte confirm; `orphaned_objects` retry.
- **SQL**: every CHECK rejects a bad row.

## (g) Risks

- **Storage disabled** (`STORAGE_BUCKET` empty): the data-URL fallback in `apiClient.ts` will get a 400. Local dev must run SeaweedFS, which docker-compose already has.
- **`initAssetBase` is global mutable state**, a trade-off to avoid changing ~15 signatures for DI.
- **Raw tokens sit in Redis for up to 1h on failed jobs.** The alternative is an HMAC-derived token.
- **Replaced thumbnails are never cleaned up** (existing behavior). Out of scope.
- **Deadlock window** between deletion and ref sync. Mitigated by retrying once.
- **Register 409 reveals that an email exists** (existing behavior).

## Open questions (for the product owner)

1. Is the unverified gate right: block PUBLIC/UNLISTED and unboxing links? Can unverified users still export?
2. Which SMTP provider and sender domain for non-local environments? Resend or SES, with `MAIL_FROM`, SPF and DKIM.
3. `fe/src` has no login/register UI yet. After a reset: redirect to login (recommended) or auto-login?
