import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [], loading: false }),
}));
vi.mock('../../../hooks/usePluginLookup', () => ({
  usePluginLookup: () => ({
    getSourceName: () => 'Hevy',
    getSourceIcon: () => '🏋️',
    getDestinationName: () => 'Strava',
    getDestinationIcon: () => '🟧',
  }),
}));

import { PipelinesSection } from '../PipelinesSection';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PipelinesSection', () => {
  it('renders the band and the empty state when there are no pipelines', () => {
    render(<PipelinesSection />, { wrapper: Wrapper });
    expect(screen.getByText(/Your Pipelines/)).toBeInTheDocument();
    expect(screen.getByText(/No pipelines configured/)).toBeInTheDocument();
  });
});
