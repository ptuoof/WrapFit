import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { ConfigService, rawAuthToken, runWithRequestId } from '../common';
import { PrismaService } from '../shared/prisma';
import { ACCOUNT_EXISTS_JOB, AccountExistsJobData, AuthEmailJobData, MAIL_QUEUE } from './mail.constants';
import { accountExistsEmail, authEmail, EmailContent } from './mail.templates';
import { isPermanentSmtpFailure, maskEmail, SmtpMailer } from './smtp-mailer';

/** Frontend pages that read `?token=` and call the matching API route. */
const LINK_PATHS = {
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  COMPLETE_SIGNUP: '/complete-signup',
} as const;

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
    this.secret = config.get('auth.tokenSecret');
    this.frontendUrl = config.get('app.frontendUrl').replace(/\/+$/, '');
  }

  process(job: Job<AuthEmailJobData | AccountExistsJobData>): Promise<{ sent: boolean }> {
    return runWithRequestId(job.data.requestId ?? `job:${job.id}`, () =>
      job.name === ACCOUNT_EXISTS_JOB
        ? this.sendAccountExists(job as Job<AccountExistsJobData>)
        : this.send(job as Job<AuthEmailJobData>, (job.data as AuthEmailJobData).authTokenId),
    );
  }

  private async sendAccountExists(job: Job<AccountExistsJobData>): Promise<{ sent: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: job.data.userId },
      select: { email: true, fullName: true, isActive: true },
    });
    if (!user?.isActive) {
      this.logger.log(`mail.skipped account-exists userId=${job.data.userId} reason=account_gone`);
      return { sent: false };
    }
    const content = accountExistsEmail(user.fullName, `${this.frontendUrl}/login`, `${this.frontendUrl}/forgot-password`);
    await this.deliver(job, user.email, content, `purpose=ACCOUNT_EXISTS userId=${job.data.userId}`);
    return { sent: true };
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
    const content = authEmail(token.purpose, link, token.user.fullName);
    await this.deliver(job, token.user.email, content, `purpose=${token.purpose} authTokenId=${authTokenId}`);
    return { sent: true };
  }

  /** Sends, and decides whether BullMQ retries: temporary SMTP failures yes, permanent refusals no. */
  private async deliver(job: Job, email: string, content: EmailContent, context: string): Promise<void> {
    const to = maskEmail(email);
    const attempt = job.attemptsMade + 1;
    try {
      await this.mailer.send(email, content);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isPermanentSmtpFailure(error)) {
        this.logger.error(`mail.failed permanent ${context} to=${to}: ${message}`);
        throw new UnrecoverableError(message); // BullMQ does not retry it
      }
      this.logger.warn(`mail.retry attempt=${attempt} ${context} to=${to}: ${message}`);
      throw error;
    }
    this.logger.log(`mail.sent ${context} to=${to} attempt=${attempt}`);
  }
}
