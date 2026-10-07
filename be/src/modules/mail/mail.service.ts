import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { currentRequestId } from '../../common/context/request-context';
import { AUTH_EMAIL_JOB, AuthEmailJobData, MAIL_JOB_OPTIONS, MAIL_QUEUE } from './mail.constants';

/** API side: queues emails; the worker process (MailProcessor) sends them. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue(MAIL_QUEUE) private readonly queue: Queue<AuthEmailJobData>) {}

  /**
   * Queues the email of a verify-email / reset-password token. Returns false when the queue is unreachable: the
   * caller decides whether that fails the request (resend) or not (register, forgot password: the user can resend).
   */
  async sendAuthEmail(authTokenId: string): Promise<boolean> {
    try {
      await this.queue.add(
        AUTH_EMAIL_JOB,
        { authTokenId, requestId: currentRequestId() },
        { ...MAIL_JOB_OPTIONS, jobId: authTokenId },
      );
      return true;
    } catch (error) {
      this.logger.error(
        `mail.enqueue_failed authTokenId=${authTokenId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
