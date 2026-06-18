import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useRealtimePipelineRuns', () => ({
  useRealtimePipelineRuns: () => ({ pipelineRuns: [], loading: false }),
}));
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [] }),
}));
vi.mock('../../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ sources: [], destinations: [] }),
}));

import { PipelineRunsList } from '../PipelineRunsList';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PipelineRunsList', () => {
  it('renders the dashboard variant with no runs', () => {
    const { container } = render(
      <PipelineRunsList variant="dashboard" defaultFilter="all" limit={6} />,
      { wrapper: Wrapper }
    );
    expect(container).toBeTruthy();
  });

  it('renders the tabbed variant', () => {
    const { container } = render(
      <PipelineRunsList variant="tabbed" showTabs defaultFilter="all" />,
      { wrapper: Wrapper }
    );
    expect(container).toBeTruthy();
  });
});
