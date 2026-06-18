import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalSection } from '../ModalSection';

describe('ModalSection', () => {
  it('renders children', () => {
    render(<ModalSection>content</ModalSection>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders title heading when provided', () => {
    render(<ModalSection title="Details">content</ModalSection>);
    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
  });

  it('omits title head when not provided', () => {
    const { container } = render(<ModalSection>content</ModalSection>);
    expect(container.querySelector('.modal-section__head')).toBeNull();
  });

  it('applies spacing modifier class', () => {
    const { container } = render(
      <ModalSection spacing="lg">content</ModalSection>,
    );
    expect(container.firstChild).toHaveClass('modal-section--spacing-lg');
  });
});
