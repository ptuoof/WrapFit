import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';

/** Typed ConfigService: `config.get('PORT', { infer: true })` returns a number. */
export type AppConfigService = ConfigService<EnvironmentVariables, true>;
