import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumBadge } from '../PremiumBadge';

describe('PremiumBadge', () => {
  it('renders PRO text', () => {
    render(<PremiumBadge />);
    expect(screen.getByText('PRO')).toBeInTheDocument();
  });

  it('applies default small size class', () => {
    render(<PremiumBadge />);
    expect(screen.getByText('PRO')).toHaveClass('premium-badge--small');
  });

  it('applies medium size class', () => {
    render(<PremiumBadge size="medium" />);
    expect(screen.getByText('PRO')).toHaveClass('premium-badge--medium');
  });
});
