import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RefreshControl } from '../RefreshControl';

describe('RefreshControl', () => {
  it('prompts to update when there is no last-updated time', () => {
    render(<RefreshControl onRefresh={vi.fn()} lastUpdated={null} loading={false} />);
    expect(screen.getByText('Update Now')).toBeInTheDocument();
  });

  it('shows "just now" for a recent update', () => {
    render(<RefreshControl onRefresh={vi.fn()} lastUpdated={new Date()} loading={false} />);
    expect(screen.getByText(/just now/)).toBeInTheDocument();
  });

  it('shows an updating label and disables when loading', () => {
    render(<RefreshControl onRefresh={vi.fn()} lastUpdated={null} loading />);
    expect(screen.getByText('Updating...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onRefresh when clicked', () => {
    const onRefresh = vi.fn();
    render(<RefreshControl onRefresh={onRefresh} lastUpdated={null} loading={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
