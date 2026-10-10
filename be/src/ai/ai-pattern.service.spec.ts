import { HttpStatus } from '@nestjs/common';
import type { PrismaService } from '../shared/prisma';
import { AiPatternService, DAILY_AI_LIMIT } from './ai-pattern.service';
import type { PatternGenerator } from './pattern/pattern.types';
import { ProceduralPatternGenerator } from './pattern/procedural-pattern.generator';

describe('AiPatternService', () => {
  const aiDesign = new ProceduralPatternGenerator().design({ theme: 'valentine', preferredColors: [] });
  let prisma: { user: { findUniqueOrThrow: jest.Mock }; aiGeneration: { count: jest.Mock; create: jest.Mock } };
  let ai: { generate: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ subscriptionTier: 'FREE' }) },
      aiGeneration: { count: jest.fn().mockResolvedValue(3), create: jest.fn() },
    };
    ai = {
      generate: jest.fn().mockResolvedValue({
        design: aiDesign,
        usage: { model: 'claude-opus-5-5', inputTokens: 900, outputTokens: 400 },
      }),
    };
  });
  const service = (generator: PatternGenerator | null) =>
    new AiPatternService(prisma as unknown as PrismaService, generator);

  it('uses the procedural generator when no AI is configured', async () => {
    const result = await service(null).generate('u-1', { theme: 'Tết hoa đào' });
    expect(result).toMatchObject({ source: 'procedural', themeName: 'Xuân Lộc Đỏ Son', usage: null });
    expect(result.tile.svg).toMatch(/^<svg /);
    expect(prisma.aiGeneration.create).not.toHaveBeenCalled();
  });

  it('records each AI generation against the daily quota', async () => {
    const result = await service(ai).generate('u-1', { theme: 'valentine', preferredColors: ['#E11D48'] });
    expect(result).toMatchObject({ source: 'ai', usage: { used: 4, limit: DAILY_AI_LIMIT.FREE } });
    expect(ai.generate).toHaveBeenCalledWith({ theme: 'valentine', preferredColors: ['#E11D48'] });
    expect(prisma.aiGeneration.create).toHaveBeenCalledWith({
      data: { userId: 'u-1', theme: 'valentine', model: 'claude-opus-5-5', inputTokens: 900, outputTokens: 400 },
    });
  });

  it('falls back to the procedural pattern when the AI fails, without using the quota', async () => {
    ai.generate.mockRejectedValueOnce(new Error('timeout'));
    const svc = service(ai);
    jest.spyOn(svc['logger'], 'warn').mockImplementation(() => undefined);

    const result = await svc.generate('u-1', { theme: 'Tết' });
    expect(result).toMatchObject({ source: 'procedural', usage: { used: 3 } });
    expect(prisma.aiGeneration.create).not.toHaveBeenCalled();
  });

  it('answers 429 once the daily limit of the plan is reached', async () => {
    prisma.aiGeneration.count.mockResolvedValueOnce(DAILY_AI_LIMIT.FREE);
    const error = await service(ai)
      .generate('u-1', { theme: 'Tết' })
      .catch((e) => e);
    expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(ai.generate).not.toHaveBeenCalled();
  });
});
