import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { PluginRegistryResponse } from '../types/plugin';
import {
  pluginRegistryAtom,
  pluginRegistryLastUpdatedAtom,
  isLoadingPluginRegistryAtom,
  isPluginRegistryLoadedAtom,
  pluginRegistryErrorAtom,
} from '../state/pluginRegistryState';

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes (registry changes rarely)

/**
 * Hook to fetch and cache the plugin registry from /api/plugins
 * Uses Jotai atoms for shared state - all components share the same cached data
 * Returns sources, enrichers, and destinations with their manifests
 */
export const usePluginRegistry = () => {
  const [registry, setRegistry] = useAtom(pluginRegistryAtom);
  const [lastUpdated, setLastUpdated] = useAtom(pluginRegistryLastUpdatedAtom);
  const [loading, setLoading] = useAtom(isLoadingPluginRegistryAtom);
  const [loaded, setLoaded] = useAtom(isPluginRegistryLoadedAtom);
  const [error, setError] = useAtom(pluginRegistryErrorAtom);

  // Track in-flight fetch to prevent duplicate calls
  const fetchInProgressRef = useRef(false);

  const fetchRegistry = useCallback(async (force = false) => {
    // Prevent concurrent fetches (but allow if force is specified)
    if (fetchInProgressRef.current && !force) return;

    fetchInProgressRef.current = true;
    setLoading(true);
    try {
      // No auth required for the plugins endpoint
      const response = await fetch('/api/registry');
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin registry: ${response.statusText}`);
      }
      const data: PluginRegistryResponse = await response.json();
      setRegistry(data);
      setLastUpdated(new Date());
      setLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch plugin registry:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  }, [setRegistry, setLastUpdated, setLoaded, setLoading, setError]);

  // Check if data is stale
  const isStale = !lastUpdated || Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS;

  // Auto-fetch on mount if needed
  useEffect(() => {
    if (!loaded && !loading) {
      fetchRegistry();
    } else if (loaded && isStale && !loading) {
      // Refresh stale data
      fetchRegistry(true);
    }
  }, [loaded, loading, isStale, fetchRegistry]);

  return {
    registry,
    sources: registry?.sources ?? [],
    enrichers: registry?.enrichers ?? [],
    destinations: registry?.destinations ?? [],
    integrations: registry?.integrations ?? [],
    loading,
    error,
    refresh: useCallback(() => fetchRegistry(true), [fetchRegistry]),
  };
};
