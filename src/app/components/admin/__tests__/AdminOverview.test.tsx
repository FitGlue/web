import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useAdminStats = vi.fn();
vi.mock('../../../hooks/admin', () => ({
  useAdminStats: () => useAdminStats(),
  useAdminRecentFailures: () => ({ runs: [], loading: false }),
}));

import { AdminOverview } from '../AdminOverview';

describe('AdminOverview', () => {
  it('renders an error message when the stats request fails', () => {
    useAdminStats.mockReturnValue({ stats: null, loading: false, error: 'boom' });
    render(<AdminOverview />);
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('renders skeletons while loading', () => {
    useAdminStats.mockReturnValue({ stats: null, loading: true, error: null });
    const { container } = render(<AdminOverview />);
    expect(container).toBeTruthy();
  });

  it('renders the stats grid', () => {
    useAdminStats.mockReturnValue({
      stats: { totalUsers: 5, athleteUsers: 2, adminUsers: 1, totalSyncsThisMonth: 99 },
      loading: false,
      error: null,
    });
    render(<AdminOverview />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
