import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const GET = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { GET: (...a: unknown[]) => GET(...a) },
  default: { GET: (...a: unknown[]) => GET(...a) },
}));
vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { usePluginRegistry } from '../usePluginRegistry';
import { usePluginLookup } from '../usePluginLookup';
import {
  pluginRegistryAtom,
  isPluginRegistryLoadedAtom,
  pluginRegistryLastUpdatedAtom,
} from '../../state/pluginRegistryState';

const REGISTRY = {
  sources: [{ id: 'hevy', name: 'Hevy', icon: '🏋️' }],
  enrichers: [{ id: 'weather', name: 'Weather', icon: '🌤️', enricherProviderType: 12 }],
  destinations: [{ id: 'strava', name: 'Strava', icon: '🟧', destinationType: 3 }],
  integrations: [
    { id: 'hevy', name: 'Hevy', icon: '🏋️' },
    { id: 'gone', name: 'Gone', icon: '❌', isTemporarilyUnavailable: true },
  ],
};

beforeEach(() => GET.mockReset());

function seededWrapper() {
  const store = createStore();
  store.set(pluginRegistryAtom, REGISTRY as never);
  store.set(isPluginRegistryLoadedAtom, true);
  store.set(pluginRegistryLastUpdatedAtom, new Date()); // fresh → no refetch
  return function Wrapper({ children }: { children: React.ReactNode }) { return <Provider store={store}>{children}</Provider>; };
}

describe('usePluginRegistry', () => {
  it('fetches the registry on mount and exposes typed collections', async () => {
    GET.mockResolvedValue({ data: REGISTRY });
    const store = createStore();
    const wrapper = function Wrapper({ children }: { children: React.ReactNode }) { return <Provider store={store}>{children}</Provider>; };
    const { result } = renderHook(() => usePluginRegistry(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sources).toHaveLength(1);
    // Temporarily-unavailable integrations are filtered out.
    expect(result.current.integrations.map((i) => i.id)).toEqual(['hevy']);
  });

});

describe('usePluginLookup', () => {
  it('resolves source info by id and normalises enum-style strings', () => {
    const { result } = renderHook(() => usePluginLookup(), { wrapper: seededWrapper() });
    expect(result.current.getSourceInfo('SOURCE_HEVY')).toEqual({ id: 'hevy', name: 'Hevy', icon: '🏋️' });
    expect(result.current.getSourceName('hevy')).toBe('Hevy');
    expect(result.current.getSourceIcon('hevy')).toBe('🏋️');
  });

  it('falls back to a capitalised name + default icon for unknown sources', () => {
    const { result } = renderHook(() => usePluginLookup(), { wrapper: seededWrapper() });
    expect(result.current.getSourceInfo('garmin')).toEqual({ id: 'garmin', name: 'Garmin', icon: '📥' });
  });

  it('returns an Unknown placeholder for empty source input', () => {
    const { result } = renderHook(() => usePluginLookup(), { wrapper: seededWrapper() });
    expect(result.current.getSourceInfo('')).toEqual({ id: '', name: 'Unknown', icon: '📥' });
  });

  it('resolves destinations by numeric destinationType', () => {
    const { result } = renderHook(() => usePluginLookup(), { wrapper: seededWrapper() });
    expect(result.current.getDestinationInfo(3).name).toBe('Strava');
    expect(result.current.getDestinationName(99)).toBe('Destination 99');
  });

  it('resolves enricher info and falls back to a humanised name', () => {
    const { result } = renderHook(() => usePluginLookup(), { wrapper: seededWrapper() });
    expect(result.current.getEnricherInfo('weather').name).toBe('Weather');
    expect(result.current.getEnricherName('muscle_heatmap')).toBe('Muscle Heatmap');
    expect(result.current.getEnricherIcon('weather')).toBe('🌤️');
  });
});
