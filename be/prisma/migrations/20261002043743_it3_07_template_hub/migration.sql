-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('TET', 'CHRISTMAS', 'WEDDING', 'VALENTINE', 'BIRTHDAY', 'MINIMAL');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('COSMETICS', 'CANDLES', 'BAKERY', 'JEWELRY', 'TEA_AGRI');

-- DropIndex
DROP INDEX "packaging_projects_visibility_status_idx";

-- AlterTable
ALTER TABLE "packaging_projects" ADD COLUMN     "industry" "Industry",
ADD COLUMN     "occasion" "Occasion";

-- CreateTable
CREATE TABLE "design_templates" (
    "id" UUID NOT NULL,
    "box_template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occasion" "Occasion",
    "industry" "Industry",
    "dimensions" JSONB NOT NULL,
    "material_spec" JSONB NOT NULL,
    "canvas_state" JSONB NOT NULL,
    "thumbnail_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "design_templates_is_active_sort_order_idx" ON "design_templates"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "packaging_projects_visibility_status_likes_count_idx" ON "packaging_projects"("visibility", "status", "likes_count");

-- AddForeignKey
ALTER TABLE "design_templates" ADD CONSTRAINT "design_templates_box_template_id_fkey" FOREIGN KEY ("box_template_id") REFERENCES "box_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
