import { Module } from '@nestjs/common';
import { ConfigService } from '../common';
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
        const apiKey = config.get('ai.anthropicApiKey');
        return apiKey
          ? new ClaudePatternGenerator({
              apiKey,
              model: config.get('ai.model'),
              timeoutMs: config.get('ai.timeoutMs'),
            })
          : null;
      },
    },
  ],
})
export class AiModule {}
