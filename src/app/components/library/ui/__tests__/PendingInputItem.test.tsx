import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingInputItem } from '../PendingInputItem';

describe('PendingInputItem', () => {
  it('renders icon, title and subtitle', () => {
    render(
      <PendingInputItem icon={<span>ic</span>} title="Title" subtitle="Sub" />
    );
    expect(screen.getByText('ic')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(<PendingInputItem icon="x" title="t" subtitle="s" variant="awaiting" />);
    expect(screen.getByRole('button')).toHaveClass('pending-input-item--awaiting');
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<PendingInputItem icon="x" title="t" subtitle="s" onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
