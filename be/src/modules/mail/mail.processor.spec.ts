import { ConfigService } from '@nestjs/config';
import { Job, UnrecoverableError } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { hashAuthToken, rawAuthToken } from '../auth/auth-token.crypto';
import { AuthEmailJobData } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { isPermanentSmtpFailure, maskEmail, SmtpMailer, SmtpStartupCheck } from './smtp-mailer';

describe('MailProcessor', () => {
  const secret = 'b'.repeat(32);
  const env: Record<string, unknown> = { JWT_REFRESH_SECRET: secret, FRONTEND_URL: 'https://wrapfit.vn/' };
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const tokenId = '0192a4c0-0000-7000-8000-000000000001';
  const job = (attemptsMade = 0) =>
    ({ name: 'auth-email', data: { authTokenId: tokenId }, attemptsMade }) as Job<AuthEmailJobData>;

  let prisma: { authToken: { findUnique: jest.Mock }; user: { findUnique: jest.Mock } };
  let mailer: { send: jest.Mock };
  let processor: MailProcessor;

  const usable = (overrides = {}) => ({
    purpose: 'VERIFY_EMAIL',
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    user: { email: 'an.nguyen@gmail.com', fullName: 'An' },
    ...overrides,
  });

  beforeEach(() => {
    prisma = { authToken: { findUnique: jest.fn() }, user: { findUnique: jest.fn() } };
    mailer = { send: jest.fn() };
    processor = new MailProcessor(prisma as unknown as PrismaService, mailer as unknown as SmtpMailer, config);
    for (const level of ['log', 'warn', 'error'] as const) {
      jest.spyOn(processor['logger'], level).mockImplementation(() => undefined);
    }
  });

  it('mails the link of the token, derived from its id; the stored hash matches it', async () => {
    prisma.authToken.findUnique.mockResolvedValue(usable());

    await expect(processor.process(job())).resolves.toEqual({ sent: true });

    const [to, content] = mailer.send.mock.calls[0];
    expect(to).toBe('an.nguyen@gmail.com');
    const token = rawAuthToken(secret, tokenId);
    expect(content.text).toContain(`https://wrapfit.vn/verify-email?token=${token}`);
    expect(content.html).toContain(`https://wrapfit.vn/verify-email?token=${token}`);
    expect(content.subject).toBe('Xác nhận email WrapFit của bạn');
    expect(hashAuthToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('links the email of a repeated registration to the page that sets the password', async () => {
    prisma.authToken.findUnique.mockResolvedValue(usable({ purpose: 'COMPLETE_SIGNUP' }));
    await processor.process(job());
    const [, content] = mailer.send.mock.calls[0];
    expect(content.subject).toBe('Hoàn tất đăng ký WrapFit');
    expect(content.text).toContain('https://wrapfit.vn/complete-signup?token=');
  });

  it('tells the owner of an existing account that someone tried to register, without any link that signs in', async () => {
    prisma.user.findUnique.mockResolvedValue({ email: 'an.nguyen@gmail.com', fullName: 'An', isActive: true });
    const notice = { name: 'account-exists', data: { userId: 'u-1' }, attemptsMade: 0 } as unknown as Job<AuthEmailJobData>;

    await expect(processor.process(notice)).resolves.toEqual({ sent: true });
    const [to, content] = mailer.send.mock.calls[0];
    expect(to).toBe('an.nguyen@gmail.com');
    expect(content.subject).toBe('Email của bạn đã có tài khoản WrapFit');
    expect(content.text).toContain('https://wrapfit.vn/forgot-password');
    expect(content.text).not.toContain('token=');
    expect(prisma.authToken.findUnique).not.toHaveBeenCalled();

    prisma.user.findUnique.mockResolvedValue({ email: 'x@y.z', fullName: null, isActive: false });
    await expect(processor.process(notice)).resolves.toEqual({ sent: false }); // disabled meanwhile
  });

  it('links a reset email to the reset page', async () => {
    prisma.authToken.findUnique.mockResolvedValue(usable({ purpose: 'RESET_PASSWORD' }));
    await processor.process(job());
    expect(mailer.send.mock.calls[0][1].text).toContain('https://wrapfit.vn/reset-password?token=');
  });

  it.each([
    ['used or replaced', { consumedAt: new Date() }],
    ['expired', { expiresAt: new Date(Date.now() - 1) }],
  ])('skips a token that was %s by the time the job runs', async (_label, overrides) => {
    prisma.authToken.findUnique.mockResolvedValue(usable(overrides));
    await expect(processor.process(job())).resolves.toEqual({ sent: false });
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('lets BullMQ retry temporary failures and stops on a permanent refusal', async () => {
    prisma.authToken.findUnique.mockResolvedValue(usable());

    mailer.send.mockRejectedValueOnce(Object.assign(new Error('421 try later'), { responseCode: 421 }));
    const temporary = await processor.process(job()).catch((e: unknown) => e);
    expect(temporary).not.toBeInstanceOf(UnrecoverableError);

    mailer.send.mockRejectedValueOnce(Object.assign(new Error('connect ETIMEDOUT'), { code: 'ETIMEDOUT' }));
    expect(await processor.process(job(1)).catch((e: unknown) => e)).not.toBeInstanceOf(UnrecoverableError);

    mailer.send.mockRejectedValueOnce(Object.assign(new Error('550 mailbox unavailable'), { responseCode: 550 }));
    expect(await processor.process(job(2)).catch((e: unknown) => e)).toBeInstanceOf(UnrecoverableError);
  });

  it('never writes the address or the link to the logs', async () => {
    prisma.authToken.findUnique.mockResolvedValue(usable());
    await processor.process(job());
    const logged = (processor['logger'].log as jest.Mock).mock.calls.flat().join(' ');
    expect(logged).toContain('to=a***@g***.com');
    expect(logged).not.toContain('an.nguyen');
    expect(logged).not.toContain(rawAuthToken(secret, tokenId));
  });
});

describe('SMTP helpers', () => {
  it('classifies SMTP replies', () => {
    expect(isPermanentSmtpFailure({ responseCode: 550 })).toBe(true);
    expect(isPermanentSmtpFailure({ responseCode: 451 })).toBe(false);
    expect(isPermanentSmtpFailure(new Error('ECONNREFUSED'))).toBe(false);
    expect(isPermanentSmtpFailure(null)).toBe(false);
  });

  it('masks addresses', () => {
    expect(maskEmail('an.nguyen@gmail.com')).toBe('a***@g***.com');
    expect(maskEmail('x@localhost')).toBe('x***@l***');
  });
});

describe('SmtpStartupCheck', () => {
  const check = (result: Awaited<ReturnType<SmtpMailer['verify']>>) => {
    const mailer = { target: 'smtp.resend.com:465 (TLS, user resend)', verify: jest.fn().mockResolvedValue(result) };
    const startup = new SmtpStartupCheck(mailer as unknown as SmtpMailer);
    const log = jest.spyOn(startup['logger'], 'log').mockImplementation(() => undefined);
    const error = jest.spyOn(startup['logger'], 'error').mockImplementation(() => undefined);
    return { startup, log, error };
  };

  it('logs the relay as ready when the connection and the login work', async () => {
    const { startup, log, error } = check({ ok: true });
    await expect(startup.run()).resolves.toBe(true);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('mail.smtp_ready target=smtp.resend.com:465'));
    expect(error).not.toHaveBeenCalled();
  });

  it('logs an error with the target (never the password) and does not stop the worker', async () => {
    const { startup, error } = check({ ok: false, error: 'Invalid login [535]' });
    await expect(startup.run()).resolves.toBe(false);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('mail.smtp_unreachable target=smtp.resend.com:465 (TLS, user resend): Invalid login [535]'),
    );
  });
});
