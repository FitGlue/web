import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies fg-button base class', () => {
    render(<Button>base</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button');
  });

  it('primary variant has no extra modifier class', () => {
    render(<Button variant="primary">primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toBe('fg-button');
  });

  it('outline variant adds fg-button--outline', () => {
    render(<Button variant="outline">outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--outline');
  });

  it('danger variant adds fg-button--danger', () => {
    render(<Button variant="danger">danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--danger');
  });

  it('ghost variant adds fg-button--ghost', () => {
    render(<Button variant="ghost">ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--ghost');
  });

  it('legacy secondary alias maps to outline', () => {
    render(<Button variant="secondary">sec</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--outline');
  });

  it('sm size adds fg-button--sm', () => {
    render(<Button size="sm">small</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--sm');
  });

  it('large size adds fg-button--lg', () => {
    render(<Button size="large">large</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--lg');
  });

  it('fullWidth adds fg-button--full', () => {
    render(<Button fullWidth>full</Button>);
    expect(screen.getByRole('button')).toHaveClass('fg-button--full');
  });

  it('calls onClick when clicked', async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when disabled', async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>disabled</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});
