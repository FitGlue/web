import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoosterPicker, BoosterChip } from '../BoosterPicker';

const boosters: BoosterChip[] = [
  { id: 'weather', name: 'Weather', icon: '🌦', category: 'DATA' },
  { id: 'route', name: 'Route', icon: '🗺', category: 'MAPS' },
];

const categories = ['ALL', 'DATA', 'MAPS'];

describe('BoosterPicker', () => {
  it('renders category tabs', () => {
    render(
      <BoosterPicker
        boosters={boosters}
        selected={[]}
        onToggle={() => {}}
        categories={categories}
        activeCategory="ALL"
        onCategoryChange={() => {}}
      />
    );
    expect(screen.getByText('DATA')).toBeInTheDocument();
    expect(screen.getByText('MAPS')).toBeInTheDocument();
  });

  it('shows all boosters when ALL active', () => {
    render(
      <BoosterPicker
        boosters={boosters}
        selected={[]}
        onToggle={() => {}}
        categories={categories}
        activeCategory="ALL"
        onCategoryChange={() => {}}
      />
    );
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
  });

  it('filters by active category', () => {
    render(
      <BoosterPicker
        boosters={boosters}
        selected={[]}
        onToggle={() => {}}
        categories={categories}
        activeCategory="DATA"
        onCategoryChange={() => {}}
      />
    );
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.queryByText('Route')).toBeNull();
  });

  it('fires onToggle', async () => {
    const onToggle = vi.fn();
    render(
      <BoosterPicker
        boosters={boosters}
        selected={[]}
        onToggle={onToggle}
        categories={categories}
        activeCategory="ALL"
        onCategoryChange={() => {}}
      />
    );
    await userEvent.click(screen.getByText('Weather'));
    expect(onToggle).toHaveBeenCalledWith('weather');
  });

  it('fires onCategoryChange', async () => {
    const onCategoryChange = vi.fn();
    render(
      <BoosterPicker
        boosters={boosters}
        selected={[]}
        onToggle={() => {}}
        categories={categories}
        activeCategory="ALL"
        onCategoryChange={onCategoryChange}
      />
    );
    await userEvent.click(screen.getByText('MAPS'));
    expect(onCategoryChange).toHaveBeenCalledWith('MAPS');
  });
});
