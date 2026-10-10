-- AlterTable
ALTER TABLE "packaging_projects" ADD COLUMN "fitcheck_score" INTEGER;

-- Backfill from the last server-side FitCheck; projects never checked are filled in by FitCheckBackfillTask.
UPDATE "packaging_projects"
SET "fitcheck_score" = ("fitcheck_state"->>'score')::int
WHERE jsonb_typeof("fitcheck_state"->'score') = 'number';
