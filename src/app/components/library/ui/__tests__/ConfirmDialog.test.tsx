import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const base = {
    isOpen: true,
    title: 'Delete this?',
    message: 'This cannot be undone.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders nothing when closed', () => {
    const { container } = render(<ConfirmDialog {...base} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...base} />);
    expect(screen.getByText('Delete this?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('fires onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...base} onConfirm={onConfirm} confirmLabel="Yes" />);
    await userEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('fires onCancel when cancel clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...base} onCancel={onCancel} cancelLabel="No" />);
    await userEvent.click(screen.getByText('No'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
