import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MAIL_QUEUE } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';
import { SmtpMailer } from './smtp-mailer';

/** API side: queues emails. Imported by the modules that send mail (auth). */
@Module({
  imports: [BullModule.registerQueue({ name: MAIL_QUEUE })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

/** Worker side: the SMTP sender. Imported by WorkerModule (src/worker.ts), never by the API. */
@Module({
  imports: [BullModule.registerQueue({ name: MAIL_QUEUE })],
  providers: [MailProcessor, SmtpMailer],
})
export class MailWorkerModule {}
