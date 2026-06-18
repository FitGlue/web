import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const GET = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { GET: (...a: unknown[]) => GET(...a) },
  default: { GET: (...a: unknown[]) => GET(...a) },
}));
vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useUser } from '../useUser';
import { userAtom, authLoadingAtom } from '../../state/authState';

beforeEach(() => GET.mockReset());

function wrapper(setup: (s: ReturnType<typeof createStore>) => void) {
  const store = createStore();
  setup(store);
  return function Wrapper({ children }: { children: React.ReactNode }) { return <Provider store={store}>{children}</Provider>; };
}

describe('useUser', () => {
  it('reports loading while Firebase auth is still resolving', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: wrapper((s) => s.set(authLoadingAtom, true)),
    });
    expect(result.current.loading).toBe(true);
    expect(GET).not.toHaveBeenCalled();
  });

  it('clears the profile when there is no Firebase user', async () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: wrapper((s) => {
        s.set(authLoadingAtom, false);
        s.set(userAtom, null);
      }),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(GET).not.toHaveBeenCalled();
  });

  it('fetches the profile once a Firebase user is present', async () => {
    GET.mockResolvedValue({ data: { id: 'u1', tier: 'ATHLETE' } });
    const { result } = renderHook(() => useUser(), {
      wrapper: wrapper((s) => {
        s.set(authLoadingAtom, false);
        s.set(userAtom, { uid: 'u1' } as never);
      }),
    });
    await waitFor(() => expect(result.current.user).toEqual({ id: 'u1', tier: 'ATHLETE' }));
  });

});
