import { Global, Module } from '@nestjs/common';
import { ConfigService } from './providers/config.service';

/** Global: providers every module may inject without importing this module. */
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CommonModule {}
