import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

const repost = vi.fn().mockResolvedValue(undefined);
const cancelRun = vi.fn().mockResolvedValue(undefined);
const resolvePendingInput = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../hooks/admin', () => ({
  useAdminRunOps: () => ({ repost, cancelRun, resolvePendingInput }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { PipelineRunDetailModal } from '../PipelineRunDetailModal';
import { selectedPipelineRunIdAtom, selectedPipelineRunDetailAtom } from '../../../state/adminState';

const run = {
  id: 'r1',
  userId: 'u1',
  activityId: 'a1',
  status: 'PIPELINE_RUN_STATUS_FAILED',
  title: 'Morning Run',
  source: 'SOURCE_STRAVA',
  steps: [
    { id: 's1', ordinal: 1, kind: 'EXECUTION_STEP_KIND_SOURCE', displayName: 'Webhook ingest', status: 'EXECUTION_STEP_STATUS_OK', durationMs: '10' },
    { id: 's2', ordinal: 2, kind: 'EXECUTION_STEP_KIND_DESTINATION', displayName: 'Strava upload', status: 'EXECUTION_STEP_STATUS_FAILED', error: 'rate limited' },
  ],
  destinations: [{ destination: 'DESTINATION_STRAVA', status: 'DESTINATION_STATUS_FAILED', error: 'boom' }],
};

function renderWithRun() {
  const store = createStore();
  store.set(selectedPipelineRunIdAtom, 'r1');
  store.set(selectedPipelineRunDetailAtom, run as never);
  return render(<PipelineRunDetailModal />, {
    wrapper: ({ children }) => (
      <Provider store={store}><ToastProvider>{children}</ToastProvider></Provider>
    ),
  });
}

beforeEach(() => {
  repost.mockClear();
  cancelRun.mockClear();
});

describe('PipelineRunDetailModal', () => {
  it('renders nothing when no run is selected', () => {
    const { container } = render(<PipelineRunDetailModal />, {
      wrapper: ({ children }) => <Provider><ToastProvider>{children}</ToastProvider></Provider>,
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the execution timeline with per-step errors', () => {
    renderWithRun();
    expect(screen.getByText(/Webhook ingest/)).toBeTruthy();
    expect(screen.getByText(/Strava upload/)).toBeTruthy();
    expect(screen.getByText('rate limited')).toBeTruthy();
  });

  it('re-runs the full pipeline', async () => {
    renderWithRun();
    fireEvent.click(screen.getByText('Re-run full pipeline'));
    await waitFor(() => expect(repost).toHaveBeenCalledWith('u1', 'a1', 'full-pipeline'));
  });

  it('retries a failed destination with its plugin id', async () => {
    renderWithRun();
    fireEvent.click(screen.getByText('Retry Strava'));
    await waitFor(() => expect(repost).toHaveBeenCalledWith('u1', 'a1', 'retry-destination', 'strava'));
  });
});
