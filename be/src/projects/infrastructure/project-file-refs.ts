import { Prisma } from '@prisma/client';

/**
 * Recomputes which uploads a project shows: the file elements of its canvas and of all its snapshots (canvases store
 * upload keys, see storage/asset-keys.ts). Call it in the transaction that changed the canvas or the snapshots, so
 * the refs always match what is stored. One statement; keys without a stored_files row are ignored.
 */
export async function syncProjectFileRefs(tx: Prisma.TransactionClient, projectId: string): Promise<void> {
  await tx.$executeRaw`
    WITH shown AS (
      SELECT f.id
      FROM (
        SELECT e ->> 'content' AS key
        FROM packaging_projects p, jsonb_array_elements(
          CASE WHEN jsonb_typeof(p.canvas_state -> 'elements') = 'array' THEN p.canvas_state -> 'elements' ELSE '[]'::jsonb END) e
        WHERE p.id = ${projectId}::uuid AND e ->> 'type' IN ('logo', 'image', 'pattern')
        UNION
        SELECT e ->> 'content'
        FROM project_snapshots s, jsonb_array_elements(
          CASE WHEN jsonb_typeof(s.canvas_state -> 'elements') = 'array' THEN s.canvas_state -> 'elements' ELSE '[]'::jsonb END) e
        WHERE s.project_id = ${projectId}::uuid AND e ->> 'type' IN ('logo', 'image', 'pattern')
      ) keys
      JOIN stored_files f ON f.key = keys.key
    ),
    removed AS (
      DELETE FROM project_file_refs r
      WHERE r.project_id = ${projectId}::uuid AND r.stored_file_id NOT IN (SELECT id FROM shown)
    )
    INSERT INTO project_file_refs (project_id, stored_file_id)
    SELECT ${projectId}::uuid, id FROM shown
    ON CONFLICT DO NOTHING`;
}
