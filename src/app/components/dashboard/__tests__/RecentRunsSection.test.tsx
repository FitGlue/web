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

import { RecentRunsSection } from '../RecentRunsSection';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('RecentRunsSection', () => {
  it('renders the runs list without crashing', () => {
    const { container } = render(<RecentRunsSection />, { wrapper: Wrapper });
    expect(container).toBeTruthy();
  });
});
