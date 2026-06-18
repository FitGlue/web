import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { PluginManifest } from '../../types/plugin';
import type { PluginCategory } from '../../utils/pluginCategories';
import { PluginCategorySection } from '../PluginCategorySection';

const category = { name: 'Strength', emoji: '💪' } as PluginCategory;
const plugins = [
  { id: 'a', name: 'Alpha', icon: '🅰️', description: 'First', enabled: true },
  { id: 'b', name: 'Beta', icon: '🅱️', description: 'Second', enabled: true },
] as unknown as PluginManifest[];

describe('PluginCategorySection', () => {
  it('returns nothing when there are no plugins', () => {
    const { container } = render(
      <PluginCategorySection category={category} plugins={[]} selectedIds={[]} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the category header with a plural count', () => {
    render(
      <PluginCategorySection category={category} plugins={plugins} selectedIds={[]} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('2 boosters')).toBeInTheDocument();
  });

  it('expands to reveal plugins and fires onSelect', () => {
    const onSelect = vi.fn();
    render(
      <PluginCategorySection
        category={category}
        plugins={plugins}
        selectedIds={[]}
        onSelect={onSelect}
        defaultExpanded
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Alpha'));
    expect(onSelect).toHaveBeenCalledWith(plugins[0]);
  });
});
