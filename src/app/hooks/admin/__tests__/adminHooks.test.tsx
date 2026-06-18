import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const GET = vi.fn();
const PUT = vi.fn();
const DELETE = vi.fn();
vi.mock('../../../../shared/api/admin-client', () => {
  const c = { GET: (...a: unknown[]) => GET(...a), PUT: (...a: unknown[]) => PUT(...a), DELETE: (...a: unknown[]) => DELETE(...a) };
  return { adminClient: c, default: c };
});
vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useAdminStats } from '../useAdminStats';
import { useAdminUsers } from '../useAdminUsers';
import { useAdminPipelineRuns } from '../useAdminPipelineRuns';

function wrapper() {
  const store = createStore();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

beforeEach(() => {
  GET.mockReset();
  PUT.mockReset();
  DELETE.mockReset();
});

describe('useAdminStats', () => {
  it('fetches platform stats on mount', async () => {
    GET.mockResolvedValue({ data: { totalUsers: 10 } });
    const { result } = renderHook(() => useAdminStats(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual({ totalUsers: 10 });
  });

  it('surfaces an error via the awaited refresh path', async () => {
    GET.mockResolvedValue({ data: { totalUsers: 1 } });
    const { result } = renderHook(() => useAdminStats(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    GET.mockRejectedValue(new Error('403'));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.error).toBe('Failed to load platform statistics');
  });
});

describe('useAdminUsers', () => {
  it('fetches a page of users', async () => {
    GET.mockResolvedValue({ data: { users: [{ userId: 'u1' }] } });
    const { result } = renderHook(() => useAdminUsers(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchUsers(2); });
    expect(result.current.users).toEqual([{ userId: 'u1' }]);
    expect(result.current.pagination).toEqual({ page: 2 });
  });

  it('records an error when the list fetch fails', async () => {
    GET.mockRejectedValue(new Error('403'));
    const { result } = renderHook(() => useAdminUsers(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchUsers(); });
    expect(result.current.error).toMatch(/Admin access required/);
  });

  it('fetches user detail into the shared atom', async () => {
    GET.mockResolvedValue({ data: { userId: 'u1', email: 'a@b.com' } });
    const { result } = renderHook(() => useAdminUsers(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchUserDetail('u1'); });
    expect(result.current.selectedUser).toMatchObject({ userId: 'u1', email: 'a@b.com' });
  });

  it('updateUser PUTs then refreshes', async () => {
    GET.mockResolvedValue({ data: { users: [] } });
    PUT.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUsers(), { wrapper: wrapper() });
    await act(async () => { await result.current.updateUser('u1', { accessEnabled: true }); });
    expect(PUT).toHaveBeenCalledWith('/users/{id}', expect.objectContaining({
      params: { path: { id: 'u1' } },
      body: { id: 'u1', accessEnabled: true },
    }));
  });

  it('deleteUserData DELETEs then refreshes detail', async () => {
    GET.mockResolvedValue({ data: { userId: 'u1' } });
    DELETE.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUsers(), { wrapper: wrapper() });
    await act(async () => { await result.current.deleteUserData('u1', 'pipelines', 'p1'); });
    expect(DELETE).toHaveBeenCalledWith('/admin/users/u1/pipelines/p1', {});
  });
});

describe('useAdminPipelineRuns', () => {
  it('fetches runs with stats and pagination cursor', async () => {
    GET.mockResolvedValue({ data: { runs: [{ id: 'r1' }], stats: { total: 1, byStatus: {}, bySource: {} }, nextCursor: 'c1', hasMore: true } });
    const { result } = renderHook(() => useAdminPipelineRuns(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchRuns(); });
    expect(result.current.runs).toEqual([{ id: 'r1' }]);
    expect(result.current.stats?.total).toBe(1);
    expect(result.current.hasMore).toBe(true);
  });

  it('loadMore appends the next page', async () => {
    GET.mockResolvedValue({ data: { runs: [{ id: 'r1' }], stats: { total: 1, byStatus: {}, bySource: {} }, nextCursor: 'c1', hasMore: true } });
    const { result } = renderHook(() => useAdminPipelineRuns(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchRuns(); });

    GET.mockResolvedValue({ data: { runs: [{ id: 'r2' }], stats: { total: 2, byStatus: {}, bySource: {} }, hasMore: false } });
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.runs.map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(result.current.hasMore).toBe(false);
  });

  it('records an error on fetch failure', async () => {
    GET.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAdminPipelineRuns(), { wrapper: wrapper() });
    await act(async () => { await result.current.fetchRuns(); });
    expect(result.current.error).toBe('Failed to load pipeline runs');
  });
});
