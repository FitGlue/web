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
    apiUrl: process.env.REGISTRY_API_URL || 'https://dev.fitglue.tech/api/registry',
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
        index: 'Watch your workout become extraordinary. FitGlue transforms every session into a story worth sharing—with AI descriptions, heart rate data, and muscle heatmaps.',
        features: 'Connect everywhere, enhance everything. Discover how FitGlue magically transforms your workouts with AI summaries, heart rate overlays, and muscle heatmaps.',
        'how-it-works': 'Three simple steps to extraordinary workouts. Connect your apps, choose your boosters, and watch the magic happen automatically.',
        'the-magic': 'Explore the magic layer. See how FitGlue takes your raw workout data and transforms it into something extraordinary.',
        pricing: 'Simple, honest pricing. Start free, upgrade when you need more. Or self-host—it\'s open source.',
        about: 'We believe your fitness data should work for you, not against you. FitGlue transforms disconnected data into unified fitness stories.',
        contact: 'Have a question or suggestion? We\'d love to hear from you.',
        waitlist: 'Be among the first to experience the magic. Join the waitlist for early access and founding member perks.',
        privacy: 'Your data is yours. Read our commitment to privacy and security.',
        terms: 'FitGlue Terms of Service and usage guidelines.',
        '404': 'Oops! This page went for a run and didn\'t come back.',
      };
      return {
        pageTitle: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' '),
        isHome: currentPage === 'index',
        isFeatures: currentPage === 'features',
        isHowItWorks: currentPage === 'how-it-works',
        isTheMagic: currentPage === 'the-magic',
        isPricing: currentPage === 'pricing',
        isAbout: currentPage === 'about',
        isContact: currentPage === 'contact',
        isWaitlist: currentPage === 'waitlist',
        isPrivacy: currentPage === 'privacy',
        isTerms: currentPage === 'terms',
        canonicalPath,
        description: descriptions[currentPage] || 'Watch your workout become extraordinary. Connect everywhere, enhance everything.',
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
        login: { pageTitle: 'Login', description: 'Welcome back! Log in to continue your fitness transformation.' },
        register: { pageTitle: 'Create Account', description: 'Join FitGlue and start transforming your workouts into stories worth sharing.' },
        'forgot-password': { pageTitle: 'Reset Password', description: 'Reset your password to get back to your extraordinary workouts.' },
        'verify-email': { pageTitle: 'Verify Email', description: 'Verify your email to complete your FitGlue account setup.' },
        logout: { pageTitle: 'Logged Out', description: 'You\'ve been logged out of FitGlue. See you next workout!' },
      };
      const meta = authMeta[currentPage] || { pageTitle: currentPage, description: '' };
      return { ...meta, canonicalPath: `/auth/${currentPage}` };
    },
  }),

  // Generate guide pages
  generatePagesTask({
    pagesDir: './pages/guides',
    partialsDir: './partials',
    outDir: './static-dist/guides',
    additionalVarsFn: ({ currentPage }) => {
      /** @type {Record<string, {pageTitle: string, description: string}>} */
      const guideMeta = {
        index: {
          pageTitle: 'Guides & Tutorials',
          description: 'Step-by-step guides to transform your workouts. Learn how FitGlue brings the magic to Hevy, Fitbit, Strava, and more.',
        },
        'hevy-to-strava': {
          pageTitle: 'Transform Your Hevy Workouts with Muscle Heatmaps',
          description: 'Turn boring "Weight Training – 45 min" into rich Strava stories with AI descriptions, set details, and visual muscle heatmaps.',
        },
        'fitbit-heart-rate': {
          pageTitle: 'Magically Merge Your Fitbit Heart Rate into Strava',
          description: 'Your Fitbit captures perfect heart rate all day—now it can automatically enhance your Strava activities with accurate calorie burns and training zones.',
        },
        'parkrun-automation': {
          pageTitle: 'Enrich Your Parkrun with Official Results',
          description: 'Your Strava parkrun automatically gets your official time, finishing position, age grade, and PB celebrations. Like magic.',
        },
      };
      const meta = guideMeta[currentPage] || { pageTitle: currentPage, description: 'FitGlue Guide' };
      return {
        ...meta,
        canonicalPath: currentPage === 'index' ? '/guides' : `/guides/${currentPage}`,
        isGuides: true,
      };
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
