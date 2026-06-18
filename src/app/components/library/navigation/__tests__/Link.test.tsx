import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Link } from '../Link';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('Link', () => {
  it('renders an internal router link with children', () => {
    render(<Link to="/dash">Dashboard</Link>, { wrapper: Wrapper });
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('href', '/dash');
  });

  it('applies default variant class', () => {
    render(<Link to="/x">x</Link>, { wrapper: Wrapper });
    expect(screen.getByRole('link')).toHaveClass('ui-link--default');
  });

  it('applies custom variant class', () => {
    render(<Link to="/x" variant="primary">x</Link>, { wrapper: Wrapper });
    expect(screen.getByRole('link')).toHaveClass('ui-link--primary');
  });

  it('renders external links with target and rel', () => {
    render(
      <Link to="https://example.com" external>External</Link>,
      { wrapper: Wrapper },
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
