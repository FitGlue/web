// @ts-check
import {
  prepareOutputTask,
  bundleCssTask,
  copyStaticTask,
  setGlobalsTask,
  generatePagesTask,
} from 'skier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a hash for cache busting
const cacheHash = Date.now().toString(36);

// Load registry data from fetch-registry.js output
function loadRegistryData() {
  try {
    const dataPath = path.join(__dirname, '_data', 'registry.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data;
  } catch (error) {
    console.warn('⚠️ Could not load registry.json, using empty defaults');
    return {
      integrations: [],
      sources: [],
      enrichers: [],
      destinations: [],
    };
  }
}

const registryData = loadRegistryData();

// Transform integrations for the marketing site format
const integrationsWithDetails = registryData.integrations.map(i => ({
  ...i,
  detailsUrl: `/connections/${i.id}`,
  status: i.enabled ? 'live' : 'disabled',
}));

const integrations = {
  // Group by category for legacy template support
  connections: integrationsWithDetails.filter(i => i.category === 'source'),
  syncTargets: integrationsWithDetails.filter(i => i.category === 'destination'),
  // All integrations for new pages
  all: integrationsWithDetails,
};

// Create lookup maps for dynamic page generation
const integrationById = {};
for (const integration of registryData.integrations) {
  integrationById[integration.id] = integration;
}

const pluginById = {};
for (const source of registryData.sources || []) {
  pluginById[source.id] = { ...source, pluginType: 'source' };
}
for (const enricher of registryData.enrichers || []) {
  pluginById[enricher.id] = { ...enricher, pluginType: 'enricher' };
}
for (const destination of registryData.destinations || []) {
  pluginById[destination.id] = { ...destination, pluginType: 'destination' };
}

// Enrichers/Boosters with detailsUrl
const boosters = (registryData.enrichers || []).map(e => ({
  ...e,
  detailsUrl: `/plugins/boosters/${e.id}`,
}));

// Sources and Destinations with detailsUrl
const sources = (registryData.sources || []).map(s => ({
  ...s,
  detailsUrl: `/plugins/sources/${s.id}`,
}));
const destinations = (registryData.destinations || []).map(d => ({
  ...d,
  detailsUrl: `/plugins/targets/${d.id}`,
}));

// Define global values
const globalValues = {
  siteName: 'FitGlue',
  siteUrl: 'https://fitglue.com/',
  tagline: 'Your fitness data, unified.',
  year: new Date().getFullYear(),
  cacheHash: cacheHash,
  integrations: integrations,
  boosters: boosters,
  sources: sources,
  destinations: destinations,
  appUrl: '/app',
  waitlistUrl: '/waitlist',
};

export const tasks = [
  // Clean & Create output directory
  prepareOutputTask({
    outDir: './static-dist',
  }),

  // Bundle and minify CSS
  bundleCssTask({
    from: './assets/styles',
    to: './static-dist',
    output: `styles.min.${cacheHash}.css`,
    minify: true,
  }),

  // Copy static images
  copyStaticTask({
    from: './assets/images',
    to: './static-dist/images',
  }),

  // Copy root assets (favicon, robots, etc.)
  copyStaticTask({
    from: './assets/root',
    to: './static-dist',
  }),

  // Make globals available to templates
  setGlobalsTask({
    values: globalValues,
  }),

  // Generate HTML pages
  generatePagesTask({
    pagesDir: './pages',
    partialsDir: './partials',
    outDir: './static-dist',
    additionalVarsFn: ({ currentPage, ...vars }) => {
      const pageName = currentPage === 'index' ? 'home' : currentPage;
      const canonicalPath = currentPage === 'index' ? '/' : `/${currentPage}`;

      return {
        pageTitle: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' '),
        isHome: currentPage === 'index',
        isFeatures: currentPage === 'features',
        isHowItWorks: currentPage === 'how-it-works',
        isConnections: currentPage === 'connections',
        isPlugins: currentPage === 'plugins',
        isPricing: currentPage === 'pricing',
        isAbout: currentPage === 'about',
        isContact: currentPage === 'contact',
        isWaitlist: currentPage === 'waitlist',
        isPrivacy: currentPage === 'privacy',
        isTerms: currentPage === 'terms',
        canonicalPath: canonicalPath,
        description: (() => {
          switch (currentPage) {
            case 'index':
              return 'FitGlue unifies your fitness data from Hevy, Fitbit, and more. Automatically sync workouts to Strava with AI-powered descriptions and rich enhancements.';
            case 'features':
              return 'Discover FitGlue features: Connect your fitness apps, boost your data with AI, and sync everywhere automatically.';
            case 'how-it-works':
              return 'Learn how FitGlue connects your fitness apps, enhances your workout data, and syncs it to your favorite platforms.';
            case 'connections':
              return 'See all the fitness platforms FitGlue connects with: Hevy, Fitbit, and Strava.';
            case 'plugins':
              return 'Explore FitGlue pipeline features: Sources, Boosters, and Targets for customizing your data flow.';
            case 'pricing':
              return 'FitGlue pricing plans: Free tier to get started, Pro for power users.';
            case 'about':
              return 'About FitGlue: Our mission to unify the fragmented world of fitness data.';
            case 'contact':
              return 'Get in touch with the FitGlue team.';
            case 'waitlist':
              return 'Join the FitGlue waitlist and be the first to experience unified fitness data.';
            case 'privacy':
              return 'FitGlue Privacy Policy - How we handle your data.';
            case 'terms':
              return 'FitGlue Terms of Service.';
            default:
              return 'FitGlue - Your fitness data, unified.';
          }
        })(),
      };
    },
  }),

  // Dynamic connection and plugin pages are generated by generate-pages.js
  // after skier build - see package.json _generate-pages script

  // Generate auth pages (login, register, etc.)
  generatePagesTask({
    pagesDir: './pages/auth',
    partialsDir: './partials',
    outDir: './static-dist/auth',
    additionalVarsFn: ({ currentPage }) => {
      const authMeta = {
        login: {
          pageTitle: 'Login',
          description: 'Log in to your FitGlue account.',
        },
        register: {
          pageTitle: 'Create Account',
          description: 'Create a new FitGlue account to unify your fitness data.',
        },
        'forgot-password': {
          pageTitle: 'Reset Password',
          description: 'Reset your FitGlue account password.',
        },
        'verify-email': {
          pageTitle: 'Verify Email',
          description: 'Verify your email address for FitGlue.',
        },
        logout: {
          pageTitle: 'Logout',
          description: 'Log out of your FitGlue account.',
        },
      };

      const meta = authMeta[currentPage] || {};
      return {
        pageTitle: meta.pageTitle || currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
        description: meta.description || `FitGlue ${currentPage} page.`,
        canonicalPath: `/auth/${currentPage}`,
      };
    },
  }),
];
