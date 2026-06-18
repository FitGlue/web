import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useAdminPipelineRuns = vi.fn();
vi.mock('../../../hooks/admin', () => ({
  useAdminPipelineRuns: () => useAdminPipelineRuns(),
}));

import { AdminPipelineRuns } from '../AdminPipelineRuns';

describe('AdminPipelineRuns', () => {
  it('renders an error state when loading fails', () => {
    useAdminPipelineRuns.mockReturnValue({
      runs: [],
      stats: null,
      loading: false,
      error: 'fail',
      selectedRun: null,
      hasMore: false,
      fetchRuns: vi.fn(),
      selectRun: vi.fn(),
      loadMore: vi.fn(),
    });
    render(<AdminPipelineRuns />);
    expect(screen.getByText(/Error loading pipeline runs/)).toBeInTheDocument();
  });

  it('renders the runs view when loaded', () => {
    useAdminPipelineRuns.mockReturnValue({
      runs: [],
      stats: null,
      loading: false,
      error: null,
      selectedRun: null,
      hasMore: false,
      fetchRuns: vi.fn(),
      selectRun: vi.fn(),
      loadMore: vi.fn(),
    });
    const { container } = render(<AdminPipelineRuns />);
    expect(container).toBeTruthy();
  });
});
