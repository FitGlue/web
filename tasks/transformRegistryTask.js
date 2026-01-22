/**
 * Transform Registry Task
 * Transforms raw registry data into landing page format with detailsUrls and status
 * Adds integrations, sources, boosters, destinations to globals for templates
 */

/**
 * @returns {import('skier').TaskDef}
 */
export function transformRegistryTask() {
  return {
    name: 'transform-registry',
    title: 'Transform registry data for templates',
    config: {},
    run: async (cfg, ctx) => {
      const registry = ctx.globals.registry || { integrations: [], sources: [], enrichers: [], destinations: [] };

      // Transform integrations for landing pages
      const integrationsWithDetails = (registry.integrations || []).map((/** @type {any} */ i) => ({
        ...i,
        detailsUrl: `/connections/${i.id}`,
      }));

      const integrations = {
        connections: integrationsWithDetails.filter((/** @type {any} */ i) => i.category === 'source'),
        syncTargets: integrationsWithDetails.filter((/** @type {any} */ i) => i.category === 'destination'),
        all: integrationsWithDetails,
      };

      // Plugin lists with detailsUrls
      const boosters = (registry.enrichers || []).map((/** @type {any} */ e) => ({
        ...e,
        detailsUrl: `/plugins/boosters/${e.id}`,
        // Ensure premium flag is boolean for templates
        isPremium: !!e.isPremium,
        // Preserve temporarily unavailable status for "Coming Soon" banners
        isTemporarilyUnavailable: !!e.isTemporarilyUnavailable,
      }));
      const sources = (registry.sources || []).map((/** @type {any} */ s) => ({
        ...s,
        detailsUrl: `/plugins/sources/${s.id}`,
        isPremium: !!s.isPremium,
        // Preserve temporarily unavailable status for "Coming Soon" banners
        isTemporarilyUnavailable: !!s.isTemporarilyUnavailable,
      }));
      const destinations = (registry.destinations || []).map((/** @type {any} */ d) => ({
        ...d,
        detailsUrl: `/plugins/targets/${d.id}`,
        isPremium: !!d.isPremium,
        // Preserve temporarily unavailable status for "Coming Soon" banners
        isTemporarilyUnavailable: !!d.isTemporarilyUnavailable,
      }));

      // Category metadata for grouping plugins
      const ENRICHER_CATEGORIES = [
        { id: 'ai_content', name: 'AI & Content', emoji: '✨' },
        { id: 'stats', name: 'Stats', emoji: '📊' },
        { id: 'detection', name: 'Detection', emoji: '🎯' },
        { id: 'transformation', name: 'Transformation', emoji: '🔧' },
        { id: 'location', name: 'Location', emoji: '🗺️' },
        { id: 'logic', name: 'Logic', emoji: '⚙️' },
        { id: 'references', name: 'References', emoji: '🔗' },
      ];

      // Group boosters by category for marketing templates
      const boostersByCategory = ENRICHER_CATEGORIES
        .map((cat) => ({
          ...cat,
          plugins: boosters
            .filter((/** @type {any} */ b) => b.category === cat.id)
            .sort((/** @type {any} */ a, /** @type {any} */ b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)),
        }))
        .filter((cat) => cat.plugins.length > 0);

      ctx.logger.info(`Transformed ${integrationsWithDetails.length} integrations, ${boosters.length} boosters`);

      return { integrations, boosters, boostersByCategory, sources, destinations };
    },
  };
}
