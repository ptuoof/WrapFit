-- DB hardening (docs/10_DB_HARDENING_DESIGN.md), part 1: time zones, CHECK constraints, foreign key indexes.
--
-- CHECK constraints are not modelled by Prisma: they live only in migrations (prefix `chk_`). `prisma migrate dev`
-- neither reports nor drops them; keep them in mind when a column is renamed or retyped.

-- 1. Every timestamp becomes timestamptz. Prisma always wrote UTC into the old `timestamp(3)` columns.
ALTER TABLE "users"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "refresh_tokens"
  ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(3) USING "expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "revoked_at" SET DATA TYPE TIMESTAMPTZ(3) USING "revoked_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "project_collections"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "design_templates"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "packaging_projects"
  ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(3) USING "deleted_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "project_snapshots"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "project_likes"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "unboxing_experiences"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "social_mockups"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "export_jobs"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "completed_at" SET DATA TYPE TIMESTAMPTZ(3) USING "completed_at" AT TIME ZONE 'UTC';

ALTER TABLE "stored_files"
  ALTER COLUMN "confirmed_at" SET DATA TYPE TIMESTAMPTZ(3) USING "confirmed_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "orphaned_objects"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "ai_generations"
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

-- 2. Bring existing rows in line with the constraints below.
UPDATE "users" SET "email" = lower("email") WHERE "email" <> lower("email");

UPDATE "packaging_projects" SET "fitcheck_score" = NULL, "fitcheck_state" = NULL
WHERE "fitcheck_score" NOT BETWEEN 0 AND 100;
UPDATE "packaging_projects" SET "views_count" = GREATEST("views_count", 0), "likes_count" = GREATEST("likes_count", 0)
WHERE "views_count" < 0 OR "likes_count" < 0;
UPDATE "packaging_projects" SET "deleted_at" = "updated_at" WHERE "status" = 'DELETED' AND "deleted_at" IS NULL;
UPDATE "packaging_projects" SET "deleted_at" = NULL WHERE "status" <> 'DELETED' AND "deleted_at" IS NOT NULL;

UPDATE "unboxing_experiences" SET "views_count" = 0 WHERE "views_count" < 0;
UPDATE "design_templates" SET "uses_count" = 0 WHERE "uses_count" < 0;
UPDATE "orphaned_objects" SET "attempts" = 0 WHERE "attempts" < 0;

-- An empty object is an upload that never happened: its bucket key (if any) is retried for deletion.
INSERT INTO "orphaned_objects" ("key") SELECT "key" FROM "stored_files" WHERE "size" <= 0 ON CONFLICT DO NOTHING;
DELETE FROM "stored_files" WHERE "size" <= 0;

-- 3. CHECK constraints (invariants the application already assumes).
ALTER TABLE "users" ADD CONSTRAINT "chk_users_email_lowercase" CHECK ("email" = lower("email"));

ALTER TABLE "packaging_projects"
  ADD CONSTRAINT "chk_packaging_projects_fitcheck_score" CHECK ("fitcheck_score" IS NULL OR "fitcheck_score" BETWEEN 0 AND 100),
  ADD CONSTRAINT "chk_packaging_projects_counts" CHECK ("views_count" >= 0 AND "likes_count" >= 0),
  ADD CONSTRAINT "chk_packaging_projects_version" CHECK ("version" >= 1),
  -- A project is in the trash exactly when it has a trash date (the 30-day purge reads deleted_at).
  ADD CONSTRAINT "chk_packaging_projects_deleted_at" CHECK (("status" = 'DELETED') = ("deleted_at" IS NOT NULL));

ALTER TABLE "unboxing_experiences" ADD CONSTRAINT "chk_unboxing_experiences_views" CHECK ("views_count" >= 0);
ALTER TABLE "design_templates" ADD CONSTRAINT "chk_design_templates_uses" CHECK ("uses_count" >= 0);
ALTER TABLE "stored_files" ADD CONSTRAINT "chk_stored_files_size" CHECK ("size" > 0);
ALTER TABLE "ai_generations" ADD CONSTRAINT "chk_ai_generations_tokens" CHECK ("input_tokens" >= 0 AND "output_tokens" >= 0);
ALTER TABLE "orphaned_objects" ADD CONSTRAINT "chk_orphaned_objects_attempts" CHECK ("attempts" >= 0);
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "chk_refresh_tokens_expiry" CHECK ("expires_at" > "created_at");

-- 4. Indexes on foreign keys and on the columns that maintenance jobs scan (PostgreSQL does not index FKs itself).
CREATE INDEX "users_referred_by_id_idx" ON "users"("referred_by_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");
CREATE INDEX "design_templates_box_template_id_idx" ON "design_templates"("box_template_id");
CREATE INDEX "packaging_projects_template_id_idx" ON "packaging_projects"("template_id");
CREATE INDEX "packaging_projects_forked_from_id_idx" ON "packaging_projects"("forked_from_id");
CREATE INDEX "social_mockups_user_id_idx" ON "social_mockups"("user_id");
