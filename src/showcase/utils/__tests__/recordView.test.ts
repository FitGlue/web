import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the public client so we can assert which beacon endpoint is hit.
const post = vi.fn<(path: string, init?: unknown) => Promise<{ data: undefined; error: undefined }>>(
  () => Promise.resolve({ data: undefined, error: undefined }),
);
vi.mock('../../../shared/api/public-client', () => ({
  default: { POST: (path: string, init?: unknown) => post(path, init) },
  publicClient: { POST: (path: string, init?: unknown) => post(path, init) },
}));

import { recordShowcaseView } from '../recordView';

beforeEach(() => {
  post.mockClear();
  sessionStorage.clear();
});

describe('recordShowcaseView', () => {
  it('beacons the activity endpoint with the showcase id', async () => {
    await recordShowcaseView({ kind: 'activity', id: 's1' });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/showcase/{id}/view', { params: { path: { id: 's1' } } });
  });

  it('beacons the profile endpoint with the slug', async () => {
    await recordShowcaseView({ kind: 'profile', slug: 'jane' });
    expect(post).toHaveBeenCalledWith('/showcase/profile/{slug}/view', { params: { path: { slug: 'jane' } } });
  });

  it('beacons the roundup endpoint with slug and periodKey', async () => {
    await recordShowcaseView({ kind: 'roundup', slug: 'jane', periodKey: 'week-23-2025' });
    expect(post).toHaveBeenCalledWith('/showcase/{slug}/roundup/{periodKey}/view', {
      params: { path: { slug: 'jane', periodKey: 'week-23-2025' } },
    });
  });

  it('debounces repeat views of the same target within a session', async () => {
    await recordShowcaseView({ kind: 'activity', id: 's1' });
    await recordShowcaseView({ kind: 'activity', id: 's1' });
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('still counts a different target in the same session', async () => {
    await recordShowcaseView({ kind: 'activity', id: 's1' });
    await recordShowcaseView({ kind: 'activity', id: 's2' });
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('never throws when the beacon request fails', async () => {
    post.mockRejectedValueOnce(new Error('network'));
    await expect(recordShowcaseView({ kind: 'profile', slug: 'jane' })).resolves.toBeUndefined();
  });
});
