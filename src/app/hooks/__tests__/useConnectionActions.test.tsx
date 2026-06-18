import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const POST = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { POST: (...a: unknown[]) => POST(...a) },
  default: { POST: (...a: unknown[]) => POST(...a) },
}));

import { useConnectionActions } from '../useConnectionActions';

beforeEach(() => POST.mockReset());

describe('useConnectionActions', () => {
  it('triggers an action and marks it completed', async () => {
    POST.mockResolvedValue({ data: { jobId: 'j1', message: 'queued' } });
    const { result } = renderHook(() => useConnectionActions('strava'));

    let res!: { jobId: string };
    await act(async () => { res = await result.current.triggerAction('import-prs'); });

    expect(res.jobId).toBe('j1');
    expect(result.current.isActionCompleted('import-prs')).toBe(true);
    expect(result.current.isActionRunning('import-prs')).toBe(false);
    expect(POST).toHaveBeenCalledWith('/users/me/connections/{provider}/actions', {
      params: { path: { provider: 'strava' } },
      body: { provider: 'strava', action: 'import-prs' },
    });
  });

  it('resetAction clears completed + error state', async () => {
    POST.mockResolvedValue({ data: { jobId: 'j1', message: 'queued' } });
    const { result } = renderHook(() => useConnectionActions('strava'));

    await act(async () => { await result.current.triggerAction('import-prs'); });
    expect(result.current.isActionCompleted('import-prs')).toBe(true);

    act(() => result.current.resetAction('import-prs'));
    expect(result.current.isActionCompleted('import-prs')).toBe(false);
    expect(result.current.getActionError('import-prs')).toBeUndefined();
  });
});
