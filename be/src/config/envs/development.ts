import type { ConfigOverride } from '../config.interface';
import type { EnvironmentVariables } from '../env.validation';

/** NODE_ENV=development: overrides of envs/default.ts (none yet). */
export const config = (_env: EnvironmentVariables): ConfigOverride => ({});
