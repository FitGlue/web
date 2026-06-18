import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const getIdToken = vi.fn();
const { authState } = vi.hoisted(() => ({ authState: { auth: null as { currentUser: unknown } | null } }));
vi.mock('../../../shared/firebase', () => ({ getFirebaseAuth: () => authState.auth }));
vi.mock('../../infrastructure/sentry', () => ({ Sentry: { captureException: vi.fn() } }));
vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useApi } from '../useApi';
import { authLoadingAtom } from '../../state/authState';

const fetchMock = vi.fn();

function setup() {
  const store = createStore();
  store.set(authLoadingAtom, false);
  const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
  return renderHook(() => useApi(), { wrapper });
}

const okResponse = (body: unknown) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body });
const errResponse = () => ({ ok: false, status: 500, statusText: 'Server Error', json: async () => ({}) });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  getIdToken.mockReset().mockResolvedValue('tok123');
  authState.auth = { currentUser: { getIdToken } };
});
afterEach(() => vi.unstubAllGlobals());

describe('useApi', () => {
  it('GET attaches the bearer token and returns JSON', async () => {
    fetchMock.mockResolvedValue(okResponse({ hello: 'world' }));
    const { result } = setup();
    const data = await result.current.get('/users/me');
    expect(data).toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/users/me', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ Authorization: 'Bearer tok123' }),
    }));
  });

  it('omits the auth header when there is no current user', async () => {
    authState.auth = { currentUser: null };
    fetchMock.mockResolvedValue(okResponse({}));
    const { result } = setup();
    await result.current.get('/x');
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('POST sends a JSON body', async () => {
    fetchMock.mockResolvedValue(okResponse({ ok: true }));
    const { result } = setup();
    await result.current.post('/things', { a: 1 });
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/things', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    }));
  });

  it('PUT, PATCH and DELETE hit the right verbs', async () => {
    fetchMock.mockResolvedValue(okResponse({}));
    const { result } = setup();
    await result.current.put('/p', { x: 1 });
    await result.current.patch('/p', { x: 2 });
    await result.current.delete('/p');
    const methods = fetchMock.mock.calls.map((c) => c[1].method);
    expect(methods).toEqual(['PUT', 'PATCH', 'DELETE']);
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue(errResponse());
    const { result } = setup();
    await expect(result.current.get('/boom')).rejects.toThrow(/GET \/boom failed: 500/);
  });

  it('strips an accidental /api/v2 prefix from the path', async () => {
    fetchMock.mockResolvedValue(okResponse({}));
    const { result } = setup();
    await result.current.get('/api/v2/users/me');
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/users/me', expect.anything());
  });

  it('strips a bare /api prefix from the path', async () => {
    fetchMock.mockResolvedValue(okResponse({}));
    const { result } = setup();
    await result.current.get('/api/public/thing');
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/public/thing', expect.anything());
  });
});
