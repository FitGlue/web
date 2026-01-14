// @ts-check
/**
 * FitGlue Web - Skier Build Tasks
 * All logic is in custom tasks - this file is purely declarative.
 */

import {
  prepareOutputTask,
  bundleCssTask,
  copyStaticTask,
  setGlobalsTask,
  generatePagesTask,
} from 'skier';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchRegistryTask } from './tasks/fetchRegistryTask.js';
import { generateDynamicPagesTask } from './tasks/generateDynamicPagesTask.js';
import { updateVersionTask } from './tasks/updateVersionTask.js';
import { transformRegistryTask } from './tasks/transformRegistryTask.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a hash for cache busting
const cacheHash = Date.now().toString(36);

export const tasks = [
  // Sync version from CHANGELOG
  updateVersionTask({
    changelogPath: path.join(__dirname, 'CHANGELOG.md'),
    packagePath: path.join(__dirname, 'package.json'),
    envPath: path.join(__dirname, '.env'),
  }),

  // Fetch registry data from API (CI) or use existing file (local)
  fetchRegistryTask({
    apiUrl: 'https://fitglue.com/api/registry',
    registryFile: path.join(__dirname, '.cache', 'registry.json'),
  }),

  // Transform registry data for landing page templates
  transformRegistryTask(),

  // Clean & create output directory
  prepareOutputTask({
    outDir: './static-dist',
  }),

  // Bundle CSS
  bundleCssTask({
    from: './assets/styles',
    to: './static-dist',
    output: `styles.min.${cacheHash}.css`,
    minify: true,
  }),

  // Copy static assets
  copyStaticTask({
    from: './assets/images',
    to: './static-dist/images',
  }),
  copyStaticTask({
    from: './assets/root',
    to: './static-dist',
  }),

  // Set global values for templates
  setGlobalsTask({
    values: {
      siteName: 'FitGlue',
      siteUrl: 'https://fitglue.com/',
      tagline: 'Your fitness data, unified.',
      year: new Date().getFullYear(),
      cacheHash,
      appUrl: '/app',
      waitlistUrl: '/waitlist',
    },
  }),

  // Generate main pages
  generatePagesTask({
    pagesDir: './pages',
    partialsDir: './partials',
    outDir: './static-dist',
    additionalVarsFn: ({ currentPage }) => {
      const pageName = currentPage === 'index' ? 'home' : currentPage;
      const canonicalPath = currentPage === 'index' ? '/' : `/${currentPage}`;
      /** @type {Record<string, string>} */
      const descriptions = {
        index: 'FitGlue unifies your fitness data. Sync workouts to Strava with AI-powered descriptions.',
        features: 'Discover FitGlue features: Connect apps, boost data with AI, sync everywhere.',
        'how-it-works': 'How FitGlue connects your apps and enhances your workout data.',
        connections: 'Fitness platforms FitGlue connects with: Hevy, Fitbit, Strava.',
        plugins: 'FitGlue pipeline features: Sources, Boosters, and Targets.',
        pricing: 'FitGlue pricing: Free tier and Pro plans.',
        about: 'About FitGlue: Unifying fragmented fitness data.',
        contact: 'Contact the FitGlue team.',
        waitlist: 'Join the FitGlue waitlist.',
        privacy: 'FitGlue Privacy Policy.',
        terms: 'FitGlue Terms of Service.',
      };
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
        canonicalPath,
        description: descriptions[currentPage] || 'FitGlue - Your fitness data, unified.',
      };
    },
  }),

  // Generate auth pages
  generatePagesTask({
    pagesDir: './pages/auth',
    partialsDir: './partials',
    outDir: './static-dist/auth',
    additionalVarsFn: ({ currentPage }) => {
      /** @type {Record<string, {pageTitle: string, description: string}>} */
      const authMeta = {
        login: { pageTitle: 'Login', description: 'Log in to FitGlue.' },
        register: { pageTitle: 'Create Account', description: 'Create a FitGlue account.' },
        'forgot-password': { pageTitle: 'Reset Password', description: 'Reset your password.' },
        'verify-email': { pageTitle: 'Verify Email', description: 'Verify your email.' },
        logout: { pageTitle: 'Logout', description: 'Log out of FitGlue.' },
      };
      const meta = authMeta[currentPage] || { pageTitle: currentPage, description: '' };
      return { ...meta, canonicalPath: `/auth/${currentPage}` };
    },
  }),

  // Generate dynamic connection & plugin pages
  generateDynamicPagesTask({
    registryFile: path.join(__dirname, '.cache', 'registry.json'),
    templatesDir: path.join(__dirname, 'templates'),
    partialsDir: path.join(__dirname, 'partials'),
    outDir: path.join(__dirname, 'static-dist'),
  }),
];
