import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionStatusItem } from '../ConnectionStatusItem';

describe('ConnectionStatusItem', () => {
  it('renders the name', () => {
    render(<ConnectionStatusItem name="Strava" connected />);
    expect(screen.getByText('Strava')).toBeInTheDocument();
  });

  it('shows connected check mark', () => {
    render(<ConnectionStatusItem name="Strava" connected />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows disconnected indicator', () => {
    render(<ConnectionStatusItem name="Fitbit" connected={false} />);
    expect(screen.getByText('○')).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const handler = vi.fn();
    render(<ConnectionStatusItem name="X" connected onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
