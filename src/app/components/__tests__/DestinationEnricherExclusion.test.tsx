import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DestinationEnricherExclusion } from '../DestinationEnricherExclusion';

const enrichers = [
  { key: 'weather', name: 'Weather', icon: '🌤️' },
  { key: 'heatmap', name: 'Heatmap', icon: '💪' },
];

describe('DestinationEnricherExclusion', () => {
  it('renders nothing when there are no enrichers', () => {
    const { container } = render(
      <DestinationEnricherExclusion enrichers={[]} excludedEnrichers={[]} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an on/off toggle per enricher', () => {
    render(
      <DestinationEnricherExclusion enrichers={enrichers} excludedEnrichers={[]} onChange={vi.fn()} />
    );
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Heatmap')).toBeInTheDocument();
  });

  it('excludes an enricher when toggled off', () => {
    const onChange = vi.fn();
    render(
      <DestinationEnricherExclusion enrichers={enrichers} excludedEnrichers={[]} onChange={onChange} />
    );
    fireEvent.click(screen.getByLabelText(/Exclude Weather/));
    expect(onChange).toHaveBeenCalledWith(['weather']);
  });

  it('re-includes an enricher that was excluded', () => {
    const onChange = vi.fn();
    render(
      <DestinationEnricherExclusion
        enrichers={enrichers}
        excludedEnrichers={['weather']}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByLabelText(/Include Weather/));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
