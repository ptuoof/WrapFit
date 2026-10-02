import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../config/app-config.type';
import { AiController } from './ai.controller';
import { AI_PATTERN_GENERATOR, AiPatternService } from './ai-pattern.service';
import { ClaudePatternGenerator } from './pattern/claude-pattern.generator';

/** AI pattern & palette generator (UC: "Sinh hoa văn AI"). Claude is optional: no key = procedural patterns. */
@Module({
  controllers: [AiController],
  providers: [
    AiPatternService,
    {
      provide: AI_PATTERN_GENERATOR,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = config as unknown as AppConfigService;
        const apiKey = env.get('ANTHROPIC_API_KEY', { infer: true });
        return apiKey
          ? new ClaudePatternGenerator({
              apiKey,
              model: env.get('AI_MODEL', { infer: true }),
              timeoutMs: env.get('AI_TIMEOUT_MS', { infer: true }),
            })
          : null;
      },
    },
  ],
})
export class AiModule {}
