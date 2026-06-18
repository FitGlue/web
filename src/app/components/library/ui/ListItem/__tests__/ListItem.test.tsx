import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListItem } from '../index';

describe('ListItem', () => {
  it('renders children with default classes', () => {
    const { container } = render(<ListItem>content</ListItem>);
    const el = container.querySelector('.list-item');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('list-item--padding-md');
    expect(el).toHaveClass('list-item--divider');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('omits the divider class when divider is false', () => {
    const { container } = render(<ListItem divider={false}>x</ListItem>);
    expect(container.querySelector('.list-item')).not.toHaveClass('list-item--divider');
  });

  it('applies active and padding modifiers', () => {
    const { container } = render(<ListItem active padding="lg">x</ListItem>);
    const el = container.querySelector('.list-item');
    expect(el).toHaveClass('list-item--active');
    expect(el).toHaveClass('list-item--padding-lg');
  });

  it('becomes a button with onClick and fires it', async () => {
    const handler = vi.fn();
    render(<ListItem onClick={handler}>clickable</ListItem>);
    const el = screen.getByRole('button');
    expect(el).toHaveClass('list-item--clickable');
    await userEvent.click(el);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const handler = vi.fn();
    const { container } = render(<ListItem onClick={handler} disabled>x</ListItem>);
    const el = container.querySelector('.list-item') as HTMLElement;
    expect(el).toHaveClass('list-item--disabled');
    await userEvent.click(el);
    expect(handler).not.toHaveBeenCalled();
  });
});
