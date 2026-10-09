import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { configuration } from '../../config';
import { CommonModule } from '../common.module';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  const env = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    JWT_ACCESS_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
    PORT: '4000',
  };

  let config: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        // A fixed environment, not the one of the machine running the tests.
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [() => configuration(env)],
        }),
        CommonModule,
      ],
    }).compile();
    config = moduleRef.get(ConfigService);
  });


  it('reads nested settings through the global CommonModule', () => {
    expect(config.get('app.port')).toBe(4000);
    expect(config.get('auth.jwt')).toMatchObject({ accessSecret: env.JWT_ACCESS_SECRET, accessTtlSeconds: 900 });
  });

  it('throws on a path that is not configured', () => {
    expect(() => config.get('app.missing' as 'app.port')).toThrow('NotFoundConfig: app.missing');
  });
});
