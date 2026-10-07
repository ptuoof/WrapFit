-- DB hardening part 5: which uploads each project shows (its canvas and the canvases of its snapshots).
-- Replaces the scans of every canvas as text (strpos(canvas_state::text, key)) that ran when a project or a user was
-- deleted. A file still shown by a project cannot be deleted: the foreign key on stored_file_id has no cascade.

-- CreateTable
CREATE TABLE "project_file_refs" (
    "project_id" UUID NOT NULL,
    "stored_file_id" UUID NOT NULL,

    CONSTRAINT "project_file_refs_pkey" PRIMARY KEY ("project_id","stored_file_id")
);

-- CreateIndex
CREATE INDEX "project_file_refs_stored_file_id_idx" ON "project_file_refs"("stored_file_id");

-- AddForeignKey
ALTER TABLE "project_file_refs" ADD CONSTRAINT "project_file_refs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "packaging_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_file_refs" ADD CONSTRAINT "project_file_refs_stored_file_id_fkey" FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE NO ACTION ON UPDATE CASCADE;


-- Backfill: same query as syncProjectFileRefs (src/modules/projects/infrastructure/project-file-refs.ts).
INSERT INTO "project_file_refs" ("project_id", "stored_file_id")
SELECT DISTINCT shown.project_id, f.id
FROM (
  SELECT p.id AS project_id, e ->> 'content' AS key
  FROM packaging_projects p, jsonb_array_elements(
    CASE WHEN jsonb_typeof(p.canvas_state -> 'elements') = 'array' THEN p.canvas_state -> 'elements' ELSE '[]'::jsonb END) e
  WHERE e ->> 'type' IN ('logo', 'image', 'pattern')
  UNION
  SELECT s.project_id, e ->> 'content'
  FROM project_snapshots s, jsonb_array_elements(
    CASE WHEN jsonb_typeof(s.canvas_state -> 'elements') = 'array' THEN s.canvas_state -> 'elements' ELSE '[]'::jsonb END) e
  WHERE e ->> 'type' IN ('logo', 'image', 'pattern')
) shown
JOIN stored_files f ON f.key = shown.key;
