import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ExecutionRecord } from '../../services/ActivitiesService';

vi.mock('../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ destinations: [] }),
}));

import { TraceItem } from '../TraceItem';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('TraceItem', () => {
  it('renders the ordinal, humanised service name and status', () => {
    const execution = { service: 'enricher', status: 'SUCCESS' } as ExecutionRecord;
    render(<TraceItem execution={execution} index={0} />, { wrapper: Wrapper });
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
  });

  it('renders an error message when present', () => {
    const execution = {
      service: 'strava-uploader',
      status: 'FAILED',
      errorMessage: 'upload failed',
    } as ExecutionRecord;
    render(<TraceItem execution={execution} index={2} />, { wrapper: Wrapper });
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('upload failed')).toBeInTheDocument();
  });
});
