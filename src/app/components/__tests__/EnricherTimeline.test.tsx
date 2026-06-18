import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PluginManifest } from '../../types/plugin';

vi.mock('../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: [] }) },
  default: { GET: vi.fn().mockResolvedValue({ data: [] }) },
}));

import { EnricherTimeline } from '../EnricherTimeline';

const enrichers = [
  {
    manifest: { id: 'weather', name: 'Weather', icon: '🌤️', description: 'd', enabled: true } as unknown as PluginManifest,
    config: {},
  },
];

describe('EnricherTimeline', () => {
  it('renders nothing visible for an empty list but does not crash', () => {
    const { container } = render(
      <EnricherTimeline enrichers={[]} onReorder={vi.fn()} onRemove={vi.fn()} onInfoClick={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders a row for each selected enricher', () => {
    render(
      <EnricherTimeline
        enrichers={enrichers}
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onInfoClick={vi.fn()}
      />
    );
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });
});
