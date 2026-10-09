import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { ConfigService } from '../providers/config.service';
import { OriginGuard } from './origin.guard';

describe('OriginGuard', () => {
  const guard = (corsOrigins = 'https://wrapfit.vn') =>
    new OriginGuard({
      get: (key: string) => ({ 'app.corsOrigins': corsOrigins, 'app.frontendUrl': 'https://app.wrapfit.vn/' })[key],
    } as unknown as ConfigService);

  const request = (method: string, headers: Record<string, string> = {}) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method, get: (name: string) => ({ host: 'api.wrapfit.vn', ...headers })[name.toLowerCase()] }),
      }),
    }) as unknown as ExecutionContext;

  it('lets state-changing requests through from CORS_ORIGINS, the frontend and the API itself', () => {
    expect(guard().canActivate(request('POST', { origin: 'https://wrapfit.vn' }))).toBe(true);
    expect(guard().canActivate(request('PATCH', { origin: 'https://app.wrapfit.vn' }))).toBe(true);
    expect(guard().canActivate(request('DELETE', { origin: 'https://api.wrapfit.vn' }))).toBe(true);
  });

  it('refuses them from any other origin, a subdomain of the site included', () => {
    for (const origin of ['https://cdn.wrapfit.vn', 'https://evil.example', 'null']) {
      expect(() => guard().canActivate(request('POST', { origin }))).toThrow(ForbiddenException);
    }
  });

  it('decides on Sec-Fetch-Site when the browser sends no Origin, and trusts clients that send neither', () => {
    expect(() => guard().canActivate(request('POST', { 'sec-fetch-site': 'same-site' }))).toThrow(ForbiddenException);
    expect(() => guard().canActivate(request('POST', { 'sec-fetch-site': 'cross-site' }))).toThrow(ForbiddenException);
    expect(guard().canActivate(request('POST', { 'sec-fetch-site': 'same-origin' }))).toBe(true);
    expect(guard().canActivate(request('POST'))).toBe(true); // curl, another server
  });

  it('never blocks reads, and is off while CORS_ORIGINS is "*"', () => {
    expect(guard().canActivate(request('GET', { origin: 'https://evil.example' }))).toBe(true);
    expect(guard('*').canActivate(request('POST', { origin: 'https://evil.example' }))).toBe(true);
  });

  it('answers with a stable code', () => {
    const error = (() => {
      try {
        guard().canActivate(request('POST', { origin: 'https://evil.example' }));
      } catch (caught) {
        return caught as ForbiddenException;
      }
    })();
    expect(error?.getResponse()).toMatchObject({ code: 'ORIGIN_NOT_ALLOWED' });
  });
});
