import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '../common';
import type { EmailContent } from './mail.templates';

/** SMTP connection of the worker (local: Mailpit from docker-compose.yml; production: the provider's SMTP relay). */
@Injectable()
export class SmtpMailer implements OnModuleDestroy {
  private readonly transport: Transporter;
  private readonly from: string;
  /** `host:port (TLS, user)` for logs: never the password. */
  readonly target: string;

  constructor(config: ConfigService) {
    const user = config.get('mail.smtp.user');
    const host = config.get('mail.smtp.host');
    const port = config.get('mail.smtp.port');
    const secure = config.get('mail.smtp.secure');
    this.from = config.get('mail.from');
    this.target = `${host}:${port} (${secure ? 'TLS' : 'STARTTLS if offered'}, ${user ? `user ${user}` : 'no auth'})`;
    this.transport = createTransport({
      host,
      port,
      secure, // implicit TLS (465); 587 upgrades with STARTTLS
      auth: user ? { user, pass: config.get('mail.smtp.pass') } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  async send(to: string, content: EmailContent): Promise<void> {
    await this.transport.sendMail({ from: this.from, to, ...content });
  }

  /**
   * Connects and authenticates without sending anything: catches a wrong host, port, TLS mode or API key before a
   * user waits for an email. Never throws.
   */
  async verify(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      await this.transport.verify();
      return { ok: true };
    } catch (error) {
      const code = (error as { responseCode?: number; code?: string }) ?? {};
      const detail = code.responseCode ?? code.code;
      return { ok: false, error: `${error instanceof Error ? error.message : String(error)}${detail ? ` [${detail}]` : ''}` };
    }
  }

  onModuleDestroy(): void {
    this.transport.close();
  }
}

/**
 * Worker start: checks the SMTP settings once, in the background (the export queue starts without waiting). A failure
 * is logged as an error with the target, so a misconfigured relay shows up in the logs right after a deploy.
 */
@Injectable()
export class SmtpStartupCheck implements OnApplicationBootstrap {
  private readonly logger = new Logger('SmtpStartupCheck');

  constructor(private readonly mailer: SmtpMailer) {}

  onApplicationBootstrap(): void {
    void this.run();
  }

  async run(): Promise<boolean> {
    const result = await this.mailer.verify();
    if (result.ok) {
      this.logger.log(`mail.smtp_ready target=${this.mailer.target}`);
    } else {
      this.logger.error(
        `mail.smtp_unreachable target=${this.mailer.target}: ${result.error}. Verify and reset emails will be retried, ` +
          'then fail: check SMTP_* in .env (npm --workspace=be run mail:test -- you@example.com)',
      );
    }
    return result.ok;
  }
}

/**
 * A 5xx SMTP reply is a permanent refusal (unknown mailbox, rejected sender, bad credentials): retrying sends the
 * same request again. 4xx replies and network errors (timeout, connection refused) are temporary.
 */
export function isPermanentSmtpFailure(error: unknown): boolean {
  const code = (error as { responseCode?: unknown } | null)?.responseCode;
  return typeof code === 'number' && code >= 500;
}

/** `an.nguyen@gmail.com` -> `a***@g***.com`: enough to tell recipients apart in logs, not to read the address. */
export function maskEmail(email: string): string {
  const [local, domain = ''] = email.split('@');
  const dot = domain.lastIndexOf('.');
  const host = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : '';
  return `${local.charAt(0)}***@${host.charAt(0)}***${tld}`;
}
