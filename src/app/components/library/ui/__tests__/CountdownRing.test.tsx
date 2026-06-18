import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownRing } from '../CountdownRing';

describe('CountdownRing', () => {
  it('shows no-deadline state when deadline is null', () => {
    render(<CountdownRing deadline={null} />);
    expect(screen.getByText('∞')).toBeInTheDocument();
    expect(screen.getByText('NO DEADLINE')).toBeInTheDocument();
  });

  it('shows OVERDUE when deadline is in the past', () => {
    render(<CountdownRing deadline={new Date(Date.now() - 1000)} />);
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
  });

  it('shows days left for a future deadline', () => {
    const future = new Date(Date.now() + 3 * 86400000);
    render(<CountdownRing deadline={future} />);
    expect(screen.getByText('DAYS LEFT')).toBeInTheDocument();
  });

  it('shows minutes-left urgent state for near deadline', () => {
    const soon = new Date(Date.now() + 10 * 60000);
    render(<CountdownRing deadline={soon} />);
    expect(screen.getByText('MIN LEFT')).toBeInTheDocument();
  });
});
