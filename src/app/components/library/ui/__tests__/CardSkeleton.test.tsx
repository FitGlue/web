import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardSkeleton } from '../CardSkeleton';

describe('CardSkeleton', () => {
  it('renders default variant', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.card-skeleton')).not.toBeNull();
  });

  it('renders the requested number of connection items', () => {
    const { container } = render(<CardSkeleton variant="connections" itemCount={4} />);
    expect(container.querySelectorAll('.card-skeleton__connection-item').length).toBe(4);
  });

  it('renders pipelines variant', () => {
    const { container } = render(<CardSkeleton variant="pipelines" itemCount={2} />);
    expect(container.querySelectorAll('.card-skeleton__pipeline-item').length).toBe(2);
  });

  it('renders file-upload variant', () => {
    const { container } = render(<CardSkeleton variant="file-upload" />);
    expect(container.querySelector('.card-skeleton--file-upload')).not.toBeNull();
  });
});
