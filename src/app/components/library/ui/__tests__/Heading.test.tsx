import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders children at default h2 level', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(el).toBeInTheDocument();
  });

  it('renders the requested semantic level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Big' })).toBeInTheDocument();
  });

  it('applies size class derived from level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByText('Big')).toHaveClass('ui-heading--2xl');
  });

  it('applies modifier classes', () => {
    render(<Heading muted centered gradient>X</Heading>);
    const el = screen.getByText('X');
    expect(el).toHaveClass('ui-heading--muted');
    expect(el).toHaveClass('ui-heading--centered');
    expect(el).toHaveClass('ui-heading--gradient');
  });
});
