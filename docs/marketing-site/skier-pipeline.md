# Skier Build Pipeline

The marketing site is built using **Skier**, a task-based static site generator. This document explains the build pipeline and how to extend it.

## Overview

Skier processes a series of tasks defined in `skier.tasks.mjs`:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Build Pipeline                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. updateVersionTask     → Sync version from CHANGELOG         │
│  2. fetchRegistryTask     → Fetch plugin data from API          │
│  3. transformRegistryTask → Transform data for templates        │
│  4. prepareOutputTask     → Clean output directory              │
│  5. bundleCssTask         → Bundle + minify CSS                 │
│  6. copyStaticTask        → Copy images and assets              │
│  7. setGlobalsTask        → Set template variables              │
│  8. generatePagesTask     → Compile main pages                  │
│  9. generatePagesTask     → Compile auth pages                  │
│  10. generatePagesTask    → Compile guide pages                 │
│  11. generateDynamicPagesTask → Generate plugin/connection pages │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Configuration

The main configuration is in [skier.tasks.mjs](file:///home/ripixel/dev/fitglue/web/skier.tasks.mjs):

```javascript
import {
  prepareOutputTask,
  bundleCssTask,
  copyStaticTask,
  setGlobalsTask,
  generatePagesTask,
} from 'skier';

export const tasks = [
  // Tasks execute in order...
];
```

## Built-in Tasks

### prepareOutputTask

Cleans and creates the output directory:

```javascript
prepareOutputTask({
  outDir: './static-dist',
}),
```

### bundleCssTask

Bundles and minifies CSS with cache-busting hash:

```javascript
bundleCssTask({
  from: './assets/styles',
  to: './static-dist',
  output: `styles.min.${cacheHash}.css`,
  minify: true,
}),
```

### copyStaticTask

Copies static assets:

```javascript
copyStaticTask({
  from: './assets/images',
  to: './static-dist/images',
}),
copyStaticTask({
  from: './assets/root',
  to: './static-dist',
}),
```

### setGlobalsTask

Sets global template variables:

```javascript
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
```

### generatePagesTask

Compiles Handlebars templates to HTML:

```javascript
generatePagesTask({
  pagesDir: './pages',
  partialsDir: './partials',
  outDir: './static-dist',
  additionalVarsFn: ({ currentPage }) => {
    // Return page-specific variables
    return {
      pageTitle: 'Features',
      description: 'Discover FitGlue features...',
      isFeatures: true,
    };
  },
}),
```

## Custom Tasks

Custom tasks are in the `tasks/` directory:

### fetchRegistryTask

Fetches plugin registry data from the API:

```javascript
// tasks/fetchRegistryTask.js
fetchRegistryTask({
  apiUrl: process.env.REGISTRY_API_URL || 'https://dev.fitglue.tech/api/registry',
  registryFile: path.join(__dirname, '.cache', 'registry.json'),
}),
```

- In CI: Fetches from API
- Locally: Uses cached `.cache/registry.json`

### transformRegistryTask

Transforms registry data for templates:

```javascript
// tasks/transformRegistryTask.js
transformRegistryTask(),
```

Adds computed fields like:
- `isSource` / `isBooster` / `isTarget` flags
- URL-safe slugs
- Category groupings

### generateDynamicPagesTask

Generates pages from registry data:

```javascript
// tasks/generateDynamicPagesTask.js
generateDynamicPagesTask({
  registryFile: path.join(__dirname, '.cache', 'registry.json'),
  templatesDir: path.join(__dirname, 'templates'),
  partialsDir: path.join(__dirname, 'partials'),
  outDir: path.join(__dirname, 'static-dist'),
}),
```

Generates:
- `/plugins/boosters/{slug}.html` for each booster
- `/connections/{slug}.html` for each connection

### updateVersionTask

Syncs version from CHANGELOG to package.json and .env:

```javascript
// tasks/updateVersionTask.js
updateVersionTask({
  changelogPath: path.join(__dirname, 'CHANGELOG.md'),
  packagePath: path.join(__dirname, 'package.json'),
  envPath: path.join(__dirname, '.env'),
}),
```

## Directory Structure

```
web/
├── skier.tasks.mjs      # Main config
├── tasks/               # Custom tasks
│   ├── fetchRegistryTask.js
│   ├── generateDynamicPagesTask.js
│   ├── transformRegistryTask.js
│   └── updateVersionTask.js
├── pages/               # Page templates
│   ├── index.html
│   ├── features.html
│   ├── auth/            # Auth pages
│   └── guides/          # Guide pages
├── partials/            # Shared partials
│   ├── header.html
│   ├── footer.html
│   ├── auth-head.html
│   └── auth-footer.html
├── templates/           # Dynamic templates
│   ├── plugin-detail.html
│   ├── connection-detail.html
│   └── guide.html
├── assets/
│   ├── styles/          # CSS source
│   ├── images/          # Image assets
│   └── root/            # Root files (favicon, etc.)
├── .cache/              # Cached data
│   └── registry.json    # Plugin registry
├── static-dist/         # Build output
└── dist/                # Final merged output
```

## Development

### Watch Mode

```bash
npm run dev:static
```

Runs `skier watch`:
- Watches all source directories
- Rebuilds on changes
- Serves at `http://localhost:5000`

### Manual Build

```bash
npx skier build
```

Runs all tasks and outputs to `static-dist/`.

## Adding a New Page

1. Create template in `pages/`:
   ```html
   {{> header}}
   <main>
     <h1>{{pageTitle}}</h1>
   </main>
   {{> footer}}
   ```

2. Add metadata in `skier.tasks.mjs`:
   ```javascript
   additionalVarsFn: ({ currentPage }) => {
     const descriptions = {
       // ...existing pages
       'my-page': 'Description for my new page',
     };
     // ...
   }
   ```

3. Build or restart watch mode

## Adding a Custom Task

1. Create task file in `tasks/`:
   ```javascript
   // tasks/myCustomTask.js
   export function myCustomTask(options) {
     return {
       name: 'my-custom-task',
       run: async (context) => {
         // Access globals via context.globals
         // Modify as needed
         console.log('Running my custom task');
       },
     };
   }
   ```

2. Import and add to `skier.tasks.mjs`:
   ```javascript
   import { myCustomTask } from './tasks/myCustomTask.js';

   export const tasks = [
     // ...existing tasks
     myCustomTask({ option: 'value' }),
   ];
   ```

## Cache Busting

CSS files include a hash for cache invalidation:

```javascript
const cacheHash = Date.now().toString(36);

bundleCssTask({
  output: `styles.min.${cacheHash}.css`,
}),

setGlobalsTask({
  values: { cacheHash },
}),
```

Templates reference it:
```html
<link rel="stylesheet" href="/styles.min.{{cacheHash}}.css">
```

## Related Documentation

- [Templates Guide](./templates.md)
- [Content Management](./content.md)
- [Architecture Overview](../architecture/overview.md)
