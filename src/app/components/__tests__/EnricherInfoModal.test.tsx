import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { PluginManifest } from '../../types/plugin';
import EnricherInfoModal from '../EnricherInfoModal';

const enricher = {
  id: 'weather',
  name: 'Weather Overlay',
  icon: '🌤️',
  description: 'Adds the weather to your activity.',
  enabled: true,
  marketingDescription: 'Never wonder about the conditions again.',
  useCases: ['Outdoor runs', 'Bike rides'],
} as unknown as PluginManifest;

describe('EnricherInfoModal', () => {
  it('renders the enricher name and description', () => {
    render(<EnricherInfoModal enricher={enricher} onClose={vi.fn()} />);
    expect(screen.getByText('Weather Overlay')).toBeInTheDocument();
    expect(screen.getByText('Adds the weather to your activity.')).toBeInTheDocument();
    expect(screen.getByText('Never wonder about the conditions again.')).toBeInTheDocument();
  });

  it('lists use cases and fires onClose', () => {
    const onClose = vi.fn();
    render(<EnricherInfoModal enricher={enricher} onClose={onClose} />);
    expect(screen.getByText(/Outdoor runs/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
