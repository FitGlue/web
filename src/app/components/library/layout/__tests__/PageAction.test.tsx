import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageAction } from '../PageAction';

describe('PageAction', () => {
  it('renders children as a button', () => {
    render(<PageAction>Save</PageAction>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies default secondary tone class', () => {
    render(<PageAction>x</PageAction>);
    expect(screen.getByRole('button')).toHaveClass('page-action--secondary');
  });

  it('applies primary tone class', () => {
    render(<PageAction tone="primary">x</PageAction>);
    expect(screen.getByRole('button')).toHaveClass('page-action--primary');
  });

  it('applies danger class', () => {
    render(<PageAction danger>x</PageAction>);
    expect(screen.getByRole('button')).toHaveClass('page-action--danger');
  });

  it('renders more tone with overflow glyph and menu semantics', () => {
    render(<PageAction tone="more" />);
    const btn = screen.getByRole('button', { name: 'More options' });
    expect(btn).toHaveClass('page-action--more');
    expect(btn).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<PageAction onClick={handler}>Go</PageAction>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop set', () => {
    render(<PageAction disabled>x</PageAction>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
