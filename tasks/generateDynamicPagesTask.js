/**
 * Generate Dynamic Pages Task
 * Generates connection and plugin detail pages from registry data
 * Uses globals from Skier context (including cacheHash)
 * Parses markdown to HTML using marked
 */

import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import Handlebars from 'handlebars';
import { marked } from 'marked';

// Configure marked for safe output
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Parse markdown content to HTML
 * @param {string} markdown
 * @returns {string}
 */
function parseMarkdown(markdown) {
  if (!markdown) return '';
  return marked.parse(markdown.trim());
}

/**
 * Parse numbered list markdown into structured steps
 * @param {string} markdown
 * @returns {Array<{number: number, title: string, description: string}>}
 */
function parseSetupSteps(markdown) {
  if (!markdown) return [];

  const steps = [];
  // Match lines like "1. Open the **Hevy app** on your phone" or "1. **Open Hevy** - description"
  const stepRegex = /^(\d+)\.\s+(.+)$/gm;
  let match;

  while ((match = stepRegex.exec(markdown)) !== null) {
    const num = parseInt(match[1], 10);
    const content = match[2];

    // Extract title from **bold** text
    const titleMatch = content.match(/\*\*([^*]+)\*\*/);
    const title = titleMatch ? titleMatch[1] : content.split(' ').slice(0, 3).join(' ');
    const description = content.replace(/\*\*[^*]+\*\*/g, '').trim();

    steps.push({ number: num, title, description: description || content });
  }

  return steps;
}

/**
 * Get integration object from registry by ID
 * @param {Object} registry
 * @param {string} integrationId
 * @returns {Object|null}
 */
function getIntegrationById(registry, integrationId) {
  return (registry.integrations || []).find(i => i.id === integrationId) || null;
}

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

      // Register 'eq' helper for equality comparisons in templates
      Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
      });

      // Use globals from Skier context
      const globals = ctx.globals || {};

      const pages = [];

      // Connection detail pages
      for (const i of registry.integrations || []) {
        // Parse markdown content and setup steps
        const marketingHtml = parseMarkdown(i.marketingDescription);
        const setupSteps = parseSetupSteps(i.setupInstructions);
        const isOAuth = i.authType === 1 || i.authType === 'oauth';

        pages.push({
          template: 'connection-detail',
          outputPath: `connections/${i.id}.html`,
          data: {
            ...globals,
            ...i,
            pageTitle: `${i.name} - Connection`,
            isConnections: true,
            canonicalPath: `/connections/${i.id}`,
            isOAuth,
            marketingHtml,
            setupSteps,
            hasSetupSteps: setupSteps.length > 0,
          },
        });
      }

      // Source pages
      for (const s of registry.sources || []) {
        const marketingHtml = parseMarkdown(s.marketingDescription);
        const requiredConnectionObjects = (s.requiredIntegrations || [])
          .map(id => getIntegrationById(registry, id))
          .filter(Boolean);

        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/sources/${s.id}.html`,
          data: {
            ...globals,
            ...s,
            pageTitle: `${s.name} - Source Plugin`,
            isPlugins: true,
            canonicalPath: `/plugins/sources/${s.id}`,
            isSource: true,
            isEnricher: false,
            isDestination: false,
            marketingHtml,
            requiredConnectionObjects,
            hasRequiredConnections: requiredConnectionObjects.length > 0,
          },
        });
      }

      // Booster pages
      for (const e of registry.enrichers || []) {
        const marketingHtml = parseMarkdown(e.marketingDescription);
        const requiredConnectionObjects = (e.requiredIntegrations || [])
          .map(id => getIntegrationById(registry, id))
          .filter(Boolean);

        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/boosters/${e.id}.html`,
          data: {
            ...globals,
            ...e,
            pageTitle: `${e.name} - Booster Plugin`,
            isPlugins: true,
            canonicalPath: `/plugins/boosters/${e.id}`,
            isSource: false,
            isEnricher: true,
            isDestination: false,
            marketingHtml,
            requiredConnectionObjects,
            hasRequiredConnections: requiredConnectionObjects.length > 0,
            // Config with full options for rich display
            hasConfig: (e.configSchema || []).length > 0,
            configItems: (e.configSchema || []).map(c => ({
              key: c.key,
              label: c.label,
              description: c.description,
              required: c.required,
              fieldType: c.fieldType,
              defaultValue: c.defaultValue,
              // Pre-compute isDefault for each option
              options: (c.options || []).map(o => ({
                ...o,
                isDefault: o.value === c.defaultValue,
              })),
              hasOptions: (c.options || []).length > 0,
              isSelect: c.fieldType === 4, // CONFIG_FIELD_TYPE_SELECT
              isBoolean: c.fieldType === 3, // CONFIG_FIELD_TYPE_BOOLEAN
              isString: c.fieldType === 1, // CONFIG_FIELD_TYPE_STRING
              // Pre-compute for boolean display
              defaultIsTrue: c.defaultValue === 'true',
            })),
            // Flexible field transformations
            transformations: (e.transformations || []).map(t => ({
              field: t.field,
              label: t.label,
              before: t.before,
              // Use pre-formatted afterHtml if available, otherwise convert plain text
              afterHtml: t.afterHtml || (t.after || '').replace(/\n/g, '<br>'),
              // Visual type support for SVG visuals (hr-graph, gps-map, heatmap)
              visualType: t.visualType || null,
              hasVisual: !!t.visualType,
            })),
            hasTransformations: (e.transformations || []).length > 0,
            // Use cases
            useCases: e.useCases || [],
            hasUseCases: (e.useCases || []).length > 0,
            // Tier gating
            isAthleteTier: e.requiredTier === 'pro',
          },
        });
      }

      // Target pages
      for (const d of registry.destinations || []) {
        const marketingHtml = parseMarkdown(d.marketingDescription);
        const requiredConnectionObjects = (d.requiredIntegrations || [])
          .map(id => getIntegrationById(registry, id))
          .filter(Boolean);

        pages.push({
          template: 'plugin-detail',
          outputPath: `plugins/targets/${d.id}.html`,
          data: {
            ...globals,
            ...d,
            pageTitle: `${d.name} - Target Plugin`,
            isPlugins: true,
            canonicalPath: `/plugins/targets/${d.id}`,
            isSource: false,
            isEnricher: false,
            isDestination: true,
            marketingHtml,
            requiredConnectionObjects,
            hasRequiredConnections: requiredConnectionObjects.length > 0,
          },
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
