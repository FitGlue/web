import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourcePicker, SourceTile } from '../SourcePicker';

const sources: SourceTile[] = [
  { id: 'strava', name: 'Strava', icon: '🏃' },
  { id: 'fitbit', name: 'Fitbit', icon: '⌚', disabled: true },
];

describe('SourcePicker', () => {
  it('renders all source tiles', () => {
    render(<SourcePicker sources={sources} onSelect={() => {}} />);
    expect(screen.getByText('Strava')).toBeInTheDocument();
    expect(screen.getByText('Fitbit')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<SourcePicker sources={sources} onSelect={() => {}} label="Pick a source" />);
    expect(screen.getByText('Pick a source')).toBeInTheDocument();
  });

  it('fires onSelect for enabled tile', async () => {
    const onSelect = vi.fn();
    render(<SourcePicker sources={sources} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Strava'));
    expect(onSelect).toHaveBeenCalledWith('strava');
  });

  it('marks the selected tile', () => {
    const { container } = render(
      <SourcePicker sources={sources} selected="strava" onSelect={() => {}} />
    );
    expect(container.querySelector('.source-tile--selected')).not.toBeNull();
  });

  it('disables disabled tiles', () => {
    render(<SourcePicker sources={sources} onSelect={() => {}} />);
    expect(screen.getByText('Fitbit').closest('button')).toBeDisabled();
  });
});
