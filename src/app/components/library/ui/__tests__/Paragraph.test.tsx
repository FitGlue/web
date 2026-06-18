import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Paragraph } from '../Paragraph';

describe('Paragraph', () => {
  it('renders children in a p tag by default', () => {
    const { container } = render(<Paragraph>hello</Paragraph>);
    expect(container.querySelector('p.ui-paragraph')).not.toBeNull();
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders a span when inline', () => {
    const { container } = render(<Paragraph inline>x</Paragraph>);
    expect(container.querySelector('span.ui-paragraph')).not.toBeNull();
  });

  it('applies modifier classes', () => {
    render(<Paragraph muted bold centered>x</Paragraph>);
    const el = screen.getByText('x');
    expect(el).toHaveClass('ui-paragraph--muted');
    expect(el).toHaveClass('ui-paragraph--bold');
    expect(el).toHaveClass('ui-paragraph--centered');
  });

  it('applies size class', () => {
    render(<Paragraph size="lg">x</Paragraph>);
    expect(screen.getByText('x')).toHaveClass('ui-paragraph--lg');
  });
});
