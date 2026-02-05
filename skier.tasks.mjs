// @ts-check
/**
 * FitGlue Web - Skier Build Tasks
 * All logic is in custom tasks - this file is purely declarative.
 */

import {
  bundleCssTask,
  copyStaticTask,
  setGlobalsTask,
  setGlobalFromMarkdownTask,
  generatePagesTask,
  generateItemsTask,
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
    apiUrl: (process.env.REGISTRY_API_URL || 'https://dev.fitglue.tech/api/registry') + '?marketingMode=true',
    registryFile: path.join(__dirname, '.cache', 'registry.json'),
  }),

  // Transform registry data for landing page templates
  transformRegistryTask(),

  // Bundle CSS
  bundleCssTask({
    from: './assets/styles',
    to: './dist',
    output: `styles.min.${cacheHash}.css`,
    minify: true,
  }),

  // Copy static assets
  copyStaticTask({
    from: './assets/images',
    to: './dist/images',
  }),
  copyStaticTask({
    from: './assets/root',
    to: './dist',
  }),

  // Read PUBLIC_CHANGELOG.md and expose as template variable
  setGlobalFromMarkdownTask({
    mdPath: './PUBLIC_CHANGELOG.md',
    outputVar: 'changelogContent',
  }),

  setGlobalsTask({
    values: {
      siteName: 'FitGlue',
      siteUrl: 'https://fitglue.com/',
      tagline: 'Your fitness data, unified.',
      year: new Date().getFullYear(),
      cacheHash,
      appUrl: '/app',
      waitlistUrl: '/auth/register',
    },
  }),

  // Generate main pages
  generatePagesTask({
    pagesDir: './pages',
    partialsDir: './partials',
    outDir: './dist',
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
    outDir: './dist/auth',
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
    outDir: './dist/guides',
    additionalVarsFn: ({ currentPage }) => {
      /** @type {Record<string, {pageTitle: string, description: string}>} */
      const guideMeta = {
        index: {
          pageTitle: 'Guides & Tutorials',
          description: 'Step-by-step guides to transform your workouts. Learn how FitGlue brings the magic to Hevy, Fitbit, Strava, and more.',
        },
        'getting-started': {
          pageTitle: 'Getting Started with FitGlue',
          description: 'From signup to your first boosted activity in under 10 minutes. Everything you need to know to start transforming your fitness data.',
        },
        'hevy-to-strava': {
          pageTitle: 'Transform Your Strength Training into Strava Posts Worth Sharing',
          description: 'Turn boring "Weight Training – 45 min" into stunning posts with detailed exercise breakdowns, emoji muscle heatmaps, and shareable Showcase pages.',
        },
        'fitbit-heart-rate': {
          pageTitle: 'Your Fitbit Knows Your Heart. Now Your Strava Can Too.',
          description: 'Merge Fitbit heart rate data with any Strava activity for accurate calories, training zones, and the complete picture of your workout.',
        },
        'parkrun-automation': {
          pageTitle: 'Your Saturday Parkrun Deserves Official Recognition',
          description: 'Automatic event detection, official times, finishing position, age grade, and PB celebrations—all without lifting a finger.',
        },
        'garmin-fit-upload': {
          pageTitle: 'Transform Your Garmin Workouts with FIT File Upload',
          description: 'Your Garmin captures incredible data. FitGlue transforms it into weather context, location titles, elevation stats, and beautiful pages.',
        },
        'showcase': {
          pageTitle: 'Share Your Achievements with Showcase',
          description: 'Create beautiful, shareable activity pages that anyone can view—no Strava account required. Perfect for coaches, friends, or social media.',
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

  // Generate help pages
  generatePagesTask({
    pagesDir: './pages/help',
    partialsDir: './partials',
    outDir: './dist/help',
    additionalVarsFn: ({ currentPage }) => {
      /** @type {Record<string, {pageTitle: string, description: string}>} */
      const helpMeta = {
        index: {
          pageTitle: 'Help & Support',
          description: 'Find answers, browse guides, and get in touch. We\'re here to help you get the most out of FitGlue.',
        },
        faq: {
          pageTitle: 'Frequently Asked Questions',
          description: 'Quick answers to common questions about FitGlue, pricing, sync limits, and more.',
        },
        feedback: {
          pageTitle: 'Request a Feature',
          description: 'Have an idea to make FitGlue better? We\'d love to hear it.',
        },
        articles: {
          pageTitle: 'Help Articles',
          description: 'Troubleshooting, concepts, and how-to guides. Find what you need.',
        },
      };
      const meta = helpMeta[currentPage] || { pageTitle: currentPage, description: 'FitGlue Help' };
      return {
        ...meta,
        canonicalPath: currentPage === 'index' ? '/help' : `/help/${currentPage}`,
        isHelp: true,
      };
    },
  }),

  // Generate help articles from Markdown
  generateItemsTask({
    itemsDir: './content/help-articles',
    partialsDir: './partials',
    outDir: './dist/help/articles',
    outputVar: 'helpArticles',
    flatStructure: false,
    linkFn: ({ section, itemName }) => `/help/articles/${section ? section + '/' : ''}${itemName}`,
    sortFn: (a, b) => (a.title || '').localeCompare(b.title || ''),
    additionalVarsFn: ({ section, itemName }) => {
      const canonicalPath = `/help/articles/${section ? section + '/' : ''}${itemName}`;
      const breadcrumbSegments = [];
      if (section && section.startsWith('registry/')) {
        const type = section.split('/')[1];
        if (type === 'sources') breadcrumbSegments.push({ label: 'Sources', url: '/help/articles#sources' });
        else if (type === 'enrichers') breadcrumbSegments.push({ label: 'Boosters', url: '/help/articles#boosters' });
        else if (type === 'destinations') breadcrumbSegments.push({ label: 'Destinations', url: '/help/articles#destinations' });
        else if (type === 'integrations') breadcrumbSegments.push({ label: 'Connections', url: '/help/articles#connections' });
      } else if (section === 'concepts') {
        breadcrumbSegments.push({ label: 'Concepts', url: '/help/articles#concepts' });
      } else if (section === 'troubleshooting') {
        breadcrumbSegments.push({ label: 'Troubleshooting', url: '/help/articles#troubleshooting' });
      }
      return {
        canonicalPath,
        isHelpArticle: true,
        category: section || 'general',
        breadcrumbSegments,
      };
    },
  }),

  // Generate dynamic connection & plugin pages
  generateDynamicPagesTask({
    registryFile: path.join(__dirname, '.cache', 'registry.json'),
    templatesDir: path.join(__dirname, 'templates'),
    partialsDir: path.join(__dirname, 'partials'),
    outDir: path.join(__dirname, 'dist'),
  }),
];
