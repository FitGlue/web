import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sentryMock } = vi.hoisted(() => ({
  sentryMock: {
    init: vi.fn(),
    setUser: vi.fn(),
    browserTracingIntegration: vi.fn(() => ({})),
    replayIntegration: vi.fn(() => ({})),
    reactRouterV6BrowserTracingIntegration: vi.fn(() => ({})),
  },
}));

vi.mock('@sentry/react', () => sentryMock);

import { initSentry, setUser, Sentry } from '../sentry';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('initSentry', () => {
  it('skips init when no DSN configured', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    initSentry();
    expect(sentryMock.init).not.toHaveBeenCalled();
  });

  it('initializes Sentry when a DSN is present', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://example@sentry.io/1');
    vi.stubEnv('VITE_ENVIRONMENT', 'prod');
    initSentry();
    expect(sentryMock.init).toHaveBeenCalledTimes(1);
    const cfg = sentryMock.init.mock.calls[0][0];
    expect(cfg.dsn).toBe('https://example@sentry.io/1');
    expect(cfg.environment).toBe('prod');
    // beforeSend strips sensitive headers
    const event = { request: { headers: { authorization: 'Bearer x', cookie: 'c', other: 'keep' } } };
    const cleaned = cfg.beforeSend(event);
    expect(cleaned.request.headers.authorization).toBeUndefined();
    expect(cleaned.request.headers.cookie).toBeUndefined();
    expect(cleaned.request.headers.other).toBe('keep');
  });
});

describe('setUser', () => {
  it('sets a user id when provided', () => {
    setUser('user-1');
    expect(sentryMock.setUser).toHaveBeenCalledWith({ id: 'user-1' });
  });
  it('clears the user when null', () => {
    setUser(null);
    expect(sentryMock.setUser).toHaveBeenCalledWith(null);
  });
});

describe('Sentry re-export', () => {
  it('re-exports the Sentry module', () => {
    expect(Sentry.init).toBe(sentryMock.init);
    expect(Sentry.setUser).toBe(sentryMock.setUser);
  });
});
