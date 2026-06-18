import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it('renders icon with accessible label', () => {
    render(<IconButton icon="×" aria-label="Close" />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('applies size and variant classes', () => {
    render(<IconButton icon="x" aria-label="X" size="lg" variant="danger" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('ui-icon-button--lg');
    expect(btn).toHaveClass('ui-icon-button--danger');
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<IconButton icon="x" aria-label="X" onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is disabled when loading', () => {
    render(<IconButton icon="x" aria-label="X" loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
