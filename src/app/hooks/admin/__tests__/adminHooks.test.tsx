import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const GET = vi.fn();
const PUT = vi.fn();
const POST = vi.fn();
const DELETE = vi.fn();
vi.mock('../../../../shared/api/admin-client', () => {
  const c = {
    GET: (...a: unknown[]) => GET(...a),
    PUT: (...a: unknown[]) => PUT(...a),
    POST: (...a: unknown[]) => POST(...a),
    DELETE: (...a: unknown[]) => DELETE(...a),
  };
  return { adminClient: c, default: c };
});
vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useAdminStats } from '../useAdminStats';
import { useAdminUsers } from '../useAdminUsers';
import { useAdminUserDetail } from '../useAdminUserDetail';
import { useAdminRunOps } from '../useAdminRunOps';
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
  POST.mockReset();
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
});

describe('useAdminUserDetail', () => {
  it('loads the aggregated detail on mount', async () => {
    GET.mockResolvedValue({ data: { profile: { userId: 'u1', email: 'a@b.com' } } });
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.detail?.profile?.userId).toBe('u1');
  });

  it('updateUser PUTs the changed fields then reloads', async () => {
    GET.mockResolvedValue({ data: { profile: { userId: 'u1' } } });
    PUT.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.updateUser({ isAdmin: true }); });
    expect(PUT).toHaveBeenCalledWith('/users/{id}', expect.objectContaining({
      params: { path: { id: 'u1' } },
      body: { id: 'u1', isAdmin: true },
    }));
  });

  it('setIntegrationEnabled POSTs to the provider endpoint', async () => {
    GET.mockResolvedValue({ data: { profile: { userId: 'u1' } } });
    POST.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.setIntegrationEnabled('strava', false); });
    expect(POST).toHaveBeenCalledWith('/users/{id}/integrations/{provider}/enabled', expect.objectContaining({
      params: { path: { id: 'u1', provider: 'strava' } },
      body: { enabled: false },
    }));
  });

  it('sendPasswordReset POSTs to the reset endpoint', async () => {
    GET.mockResolvedValue({ data: { profile: { userId: 'u1' } } });
    POST.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.sendPasswordReset(); });
    expect(POST).toHaveBeenCalledWith('/users/{id}/send-password-reset', expect.anything());
  });

  it('deleteUserData DELETEs the data-type endpoint', async () => {
    GET.mockResolvedValue({ data: { profile: { userId: 'u1' } } });
    DELETE.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.deleteUserData('pipelines'); });
    expect(DELETE).toHaveBeenCalledWith('/users/{id}/{dataType}', expect.objectContaining({
      params: { path: { id: 'u1', dataType: 'pipelines' } },
    }));
  });

  it('records an error when the detail fetch fails', async () => {
    GET.mockRejectedValue(new Error('403'));
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load user/);
  });
});

describe('useAdminRunOps', () => {
  it('repost POSTs mode and destination', async () => {
    POST.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminRunOps(), { wrapper: wrapper() });
    await act(async () => { await result.current.repost('u1', 'a1', 'retry-destination', 'strava'); });
    expect(POST).toHaveBeenCalledWith('/users/{id}/activities/{activityId}/repost', expect.objectContaining({
      params: { path: { id: 'u1', activityId: 'a1' } },
      body: { mode: 'retry-destination', destination: 'strava' },
    }));
  });

  it('cancelRun POSTs to the cancel endpoint', async () => {
    POST.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminRunOps(), { wrapper: wrapper() });
    await act(async () => { await result.current.cancelRun('u1', 'r1'); });
    expect(POST).toHaveBeenCalledWith('/users/{id}/pipeline-runs/{runId}/cancel', expect.objectContaining({
      params: { path: { id: 'u1', runId: 'r1' } },
    }));
  });

  it('resolvePendingInput POSTs to the resolve endpoint', async () => {
    POST.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAdminRunOps(), { wrapper: wrapper() });
    await act(async () => { await result.current.resolvePendingInput('u1', 'i1'); });
    expect(POST).toHaveBeenCalledWith('/users/{id}/pending-inputs/{inputId}/resolve', expect.objectContaining({
      params: { path: { id: 'u1', inputId: 'i1' } },
    }));
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
