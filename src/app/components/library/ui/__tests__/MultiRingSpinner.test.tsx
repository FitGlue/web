import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MultiRingSpinner } from '../MultiRingSpinner';

describe('MultiRingSpinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<MultiRingSpinner />);
    expect(container.querySelector('.multi-ring-spinner--md')).not.toBeNull();
  });

  it('applies the requested size', () => {
    const { container } = render(<MultiRingSpinner size="lg" />);
    expect(container.querySelector('.multi-ring-spinner--lg')).not.toBeNull();
  });

  it('renders three rings', () => {
    const { container } = render(<MultiRingSpinner />);
    expect(container.querySelectorAll('.multi-ring-spinner__ring').length).toBe(3);
  });

  it('applies extra class name', () => {
    const { container } = render(<MultiRingSpinner className="extra" />);
    expect(container.querySelector('.extra')).not.toBeNull();
  });
});
