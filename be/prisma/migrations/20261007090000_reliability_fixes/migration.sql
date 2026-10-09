-- Refresh token rotation: the token that replaced this one (a replay within a few seconds is a concurrent tab).
ALTER TABLE "refresh_tokens" ADD COLUMN "replaced_by_id" UUID;

-- Optimistic concurrency of project saves. A constant default does not rewrite the table (PostgreSQL >= 11).
ALTER TABLE "packaging_projects" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Uploads are confirmed once the object exists in the bucket. Files recorded before this migration are trusted.
ALTER TABLE "stored_files" ADD COLUMN "confirmed_at" TIMESTAMP(3);
UPDATE "stored_files" SET "confirmed_at" = "created_at";
CREATE INDEX "stored_files_confirmed_at_created_at_idx" ON "stored_files"("confirmed_at", "created_at");

-- Objects whose rows are gone but that could not be removed from the bucket, retried by StorageMaintenanceTask.
CREATE TABLE "orphaned_objects" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orphaned_objects_pkey" PRIMARY KEY ("key")
);
