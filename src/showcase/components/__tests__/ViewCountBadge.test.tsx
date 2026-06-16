import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewCountBadge } from '../ViewCountBadge';

describe('ViewCountBadge', () => {
  it('renders nothing when stats are null', () => {
    const { container } = render(<ViewCountBadge stats={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders view and visitor counts (int64 strings)', () => {
    render(<ViewCountBadge stats={{ views: '42', visitors: '17' }} />);
    expect(screen.getByText(/42 views/)).toBeTruthy();
    expect(screen.getByText(/17 visitors/)).toBeTruthy();
  });

  it('uses singular labels for a count of one', () => {
    render(<ViewCountBadge stats={{ views: '1', visitors: '1' }} />);
    expect(screen.getByText(/1 view$/)).toBeTruthy();
    expect(screen.getByText(/1 visitor$/)).toBeTruthy();
  });

  it('compacts large counts', () => {
    render(<ViewCountBadge stats={{ views: '12000', visitors: '3400' }} />);
    expect(screen.getByText(/12k views/)).toBeTruthy();
    expect(screen.getByText(/3.4k visitors/)).toBeTruthy();
  });
});
