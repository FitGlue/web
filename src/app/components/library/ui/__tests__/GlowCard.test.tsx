import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlowCard } from '../GlowCard';

describe('GlowCard', () => {
  it('renders children', () => {
    render(<GlowCard>content</GlowCard>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(<GlowCard header={<span>Head</span>}>c</GlowCard>);
    expect(screen.getByText('Head')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(<GlowCard variant="success">c</GlowCard>);
    expect(container.querySelector('.glow-card--success')).not.toBeNull();
  });

  it('applies loading and disabled classes', () => {
    const { container } = render(<GlowCard loading disabled>c</GlowCard>);
    expect(container.querySelector('.glow-card--loading')).not.toBeNull();
    expect(container.querySelector('.glow-card--disabled')).not.toBeNull();
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<GlowCard onClick={handler}>c</GlowCard>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
