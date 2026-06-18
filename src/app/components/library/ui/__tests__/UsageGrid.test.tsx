import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageGrid } from '../UsageGrid';

describe('UsageGrid', () => {
  it('renders all cells', () => {
    render(
      <UsageGrid
        cells={[
          { value: 10, label: 'Syncs' },
          { value: '5', label: 'Boosters', sub: 'active' },
        ]}
      />
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Syncs')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('applies gradient modifier class', () => {
    const { container } = render(
      <UsageGrid cells={[{ value: 1, label: 'L', gradient: true }]} />
    );
    expect(container.querySelector('.usage-cell__n--gradient')).not.toBeNull();
  });
});
