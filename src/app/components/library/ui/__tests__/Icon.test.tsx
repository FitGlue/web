import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders the mapped glyph', () => {
    render(<Icon name="check" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Icon name="close" size="lg" />);
    expect(container.querySelector('.ui-icon--lg')).not.toBeNull();
  });

  it('exposes accessible label when provided', () => {
    render(<Icon name="search" aria-label="Search" />);
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
  });
});
