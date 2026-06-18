import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DestinationPicker, DestinationChip } from '../DestinationPicker';

const destinations: DestinationChip[] = [
  { id: 'strava', name: 'Strava', icon: '🏃', rule: 'type==run' },
];

describe('DestinationPicker', () => {
  it('renders chosen destinations', () => {
    render(
      <DestinationPicker
        destinations={destinations}
        onRemove={() => {}}
        onAdd={() => {}}
        onConfigure={() => {}}
      />
    );
    expect(screen.getByText('Strava')).toBeInTheDocument();
    expect(screen.getByText('type==run')).toBeInTheDocument();
  });

  it('fires onAdd', async () => {
    const onAdd = vi.fn();
    render(
      <DestinationPicker destinations={[]} onRemove={() => {}} onAdd={onAdd} onConfigure={() => {}} />
    );
    await userEvent.click(screen.getByText('+ ADD DESTINATION'));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('fires onConfigure and onRemove', async () => {
    const onConfigure = vi.fn();
    const onRemove = vi.fn();
    render(
      <DestinationPicker
        destinations={destinations}
        onRemove={onRemove}
        onAdd={() => {}}
        onConfigure={onConfigure}
      />
    );
    await userEvent.click(screen.getByText('CONFIGURE'));
    await userEvent.click(screen.getByLabelText('Remove Strava'));
    expect(onConfigure).toHaveBeenCalledWith('strava');
    expect(onRemove).toHaveBeenCalledWith('strava');
  });
});
