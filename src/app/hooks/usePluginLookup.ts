import { usePluginRegistry } from './usePluginRegistry';

/**
 * Plugin info returned by lookup functions
 */
export interface PluginInfo {
  id: string;
  name: string;
  icon: string;
}

/**
 * Hook that provides convenient lookup functions for plugin registry data.
 * Consolidates the repeated getSourceName/Icon, getDestinationName/Icon, getEnricherName/Icon
 * patterns found across multiple components.
 */
export const usePluginLookup = () => {
  const { sources, enrichers, destinations } = usePluginRegistry();

  /**
   * Get source info (name, icon) from source ID or enum value
   */
  const getSourceInfo = (source: string | number): PluginInfo => {
    const normalized = String(source).toLowerCase().replace('source_', '');
    const found = sources.find(s => s.id === normalized);
    return {
      id: normalized,
      name: found?.name || normalized.charAt(0).toUpperCase() + normalized.slice(1),
      icon: found?.icon || '📥',
    };
  };

  /**
   * Get destination info (name, icon) from destination ID or enum value
   */
  const getDestinationInfo = (dest: string | number): PluginInfo => {
    const normalized = String(dest).toLowerCase();
    const found = destinations.find(d =>
      d.id === normalized ||
      d.destinationType === Number(dest)
    );
    return {
      id: normalized,
      name: found?.name || (typeof dest === 'string'
        ? dest.charAt(0).toUpperCase() + dest.slice(1).toLowerCase()
        : `Destination ${dest}`),
      icon: found?.icon || '📤',
    };
  };

  /**
   * Get enricher info (name, icon) from enricher ID or provider type enum
   */
  const getEnricherInfo = (enricher: string | number): PluginInfo => {
    const normalized = String(enricher).toLowerCase().replace('enricher_provider_', '');
    const found = enrichers.find(e =>
      e.id === normalized ||
      e.enricherProviderType === Number(enricher)
    );
    return {
      id: normalized,
      name: found?.name || normalized
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      icon: found?.icon || '✨',
    };
  };

  // Convenience functions that return just name or icon
  const getSourceName = (source: string | number): string => getSourceInfo(source).name;
  const getSourceIcon = (source: string | number): string => getSourceInfo(source).icon;
  const getDestinationName = (dest: string | number): string => getDestinationInfo(dest).name;
  const getDestinationIcon = (dest: string | number): string => getDestinationInfo(dest).icon;
  const getEnricherName = (enricher: string | number): string => getEnricherInfo(enricher).name;
  const getEnricherIcon = (enricher: string | number): string => getEnricherInfo(enricher).icon;

  return {
    // Full info functions
    getSourceInfo,
    getDestinationInfo,
    getEnricherInfo,
    // Convenience functions
    getSourceName,
    getSourceIcon,
    getDestinationName,
    getDestinationIcon,
    getEnricherName,
    getEnricherIcon,
  };
};
