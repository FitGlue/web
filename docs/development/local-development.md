# Local Development

This guide covers running the FitGlue web frontend locally for development. The web repository contains **two applications** that run independently:

1. **Marketing Site** - Static pages built with Skier (custom SSG)
2. **React App** - Vite + React SPA at `/app`

## Prerequisites

- Node.js 20+
- npm
- Firebase CLI (optional, for full local testing)

## Quick Start

```bash
# Install dependencies
npm install

# Start BOTH dev servers (recommended)
# Terminal 1: Marketing site (Skier watch)
npm run dev:static

# Terminal 2: React app (Vite)
npm run dev
```

| Server | URL | Purpose |
|--------|-----|---------|
| Skier | `http://localhost:5000` | Marketing pages (hot reload) |
| Vite | `http://localhost:5173/app` | React app (HMR) |

## Available Scripts

### Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Build + Firebase serve (full site locally) |
| `npm run dev:static` | Skier watch for marketing pages |
| `npm run preview` | Vite preview of built React app |

### Building

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build (Skier + Vite → `dist/`) |
| `npm run build:dev` | Dev mode build |
| `npm run build:test` | Test mode build |
| `npm run build:prod` | Alias for `npm run build` |

### Deployment

| Command | Purpose |
|---------|---------|
| `npm run serve` | Build + Firebase serve locally |
| `npm run deploy` | Deploy to Firebase Hosting |
| `npm run deploy:prod` | Deploy to production project |

### Code Quality

| Command | Purpose |
|---------|---------|
| `npm run lint` | ESLint check on TypeScript |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run gen-api` | Regenerate API types from swagger.json |

## Project Structure

```
web/
├── assets/                # Static assets
│   ├── styles/            # CSS (main.css, _auth.css)
│   ├── images/            # Image assets
│   └── root/              # Root-level files (favicon, etc.)
├── pages/                 # Marketing page templates (Handlebars)
│   ├── auth/              # Auth flow pages
│   └── guides/            # Tutorial/guide pages
├── partials/              # Shared template partials
├── templates/             # Dynamic page templates (plugins, connections)
├── tasks/                 # Custom Skier tasks
├── src/
│   ├── app/               # React SPA
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useApi, useAuth, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service classes
│   │   ├── state/         # Jotai atoms
│   │   └── types/         # TypeScript types
│   ├── shared/            # Shared code (Firebase init, API types)
│   └── openapi/           # swagger.json for type generation
├── public/                # Static files served directly
│   └── app/               # React app entry point
├── static-dist/           # Skier build output
├── dist/                  # Final merged output (Skier + Vite)
├── skier.tasks.mjs        # Skier build configuration
├── vite.config.ts         # Vite configuration
├── firebase.json          # Firebase Hosting config
└── package.json           # Dependencies and scripts
```

## Build Pipeline

The build process merges two outputs:

```
┌─────────────────┐     ┌─────────────────┐
│  Skier Build    │     │   Vite Build    │
│  (npx skier)    │     │  (vite build)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
    static-dist/             dist/app/
         │                       │
         └───────────┬───────────┘
                     ▼
               dist/ (merged)
                     │
                     ▼
            Firebase Hosting
```

### Merge Process (`_merge` script)

1. Copy `static-dist/*` → `dist/`
2. Move `dist/public/*` → `dist/` (if exists)
3. Keep React app at `dist/app/index.html`

## Environment Configuration

### Environment Files

| File | Purpose |
|------|---------|
| `.env` | Base env vars (loaded by Skier) |
| `.env.development` | Dev-specific overrides |
| `.env.test` | Test environment |
| `.env.production` | Production settings |

### Firebase Projects

The web repo deploys to shared GCP projects:

| Environment | Project | Domain |
|-------------|---------|--------|
| Dev | `fitglue-server-dev` | `dev.fitglue.tech` |
| Test | `fitglue-server-test` | `test.fitglue.tech` |
| Prod | `fitglue-server-prod` | `fitglue.tech` |

Switch projects:
```bash
firebase use fitglue-server-dev
```

## Marketing Site Development

### Starting the Dev Server

```bash
npm run dev:static
```

This runs Skier in watch mode:
- Watches `pages/`, `partials/`, `templates/`, `assets/`
- Rebuilds on changes
- Outputs to `static-dist/`

### Adding a New Page

1. Create `pages/my-page.html`
2. Add page metadata in `skier.tasks.mjs` → `additionalVarsFn`
3. Refresh browser to see changes

### Template Structure

```html
{{> header}}

<main>
  <section class="hero">
    <h1>{{pageTitle}}</h1>
  </section>
</main>

{{> footer}}
```

See [Marketing Site Documentation](../marketing-site/skier-pipeline.md) for details.

## React App Development

### Starting the Dev Server

```bash
npm run dev
```

This runs Vite with:
- Hot Module Replacement (HMR)
- API proxy to `localhost:8080` (for local backend)
- TypeScript compilation

### Vite Proxy

The dev server proxies `/api/*` requests:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
},
```

For full local testing with Cloud Functions, use `npm run serve` instead.

### Adding a New Page

1. Create component in `src/app/pages/`
2. Add route in `src/app/App.tsx`
3. Wrap with `ProtectedRoute` if auth required

See [React App Documentation](../react-app/routing.md) for details.

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (Skier)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (Vite)
lsof -ti:5173 | xargs kill -9
```

### Firebase Commands Fail

```bash
# Set active project
firebase use fitglue-server-dev

# Login if needed
firebase login
```

### Changes Not Showing

- **Marketing site**: Hard refresh (`Ctrl+Shift+R`)
- **React app**: Vite HMR should auto-update; try restarting if not

### Build Fails

```bash
# Clear caches
rm -rf .cache static-dist dist node_modules/.vite

# Reinstall and rebuild
npm install
npm run build
```

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Skier Pipeline](../marketing-site/skier-pipeline.md)
- [React App Routing](../react-app/routing.md)
- [Styling Guide](./styling.md)
