import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({
    integrations: [{ id: 'strava', name: 'Strava', icon: '🟧' }],
  }),
}));
vi.mock('../../../hooks/useRealtimeIntegrations', () => ({
  useRealtimeIntegrations: () => ({ integrations: { strava: { connected: true } }, loading: false }),
}));

import { ConnectionsSummaryCard } from '../ConnectionsSummaryCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('ConnectionsSummaryCard', () => {
  it('renders the card title and connected count', () => {
    render(<ConnectionsSummaryCard />, { wrapper: Wrapper });
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('Strava')).toBeInTheDocument();
    expect(screen.getByText(/connected/)).toBeInTheDocument();
  });
});
