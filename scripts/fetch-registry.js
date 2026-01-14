/**
 * Fetch registry from the API and write to _data/registry.json
 * Run before static site build: node scripts/fetch-registry.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.REGISTRY_API_URL || 'https://fitglue.com/api/registry';
const OUTPUT_DIR = path.join(__dirname, '..', '_data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'registry.json');

// Fallback data if API is unavailable or in development
const FALLBACK_DATA = {
  integrations: [
    {
      id: 'hevy',
      name: 'Hevy',
      icon: '🏋️',
      image: '/images/integrations/hevy.svg',
      status: 'live',
      description: 'Import strength training workouts',
      category: 'source',
      authType: 'apikey',
      detailsUrl: '/integrations/hevy',
      setupTitle: 'Connect Hevy',
      setupInstructions: 'Generate an API key from the Hevy app settings.',
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: '⌚',
      image: '/images/integrations/fitbit.svg',
      status: 'live',
      description: 'Import activities and heart rate data',
      category: 'source',
      authType: 'oauth',
      detailsUrl: '/integrations/fitbit',
      setupTitle: 'Connect Fitbit',
      setupInstructions: 'Authorize FitGlue to access your Fitbit data.',
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: '🚴',
      image: '/images/integrations/strava.svg',
      status: 'live',
      description: 'Upload enriched activities to Strava',
      category: 'destination',
      authType: 'oauth',
      detailsUrl: '/integrations/strava',
      setupTitle: 'Connect Strava',
      setupInstructions: 'Authorize FitGlue to upload to your Strava profile.',
    },
  ],
  sources: [
    { id: 'hevy', name: 'Hevy', icon: '🏋️', description: 'Import strength training workouts from Hevy' },
    { id: 'fitbit', name: 'Fitbit', icon: '⌚', description: 'Import activities from Fitbit' },
  ],
  enrichers: [
    { id: 'ai-description', name: 'AI Descriptions', icon: '🤖', description: 'Let AI write engaging summaries of your workouts' },
    { id: 'muscle-heatmap', name: 'Muscle Heatmaps', icon: '💪', description: 'Visualize which muscles you trained' },
    { id: 'heart-rate', name: 'Heart Rate Analysis', icon: '❤️', description: 'Pull heart rate data from your wearables' },
  ],
  destinations: [
    { id: 'strava', name: 'Strava', icon: '🚴', description: 'Upload activities to Strava' },
  ],
};

async function fetchPlugins() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if we're in development/local mode
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log('📦 Development mode: using fallback plugin data');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(FALLBACK_DATA, null, 2));
    console.log(`✅ Wrote fallback data to ${OUTPUT_FILE}`);
    return;
  }

  try {
    console.log(`🔍 Fetching plugins from ${API_URL}...`);

    const response = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform API response to our expected format
    const transformed = transformPluginData(data);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2));
    console.log(`✅ Wrote plugin data to ${OUTPUT_FILE}`);
    console.log(`   - ${transformed.integrations.length} integrations`);
    console.log(`   - ${transformed.sources.length} sources`);
    console.log(`   - ${transformed.enrichers.length} enrichers`);
    console.log(`   - ${transformed.destinations.length} destinations`);
  } catch (error) {
    console.warn(`⚠️ Failed to fetch plugins: ${error.message}`);
    console.log('📦 Using fallback plugin data');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(FALLBACK_DATA, null, 2));
  }
}

function transformPluginData(apiData) {
  const result = {
    integrations: [],
    sources: [],
    enrichers: [],
    destinations: [],
  };

  // Transform integrations
  if (apiData.integrations && Array.isArray(apiData.integrations)) {
    result.integrations = apiData.integrations
      .filter(i => i.enabled)
      .map(i => ({
        id: i.id,
        name: i.name,
        icon: i.icon || '🔌',
        image: `/images/integrations/${i.id}.svg`,
        status: 'live',
        description: i.description || '',
        category: getIntegrationCategory(i),
        authType: i.authType === 1 ? 'oauth' : 'apikey',
        detailsUrl: `/integrations/${i.id}`,
        setupTitle: i.setupTitle || `Connect ${i.name}`,
        setupInstructions: i.setupInstructions || '',
        docsUrl: i.docsUrl || '',
        // Marketing fields
        marketingDescription: i.marketingDescription || '',
        features: i.features || [],
      }));
  }

  // Transform sources
  if (apiData.sources && Array.isArray(apiData.sources)) {
    result.sources = apiData.sources
      .filter(s => s.enabled)
      .map(s => ({
        id: s.id,
        name: s.name,
        icon: s.icon || '📥',
        description: s.description || '',
        detailsUrl: `/plugins/sources/${s.id}`,
        // Marketing fields
        marketingDescription: s.marketingDescription || '',
        features: s.features || [],
        requiredIntegrations: s.requiredIntegrations || [],
      }));
  }

  // Transform enrichers
  if (apiData.enrichers && Array.isArray(apiData.enrichers)) {
    result.enrichers = apiData.enrichers
      .filter(e => e.enabled)
      .map(e => ({
        id: e.id,
        name: e.name,
        icon: e.icon || '✨',
        description: e.description || '',
        detailsUrl: `/plugins/boosters/${e.id}`,
        providerType: e.enricherProviderType,
        // Marketing fields
        marketingDescription: e.marketingDescription || '',
        features: e.features || [],
        requiredIntegrations: e.requiredIntegrations || [],
      }));
  }

  // Transform destinations
  if (apiData.destinations && Array.isArray(apiData.destinations)) {
    result.destinations = apiData.destinations
      .filter(d => d.enabled)
      .map(d => ({
        id: d.id,
        name: d.name,
        icon: d.icon || '📤',
        description: d.description || '',
        detailsUrl: `/plugins/destinations/${d.id}`,
        // Marketing fields
        marketingDescription: d.marketingDescription || '',
        features: d.features || [],
        requiredIntegrations: d.requiredIntegrations || [],
      }));
  }

  return result;
}

function getIntegrationCategory(integration) {
  // Check if this integration is used as a source or destination based on ID
  const sourceIds = ['hevy', 'fitbit'];
  const destIds = ['strava'];

  if (sourceIds.includes(integration.id)) return 'source';
  if (destIds.includes(integration.id)) return 'destination';
  return 'source'; // default
}

fetchPlugins();
