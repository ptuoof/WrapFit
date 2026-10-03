-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MAKER', 'PRO_ARTISAN', 'PRINT_SHOP', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'STARTER', 'PRO_BUSINESS');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportFileType" AS ENUM ('PDF_CMYK', 'SVG', 'DXF');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "shop_name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MAKER',
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "brand_kit" JSONB,
    "referral_code" TEXT,
    "referred_by_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_collections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color_tag" TEXT DEFAULT '#D4A373',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'retail',
    "description" TEXT,
    "formula_schema" JSONB NOT NULL,
    "preview_3d_url" TEXT,
    "is_curated" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "box_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "template_id" TEXT NOT NULL,
    "collection_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "visibility" "ProjectVisibility" NOT NULL DEFAULT 'PRIVATE',
    "allow_fork" BOOLEAN NOT NULL DEFAULT true,
    "forked_from_id" UUID,
    "dimensions" JSONB NOT NULL,
    "material_spec" JSONB NOT NULL,
    "canvas_state" JSONB NOT NULL,
    "fitcheck_state" JSONB,
    "thumbnail_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_snapshots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "canvas_state" JSONB NOT NULL,
    "dimensions" JSONB NOT NULL,
    "preview_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_likes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unboxing_experiences" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "gift_note" TEXT NOT NULL,
    "audio_track_url" TEXT,
    "particle_effect" TEXT NOT NULL DEFAULT 'confetti',
    "qr_code_url" TEXT,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unboxing_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_mockups" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "preset_name" TEXT NOT NULL,
    "render_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_mockups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "file_type" "ExportFileType" NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "storage_key" TEXT,
    "error_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "project_collections_user_id_idx" ON "project_collections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_projects_slug_key" ON "packaging_projects"("slug");

-- CreateIndex
CREATE INDEX "packaging_projects_user_id_status_idx" ON "packaging_projects"("user_id", "status");

-- CreateIndex
CREATE INDEX "packaging_projects_visibility_status_idx" ON "packaging_projects"("visibility", "status");

-- CreateIndex
CREATE INDEX "packaging_projects_status_deleted_at_idx" ON "packaging_projects"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "packaging_projects_collection_id_idx" ON "packaging_projects"("collection_id");

-- CreateIndex
CREATE INDEX "project_snapshots_project_id_idx" ON "project_snapshots"("project_id");

-- CreateIndex
CREATE INDEX "project_likes_project_id_idx" ON "project_likes"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_likes_user_id_project_id_key" ON "project_likes"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "unboxing_experiences_project_id_key" ON "unboxing_experiences"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "unboxing_experiences_slug_key" ON "unboxing_experiences"("slug");

-- CreateIndex
CREATE INDEX "social_mockups_project_id_idx" ON "social_mockups"("project_id");

-- CreateIndex
CREATE INDEX "export_jobs_project_id_idx" ON "export_jobs"("project_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_collections" ADD CONSTRAINT "project_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_projects" ADD CONSTRAINT "packaging_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_projects" ADD CONSTRAINT "packaging_projects_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "box_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_projects" ADD CONSTRAINT "packaging_projects_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "project_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_projects" ADD CONSTRAINT "packaging_projects_forked_from_id_fkey" FOREIGN KEY ("forked_from_id") REFERENCES "packaging_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_snapshots" ADD CONSTRAINT "project_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unboxing_experiences" ADD CONSTRAINT "unboxing_experiences_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_mockups" ADD CONSTRAINT "social_mockups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_mockups" ADD CONSTRAINT "social_mockups_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
