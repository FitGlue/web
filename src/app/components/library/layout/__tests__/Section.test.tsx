import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '../Section';

describe('Section', () => {
  it('renders children', () => {
    render(<Section>content</Section>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders title heading when provided', () => {
    render(<Section title="Overview">content</Section>);
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
  });

  it('omits heading when no title', () => {
    render(<Section>content</Section>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
