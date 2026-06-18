import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '../Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>content</Container>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies default size, padding and centered classes', () => {
    const { container } = render(<Container>x</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('ui-container');
    expect(el).toHaveClass('ui-container--lg');
    expect(el).toHaveClass('ui-container--padding-md');
    expect(el).toHaveClass('ui-container--centered');
  });

  it('applies custom size and padding', () => {
    const { container } = render(
      <Container size="sm" padding="none">x</Container>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('ui-container--sm');
    expect(el).toHaveClass('ui-container--padding-none');
  });

  it('omits centered class when centered is false', () => {
    const { container } = render(<Container centered={false}>x</Container>);
    expect(container.firstChild).not.toHaveClass('ui-container--centered');
  });
});
