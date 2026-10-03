import { ValidateIf } from 'class-validator';

/**
 * Like `@IsOptional()`, but only an omitted (`undefined`) value skips validation. `null` is validated and rejected
 * with a 400, instead of reaching Prisma as `null` for a required column (500).
 */
export const IsOptionalNotNull = () => ValidateIf((_object, value) => value !== undefined);
