import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

vi.mock('../../../hooks/admin', () => ({
  useAdminPipelineRuns: () => ({
    runs: [{ id: 'r1', userId: 'u1abcdef', activityId: 'a1', source: 'SOURCE_STRAVA', title: 'Morning Run', status: 'PIPELINE_RUN_STATUS_FAILED', steps: [], destinations: [] }],
    stats: { total: 1, byStatus: { Failed: 1 }, bySource: {} },
    loading: false, error: null, hasMore: false, fetchRuns: vi.fn(), loadMore: vi.fn(),
  }),
  useAdminRunOps: () => ({ repost: vi.fn(), cancelRun: vi.fn(), resolvePendingInput: vi.fn() }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { AdminRunsConsole } from '../AdminRunsConsole';

const renderConsole = () => render(<Provider><ToastProvider><AdminRunsConsole /></ToastProvider></Provider>);

describe('AdminRunsConsole', () => {
  it('lists runs and shows a placeholder until one is selected', () => {
    renderConsole();
    expect(screen.getByText('Morning Run')).toBeTruthy();
    expect(screen.getByText('Select a run')).toBeTruthy();
  });

  it('opens the run ops pane when a row is clicked', () => {
    renderConsole();
    fireEvent.click(screen.getByText('Morning Run'));
    expect(screen.getByText('execution timeline')).toBeTruthy();
    expect(screen.getByText('operations')).toBeTruthy();
  });
});
