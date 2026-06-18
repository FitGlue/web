import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanBand } from '../PlanBand';

describe('PlanBand', () => {
  it('renders plan name and price', () => {
    render(<PlanBand planName="Athlete" price="$9" />);
    expect(screen.getByText('Athlete')).toBeInTheDocument();
    expect(screen.getByText('$9')).toBeInTheDocument();
  });

  it('renders period and badge', () => {
    render(<PlanBand planName="P" price="$9" period="/mo" badge="POPULAR" />);
    expect(screen.getByText('/mo')).toBeInTheDocument();
    expect(screen.getByText('POPULAR')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(<PlanBand planName="P" price="$9" actions={<button>Upgrade</button>} />);
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });
});
