import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>content</Card>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies default surface class', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.querySelector('.fg-panel--ink-2')).not.toBeNull();
  });

  it('applies premium surface class', () => {
    const { container } = render(<Card variant="premium">x</Card>);
    expect(container.querySelector('.fg-panel--aurora-wash')).not.toBeNull();
  });

  it('renders footer when provided', () => {
    render(<Card footer={<span>foot</span>}>x</Card>);
    expect(screen.getByText('foot')).toBeInTheDocument();
  });

  it('is clickable and fires onClick', async () => {
    const handler = vi.fn();
    render(<Card onClick={handler}>x</Card>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
