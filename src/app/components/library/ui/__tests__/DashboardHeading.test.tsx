import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeading, Gr } from '../DashboardHeading';

describe('DashboardHeading', () => {
  it('renders eyebrow and title', () => {
    render(<DashboardHeading eyebrow="WELCOME" title="Dashboard" stats={[]} />);
    expect(screen.getByText('WELCOME')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(
      <DashboardHeading
        eyebrow="E"
        title="T"
        stats={[{ n: 42, l: 'Synced' }]}
      />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });
});

describe('Gr', () => {
  it('wraps children in a gradient span', () => {
    const { container } = render(<Gr>brand</Gr>);
    expect(container.querySelector('.dash-heading__gr')).not.toBeNull();
  });
});
