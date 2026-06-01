import { describe, it, expect } from 'vitest';
import {
  groupPluginsByCategory,
  groupPluginsByStage,
  getRecommendedPlugins,
  filterPluginsBySearch,
  SOURCE_CATEGORIES,
  ENRICHER_CATEGORIES,
  CATEGORY_WEARABLES,
  CATEGORY_APPS,
} from '../pluginCategories';
import type { PluginManifest } from '../../types/plugin';

function makePlugin(overrides: Partial<PluginManifest> & { id: string; name: string }): PluginManifest {
  return {
    icon: '',
    description: overrides.description ?? overrides.name,
    enabled: true,
    isPremium: false,
    popularityScore: 0,
    ...overrides,
  } as PluginManifest;
}

describe('groupPluginsByCategory', () => {
  const plugins: PluginManifest[] = [
    makePlugin({ id: 'fitbit', name: 'Fitbit', category: CATEGORY_WEARABLES }),
    makePlugin({ id: 'garmin', name: 'Garmin', category: CATEGORY_WEARABLES, isPremium: true }),
    makePlugin({ id: 'strava', name: 'Strava', category: CATEGORY_APPS }),
    makePlugin({ id: 'orphan', name: 'Orphan', category: 'nonexistent' }),
  ];

  it('groups plugins under matching categories', () => {
    const grouped = groupPluginsByCategory(plugins, SOURCE_CATEGORIES);
    const wearableCategory = [...grouped.keys()].find(c => c.id === CATEGORY_WEARABLES);
    expect(wearableCategory).toBeDefined();
    const wearables = grouped.get(wearableCategory!);
    expect(wearables?.map(p => p.id)).toContain('fitbit');
    expect(wearables?.map(p => p.id)).toContain('garmin');
  });

  it('puts premium plugins first within a category', () => {
    const grouped = groupPluginsByCategory(plugins, SOURCE_CATEGORIES);
    const wearableCategory = [...grouped.keys()].find(c => c.id === CATEGORY_WEARABLES)!;
    const wearables = grouped.get(wearableCategory)!;
    expect(wearables[0].id).toBe('garmin');
  });

  it('sorts non-premium plugins alphabetically', () => {
    const ps = [
      makePlugin({ id: 'z-plugin', name: 'Zzz', category: CATEGORY_APPS }),
      makePlugin({ id: 'a-plugin', name: 'Aaa', category: CATEGORY_APPS }),
    ];
    const grouped = groupPluginsByCategory(ps, SOURCE_CATEGORIES);
    const appCat = [...grouped.keys()].find(c => c.id === CATEGORY_APPS)!;
    const apps = grouped.get(appCat)!;
    expect(apps[0].id).toBe('a-plugin');
  });

  it('places uncategorised plugins in an Other bucket', () => {
    const grouped = groupPluginsByCategory(plugins, SOURCE_CATEGORIES);
    const other = [...grouped.keys()].find(c => c.id === 'other');
    expect(other).toBeDefined();
    expect(grouped.get(other!)?.map(p => p.id)).toContain('orphan');
  });

  it('omits empty categories', () => {
    const grouped = groupPluginsByCategory([], SOURCE_CATEGORIES);
    expect(grouped.size).toBe(0);
  });
});

describe('groupPluginsByStage', () => {
  const plugins: PluginManifest[] = [
    makePlugin({ id: 'gate1', name: 'Gate One', stage: 'PIPELINE_STAGE_GATE' }),
    makePlugin({ id: 'metrics1', name: 'Metrics One', stage: 'PIPELINE_STAGE_METRICS' }),
    makePlugin({ id: 'nostageplugin', name: 'No Stage' }),
  ];

  it('groups by pipeline stage', () => {
    const grouped = groupPluginsByStage(plugins);
    const gatecat = [...grouped.keys()].find(c => c.id === 'PIPELINE_STAGE_GATE');
    expect(gatecat).toBeDefined();
    expect(grouped.get(gatecat!)?.map(p => p.id)).toContain('gate1');
  });

  it('places plugins with no stage in Other', () => {
    const grouped = groupPluginsByStage(plugins);
    const other = [...grouped.keys()].find(c => c.id === 'other');
    expect(other).toBeDefined();
    expect(grouped.get(other!)?.map(p => p.id)).toContain('nostageplugin');
  });
});

describe('getRecommendedPlugins', () => {
  const plugins: PluginManifest[] = [
    makePlugin({ id: 'a', name: 'A', popularityScore: 10 }),
    makePlugin({ id: 'b', name: 'B', popularityScore: 5 }),
    makePlugin({ id: 'c', name: 'C', popularityScore: 8, requiredIntegrations: ['strava'] }),
    makePlugin({ id: 'd', name: 'D', popularityScore: 7, requiredIntegrations: ['garmin'] }),
  ];

  it('returns plugins sorted by popularity descending', () => {
    const result = getRecommendedPlugins(plugins, []);
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });

  it('includes plugins whose required integrations are connected', () => {
    const result = getRecommendedPlugins(plugins, ['strava']);
    expect(result.map(p => p.id)).toContain('c');
  });

  it('excludes plugins whose required integrations are not connected', () => {
    const result = getRecommendedPlugins(plugins, ['strava']);
    expect(result.map(p => p.id)).not.toContain('d');
  });

  it('respects limit', () => {
    const result = getRecommendedPlugins(plugins, [], 2);
    expect(result).toHaveLength(2);
  });
});

describe('filterPluginsBySearch', () => {
  const plugins: PluginManifest[] = [
    makePlugin({ id: 'strava', name: 'Strava', description: 'Social fitness network' }),
    makePlugin({ id: 'fitbit', name: 'Fitbit', description: 'Wearable tracker' }),
    makePlugin({ id: 'garmin', name: 'Garmin', description: 'GPS fitness device' }),
  ];

  it('returns all plugins for empty query', () => {
    expect(filterPluginsBySearch(plugins, '')).toHaveLength(3);
    expect(filterPluginsBySearch(plugins, '   ')).toHaveLength(3);
  });

  it('filters by name (case-insensitive)', () => {
    const result = filterPluginsBySearch(plugins, 'STRAVA');
    expect(result.map(p => p.id)).toEqual(['strava']);
  });

  it('filters by description', () => {
    const result = filterPluginsBySearch(plugins, 'wearable');
    expect(result.map(p => p.id)).toEqual(['fitbit']);
  });

  it('returns empty array when no match', () => {
    expect(filterPluginsBySearch(plugins, 'zzz')).toHaveLength(0);
  });
});
