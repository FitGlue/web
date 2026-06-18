import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyValue } from '../KeyValue';

describe('KeyValue', () => {
  it('renders label and text value', () => {
    render(<KeyValue label="Name" value="Strava" />);
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText(/Strava/)).toBeInTheDocument();
  });

  it('renders N/A for null value', () => {
    render(<KeyValue label="X" value={null} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('renders code formatted value', () => {
    const { container } = render(<KeyValue label="X" value="abc" format="code" />);
    expect(container.querySelector('code')).not.toBeNull();
  });

  it('renders multiline layout', () => {
    render(<KeyValue label="Label" value="val" multiline />);
    expect(screen.getByText('Label:')).toBeInTheDocument();
    expect(screen.getByText('val')).toBeInTheDocument();
  });
});
