import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

const repost = vi.fn().mockResolvedValue(undefined);
const cancelRun = vi.fn().mockResolvedValue(undefined);
const resolvePendingInput = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../hooks/admin', () => ({
  useAdminRunOps: () => ({ repost, cancelRun, resolvePendingInput }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { AdminRunPane } from '../AdminRunPane';

const run = {
  id: 'r1', userId: 'u1', activityId: 'a1',
  status: 'PIPELINE_RUN_STATUS_FAILED', source: 'SOURCE_STRAVA', title: 'Run',
  steps: [{ id: 's1', ordinal: 1, kind: 'EXECUTION_STEP_KIND_DESTINATION', displayName: 'Strava upload', status: 'EXECUTION_STEP_STATUS_FAILED', error: 'rate limited' }],
  destinations: [{ destination: 'DESTINATION_STRAVA', status: 'DESTINATION_STATUS_FAILED' }],
};

function renderPane() {
  return render(<ToastProvider><AdminRunPane run={run as never} onActed={vi.fn()} /></ToastProvider>);
}

beforeEach(() => { repost.mockClear(); });

describe('AdminRunPane', () => {
  it('renders the timeline with per-step errors', () => {
    renderPane();
    expect(screen.getByText('Strava upload')).toBeTruthy();
    expect(screen.getByText(/rate limited/)).toBeTruthy();
  });

  it('re-runs the full pipeline', async () => {
    renderPane();
    fireEvent.click(screen.getByText('Re-run full'));
    await waitFor(() => expect(repost).toHaveBeenCalledWith('u1', 'a1', 'full-pipeline'));
  });

  it('retries a failed destination with its plugin id', async () => {
    renderPane();
    fireEvent.click(screen.getByText('Retry Strava'));
    await waitFor(() => expect(repost).toHaveBeenCalledWith('u1', 'a1', 'retry-destination', 'strava'));
  });
});
