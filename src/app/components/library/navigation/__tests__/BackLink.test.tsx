import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackLink } from '../BackLink';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('BackLink', () => {
  it('renders a link to the target', () => {
    render(<BackLink to="/home" />, { wrapper: Wrapper });
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });

  it('renders default Back label', () => {
    render(<BackLink to="/home" />, { wrapper: Wrapper });
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<BackLink to="/home" label="All items" />, { wrapper: Wrapper });
    expect(screen.getByText('All items')).toBeInTheDocument();
  });
});
