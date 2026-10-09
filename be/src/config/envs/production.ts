import type { ConfigOverride } from '../config.interface';
import type { EnvironmentVariables } from '../env.validation';

/** NODE_ENV=production: defaults that differ from envs/default.ts. A value set explicitly in the environment wins. */
export const config = (env: EnvironmentVariables): ConfigOverride => ({
  auth: {
    cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : true,
  },
});
