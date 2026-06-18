import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionCard } from '../ActionCard';

describe('ActionCard', () => {
  it('renders children', () => {
    render(<ActionCard>Body content</ActionCard>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders header when provided', () => {
    render(<ActionCard header={<span>Heading</span>}>body</ActionCard>);
    expect(screen.getByText('Heading')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<ActionCard>x</ActionCard>);
    expect(container.querySelector('.action-card-wrapper--default')).not.toBeNull();
  });

  it('applies awaiting variant class', () => {
    const { container } = render(<ActionCard variant="awaiting">x</ActionCard>);
    expect(container.querySelector('.action-card-wrapper--awaiting')).not.toBeNull();
  });
});
