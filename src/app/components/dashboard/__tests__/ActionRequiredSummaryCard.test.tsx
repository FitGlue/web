import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useRealtimeInputs', () => ({
  useRealtimeInputs: () => ({ inputs: [], loading: false }),
}));
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [] }),
}));
vi.mock('../../../hooks/usePluginLookup', () => ({
  usePluginLookup: () => ({ getSourceInfo: () => ({ name: 'Hevy', icon: '🏋️' }) }),
}));

import { ActionRequiredSummaryCard } from '../ActionRequiredSummaryCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('ActionRequiredSummaryCard', () => {
  it('renders the card title and an all-caught-up empty state', () => {
    render(<ActionRequiredSummaryCard />, { wrapper: Wrapper });
    expect(screen.getByText('Action Required')).toBeInTheDocument();
    expect(screen.getByText(/All caught up/)).toBeInTheDocument();
  });
});
