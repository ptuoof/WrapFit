import type { Request, Response } from 'express';
import { DEFAULT_LOGIN_REDIRECT, OAUTH_STATE_COOKIE, safeRedirectPath } from '../auth.constants';
import { AuthCookieService } from '../auth-cookie.service';
import { OAuthStateStore, readOAuthState } from './oauth-state.store';

describe('safeRedirectPath', () => {
  it.each(['/dashboard', '/p/8f92a1', '/templates?tag=noel'])('keeps the relative path %s', (path) => {
    expect(safeRedirectPath(path)).toBe(path);
  });

  it.each([
    undefined,
    42,
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'dashboard',
    '/ok\r\nSet-Cookie: x=1',
    `/${'a'.repeat(600)}`,
  ])('falls back to the default for %p', (value) => {
    expect(safeRedirectPath(value)).toBe(DEFAULT_LOGIN_REDIRECT);
  });
});

describe('OAuthStateStore', () => {
  const setOAuthState = jest.fn();
  const store = new OAuthStateStore({ setOAuthState } as unknown as AuthCookieService);

  beforeEach(() => setOAuthState.mockReset());

  const storeState = (query: Record<string, unknown>) => {
    const req = { query, res: {} as Response } as unknown as Request;
    let state = '';
    store.store(req, {}, (_err, value) => (state = value!));
    const cookieValue = setOAuthState.mock.calls[0][1] as string;
    return { state, cookieValue };
  };

  const verify = (cookieValue: string | undefined, providedState: string) => {
    const req = { cookies: cookieValue ? { [OAUTH_STATE_COOKIE]: cookieValue } : {} } as unknown as Request;
    return new Promise<boolean>((resolve) => store.verify(req, providedState, (_err, ok) => resolve(ok)));
  };

  it('uses passport-oauth2 arities (store: 3, verify: 3)', () => {
    expect(store.store.length).toBe(3);
    expect(store.verify.length).toBe(3);
  });

  it('issues a random state and remembers a safe redirect', () => {
    const first = storeState({ redirect: '/p/8f92a1' });
    setOAuthState.mockReset();
    const second = storeState({ redirect: 'https://evil.example' });

    expect(first.state).toMatch(/^[\w-]{32}$/);
    expect(first.state).not.toBe(second.state);
    expect(readOAuthState({ cookies: { [OAUTH_STATE_COOKIE]: first.cookieValue } } as unknown as Request)).toEqual({
      state: first.state,
      redirect: '/p/8f92a1',
    });
    expect(JSON.parse(second.cookieValue).redirect).toBe(DEFAULT_LOGIN_REDIRECT);
  });

  it('accepts only the state stored in the cookie', async () => {
    const { state, cookieValue } = storeState({});
    await expect(verify(cookieValue, state)).resolves.toBe(true);
    await expect(verify(cookieValue, `${state.slice(0, -1)}x`)).resolves.toBe(false);
    await expect(verify(cookieValue, '')).resolves.toBe(false);
    await expect(verify(undefined, state)).resolves.toBe(false);
    await expect(verify('not-json', state)).resolves.toBe(false);
  });
});
