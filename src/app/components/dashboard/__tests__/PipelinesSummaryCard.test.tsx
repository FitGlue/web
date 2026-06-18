import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const pipelines: unknown[] = [];
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines, loading: false }),
}));
vi.mock('../../../hooks/usePluginLookup', () => ({
  usePluginLookup: () => ({
    getSourceName: () => 'Hevy',
    getSourceIcon: () => '🏋️',
    getDestinationName: () => 'Strava',
  }),
}));

import { PipelinesSummaryCard } from '../PipelinesSummaryCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PipelinesSummaryCard', () => {
  it('renders the card title and an empty state when there are no pipelines', () => {
    render(<PipelinesSummaryCard />, { wrapper: Wrapper });
    expect(screen.getByText('Pipelines')).toBeInTheDocument();
    expect(screen.getByText(/No pipelines configured/)).toBeInTheDocument();
  });
});
