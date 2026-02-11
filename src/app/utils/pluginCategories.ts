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

// Enricher categories (Output-based taxonomy)
export const CATEGORY_AI_IMAGES = 'ai_images';
export const CATEGORY_SUMMARIES = 'summaries';
export const CATEGORY_DATA = 'data';
export const CATEGORY_DETECTION = 'detection';
export const CATEGORY_LINKS = 'links';
export const CATEGORY_WORKFLOW = 'workflow';

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
  { id: CATEGORY_AI_IMAGES, name: 'AI & Images', emoji: '✨', pluginType: 'enricher' },
  { id: CATEGORY_SUMMARIES, name: 'Summaries', emoji: '📝', pluginType: 'enricher' },
  { id: CATEGORY_DATA, name: 'Data & Stats', emoji: '📊', pluginType: 'enricher' },
  { id: CATEGORY_DETECTION, name: 'Smart Detection', emoji: '🎯', pluginType: 'enricher' },
  { id: CATEGORY_LINKS, name: 'Links & References', emoji: '🔗', pluginType: 'enricher' },
  { id: CATEGORY_WORKFLOW, name: 'Workflow', emoji: '⚙️', pluginType: 'enricher' },
];

export const DESTINATION_CATEGORIES: PluginCategory[] = [
  { id: CATEGORY_SOCIAL, name: 'Social', emoji: '🌐', pluginType: 'destination' },
  { id: CATEGORY_ANALYTICS, name: 'Analytics', emoji: '📈', pluginType: 'destination' },
  { id: CATEGORY_LOGGING, name: 'Logging', emoji: '📊', pluginType: 'destination' },
];

/**
 * Group plugins by category, sorted by premium status (Pro first), then sortOrder, then alphabetically
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
        // Pro (isPremium) boosters first
        if (a.isPremium !== b.isPremium) {
          return a.isPremium ? -1 : 1;
        }
        // Then alphabetically A-Z
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
