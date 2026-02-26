/**
 * Fetch Registry Task
 * Fetches registry data from the FitGlue API at build time
 * - Local: uses existing .cache/registry.json (create manually)
 * - CI: fetches from real API, fails build if unavailable
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * @param {Object} config
 * @param {string} config.apiUrl
 * @param {string} config.registryFile
 */
export function fetchRegistryTask(config) {
  return {
    name: 'fetch-registry',
    title: 'Fetch registry from API',
    config,
    run: async (cfg, ctx) => {
      const outDir = dirname(cfg.registryFile);
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }

      // Local dev mode: use existing file
      const isLocal = !process.env.CI && process.env.NODE_ENV !== 'production';

      if (isLocal) {
        if (existsSync(cfg.registryFile)) {
          ctx.logger.info('Local mode: using existing registry.json');
          const data = JSON.parse(readFileSync(cfg.registryFile, 'utf-8'));
          return { registry: data };
        }
        throw new Error(`Local mode: ${cfg.registryFile} not found. Create it or run in CI mode.`);
      }

      // CI/Production: fetch from real API
      ctx.logger.info(`Fetching registry from ${cfg.apiUrl}...`);

      try {
        const response = await fetch(cfg.apiUrl, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        writeFileSync(cfg.registryFile, JSON.stringify(data, null, 2));
        ctx.logger.info(`Wrote registry: ${data.integrations?.length || 0} integrations`);

        return { registry: data };
      } catch (error) {
        ctx.logger.warn(`Failed to fetch registry: ${error.message}`);

        // Fall back to cached registry file if available
        if (existsSync(cfg.registryFile)) {
          ctx.logger.warn('Using cached registry.json as fallback');
          const data = JSON.parse(readFileSync(cfg.registryFile, 'utf-8'));
          return { registry: data };
        }

        throw new Error('Build cannot continue without registry data (no API and no cached file).');
      }
    },
  };
}
