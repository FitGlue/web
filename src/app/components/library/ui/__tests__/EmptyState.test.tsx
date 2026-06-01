import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    render(<EmptyState title="x" icon="🎉" />);
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState title="x" description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="x" />);
    // Only the title paragraph should be present
    expect(screen.getAllByRole('paragraph')).toHaveLength(1);
  });

  it('renders primary action button', () => {
    render(<EmptyState title="x" actionLabel="Do it" onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
  });

  it('fires onAction when primary button clicked', async () => {
    const handler = vi.fn();
    render(<EmptyState title="x" actionLabel="Go" onAction={handler} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not render primary button without onAction callback', () => {
    render(<EmptyState title="x" actionLabel="Go" />);
    expect(screen.queryByRole('button', { name: 'Go' })).not.toBeInTheDocument();
  });

  it('renders secondary action button', () => {
    render(<EmptyState title="x" secondaryActionLabel="Cancel" onSecondaryAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('fires onSecondaryAction when secondary button clicked', async () => {
    const handler = vi.fn();
    render(<EmptyState title="x" secondaryActionLabel="Cancel" onSecondaryAction={handler} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('applies mini variant class', () => {
    const { container } = render(<EmptyState title="x" variant="mini" />);
    expect(container.firstChild).toHaveClass('empty-state--mini');
  });

  it('does not apply mini class for default variant', () => {
    const { container } = render(<EmptyState title="x" />);
    expect(container.firstChild).not.toHaveClass('empty-state--mini');
  });
});
