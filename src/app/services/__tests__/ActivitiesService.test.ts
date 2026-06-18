import { describe, it, expect, vi, beforeEach } from 'vitest';

const GET = vi.fn();
const POST = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { GET: (...a: unknown[]) => GET(...a), POST: (...a: unknown[]) => POST(...a) },
  default: { GET: (...a: unknown[]) => GET(...a), POST: (...a: unknown[]) => POST(...a) },
}));

import { ActivitiesService } from '../ActivitiesService';

beforeEach(() => {
  GET.mockReset();
  POST.mockReset();
});

describe('ActivitiesService.getStats', () => {
  it('maps the API response into stats', async () => {
    GET.mockResolvedValue({ data: { totalActivities: 12, uploadsThisMonth: 3 } });
    expect(await ActivitiesService.getStats()).toEqual({ totalSynced: 12, uploadsThisMonth: 3 });
  });

  it('defaults missing fields to zero', async () => {
    GET.mockResolvedValue({ data: {} });
    expect(await ActivitiesService.getStats()).toEqual({ totalSynced: 0, uploadsThisMonth: 0 });
  });

  it('returns zeros and swallows errors', async () => {
    GET.mockRejectedValue(new Error('boom'));
    expect(await ActivitiesService.getStats()).toEqual({ totalSynced: 0, uploadsThisMonth: 0 });
  });
});

describe('ActivitiesService.get', () => {
  it('unwraps the activity field', async () => {
    GET.mockResolvedValue({ data: { activity: { id: 'a1', name: 'Run' } } });
    expect(await ActivitiesService.get('a1')).toEqual({ id: 'a1', name: 'Run' });
  });

  it('returns null when there is no activity', async () => {
    GET.mockResolvedValue({ data: {} });
    expect(await ActivitiesService.get('a1')).toBeNull();
  });

  it('returns null on error', async () => {
    GET.mockRejectedValue(new Error('nope'));
    expect(await ActivitiesService.get('a1')).toBeNull();
  });
});

describe('ActivitiesService.listUnsynchronized', () => {
  it('returns the executions array', async () => {
    GET.mockResolvedValue({ data: { executions: [{ pipelineExecutionId: 'p1' }] } });
    expect(await ActivitiesService.listUnsynchronized()).toEqual([{ pipelineExecutionId: 'p1' }]);
  });

  it('passes limit/offset query params', async () => {
    GET.mockResolvedValue({ data: { executions: [] } });
    await ActivitiesService.listUnsynchronized(5, 10);
    expect(GET).toHaveBeenCalledWith(expect.any(String), {
      params: { query: { limit: 5, offset: 10 } },
    });
  });

  it('returns [] on error', async () => {
    GET.mockRejectedValue(new Error('x'));
    expect(await ActivitiesService.listUnsynchronized()).toEqual([]);
  });
});

describe('ActivitiesService.getUnsynchronizedTrace', () => {
  it('normalises the trace shape', async () => {
    GET.mockResolvedValue({ data: { pipelineExecutionId: 'p1', pipelineExecution: [{ step: 's' }] } });
    expect(await ActivitiesService.getUnsynchronizedTrace('p1')).toEqual({
      pipelineExecutionId: 'p1',
      pipelineExecution: [{ step: 's' }],
    });
  });

  it('falls back to the passed id and empty execution list', async () => {
    GET.mockResolvedValue({ data: {} });
    expect(await ActivitiesService.getUnsynchronizedTrace('p9')).toEqual({
      pipelineExecutionId: 'p9',
      pipelineExecution: [],
    });
  });

  it('returns null on error', async () => {
    GET.mockRejectedValue(new Error('x'));
    expect(await ActivitiesService.getUnsynchronizedTrace('p1')).toBeNull();
  });
});

describe('ActivitiesService repost actions', () => {
  it('repostToMissedDestination returns the API response', async () => {
    POST.mockResolvedValue({ data: { success: true, message: 'ok' } });
    expect(await ActivitiesService.repostToMissedDestination('a1', 'strava')).toEqual({
      success: true,
      message: 'ok',
    });
  });

  it('repostToMissedDestination returns a failure on error', async () => {
    POST.mockRejectedValue(new Error('x'));
    expect(await ActivitiesService.repostToMissedDestination('a1', 'strava')).toEqual({
      success: false,
      message: 'Failed to re-post to destination',
    });
  });

  it('retryDestination returns a failure on error', async () => {
    POST.mockRejectedValue(new Error('x'));
    expect(await ActivitiesService.retryDestination('a1', 'strava')).toEqual({
      success: false,
      message: 'Failed to retry destination',
    });
  });

  it('fullPipelineRerun returns a failure on error', async () => {
    POST.mockRejectedValue(new Error('x'));
    expect(await ActivitiesService.fullPipelineRerun('a1')).toEqual({
      success: false,
      message: 'Failed to re-run pipeline',
    });
  });

  it('fullPipelineRerun defaults to success when API returns no body', async () => {
    POST.mockResolvedValue({ data: null });
    expect(await ActivitiesService.fullPipelineRerun('a1')).toEqual({ success: true });
  });
});
