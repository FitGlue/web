import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardBand } from '../DashboardBand';

describe('DashboardBand', () => {
  it('renders the label', () => {
    render(<DashboardBand label="Recent activity" />);
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
  });

  it('renders right content', () => {
    render(<DashboardBand label="L" right={<span>R</span>} />);
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('applies tone class', () => {
    const { container } = render(<DashboardBand label="L" tone="aurora" />);
    expect(container.querySelector('.dash-band--aurora')).not.toBeNull();
  });
});
