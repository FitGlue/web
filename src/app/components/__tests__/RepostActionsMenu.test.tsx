import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { SynchronizedActivity } from '../../services/ActivitiesService';

const useUser = vi.fn();
vi.mock('../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ destinations: [] }),
}));
vi.mock('../../hooks/useRealtimeIntegrations', () => ({
  useRealtimeIntegrations: () => ({ integrations: {} }),
}));
vi.mock('../../hooks/useUser', () => ({ useUser: () => useUser() }));

import { RepostActionsMenu } from '../RepostActionsMenu';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const activity = { activityId: 'a1', destinations: {} } as unknown as SynchronizedActivity;

describe('RepostActionsMenu', () => {
  it('renders nothing for non-pro users', () => {
    useUser.mockReturnValue({ user: {} });
    const { container } = render(
      <RepostActionsMenu activity={activity} onSuccess={vi.fn()} isPro={false} />,
      { wrapper: Wrapper }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows an upgrade prompt for pro users at their limit', () => {
    useUser.mockReturnValue({ user: { syncCountThisMonth: 9999 } });
    render(
      <RepostActionsMenu activity={activity} onSuccess={vi.fn()} isPro inline />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText(/monthly sync limit reached/)).toBeInTheDocument();
  });
});
