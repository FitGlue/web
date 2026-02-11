/**
 * Transform Registry Task
 * Transforms raw registry data into landing page format with detailsUrls and status
 * Adds integrations, sources, boosters, destinations to globals for templates
 */

/**
 * Format a raw count into a marketing-friendly string.
 * Rounds down to a "nice" number and appends "+".
 * - < 100: round to nearest 10
 * - >= 100: round to nearest 50
 * @param {number} count
 * @returns {string}
 */
function formatStatCount(count) {
  if (count <= 0) return '0';
  if (count < 10) return `${count}`;
  const step = count >= 100 ? 50 : 10;
  const rounded = Math.ceil(count / step) * step;
  return `${rounded}+`;
}

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
        isTemporarilyUnavailable: !!i.isTemporarilyUnavailable,
      }));

      const integrations = {
        connections: integrationsWithDetails.filter((/** @type {any} */ i) => i.category === 'source'),
        syncTargets: integrationsWithDetails.filter((/** @type {any} */ i) => i.category === 'destination'),
        all: integrationsWithDetails,
      };

      // Cross-reference sources + destinations to find icons for integrations
      // (integrations don't natively carry iconPath/iconType)
      /** @type {Record<string, {iconPath: string, iconType: string}>} */
      const iconLookup = {};
      for (const s of registry.sources || []) {
        if (s.iconPath) iconLookup[s.id] = { iconPath: s.iconPath, iconType: s.iconType };
      }
      for (const d of registry.destinations || []) {
        if (d.iconPath && !iconLookup[d.id]) iconLookup[d.id] = { iconPath: d.iconPath, iconType: d.iconType };
      }

      // Split integrations into available vs coming-soon for homepage
      const allConnections = integrationsWithDetails
        .filter((/** @type {any} */ i) => i.enabled !== false)
        .map((/** @type {any} */ i) => ({
          ...i,
          iconPath: iconLookup[i.id]?.iconPath || i.iconPath,
          iconType: iconLookup[i.id]?.iconType || i.iconType,
        }));
      const availableConnections = allConnections.filter((/** @type {any} */ c) => !c.isTemporarilyUnavailable);
      const comingSoonConnections = allConnections.filter((/** @type {any} */ c) => c.isTemporarilyUnavailable);

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
      })).sort((/** @type {any} */ a, /** @type {any} */ b) => {
        // Available items before "Coming Soon"
        if (a.isTemporarilyUnavailable !== b.isTemporarilyUnavailable) {
          return a.isTemporarilyUnavailable ? 1 : -1;
        }
        return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
      });
      const destinations = (registry.destinations || []).map((/** @type {any} */ d) => ({
        ...d,
        detailsUrl: `/plugins/targets/${d.id}`,
        isPremium: !!d.isPremium,
        // Preserve temporarily unavailable status for "Coming Soon" banners
        isTemporarilyUnavailable: !!d.isTemporarilyUnavailable,
      })).sort((/** @type {any} */ a, /** @type {any} */ b) => {
        // Available items before "Coming Soon"
        if (a.isTemporarilyUnavailable !== b.isTemporarilyUnavailable) {
          return a.isTemporarilyUnavailable ? 1 : -1;
        }
        return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
      });

      // Category metadata for grouping plugins (Output-based taxonomy)
      const ENRICHER_CATEGORIES = [
        { id: 'ai_images', name: 'AI & Images', emoji: '✨' },
        { id: 'summaries', name: 'Summaries', emoji: '📝' },
        { id: 'data', name: 'Data & Stats', emoji: '📊' },
        { id: 'detection', name: 'Smart Detection', emoji: '🎯' },
        { id: 'links', name: 'Links & References', emoji: '🔗' },
        { id: 'workflow', name: 'Workflow', emoji: '⚙️' },
      ];

      // Group boosters by category for marketing templates (Pro/Premium first)
      const boostersByCategory = ENRICHER_CATEGORIES
        .map((cat) => ({
          ...cat,
          plugins: boosters
            .filter((/** @type {any} */ b) => b.category === cat.id)
            .sort((/** @type {any} */ a, /** @type {any} */ b) => {
              // Available items before "Coming Soon"
              if (a.isTemporarilyUnavailable !== b.isTemporarilyUnavailable) {
                return a.isTemporarilyUnavailable ? 1 : -1;
              }
              // Pro (isPremium) boosters first
              if (a.isPremium !== b.isPremium) {
                return a.isPremium ? -1 : 1;
              }
              // Then alphabetically A-Z
              return (a.name || '').localeCompare(b.name || '');
            }),
        }))
        .filter((cat) => cat.plugins.length > 0);

      // Grouped by type for help articles — Sources, Boosters, Destinations, Connections.
      // Excludes disabled/internal plugins (mock, parkrun_results).
      const EXCLUDED_IDS = new Set(['mock', 'parkrun_results']);
      const sortByName = (a, b) => (a.name || '').localeCompare(b.name || '');
      const helpArticleByType = {
        sources: (registry.sources || [])
          .filter((/** @type {any} */ s) => s.enabled !== false && !EXCLUDED_IDS.has(s.id))
          .map((/** @type {any} */ s) => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            iconPath: s.iconPath,
            iconType: s.iconType,
            description: s.description,
            helpArticleUrl: `/help/articles/registry/sources/${s.id}`,
          }))
          .sort(sortByName),
        boosters: (registry.enrichers || [])
          .filter((/** @type {any} */ e) => e.enabled !== false && !EXCLUDED_IDS.has(e.id))
          .map((/** @type {any} */ e) => ({
            id: e.id,
            name: e.name,
            icon: e.icon,
            iconPath: e.iconPath,
            iconType: e.iconType,
            description: e.description,
            helpArticleUrl: `/help/articles/registry/enrichers/${e.id}`,
          }))
          .sort(sortByName),
        destinations: (registry.destinations || [])
          .filter((/** @type {any} */ d) => d.enabled !== false)
          .map((/** @type {any} */ d) => ({
            id: d.id,
            name: d.name,
            icon: d.icon,
            iconPath: d.iconPath,
            iconType: d.iconType,
            description: d.description,
            helpArticleUrl: `/help/articles/registry/destinations/${d.id}`,
          }))
          .sort(sortByName),
        connections: (registry.integrations || [])
          .filter((/** @type {any} */ i) => i.enabled !== false)
          .map((/** @type {any} */ i) => ({
            id: i.id,
            name: i.name,
            icon: i.icon,
            iconPath: i.iconPath,
            iconType: i.iconType,
            description: i.description,
            helpArticleUrl: `/help/articles/registry/integrations/${i.id}`,
          }))
          .sort(sortByName),
      };
      const totalPlugins = helpArticleByType.sources.length + helpArticleByType.boosters.length +
        helpArticleByType.destinations.length + helpArticleByType.connections.length;

      // Platform stats for marketing homepage (from registry API when marketingMode=true)
      const stats = registry.stats || {};
      const athleteCount = formatStatCount(stats.athleteCount || 0);
      const activitiesBoostedCount = formatStatCount(stats.activitiesBoostedCount || 0);

      ctx.logger.info(`Transformed ${integrationsWithDetails.length} integrations, ${boosters.length} boosters, ${totalPlugins} help article plugins, stats: ${athleteCount} athletes / ${activitiesBoostedCount} boosted`);

      return { integrations, boosters, boostersByCategory, sources, destinations, helpArticleByType, athleteCount, activitiesBoostedCount, availableConnections, comingSoonConnections };
    },
  };
}

