-- AlterTable
ALTER TABLE "project_snapshots" ADD COLUMN "is_automatic" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: snapshots written by the export worker and by restore backups are automatic.
UPDATE "project_snapshots"
SET "is_automatic" = true
WHERE "name" LIKE 'Bản xuất in %' OR "name" LIKE 'Trước khi khôi phục: %';
