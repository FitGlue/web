import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCard } from '../ActivityCard';

describe('ActivityCard', () => {
  it('renders title, type and source', () => {
    render(
      <ActivityCard
        title="Morning Run"
        type="Run"
        source="Strava"
        timestamp="2026-01-01T08:00:00Z"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('Strava')).toBeInTheDocument();
  });

  it('defaults to SYNCED status when none provided', () => {
    render(
      <ActivityCard title="t" type="Run" source="s" timestamp={null} onClick={vi.fn()} />
    );
    expect(screen.getByText('SYNCED')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('shows PENDING for unsynchronized activities and renders an error message', () => {
    render(
      <ActivityCard
        title="t"
        type="Run"
        source="s"
        timestamp={null}
        isUnsynchronized
        errorMessage="boom"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('fires onClick when activated', () => {
    const onClick = vi.fn();
    render(
      <ActivityCard title="t" type="Run" source="s" timestamp={null} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
