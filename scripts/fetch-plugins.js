/**
 * Fetch plugins from the API and write to _data/plugins.json
 * Run before static site build: node scripts/fetch-plugins.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.PLUGIN_API_URL || 'https://fitglue.com/api/plugins';
const OUTPUT_DIR = path.join(__dirname, '..', '_data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'plugins.json');

// Fallback data if API is unavailable or in development
const FALLBACK_DATA = {
  connections: [
    { id: 'hevy', name: 'Hevy', icon: '/images/integrations/hevy.svg', status: 'live', description: 'Strength training workouts' },
    { id: 'fitbit', name: 'Fitbit', icon: '/images/integrations/fitbit.svg', status: 'live', description: 'Heart rate & sleep data' },
  ],
  syncTargets: [
    { id: 'strava', name: 'Strava', icon: '/images/integrations/strava.svg', status: 'live', description: 'Share your achievements' },
  ],
  comingSoon: [
    { id: 'garmin', name: 'Garmin', icon: '/images/integrations/garmin.svg', status: 'coming', description: 'GPS activities' },
    { id: 'apple-health', name: 'Apple Health', icon: '/images/integrations/apple-health.svg', status: 'coming', description: 'Unified health data' },
    { id: 'nike-run-club', name: 'Nike Run Club', icon: '/images/integrations/nike-run-club.svg', status: 'coming', description: 'Running activities' },
  ],
  boosters: [
    { id: 'ai-description', name: 'AI Descriptions', icon: '🤖', description: 'Let AI write engaging summaries of your workouts' },
    { id: 'muscle-heatmap', name: 'Muscle Heatmaps', icon: '💪', description: 'Visualize which muscles you trained' },
    { id: 'heart-rate', name: 'Heart Rate Analysis', icon: '❤️', description: 'Pull heart rate data from your wearables' },
    { id: 'achievements', name: 'Achievement Badges', icon: '🏆', description: 'Celebrate milestones automatically' },
    { id: 'custom-notes', name: 'Custom Notes', icon: '✏️', description: 'Add your own insights and comments' },
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

    // Transform API response to integration format
    const transformed = transformPluginData(data);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2));
    console.log(`✅ Wrote ${Object.keys(transformed).length} plugin categories to ${OUTPUT_FILE}`);
  } catch (error) {
    console.warn(`⚠️ Failed to fetch plugins: ${error.message}`);
    console.log('📦 Using fallback plugin data');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(FALLBACK_DATA, null, 2));
  }
}

function transformPluginData(apiData) {
  // If API returns enrichers array, transform to our structure
  if (apiData.enrichers) {
    return {
      ...FALLBACK_DATA,
      boosters: apiData.enrichers.map(e => ({
        id: e.name.toLowerCase().replace(/\s+/g, '-'),
        name: e.displayName || e.name,
        icon: e.icon || '🔧',
        description: e.description || '',
      })),
    };
  }

  // If API returns our expected format, use it directly
  return apiData;
}

fetchPlugins();
