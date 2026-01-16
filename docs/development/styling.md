# Styling Guide

The FitGlue web repository uses a **shared CSS architecture** that serves both the marketing site and React app. This ensures design consistency across all pages.

## File Structure

```
assets/styles/
├── main.css       # Primary stylesheet (78KB)
└── _auth.css      # Auth page overrides
```

Both files are bundled by Skier into `styles.min.{hash}.css`.

## Design Tokens

CSS custom properties define the design system:

```css
:root {
  /* Colors */
  --color-primary: #FF006E;      /* Bright pink */
  --color-secondary: #8338EC;    /* Vivid purple */
  --color-accent: #3A86FF;       /* Electric blue */
  --color-success: #06FFA5;      /* Neon green */
  --color-warning: #FFB703;      /* Amber */
  --color-error: #EF476F;        /* Red-pink */

  /* Neutrals */
  --color-bg: #0D0D0D;
  --color-surface: #1A1A1A;
  --color-text: #FFFFFF;
  --color-text-muted: #888888;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --spacing-xxl: 8rem;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 3rem;

  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.2);
}
```

## Component Classes

### Buttons

```css
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}
```

### Layout

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.section {
  padding: var(--spacing-xxl) 0;
}
```

## Responsive Breakpoints

```css
/* Mobile first */
.element { /* Mobile styles */ }

@media (min-width: 640px) {
  .element { /* Tablet */ }
}

@media (min-width: 1024px) {
  .element { /* Desktop */ }
}

@media (min-width: 1280px) {
  .element { /* Large desktop */ }
}
```

## Dark Mode

The site uses dark mode by default. Light mode overrides:

```css
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #FFFFFF;
    --color-surface: #F5F5F5;
    --color-text: #0D0D0D;
  }
}
```

## Utility Classes

```css
/* Text alignment */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Spacing */
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }
.mt-xxl { margin-top: var(--spacing-xxl); }

/* Display */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }
```

## Adding New Styles

1. **Add to appropriate section** in `main.css`
2. **Use design tokens** for consistency
3. **Follow BEM-ish naming** for components
4. **Test both marketing site and React app**

## Linting

```bash
npm run lint  # Includes CSS linting via stylelint
```

## Related Documentation

- [Local Development](./local-development.md)
- [Architecture Overview](../architecture/overview.md)
