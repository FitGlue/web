import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders the footer banner', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
  });

  it('renders the changelog link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /What's New/i });
    expect(link).toHaveAttribute('href', '/changelog');
  });

  it('renders the version label', () => {
    render(<Footer />);
    expect(screen.getByText(/FitGlue/)).toBeInTheDocument();
  });
});
