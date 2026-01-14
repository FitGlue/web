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
        status: i.enabled ? 'live' : 'disabled',
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
      }));
      const sources = (registry.sources || []).map((/** @type {any} */ s) => ({
        ...s,
        detailsUrl: `/plugins/sources/${s.id}`,
      }));
      const destinations = (registry.destinations || []).map((/** @type {any} */ d) => ({
        ...d,
        detailsUrl: `/plugins/targets/${d.id}`,
      }));

      ctx.logger.info(`Transformed ${integrationsWithDetails.length} integrations, ${boosters.length} boosters`);

      return { integrations, boosters, sources, destinations };
    },
  };
}
