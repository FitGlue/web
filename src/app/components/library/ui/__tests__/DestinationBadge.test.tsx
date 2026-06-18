import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DestinationBadge } from '../DestinationBadge';

describe('DestinationBadge', () => {
  it('renders name and synced status', () => {
    render(<DestinationBadge name="Strava" icon="🏃" />);
    expect(screen.getByText('Strava')).toBeInTheDocument();
    expect(screen.getByText(/Synced successfully/)).toBeInTheDocument();
  });

  it('is clickable and fires onClick', async () => {
    const handler = vi.fn();
    render(<DestinationBadge name="X" icon="x" onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('shows arrow only when clickable', () => {
    const { rerender, queryByText } = render(<DestinationBadge name="X" icon="x" />);
    expect(queryByText('↗')).toBeNull();
    rerender(<DestinationBadge name="X" icon="x" onClick={() => {}} />);
    expect(queryByText('↗')).not.toBeNull();
  });
});
