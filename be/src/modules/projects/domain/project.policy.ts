// Business rules of a packaging project. Plain TypeScript: unit-tested without Nest or a database.
import type { BoxDimensions } from '@wrapfit/shared';
import type { ProjectStatus } from './project.types';

const DIMENSION_KEYS = ['length', 'width', 'height', 'paperThickness'] as const;

export interface DimensionLimit {
  min?: number;
  max?: number;
}
export type DimensionLimits = Partial<Record<keyof BoxDimensions, DimensionLimit>>;

/**
 * Reads the allowed range of each dimension from a template's `formula_schema`
 * (`{ params: { length: { min, max }, ... } }`, see prisma/seed.ts). Unknown shapes give no limits.
 */
export function readDimensionLimits(formulaSchema: unknown): DimensionLimits {
  const params = (formulaSchema as { params?: Record<string, unknown> } | null)?.params;
  if (!params || typeof params !== 'object') return {};

  const limits: DimensionLimits = {};
  for (const key of DIMENSION_KEYS) {
    const param = params[key] as { min?: unknown; max?: unknown } | undefined;
    if (!param || typeof param !== 'object') continue;
    limits[key] = {
      min: typeof param.min === 'number' ? param.min : undefined,
      max: typeof param.max === 'number' ? param.max : undefined,
    };
  }
  return limits;
}

/** Returns one message per dimension outside the template range (same style as ValidationPipe messages). */
export function findDimensionViolations(dimensions: BoxDimensions, limits: DimensionLimits): string[] {
  const violations: string[] = [];
  for (const key of DIMENSION_KEYS) {
    const limit = limits[key];
    const value = dimensions[key];
    if (!limit) continue;
    if (limit.min !== undefined && value < limit.min) {
      violations.push(`dimensions.${key} must not be less than ${limit.min}`);
    }
    if (limit.max !== undefined && value > limit.max) {
      violations.push(`dimensions.${key} must not be greater than ${limit.max}`);
    }
  }
  return violations;
}

/** A project in the trash is read-only until it is restored. */
export function canEdit(status: ProjectStatus): boolean {
  return status !== 'DELETED';
}

/** Permanent deletion is only allowed from the trash (two-step delete). */
export function canDeletePermanently(status: ProjectStatus): boolean {
  return status === 'DELETED';
}
