import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({
    enrichers: [{ id: 'muscle-heatmap', name: 'Muscle Heatmap', icon: '💪' }],
  }),
}));

import { EnricherBadge } from '../EnricherBadge';

describe('EnricherBadge', () => {
  it('resolves a known enricher name and icon from the registry', () => {
    render(<EnricherBadge providerName="muscle_heatmap" status="SUCCESS" />);
    expect(screen.getByText('Muscle Heatmap')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  it('humanises unknown provider names with a default icon', () => {
    render(<EnricherBadge providerName="weather_overlay" status="SUCCESS" />);
    expect(screen.getByText('Weather Overlay')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('shows a metric for successful runs when metadata provides one', () => {
    render(
      <EnricherBadge
        providerName="muscle_heatmap"
        status="SUCCESS"
        metadata={{ muscles_tracked: 7 }}
      />
    );
    expect(screen.getByText('7m')).toBeInTheDocument();
  });
});
