import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalProse } from '../LegalProse';

describe('LegalProse', () => {
  it('renders title as heading and children', () => {
    render(<LegalProse title="Terms">body text</LegalProse>);
    expect(screen.getByRole('heading', { name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByText('body text')).toBeInTheDocument();
  });

  it('renders last updated when provided', () => {
    render(
      <LegalProse title="Terms" lastUpdated="2024-01-01">body</LegalProse>,
    );
    expect(screen.getByText(/Last updated: 2024-01-01/)).toBeInTheDocument();
  });

  it('omits last updated when not provided', () => {
    const { container } = render(<LegalProse title="Terms">body</LegalProse>);
    expect(container.querySelector('.legal-prose__updated')).toBeNull();
  });
});
