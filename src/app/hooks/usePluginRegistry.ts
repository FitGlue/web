import { useState, useEffect } from 'react';
import { PluginRegistryResponse } from '../types/plugin';

/**
 * Hook to fetch and cache the plugin registry from /api/plugins
 * Returns sources, enrichers, and destinations with their manifests
 */
export const usePluginRegistry = () => {
  const [registry, setRegistry] = useState<PluginRegistryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        // No auth required for the plugins endpoint
        const response = await fetch('/api/plugins');
        if (!response.ok) {
          throw new Error(`Failed to fetch plugin registry: ${response.statusText}`);
        }
        const data: PluginRegistryResponse = await response.json();
        setRegistry(data);
      } catch (err) {
        console.error('Failed to fetch plugin registry:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plugins');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistry();
  }, []);

  return {
    registry,
    sources: registry?.sources ?? [],
    enrichers: registry?.enrichers ?? [],
    destinations: registry?.destinations ?? [],
    integrations: registry?.integrations ?? [],
    loading,
    error,
  };
};
