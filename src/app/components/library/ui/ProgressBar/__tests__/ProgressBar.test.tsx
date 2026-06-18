import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../index';

describe('ProgressBar', () => {
  it('renders a progressbar role with aria values', () => {
    render(<ProgressBar value={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('computes fill width from value/max', () => {
    const { container } = render(<ProgressBar value={25} max={50} />);
    const fill = container.querySelector('.ui-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('clamps percentage to 100 when value exceeds max', () => {
    const { container } = render(<ProgressBar value={200} max={100} />);
    const fill = container.querySelector('.ui-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('shows a rounded percentage label when showLabel is set', () => {
    render(<ProgressBar value={33} max={100} showLabel />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('applies size and variant modifier classes', () => {
    const { container } = render(<ProgressBar value={10} size="sm" variant="success" />);
    expect(container.querySelector('.ui-progress')).toHaveClass('ui-progress--sm');
    expect(container.querySelector('.ui-progress__fill')).toHaveClass('ui-progress__fill--success');
  });
});
