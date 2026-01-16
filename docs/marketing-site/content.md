# Content Management

This document explains how content is managed on the FitGlue marketing site.

## Content Sources

| Source | Type | Output |
|--------|------|--------|
| `pages/*.html` | Static templates | Main marketing pages |
| `pages/auth/*.html` | Static templates | Auth flow pages |
| `pages/guides/*.html` | Static templates | Tutorial content |
| Registry API | Dynamic data | Plugin/connection pages |

## Static Pages

### Adding a New Page

1. **Create template** in `pages/my-page.html`:
   ```html
   {{> header}}
   <main>
     <section class="hero">
       <h1>{{pageTitle}}</h1>
     </section>
   </main>
   {{> footer}}
   ```

2. **Add metadata** in `skier.tasks.mjs`:
   ```javascript
   const descriptions = {
     'my-page': 'SEO description for this page.',
   };
   ```

3. **Rebuild**: `npm run dev:static`

## Dynamic Plugin Pages

Plugin pages are auto-generated from the registry API:

```
Registry API → .cache/registry.json → generateDynamicPagesTask → /plugins/boosters/*.html
```

### Refresh Registry

```bash
rm .cache/registry.json
npx skier build
```

## Navigation

Navigation uses page flags for active states:

```html
<a href="/features" {{#if isFeatures}}class="active"{{/if}}>Features</a>
```

Flags are set in `additionalVarsFn` based on `currentPage`.

## Related Documentation

- [Skier Pipeline](./skier-pipeline.md)
- [Templates Guide](./templates.md)
