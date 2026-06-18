import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureItem } from '../FeatureItem';

describe('FeatureItem', () => {
  it('renders icon and title', () => {
    render(<FeatureItem icon="⚡" title="Fast" />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('Fast')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<FeatureItem icon="x" title="t" description="a description" />);
    expect(screen.getByText('a description')).toBeInTheDocument();
  });

  it('omits description when not provided', () => {
    const { container } = render(<FeatureItem icon="x" title="t" />);
    expect(container.querySelector('.feature-item__description')).toBeNull();
  });

  it('applies size modifier class', () => {
    const { container } = render(<FeatureItem icon="x" title="t" size="lg" />);
    expect(container.firstChild).toHaveClass('feature-item--lg');
  });
});
