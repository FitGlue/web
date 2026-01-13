// @ts-check
import {
  prepareOutputTask,
  bundleCssTask,
  copyStaticTask,
  setGlobalsTask,
  generatePagesTask,
} from 'skier';

// Generate a hash for cache busting
const cacheHash = Date.now().toString(36);

// Integration data
const integrations = {
  connections: [
    { id: 'hevy', name: 'Hevy', emoji: '🏋️', icon: '/images/integrations/hevy.svg', status: 'live', description: 'Strength training workouts' },
    { id: 'fitbit', name: 'Fitbit', emoji: '⌚', icon: '/images/integrations/fitbit.svg', status: 'live', description: 'Heart rate & sleep data' },
  ],
  syncTargets: [
    { id: 'strava', name: 'Strava', emoji: '🚴', icon: '/images/integrations/strava.svg', status: 'live', description: 'Share your achievements' },
  ],
  comingSoon: [
    { id: 'garmin', name: 'Garmin', emoji: '⌚', icon: '/images/integrations/garmin.svg', status: 'coming', description: 'GPS activities' },
    { id: 'apple-health', name: 'Apple Health', emoji: '❤️', icon: '/images/integrations/apple-health.svg', status: 'coming', description: 'Unified health data' },
    { id: 'nike-run-club', name: 'Nike Run Club', emoji: '👟', icon: '/images/integrations/nike-run-club.svg', status: 'coming', description: 'Running activities' },
  ]
};

// Booster (Enricher) data
const boosters = [
  { id: 'ai-description', name: 'AI Descriptions', icon: '🤖', description: 'Let AI write engaging summaries of your workouts' },
  { id: 'muscle-heatmap', name: 'Muscle Heatmaps', icon: '💪', description: 'Visualize which muscles you trained' },
  { id: 'heart-rate', name: 'Heart Rate Analysis', icon: '❤️', description: 'Pull heart rate data from your wearables' },
  { id: 'achievements', name: 'Achievement Badges', icon: '🏆', description: 'Celebrate milestones automatically' },
  { id: 'custom-notes', name: 'Custom Notes', icon: '✏️', description: 'Add your own insights and comments' },
];

// Define global values
const globalValues = {
  siteName: 'FitGlue',
  siteUrl: 'https://fitglue.com/',
  tagline: 'Your fitness data, unified.',
  year: new Date().getFullYear(),
  cacheHash: cacheHash,
  integrations: integrations,
  boosters: boosters,
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
];
