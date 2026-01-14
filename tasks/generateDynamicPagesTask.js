/**
 * Generate Dynamic Pages Task
 * Generates connection and plugin detail pages from registry data
 * Uses globals from Skier context (including cacheHash)
 */

import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import Handlebars from 'handlebars';

/**
 * @param {Object} config
 * @param {string} config.registryFile
 * @param {string} config.templatesDir
 * @param {string} config.partialsDir
 * @param {string} config.outDir
 */
export function generateDynamicPagesTask(config) {
  return {
    name: 'generate-dynamic-pages',
    title: 'Generate dynamic pages from registry',
    config,
    run: async (cfg, ctx) => {
      // Load registry
      if (!existsSync(cfg.registryFile)) {
        throw new Error(`Registry file not found: ${cfg.registryFile}`);
      }
      const registry = JSON.parse(readFileSync(cfg.registryFile, 'utf-8'));

      // Register Handlebars partials
      const partialFiles = readdirSync(cfg.partialsDir).filter(f => f.endsWith('.html'));
      for (const file of partialFiles) {
        const name = basename(file, '.html');
        const content = readFileSync(join(cfg.partialsDir, file), 'utf-8');
        Handlebars.registerPartial(name, content);
      }

      // Use globals from Skier context - includes cacheHash, siteName, etc.
      const globals = ctx.globals || {};

      const pages = [];

      // Connection detail pages
      for (const i of registry.integrations || []) {
        pages.push({
          template: 'connection-detail',
          outputPath: `connections/${i.id}.html`,
          data: { ...globals, ...i, pageTitle: `${i.name} - Connection`, isConnections: true, canonicalPath: `/connections/${i.id}`, isOAuth: i.authType === 'oauth' },
        });
      }

      // Source pages
      for (const s of registry.sources || []) {
        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/sources/${s.id}.html`,
          data: { ...globals, ...s, pageTitle: `${s.name} - Source Plugin`, isPlugins: true, canonicalPath: `/plugins/sources/${s.id}`, isSource: true, isEnricher: false, isDestination: false },
        });
      }

      // Booster pages
      for (const e of registry.enrichers || []) {
        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/boosters/${e.id}.html`,
          data: { ...globals, ...e, pageTitle: `${e.name} - Booster Plugin`, isPlugins: true, canonicalPath: `/plugins/boosters/${e.id}`, isSource: false, isEnricher: true, isDestination: false },
        });
      }

      // Target pages
      for (const d of registry.destinations || []) {
        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/targets/${d.id}.html`,
          data: { ...globals, ...d, pageTitle: `${d.name} - Target Plugin`, isPlugins: true, canonicalPath: `/plugins/targets/${d.id}`, isSource: false, isEnricher: false, isDestination: true },
        });
      }

      // Render all
      for (const page of pages) {
        const templateContent = readFileSync(join(cfg.templatesDir, `${page.template}.html`), 'utf-8');
        const html = Handlebars.compile(templateContent)(page.data);
        const outputPath = join(cfg.outDir, page.outputPath);
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, html);
      }

      ctx.logger.info(`Generated ${pages.length} dynamic pages`);
    },
  };
}
