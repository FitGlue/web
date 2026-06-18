import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { UnsynchronizedEntry } from '../../../services/ActivitiesService';
import { UnsyncedActivityCard } from '../UnsyncedActivityCard';

describe('UnsyncedActivityCard', () => {
  it('renders the title and a failed status stamp', () => {
    const entry = { title: 'Lost Run', status: 'FAILED', errorMessage: 'no gps' } as UnsynchronizedEntry;
    render(<UnsyncedActivityCard entry={entry} />);
    expect(screen.getByText('Lost Run')).toBeInTheDocument();
    expect(screen.getByText('✕ FAILED')).toBeInTheDocument();
    expect(screen.getByText('no gps')).toBeInTheDocument();
  });

  it('falls back to a default title and fires onClick', () => {
    const onClick = vi.fn();
    const entry = {} as UnsynchronizedEntry;
    render(<UnsyncedActivityCard entry={entry} onClick={onClick} />);
    expect(screen.getByText('Unknown Activity')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
