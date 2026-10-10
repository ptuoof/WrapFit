import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '../../common';
import { GoogleOAuthGuard } from './google-oauth.guard';

describe('GoogleOAuthGuard', () => {
  const guardWith = (clientId: string) =>
    new GoogleOAuthGuard({ get: () => clientId } as unknown as ConfigService);

  it('answers 503 while Google login is not configured', () => {
    expect(() => guardWith('').canActivate({} as ExecutionContext)).toThrow(ServiceUnavailableException);
  });

  it('turns a failed login into an empty user instead of throwing', () => {
    const guard = guardWith('client-id');
    jest.spyOn(guard['logger'], 'warn').mockImplementation(() => undefined);

    expect(guard.handleRequest(new Error('token exchange failed'), false, undefined)).toBeNull();
    expect(guard.handleRequest(null, false, { message: 'Invalid OAuth state' })).toBeNull();
    expect(guard.handleRequest(null, { googleId: 'g-1' }, undefined)).toEqual({ googleId: 'g-1' });
  });
});
