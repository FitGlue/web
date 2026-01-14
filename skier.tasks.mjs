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

// Load plugin data from fetch-plugins.js output
function loadPluginData() {
  try {
    const dataPath = path.join(__dirname, '_data', 'plugins.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data;
  } catch (error) {
    console.warn('⚠️ Could not load plugins.json, using empty defaults');
    return {
      integrations: [],
      sources: [],
      enrichers: [],
      destinations: [],
      comingSoon: [],
    };
  }
}

const pluginData = loadPluginData();

// Transform integrations for the marketing site format
const integrations = {
  // Group by category for legacy template support
  connections: pluginData.integrations.filter(i => i.category === 'source'),
  syncTargets: pluginData.integrations.filter(i => i.category === 'destination'),
  comingSoon: pluginData.comingSoon || [],
  // All integrations for new pages
  all: pluginData.integrations,
};

// Enrichers/Boosters
const boosters = pluginData.enrichers || [];

// Sources and Destinations
const sources = pluginData.sources || [];
const destinations = pluginData.destinations || [];

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
        isIntegrations: currentPage === 'integrations',
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
            case 'integrations':
              return 'See all the fitness platforms FitGlue integrates with: Hevy, Fitbit, Strava, and more coming soon.';
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

  // Generate integration detail pages (subdirectory)
  generatePagesTask({
    pagesDir: './pages/integrations',
    partialsDir: './partials',
    outDir: './static-dist/integrations',
    additionalVarsFn: ({ currentPage }) => {
      const integrationMeta = {
        hevy: {
          pageTitle: 'Hevy Integration',
          description: 'Connect Hevy to FitGlue to import your strength training workouts. Step-by-step setup guide.',
        },
        fitbit: {
          pageTitle: 'Fitbit Integration',
          description: 'Connect Fitbit to FitGlue to import your activities, heart rate, and health data.',
        },
        strava: {
          pageTitle: 'Strava Integration',
          description: 'Upload your enriched FitGlue activities to Strava automatically.',
        },
      };

      const meta = integrationMeta[currentPage] || {};
      return {
        pageTitle: meta.pageTitle || `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Integration`,
        description: meta.description || `FitGlue ${currentPage} integration details.`,
        isIntegrations: true,
        canonicalPath: `/integrations/${currentPage}`,
      };
    },
  }),

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
