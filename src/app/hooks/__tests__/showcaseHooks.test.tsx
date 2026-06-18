import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const GET = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { GET: (...a: unknown[]) => GET(...a) },
  default: { GET: (...a: unknown[]) => GET(...a) },
}));

import { useShowcaseSlug } from '../useShowcaseSlug';
import { useShowcasePreferences } from '../useShowcasePreferences';

beforeEach(() => GET.mockReset());

// useShowcaseSlug uses module-level atoms, so each test needs a fresh store.
function freshWrapper() {
  const store = createStore();
  return function Wrapper({ children }: { children: React.ReactNode }) { return <Provider store={store}>{children}</Provider>; };
}

describe('useShowcaseSlug', () => {
  it('fetches and returns the profile slug once', async () => {
    GET.mockResolvedValue({ data: { profile: { slug: 'jamesking' } } });
    const { result } = renderHook(() => useShowcaseSlug(), { wrapper: freshWrapper() });
    await waitFor(() => expect(result.current).toBe('jamesking'));
    expect(GET).toHaveBeenCalledTimes(1);
  });

  it('returns null when the user has no showcase profile', async () => {
    GET.mockResolvedValue({ data: { profile: null } });
    const { result } = renderHook(() => useShowcaseSlug(), { wrapper: freshWrapper() });
    await waitFor(() => expect(GET).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

});

describe('useShowcasePreferences', () => {
  it('loads preferences from the API', async () => {
    GET.mockResolvedValue({ data: { defaultDestination: true } });
    const { result } = renderHook(() => useShowcasePreferences());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.preferences).toEqual({ defaultDestination: true });
  });

});
