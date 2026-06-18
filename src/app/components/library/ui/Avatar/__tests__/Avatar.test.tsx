import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../index';

describe('Avatar', () => {
  it('renders the uppercased first initial when no src', () => {
    const { container } = render(<Avatar initial="alice" />);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('only uses the first character of the initial', () => {
    render(<Avatar initial="bob" />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('BOB')).not.toBeInTheDocument();
  });

  it('applies size and variant modifier classes', () => {
    const { container } = render(<Avatar initial="x" size="lg" variant="solid" />);
    const el = container.querySelector('.ui-avatar');
    expect(el).toHaveClass('ui-avatar--lg');
    expect(el).toHaveClass('ui-avatar--solid');
  });

  it('renders an image when src is provided', () => {
    render(<Avatar initial="c" src="https://example.com/pic.png" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/pic.png');
    expect(img).toHaveClass('ui-avatar__img');
  });
});
