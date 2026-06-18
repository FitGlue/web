import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const onAuthStateChanged = vi.fn();
const initFirebase = vi.fn();
const GET = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...a: unknown[]) => onAuthStateChanged(...a),
}));
vi.mock('../../../shared/firebase', () => ({
  initFirebase: () => initFirebase(),
}));
vi.mock('../../../shared/api/client', () => ({
  default: { GET: (...a: unknown[]) => GET(...a) },
  client: { GET: (...a: unknown[]) => GET(...a) },
}));

import { useShowcaseOwner } from '../useShowcaseOwner';

// Drive onAuthStateChanged: immediately invoke the callback with `user`.
function withAuthUser(user: unknown) {
  onAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
    cb(user);
    return () => {};
  });
}

beforeEach(() => {
  onAuthStateChanged.mockReset();
  initFirebase.mockReset().mockResolvedValue({ auth: {} });
  GET.mockReset();
});

describe('useShowcaseOwner', () => {
  it('resolves to not-owner when no slug is provided', async () => {
    const { result } = renderHook(() => useShowcaseOwner(undefined));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(false);
  });

  it('resolves to not-owner when Firebase is unavailable', async () => {
    initFirebase.mockResolvedValue(null);
    const { result } = renderHook(() => useShowcaseOwner('jamesking'));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(false);
  });

  it('resolves to not-owner for anonymous visitors', async () => {
    withAuthUser(null);
    const { result } = renderHook(() => useShowcaseOwner('jamesking'));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(false);
  });

  it('is owner when the logged-in user’s slug matches', async () => {
    withAuthUser({ uid: 'u1' });
    GET.mockResolvedValue({ data: { profile: { slug: 'jamesking' } } });
    const { result } = renderHook(() => useShowcaseOwner('jamesking'));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(true);
  });

  it('is not owner when slugs differ', async () => {
    withAuthUser({ uid: 'u1' });
    GET.mockResolvedValue({ data: { profile: { slug: 'someoneelse' } } });
    const { result } = renderHook(() => useShowcaseOwner('jamesking'));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(false);
  });

  it('resolves to not-owner when the profile lookup fails', async () => {
    withAuthUser({ uid: 'u1' });
    GET.mockRejectedValue(new Error('500'));
    const { result } = renderHook(() => useShowcaseOwner('jamesking'));
    await waitFor(() => expect(result.current.resolved).toBe(true));
    expect(result.current.isOwner).toBe(false);
  });
});
