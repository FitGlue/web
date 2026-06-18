import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowVisualization } from '../FlowVisualization';

describe('FlowVisualization', () => {
  it('renders source, center and destination', () => {
    render(
      <FlowVisualization
        source={<span>SRC</span>}
        center={<span>MID</span>}
        destination={<span>DST</span>}
      />
    );
    expect(screen.getByText('SRC')).toBeInTheDocument();
    expect(screen.getByText('MID')).toBeInTheDocument();
    expect(screen.getByText('DST')).toBeInTheDocument();
  });

  it('renders the flow container', () => {
    const { container } = render(
      <FlowVisualization source="a" center="b" destination="c" />
    );
    expect(container.querySelector('.flow-visualization')).not.toBeNull();
  });
});
