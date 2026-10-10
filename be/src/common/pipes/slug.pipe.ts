import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

/**
 * Public slugs are nanoid strings (`A-Za-z0-9_-`). Anything else cannot exist, so answer 404 without a query:
 * `@Param('slug', new SlugPipe('Project not found'))`.
 */
@Injectable()
export class SlugPipe implements PipeTransform<string, string> {
  constructor(private readonly notFoundMessage = 'Not found') {}

  transform(value: string): string {
    if (!/^[\w-]{1,32}$/.test(value)) throw new NotFoundException(this.notFoundMessage);
    return value;
  }
}
