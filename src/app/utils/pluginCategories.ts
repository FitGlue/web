/**
 * Plugin Category Utilities
 *
 * Uses shared category constants from @fitglue/shared (via generated types)
 * and provides UI-specific grouping and filtering functions.
 */
import { PluginManifest } from '../types/plugin';

// Category constants - keep in sync with server/src/typescript/shared/src/plugin/categories.ts
// These are duplicated here since web doesn't import from @fitglue/shared at runtime

// Source categories
export const CATEGORY_WEARABLES = 'wearables';
export const CATEGORY_APPS = 'apps';
export const CATEGORY_MANUAL = 'manual';

// Enricher categories
export const CATEGORY_AI_CONTENT = 'ai_content';
export const CATEGORY_STATS = 'stats';
export const CATEGORY_DETECTION = 'detection';
export const CATEGORY_TRANSFORMATION = 'transformation';
export const CATEGORY_LOCATION = 'location';
export const CATEGORY_LOGIC = 'logic';
export const CATEGORY_REFERENCES = 'references';

// Destination categories
export const CATEGORY_SOCIAL = 'social';
export const CATEGORY_ANALYTICS = 'analytics';
export const CATEGORY_LOGGING = 'logging';

export interface PluginCategory {
  id: string;
  name: string;
  emoji: string;
  pluginType: 'source' | 'enricher' | 'destination';
}

export const SOURCE_CATEGORIES: PluginCategory[] = [
  { id: CATEGORY_WEARABLES, name: 'Wearables', emoji: '⌚', pluginType: 'source' },
  { id: CATEGORY_APPS, name: 'Apps', emoji: '📱', pluginType: 'source' },
  { id: CATEGORY_MANUAL, name: 'Manual', emoji: '📄', pluginType: 'source' },
];

export const ENRICHER_CATEGORIES: PluginCategory[] = [
  { id: CATEGORY_AI_CONTENT, name: 'AI & Content', emoji: '✨', pluginType: 'enricher' },
  { id: CATEGORY_STATS, name: 'Stats', emoji: '📊', pluginType: 'enricher' },
  { id: CATEGORY_DETECTION, name: 'Detection', emoji: '🎯', pluginType: 'enricher' },
  { id: CATEGORY_TRANSFORMATION, name: 'Transformation', emoji: '🔧', pluginType: 'enricher' },
  { id: CATEGORY_LOCATION, name: 'Location', emoji: '🗺️', pluginType: 'enricher' },
  { id: CATEGORY_LOGIC, name: 'Logic', emoji: '⚙️', pluginType: 'enricher' },
  { id: CATEGORY_REFERENCES, name: 'References', emoji: '🔗', pluginType: 'enricher' },
];

export const DESTINATION_CATEGORIES: PluginCategory[] = [
  { id: CATEGORY_SOCIAL, name: 'Social', emoji: '🌐', pluginType: 'destination' },
  { id: CATEGORY_ANALYTICS, name: 'Analytics', emoji: '📈', pluginType: 'destination' },
  { id: CATEGORY_LOGGING, name: 'Logging', emoji: '📊', pluginType: 'destination' },
];

/**
 * Group plugins by category, sorted by sortOrder then alphabetically
 */
export function groupPluginsByCategory(
  plugins: PluginManifest[],
  categories: PluginCategory[]
): Map<PluginCategory, PluginManifest[]> {
  const grouped = new Map<PluginCategory, PluginManifest[]>();

  categories.forEach((cat) => {
    const matching = plugins
      .filter((p) => p.category === cat.id)
      .sort((a, b) => {
        // Sort by sortOrder first, then alphabetically
        const orderDiff = (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
    if (matching.length > 0) {
      grouped.set(cat, matching);
    }
  });

  // Add uncategorized plugins to a catch-all if any
  const categorizedIds = new Set(
    Array.from(grouped.values())
      .flat()
      .map((p) => p.id)
  );
  const uncategorized = plugins.filter((p) => !categorizedIds.has(p.id));
  if (uncategorized.length > 0) {
    const fallbackCategory: PluginCategory = {
      id: 'other',
      name: 'Other',
      emoji: '📦',
      pluginType: 'enricher',
    };
    grouped.set(fallbackCategory, uncategorized);
  }

  return grouped;
}

/**
 * Get plugins recommended for user based on their connected integrations
 */
export function getRecommendedPlugins(
  plugins: PluginManifest[],
  connectedIntegrations: string[],
  limit: number = 5
): PluginManifest[] {
  return plugins
    .filter((p) => {
      // Prioritize plugins that match user's connected integrations
      if (!p.requiredIntegrations?.length) return true;
      return p.requiredIntegrations.every((id) =>
        connectedIntegrations.includes(id)
      );
    })
    .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
    .slice(0, limit);
}

/**
 * Filter plugins by search query (matches name or description)
 */
export function filterPluginsBySearch(
  plugins: PluginManifest[],
  query: string
): PluginManifest[] {
  if (!query.trim()) return plugins;
  const lowerQuery = query.toLowerCase();
  return plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.description ?? '').toLowerCase().includes(lowerQuery)
  );
}

