import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionMenu, ActionMenuItem } from '../ActionMenu';

describe('ActionMenu', () => {
  it('renders the trigger', () => {
    render(
      <ActionMenu trigger={<span>Menu</span>}>
        <ActionMenuItem onClick={vi.fn()}>Edit</ActionMenuItem>
      </ActionMenu>,
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('does not show items until opened', () => {
    render(
      <ActionMenu trigger={<span>Menu</span>}>
        <ActionMenuItem onClick={vi.fn()}>Edit</ActionMenuItem>
      </ActionMenu>,
    );
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('opens the dropdown when trigger clicked', async () => {
    render(
      <ActionMenu trigger={<span>Menu</span>}>
        <ActionMenuItem onClick={vi.fn()}>Edit</ActionMenuItem>
      </ActionMenu>,
    );
    await userEvent.click(screen.getByText('Menu'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('fires item onClick and closes the menu', async () => {
    const onClick = vi.fn();
    render(
      <ActionMenu trigger={<span>Menu</span>}>
        <ActionMenuItem onClick={onClick}>Edit</ActionMenuItem>
      </ActionMenu>,
    );
    await userEvent.click(screen.getByText('Menu'));
    await userEvent.click(screen.getByText('Edit'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});

describe('ActionMenuItem', () => {
  it('renders icon and children', () => {
    render(
      <ActionMenuItem onClick={vi.fn()} icon={<span>★</span>}>Star</ActionMenuItem>,
    );
    expect(screen.getByText('★')).toBeInTheDocument();
    expect(screen.getByText('Star')).toBeInTheDocument();
  });

  it('is disabled when disabled prop set', () => {
    render(
      <ActionMenuItem onClick={vi.fn()} disabled>Nope</ActionMenuItem>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
