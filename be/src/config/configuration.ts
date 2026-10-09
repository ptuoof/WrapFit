import type { Config, ConfigOverride } from './config.interface';
import { NodeEnv, validateEnv } from './env.validation';
import { config as defaults } from './envs/default';
import { config as development } from './envs/development';
import { config as production } from './envs/production';
import { config as test } from './envs/test';

const overrides = { [NodeEnv.Development]: development, [NodeEnv.Production]: production, [NodeEnv.Test]: test };

const isObject = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object' && !Array.isArray(value);

function merge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    result[key] = isObject(result[key]) && isObject(value) ? merge(result[key], value) : value;
  }
  return result as T;
}

/**
 * Settings of the process: envs/default.ts deep-merged with the file of the current NODE_ENV. Loaded by
 * `ConfigModule.forRoot({ load: [configuration] })`, after ConfigModule has read `.env` and validated it.
 */
export function configuration(env: Record<string, unknown> = process.env): Config {
  const validated = validateEnv(env);
  const override: ConfigOverride = overrides[validated.NODE_ENV](validated);
  return merge(defaults(validated), override);
}
