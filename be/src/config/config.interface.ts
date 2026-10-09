import type { config as defaults } from './envs/default';

/** Shape of the application settings, see envs/default.ts. */
export type Config = ReturnType<typeof defaults>;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** What a NODE_ENV file (envs/production.ts, ...) may override. */
export type ConfigOverride = DeepPartial<Config>;
