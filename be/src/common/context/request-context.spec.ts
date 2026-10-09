import type { NextFunction, Request, Response } from 'express';
import { AppLogger } from '../../config';
import { currentRequestId, requestIdMiddleware, runWithRequestId } from './request-context';

describe('request context', () => {
  const run = (incoming?: string) => {
    const headers: Record<string, string> = {};
    const req = { get: () => incoming } as unknown as Request;
    const res = {
      setHeader: (name: string, value: string) => (headers[name] = value),
    } as unknown as Response;
    let seen: string | undefined;
    requestIdMiddleware(req, res, (() => (seen = currentRequestId())) as NextFunction);
    return { header: headers['x-request-id'], seen };
  };

  it('keeps a well-formed incoming id, replaces anything else, and echoes it back', () => {
    expect(run('abc12345-proxy')).toEqual({
      header: 'abc12345-proxy',
      seen: 'abc12345-proxy',
    });

    const generated = run('bad id\n{"injected":true}');
    expect(generated.header).toMatch(/^[0-9a-f-]{36}$/);
    expect(generated.seen).toBe(generated.header);
    expect(currentRequestId()).toBeUndefined(); // only inside the request
  });

  it('adds the request id to JSON log lines', () => {
    const logger = new AppLogger({ json: true });
    const line = runWithRequestId('req-42', () =>
      logger['getJsonLogObject']('hello', { context: 'Test', logLevel: 'log' }),
    );
    expect(line).toMatchObject({
      level: 'log',
      message: 'hello',
      context: 'Test',
      requestId: 'req-42',
    });
    expect(logger['getJsonLogObject']('hello', { context: 'Test', logLevel: 'log' })).not.toHaveProperty('requestId');
  });
});
