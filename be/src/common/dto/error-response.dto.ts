import { ApiProperty } from '@nestjs/swagger';

/** Body of every error response (AllExceptionsFilter). Some 4xx add fields, e.g. `fitCheck` on an export 422. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['dimensions.length must not be less than 40'],
  })
  message: string | string[];

  @ApiProperty({ example: '/api/projects' })
  path: string;

  @ApiProperty({
    example: '0b6f1c1e-3d8a-4c58-9a51-2f0e8d7c4b21',
    description: 'Same as the `X-Request-Id` header; quote it when reporting a bug',
  })
  requestId: string;

  @ApiProperty({ example: '2026-10-03T08:00:00.000Z' })
  timestamp: string;
}
