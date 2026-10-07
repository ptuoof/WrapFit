import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, UnrecoverableError } from 'bullmq';
import { runWithRequestId } from '../../common/context/request-context';
import { AppConfigService } from '../../config/app-config.type';
import { PrismaService } from '../../prisma/prisma.service';
import { authTokenSecret, rawAuthToken } from '../auth/auth-token.crypto';
import { AuthEmailJobData, MAIL_QUEUE } from './mail.constants';
import { authEmail } from './mail.templates';
import { isPermanentSmtpFailure, maskEmail, SmtpMailer } from './smtp-mailer';

/** Frontend pages that read `?token=` and call the matching API route. */
const LINK_PATHS = { VERIFY_EMAIL: '/verify-email', RESET_PASSWORD: '/reset-password' } as const;

/**
 * Sends the email of an AuthToken (worker process). Delivery is at least once: a token that was used, replaced or has
 * expired by the time the job runs is skipped, so a late retry never mails a dead link.
 */
@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly secret: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: SmtpMailer,
    config: ConfigService,
  ) {
    super();
    const env = config as unknown as AppConfigService;
    this.secret = authTokenSecret(env);
    this.frontendUrl = env.get('FRONTEND_URL', { infer: true }).replace(/\/+$/, '');
  }

  process(job: Job<AuthEmailJobData>): Promise<{ sent: boolean }> {
    const { authTokenId, requestId } = job.data;
    return runWithRequestId(requestId ?? `job:${authTokenId}`, () => this.send(job, authTokenId));
  }

  private async send(job: Job<AuthEmailJobData>, authTokenId: string): Promise<{ sent: boolean }> {
    const token = await this.prisma.authToken.findUnique({
      where: { id: authTokenId },
      select: { purpose: true, expiresAt: true, consumedAt: true, user: { select: { email: true, fullName: true } } },
    });
    if (!token || token.consumedAt || token.expiresAt <= new Date()) {
      this.logger.log(`mail.skipped authTokenId=${authTokenId} reason=token_no_longer_usable`);
      return { sent: false };
    }

    const link = `${this.frontendUrl}${LINK_PATHS[token.purpose]}?token=${rawAuthToken(this.secret, authTokenId)}`;
    const to = maskEmail(token.user.email);
    const attempt = job.attemptsMade + 1;
    try {
      await this.mailer.send(token.user.email, authEmail(token.purpose, link, token.user.fullName));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isPermanentSmtpFailure(error)) {
        this.logger.error(`mail.failed permanent purpose=${token.purpose} to=${to} authTokenId=${authTokenId}: ${message}`);
        throw new UnrecoverableError(message); // BullMQ does not retry it
      }
      this.logger.warn(`mail.retry attempt=${attempt} purpose=${token.purpose} to=${to} authTokenId=${authTokenId}: ${message}`);
      throw error;
    }
    this.logger.log(`mail.sent purpose=${token.purpose} to=${to} authTokenId=${authTokenId} attempt=${attempt}`);
    return { sent: true };
  }
}
