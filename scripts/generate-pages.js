/**
 * Generate dynamic pages from registry data
 * Renders Handlebars templates with data and outputs directly to static-dist
 * Run AFTER skier build (since we need the partials to be compiled)
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const REGISTRY_FILE = path.join(__dirname, '..', '_data', 'registry.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PARTIALS_DIR = path.join(__dirname, '..', 'partials');
const OUTPUT_DIR = path.join(__dirname, '..', 'static-dist');

// Global values that would normally come from skier
const globalValues = {
  siteName: 'FitGlue',
  siteUrl: 'https://fitglue.com/',
  tagline: 'Your fitness data, unified.',
  year: new Date().getFullYear(),
};

function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch (error) {
    console.warn('⚠️ Could not load registry.json');
    return { integrations: [], sources: [], enrichers: [], destinations: [] };
  }
}

function loadTemplate(name) {
  try {
    return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), 'utf-8');
  } catch (error) {
    console.warn(`⚠️ Could not load template: ${name}`);
    return '';
  }
}

function registerPartials() {
  // Register all partials from the partials directory
  const partialFiles = fs.readdirSync(PARTIALS_DIR).filter(f => f.endsWith('.html'));
  for (const file of partialFiles) {
    const name = path.basename(file, '.html');
    const content = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf-8');
    Handlebars.registerPartial(name, content);
  }
}

function generateConnectionPages(registry, template) {
  const outputDir = path.join(OUTPUT_DIR, 'connections');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const compiledTemplate = Handlebars.compile(template);

  for (const integration of registry.integrations) {
    const data = {
      ...globalValues,
      ...integration,
      pageTitle: `${integration.name} - Connection`,
      description: integration.description || `FitGlue ${integration.name} connection details.`,
      isConnections: true,
      canonicalPath: `/connections/${integration.id}`,
      isOAuth: integration.authType === 'oauth',
    };

    const html = compiledTemplate(data);
    const outputPath = path.join(outputDir, `${integration.id}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`  📄 Generated: connections/${integration.id}.html`);
  }
}

function generatePluginPages(registry, urlType, dataKey, pluginType, typeFlags, template) {
  const outputDir = path.join(OUTPUT_DIR, 'plugins', urlType);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const compiledTemplate = Handlebars.compile(template);
  const items = registry[dataKey] || [];

  for (const item of items) {
    const data = {
      ...globalValues,
      ...item,
      pageTitle: `${item.name} - ${pluginType} Plugin`,
      description: item.description || `FitGlue ${pluginType.toLowerCase()} plugin details.`,
      isPlugins: true,
      canonicalPath: `/plugins/${urlType}/${item.id}`,
      ...typeFlags,
    };

    const html = compiledTemplate(data);
    const outputPath = path.join(outputDir, `${item.id}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`  📄 Generated: plugins/${urlType}/${item.id}.html`);
  }
}

function main() {
  console.log('🔧 Generating dynamic pages from registry...');

  // Load registry data
  const registry = loadRegistry();

  // Register Handlebars partials
  registerPartials();

  // Load templates
  const connectionTemplate = loadTemplate('connection-detail');
  const pluginTemplate = loadTemplate('plugin-detail');

  if (!connectionTemplate || !pluginTemplate) {
    console.error('❌ Missing templates');
    process.exit(1);
  }

  // Generate connection pages
  console.log('📁 Connections:');
  generateConnectionPages(registry, connectionTemplate);

  // Generate plugin pages
  console.log('📁 Sources:');
  generatePluginPages(registry, 'sources', 'sources', 'Source',
    { isSource: true, isEnricher: false, isDestination: false }, pluginTemplate);

  console.log('📁 Boosters:');
  generatePluginPages(registry, 'boosters', 'enrichers', 'Booster',
    { isSource: false, isEnricher: true, isDestination: false }, pluginTemplate);

  console.log('📁 Targets:');
  generatePluginPages(registry, 'targets', 'destinations', 'Target',
    { isSource: false, isEnricher: false, isDestination: true }, pluginTemplate);

  console.log('✅ Dynamic page generation complete');
}

main();
