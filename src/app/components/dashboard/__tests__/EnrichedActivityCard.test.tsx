import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PipelineRun } from '../../../../types/pb/user';

vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [] }),
}));
vi.mock('../../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ sources: [], destinations: [] }),
}));

import { EnrichedActivityCard } from '../EnrichedActivityCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('EnrichedActivityCard', () => {
  it('renders the activity title and a status stamp', () => {
    const run = { title: 'Morning Lift', boosters: [], destinations: [] } as unknown as PipelineRun;
    render(<EnrichedActivityCard pipelineRun={run} />, { wrapper: Wrapper });
    expect(screen.getByText('Morning Lift')).toBeInTheDocument();
    // Unknown status falls through to UNKNOWN stamp
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('falls back to a default title and fires onClick', () => {
    const onClick = vi.fn();
    const run = { boosters: [], destinations: [] } as unknown as PipelineRun;
    render(<EnrichedActivityCard pipelineRun={run} onClick={onClick} />, { wrapper: Wrapper });
    expect(screen.getByText('Untitled Activity')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
