import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './common/providers/config.service';
import { NestFactory } from '@nestjs/core';
import { validateEnv } from './config/env.validation';
import { configuration } from './config/configuration';
import { CommonModule } from './common/common.module';
import { testEmail } from './mail/mail.templates';
import { maskEmail, SmtpMailer } from './mail/smtp-mailer';

/**
 * Sends one test email with the SMTP settings of the environment, to check a relay before real users depend on it:
 *   npm --workspace=be run mail:test -- you@example.com          (development, reads be/.env)
 *   docker compose exec worker node dist/mail-test.js you@example.com   (production container)
 * Exit code 0 = accepted by the relay; then check that it reached the inbox, not the spam folder.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv, load: [configuration] }),
    CommonModule,
  ],
  providers: [SmtpMailer],
})
class MailTestModule {}

async function main(): Promise<number> {
  const to = process.argv[2];
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error('Usage: npm --workspace=be run mail:test -- you@example.com');
    return 2;
  }

  const app = await NestFactory.createApplicationContext(MailTestModule, { logger: ['error', 'warn'] });
  try {
    const mailer = app.get(SmtpMailer);
    const config = app.get(ConfigService);
    console.log(`SMTP: ${mailer.target}`);
    console.log(`From: ${config.get('mail.from')}`);

    const check = await mailer.verify();
    if (!check.ok) {
      console.error(`Connection or login failed: ${check.error}`);
      return 1;
    }
    console.log('Connection and login: OK');

    const frontendUrl = config.get('app.frontendUrl').replace(/\/+$/, '');
    await mailer.send(to, testEmail(mailer.target, new Date(), frontendUrl));
    console.log(`Accepted for ${maskEmail(to)}. Check the inbox (and the spam folder) of that address.`);
    return 0;
  } catch (error) {
    const reply = (error as { responseCode?: number }).responseCode;
    console.error(`Sending failed${reply ? ` (SMTP ${reply})` : ''}: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  } finally {
    await app.close();
  }
}

main().then((code) => process.exit(code));
