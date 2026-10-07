import type { JobsOptions } from 'bullmq';

export const MAIL_QUEUE = 'mail';
export const AUTH_EMAIL_JOB = 'auth-email';
export const ACCOUNT_EXISTS_JOB = 'account-exists';

/**
 * Data of an auth email job: the AuthToken row only. The worker reads the recipient and derives the link itself, so
 * Redis never holds an email address or a usable token. The job id is the AuthToken id (one email per token).
 */
export interface AuthEmailJobData {
  authTokenId: string;
  /** Id of the HTTP request that queued the email, so worker logs can be matched with it. */
  requestId?: string;
}

/** "Someone tried to register with your address": the account only, the worker reads the recipient. */
export interface AccountExistsJobData {
  userId: string;
  requestId?: string;
}

/** One account-exists notice per account and hour: the job id of the hour is kept that long (see MailService). */
export const ACCOUNT_EXISTS_WINDOW_MS = 60 * 60 * 1000;

/**
 * 5 attempts with exponential backoff (10 s, 20 s, 40 s, 80 s) for temporary SMTP failures (4xx replies, network).
 * A permanent refusal (5xx) is not retried. Sent jobs leave Redis at once; failed ones are kept a week for inspection.
 */
export const MAIL_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 10_000 },
  removeOnComplete: true,
  removeOnFail: { age: 7 * 24 * 3600 },
};
