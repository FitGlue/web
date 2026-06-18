import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowNode } from '../FlowNode';

describe('FlowNode', () => {
  it('renders the label', () => {
    render(<FlowNode label="Strava" type="source" />);
    expect(screen.getByText('Strava')).toBeInTheDocument();
  });

  it('applies type class', () => {
    const { container } = render(<FlowNode label="X" type="destination" />);
    expect(container.querySelector('.flow-node--destination')).not.toBeNull();
  });

  it('renders badge count when > 0', () => {
    render(<FlowNode label="X" type="enricher" badgeCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render badge when count is 0', () => {
    render(<FlowNode label="X" type="enricher" badgeCount={0} />);
    expect(screen.queryByText('0')).toBeNull();
  });
});
