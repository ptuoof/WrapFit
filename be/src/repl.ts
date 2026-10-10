import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Interactive shell on the API module graph (https://docs.nestjs.com/recipes/repl): `npm --workspace=be run
 * start:repl`, then e.g. `await get(UsersService).findByEmail('an@example.com')`. Connects to the database and Redis
 * of be/.env like the API; `.exit` to quit.
 */
async function bootstrap() {
  await repl(AppModule);
}

bootstrap();
