import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { AppConfigService } from '../../config/app-config.type';
import type { EmailContent } from './mail.templates';

/** SMTP connection of the worker (local: Mailpit from docker-compose.yml; production: the provider's SMTP relay). */
@Injectable()
export class SmtpMailer implements OnModuleDestroy {
  private readonly transport: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    const env = config as unknown as AppConfigService;
    const user = env.get('SMTP_USER', { infer: true });
    this.from = env.get('MAIL_FROM', { infer: true });
    this.transport = createTransport({
      host: env.get('SMTP_HOST', { infer: true }),
      port: env.get('SMTP_PORT', { infer: true }),
      secure: env.get('SMTP_SECURE', { infer: true }) === 'true', // implicit TLS (465); 587 upgrades with STARTTLS
      auth: user ? { user, pass: env.get('SMTP_PASS', { infer: true }) } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  async send(to: string, content: EmailContent): Promise<void> {
    await this.transport.sendMail({ from: this.from, to, ...content });
  }

  onModuleDestroy(): void {
    this.transport.close();
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
