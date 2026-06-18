import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useRealtimeInputs', () => ({
  useRealtimeInputs: () => ({ inputs: [], loading: false }),
}));
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [{ id: 'p1' }] }),
}));
vi.mock('../../../hooks/usePluginLookup', () => ({
  usePluginLookup: () => ({ getSourceInfo: () => ({ name: 'Hevy', icon: '🏋️' }) }),
}));

import { ActionRequiredSection } from '../ActionRequiredSection';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('ActionRequiredSection', () => {
  it('renders the band and the caught-up state with pipeline count', () => {
    render(<ActionRequiredSection />, { wrapper: Wrapper });
    expect(screen.getByText(/Action Required/)).toBeInTheDocument();
    expect(screen.getByText('All caught up')).toBeInTheDocument();
    expect(screen.getByText(/across 1 pipeline/)).toBeInTheDocument();
  });
});
