-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('LOGO', 'IMAGE', 'THUMBNAIL', 'AVATAR');

-- CreateTable
CREATE TABLE "stored_files" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "key" TEXT NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stored_files_key_key" ON "stored_files"("key");

-- CreateIndex
CREATE INDEX "stored_files_user_id_idx" ON "stored_files"("user_id");

-- CreateIndex
CREATE INDEX "stored_files_project_id_idx" ON "stored_files"("project_id");

-- AddForeignKey
ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
