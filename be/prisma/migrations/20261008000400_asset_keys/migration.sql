-- DB hardening part 4: store object keys of uploads instead of their public URLs.
-- The API still returns URLs (built from STORAGE_PUBLIC_URL when a row is read): moving the bucket or the CDN domain
-- no longer means rewriting every row and every canvas.
--
-- An upload URL ends with its key: .../users/<user uuid>/<purpose>/<file>. Values that are not uploads of WrapFit
-- (static assets, other hosts, data URLs) are kept in canvases; they cannot be a thumbnail, preview or logo any more.

CREATE FUNCTION pg_temp.upload_key(url TEXT) RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT (regexp_match(url, '/(users/[0-9a-f-]{36}/[a-z_]+/[^/?#]+)(?:[?#].*)?$'))[1]
$$;

-- Canvas elements that show a file: their `content` becomes the key when it is an upload URL.
CREATE FUNCTION pg_temp.canvas_with_keys(canvas JSONB) RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN jsonb_typeof(canvas -> 'elements') IS DISTINCT FROM 'array' THEN canvas ELSE jsonb_set(canvas, '{elements}', (
    SELECT COALESCE(jsonb_agg(
      CASE WHEN element ->> 'type' IN ('logo', 'image', 'pattern') AND pg_temp.upload_key(element ->> 'content') IS NOT NULL
        THEN jsonb_set(element, '{content}', to_jsonb(pg_temp.upload_key(element ->> 'content')))
        ELSE element END
      ORDER BY position), '[]'::jsonb)
    FROM jsonb_array_elements(canvas -> 'elements') WITH ORDINALITY AS e(element, position)))
  END
$$;

-- Thumbnails and version previews.
ALTER TABLE "packaging_projects" RENAME COLUMN "thumbnail_url" TO "thumbnail_key";
UPDATE "packaging_projects" SET "thumbnail_key" = pg_temp.upload_key("thumbnail_key") WHERE "thumbnail_key" IS NOT NULL;

ALTER TABLE "project_snapshots" RENAME COLUMN "preview_url" TO "preview_key";
UPDATE "project_snapshots" SET "preview_key" = pg_temp.upload_key("preview_key") WHERE "preview_key" IS NOT NULL;

ALTER TABLE "social_mockups" RENAME COLUMN "render_url" TO "render_key";
UPDATE "social_mockups" SET "render_key" = COALESCE(pg_temp.upload_key("render_key"), "render_key");

-- Avatars: uploads move to avatar_key; an external avatar (Google) stays in avatar_url.
ALTER TABLE "users" ADD COLUMN "avatar_key" TEXT;
UPDATE "users" SET "avatar_key" = pg_temp.upload_key("avatar_url"), "avatar_url" = NULL
WHERE pg_temp.upload_key("avatar_url") IS NOT NULL;

-- Brand kit: { logoUrl } -> { logoKey }.
UPDATE "users"
SET "brand_kit" = ("brand_kit" - 'logoUrl') || jsonb_build_object('logoKey', pg_temp.upload_key("brand_kit" ->> 'logoUrl'))
WHERE jsonb_typeof("brand_kit") = 'object' AND "brand_kit" ? 'logoUrl';

-- Canvases of projects, snapshots and curated designs.
UPDATE "packaging_projects" SET "canvas_state" = pg_temp.canvas_with_keys("canvas_state");
UPDATE "project_snapshots" SET "canvas_state" = pg_temp.canvas_with_keys("canvas_state");
UPDATE "design_templates" SET "canvas_state" = pg_temp.canvas_with_keys("canvas_state");

-- The QR code of an unboxing has a fixed key (projects/<project id>/unboxing/qr-<slug>.png): its URL is computed.
ALTER TABLE "unboxing_experiences" DROP COLUMN "qr_code_url";

-- A key column never holds a URL.
ALTER TABLE "packaging_projects" ADD CONSTRAINT "chk_packaging_projects_thumbnail_key"
  CHECK ("thumbnail_key" IS NULL OR "thumbnail_key" ~ '^users/[^:]+$');
ALTER TABLE "project_snapshots" ADD CONSTRAINT "chk_project_snapshots_preview_key"
  CHECK ("preview_key" IS NULL OR "preview_key" ~ '^users/[^:]+$');
ALTER TABLE "users" ADD CONSTRAINT "chk_users_avatar_key"
  CHECK ("avatar_key" IS NULL OR "avatar_key" ~ '^users/[^:]+$');
