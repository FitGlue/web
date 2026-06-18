import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoosterGrid } from '../BoosterGrid';

describe('BoosterGrid', () => {
  it('renders children when present', () => {
    render(<BoosterGrid><span>booster</span></BoosterGrid>);
    expect(screen.getByText('booster')).toBeInTheDocument();
  });

  it('renders loading skeleton', () => {
    const { container } = render(<BoosterGrid loading>{null}</BoosterGrid>);
    expect(container.querySelector('.booster-grid--loading')).not.toBeNull();
  });

  it('renders empty text when no children', () => {
    render(<BoosterGrid>{null}</BoosterGrid>);
    expect(screen.getByText('No boosters')).toBeInTheDocument();
  });

  it('renders custom empty text', () => {
    render(<BoosterGrid emptyText="Nothing yet">{null}</BoosterGrid>);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
  });
});
