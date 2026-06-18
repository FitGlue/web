import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ExecutionRecord } from '../../services/ActivitiesService';

vi.mock('../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ destinations: [] }),
}));

import { PipelineTrace } from '../PipelineTrace';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PipelineTrace', () => {
  it('shows a loading state', () => {
    render(<PipelineTrace trace={[]} isLoading />, { wrapper: Wrapper });
    expect(screen.getByText(/Loading pipeline execution trace/)).toBeInTheDocument();
  });

  it('shows the empty state when there is no trace', () => {
    render(<PipelineTrace trace={[]} />, { wrapper: Wrapper });
    expect(screen.getByText('No Trace Data')).toBeInTheDocument();
  });

  it('renders the trace section and steps', () => {
    const trace = [{ service: 'enricher', status: 'SUCCESS' }] as ExecutionRecord[];
    render(<PipelineTrace trace={trace} pipelineExecutionId="exec-1" />, { wrapper: Wrapper });
    expect(screen.getByText('Pipeline Execution Trace')).toBeInTheDocument();
    expect(screen.getByText('exec-1')).toBeInTheDocument();
  });
});
