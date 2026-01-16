# Architecture Overview

FitGlue Web is a **hybrid architecture** combining a static marketing site with an interactive React application, unified by Firebase Hosting.

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Firebase Hosting (CDN)                          │
│                  fitglue.tech / dev.fitglue.tech                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌───────────────────────────┐    ┌───────────────────────────┐     │
│   │     Marketing Site        │    │       React SPA           │     │
│   │     (Skier SSG)           │    │       (Vite)              │     │
│   │                           │    │                           │     │
│   │  • Landing page           │    │  • Dashboard              │     │
│   │  • Features               │    │  • Activities             │     │
│   │  • Pricing                │    │  • Settings               │     │
│   │  • How It Works           │    │  • Pipelines              │     │
│   │  • Plugin pages           │    │  • Admin console          │     │
│   │  • Auth pages             │    │                           │     │
│   │                           │    │                           │     │
│   │  Output: static-dist/     │    │  Output: dist/app/        │     │
│   └───────────────────────────┘    └───────────────────────────┘     │
│                                                                       │
│                    ┌───────────────────────────┐                      │
│                    │       Shared CSS          │                      │
│                    │       main.css            │                      │
│                    │   (design tokens, comps)  │                      │
│                    └───────────────────────────┘                      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                              │
                              │ Firebase Rewrites
                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       Cloud Run Functions                              │
│                                                                        │
│  /api/users/**      → user-profile-handler                            │
│  /api/activities/** → activities-handler                              │
│  /api/billing/**    → billing-handler                                 │
│  /hooks/hevy        → hevy-webhook-handler                            │
│  /hooks/fitbit      → fitbit-handler                                  │
│  /auth/*/callback   → oauth-handlers                                  │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

## URL Routing

Firebase Hosting routes requests to the appropriate handler:

### Static Pages (Marketing Site)
| URL | Served From |
|-----|-------------|
| `/` | `static-dist/index.html` |
| `/features` | `static-dist/features.html` |
| `/pricing` | `static-dist/pricing.html` |
| `/how-it-works` | `static-dist/how-it-works.html` |
| `/plugins/boosters/*` | `static-dist/plugins/boosters/*.html` |
| `/auth/login` | `static-dist/auth/login.html` |

### React SPA
| URL | Served From |
|-----|-------------|
| `/app/**` | `dist/app/index.html` (SPA routing) |

### API & Webhooks (Cloud Functions)
| URL | Handler |
|-----|---------|
| `/api/users/me/**` | `user-profile-handler` |
| `/api/activities/**` | `activities-handler` |
| `/hooks/hevy` | `hevy-webhook-handler` |
| `/auth/strava/callback` | `strava-oauth-handler` |

See [firebase.json](file:///home/ripixel/dev/fitglue/web/firebase.json) for complete rewrite rules.

## Build Pipeline

```
                    ┌─────────────────────────────┐
                    │        npm run build        │
                    └─────────────────────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              ▼                                       ▼
    ┌──────────────────┐                   ┌──────────────────┐
    │  _build:static   │                   │   _build:app     │
    │  (npx skier)     │                   │   (vite build)   │
    └────────┬─────────┘                   └────────┬─────────┘
             │                                      │
             ▼                                      ▼
       static-dist/                            dist/app/
    ┌──────────────────┐                   ┌──────────────────┐
    │ • index.html     │                   │ • index.html     │
    │ • features.html  │                   │ • assets/*.js    │
    │ • pricing.html   │                   │ • assets/*.css   │
    │ • plugins/...    │                   └──────────────────┘
    │ • styles.min.css │                            │
    │ • images/        │                            │
    └────────┬─────────┘                            │
             │                                      │
             └───────────────────┬──────────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │    _merge    │
                         └──────┬───────┘
                                │
                                ▼
                            dist/ (final)
                    ┌──────────────────────┐
                    │ • index.html         │
                    │ • features.html      │
                    │ • plugins/...        │
                    │ • app/index.html     │
                    │ • styles.min.css     │
                    │ • images/            │
                    └──────────────────────┘
                                │
                                ▼
                      Firebase Hosting Deploy
```

## Tech Stack

### Marketing Site
| Technology | Purpose |
|------------|---------|
| [Skier](https://github.com/ripixel/skier) | Static site generator |
| Handlebars | Template engine |
| CSS | Styling (bundled + minified) |

### React App
| Technology | Purpose |
|------------|---------|
| [Vite](https://vite.dev/) | Build tool + dev server |
| [React 19](https://react.dev/) | UI framework |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Jotai](https://jotai.org/) | Atomic state management |
| [Firebase](https://firebase.google.com/) | Auth + Firestore |
| TypeScript | Type safety |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Firebase Hosting | CDN + rewrites |
| Cloud Run | Function hosting |
| Terraform | Infrastructure as code |
| CircleCI | CI/CD pipeline |

## Shared CSS Architecture

Both applications use the same CSS, ensuring design consistency:

```
assets/styles/
├── main.css       # Primary stylesheet (78KB)
│   ├── CSS variables (design tokens)
│   ├── Base styles (reset, typography)
│   ├── Layout utilities
│   ├── Component styles
│   └── Page-specific sections
└── _auth.css      # Auth page overrides
```

### Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #FF006E;
  --color-secondary: #8338EC;
  --color-accent: #3A86FF;
  --color-success: #06FFA5;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
}
```

See [Styling Guide](../development/styling.md) for details.

## Development Modes

### Marketing Site Only

```bash
npm run dev:static
# Skier watch mode
# http://localhost:5000
```

### React App Only

```bash
npm run dev
# Vite dev server
# http://localhost:5173/app
```

### Full Local Testing

```bash
npm run serve
# Builds both + Firebase emulator
# http://localhost:5000
```

## Related Documentation

- [Local Development](../development/local-development.md)
- [Skier Pipeline](../marketing-site/skier-pipeline.md)
- [React App Routing](../react-app/routing.md)
- [Authentication](./authentication.md)
- [ADRs](../decisions/ADR.md)
