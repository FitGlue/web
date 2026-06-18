import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ExecutionStep } from '../../../types/pb/models/pipeline/execution';
import { ExecutionStepTrace } from '../ExecutionStepTrace';

describe('ExecutionStepTrace', () => {
  it('shows a loading state', () => {
    render(<ExecutionStepTrace steps={[]} isLoading />);
    expect(screen.getByText(/Loading execution trace/)).toBeInTheDocument();
  });

  it('shows the empty state when there are no steps', () => {
    render(<ExecutionStepTrace steps={[]} />);
    expect(screen.getByText('No Trace Data')).toBeInTheDocument();
  });

  it('renders steps sorted by ordinal', () => {
    const steps = [
      { id: 's2', ordinal: 2, kind: 0, status: 0, durationMs: 0 },
      { id: 's1', ordinal: 1, kind: 0, status: 0, durationMs: 0 },
    ] as unknown as ExecutionStep[];
    render(<ExecutionStepTrace steps={steps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
