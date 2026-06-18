import { describe, it, expect, vi } from 'vitest';

const { fakeClient } = vi.hoisted(() => ({ fakeClient: { GET: vi.fn(), POST: vi.fn() } }));
vi.mock('../../../shared/api/client', () => ({ client: fakeClient, default: fakeClient }));

import { renderHook } from '@testing-library/react';
import { useApiClient } from '../useApiClient';

describe('useApiClient', () => {
  it('returns the singleton client with a stable reference', () => {
    const { result, rerender } = renderHook(() => useApiClient());
    expect(result.current).toBe(fakeClient);
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
