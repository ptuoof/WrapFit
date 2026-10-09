-- DB hardening part 2: dieline formula versions (shared/src/parametric/registry.ts).
-- A project is pinned to the formula version of its box structure when it is created, so a later formula change
-- never moves the cut lines of a design that was already checked or printed. Existing rows are version 1.

ALTER TABLE "box_templates" ADD COLUMN "formula_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "box_templates" ADD CONSTRAINT "chk_box_templates_formula_version" CHECK ("formula_version" >= 1);

-- The default only fills existing rows: every insert must state the version it was designed with.
ALTER TABLE "packaging_projects" ADD COLUMN "formula_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "packaging_projects" ALTER COLUMN "formula_version" DROP DEFAULT;
ALTER TABLE "packaging_projects" ADD CONSTRAINT "chk_packaging_projects_formula_version" CHECK ("formula_version" >= 1);
