import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export interface RequestContext {
  /** Id of the HTTP request (or `job:<id>` in the worker), written into every log line and error response. */
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Header read from the proxy / client and echoed back on every response. */
export const REQUEST_ID_HEADER = 'x-request-id';

// Accept a caller's id only when it looks like an id: it is copied into logs.
const VALID_REQUEST_ID = /^[\w-]{8,64}$/;

export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/** Runs `fn` with `requestId` attached to everything it logs (used by the export worker for each job). */
export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

/** Express middleware: one request id per request, kept for the whole async call chain. */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get(REQUEST_ID_HEADER);
  const requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  storage.run({ requestId }, next);
}
