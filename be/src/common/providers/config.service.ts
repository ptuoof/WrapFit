import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService, Path, PathValue } from '@nestjs/config';
import type { Config } from '../../config';

/**
 * Typed settings of src/config: `config.get('auth.jwt.accessTtlSeconds')` is a number. An unknown path throws
 * instead of returning undefined. Provided by the global CommonModule: inject this one, not the one of @nestjs/config.
 */
@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService<Config, true>) {}

  get<P extends Path<Config>>(path: P): PathValue<Config, P> {
    const value = this.config.get(path, { infer: true });
    if (value === undefined) throw new Error(`NotFoundConfig: ${path}`);
    return value;
  }
}
