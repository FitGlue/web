# FitGlue Reskin — Claude Code Handoff Brief

**Visual direction:** Brutal × Aurora — midnight base, 3-tier hard rules, magenta→violet→cyan aurora gradient as the energy color, Archivo Black display + JetBrains Mono labels.

**Repo:** `github.com/FitGlue/web`
**Target branch:** create a feature branch from `main`, e.g. `feat/brutal-aurora-reskin`.

This brief tells you everything you need to apply the new visual system across the marketing site AND the React app without rebuilding from scratch.

---

## TL;DR — what to do

1. Drop three CSS files into the repo (one new, two prepended).
2. Add three Google Font families to `partials/header.html`.
3. Work through pages in the order in [§5 Build Order](#5-build-order). Most pages are pure CSS work — the system was designed to retone existing markup.
4. The few places that need real markup refactors are listed in [§4 Markup Refactor Notes](#4-markup-refactor-notes).

---

## 1. File drops

Three CSS files live in `handoff/css/`:

| File | What it is | Where it goes |
|---|---|---|
| `tokens.css` | Design tokens (CSS custom properties). Drop-in replacement for the `:root` block in `assets/styles/main.css`. Existing var names preserved; values retoned. | **Replace** the existing `:root { … }` block at the top of `assets/styles/main.css`. |
| `components.css` | New reusable component classes — all `fg-*` prefixed. `.fg-band`, `.fg-panel`, `.fg-stamp`, `.fg-button`, `.fg-booster-chip`, `.fg-inline-stat`, etc. | **Concatenate** to the bottom of `assets/styles/main.css` OR import as a separate stylesheet. |
| `overrides.css` | Retoning of existing un-prefixed classes (`.header`, `.btn`, `.feature-card`, `.steps`, `.cta-section`, etc). Preserves your markup. | **Concatenate** AFTER the existing main.css contents AND after components.css. Specificity is calibrated to win without `!important` except where noted. |
| `base.css` | **Demo-only.** Holds layout primitives (`.container`, `.problem-grid`, `.feature-grid`, list-style reset, button shape) so the archetype mockups render standalone without your real `main.css`. **DO NOT** ship this to production — Claude Code, ignore it; your `main.css` already provides these rules. |

Recommended order when concatenated:
```
1. tokens.css           (replaces existing :root)
2. existing main.css    (with :root removed)
3. components.css
4. overrides.css
```

For the React app, the same `main.css` is loaded — the SPA inherits all the same overrides. You can also import `components.css` directly inside React modules if any component-local CSS module needs `fg-*` classes.

## 2. Fonts

Replace the Google Fonts `<link>` in `partials/header.html` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

`Inter` stays (kept for legacy components, fallback). New use:
- `Archivo Black` → headlines (h1–h6, display) via `--fg-font-display`
- `Archivo` → body via `--fg-font-body`
- `JetBrains Mono` → labels, metadata, status pills via `--fg-font-mono`

## 3.a Showcase Profile — public `/showcase/[username]`

The existing `_showcase-shared.css` defines `.showcase-page` with 8 themes (default / midnight / ember / forest / neon / arctic / golden / stealth) selectable by `data-theme=`. The reskin **keeps the theme system** but retones the defaults:

- Default `.showcase-page` background → `var(--gradient-hero)`
- Default `--sc-accent` → `var(--fg-pink)`
- Default `--sc-card-bg` → `var(--fg-ink-2)`; drop `backdrop-filter`
- `.glass-card` keeps the class name but loses the blur: `background: var(--fg-ink-2); border-radius: 0; border: 0; box-shadow: inset 0 0 0 1.5px var(--fg-hairline-color);`
- Theme variants (midnight / ember / etc.) **stay** as user-pickable accent tints. They're a delight; just retone their gradient stops to use closer-to-aurora hues if you want.

Pattern reference: `archetypes/showcase-profile.html`. If there isn't a `ShowcaseProfilePage.tsx` in the React app yet (I didn't find one), this archetype is also the spec for the new page.

## 3. Per-page mapping (all 56 pages)

Each row tells you which archetype to apply to which file. "Drop-in" = CSS-only (existing markup works as-is). "Light touch" = small JSX/HBS additions to use new `fg-*` classes for sections that benefit from gradient bands.

### Marketing site (Skier · Handlebars)

| Page file | Archetype | Effort | Notes |
|---|---|---|---|
| `pages/index.html` | 01 Landing | Light touch | Replace hero carousel content with the live-pipeline preview from `archetypes/marketing-landing.html`. Existing `.hero-split` / `.hc-card` markup mostly OK. |
| `pages/features.html` | 02 Pillar | Drop-in | `.feature-grid` + `.feature-card` already retoned. Add `<div class="fg-band">` between booster categories for chapter markers. |
| `pages/how-it-works.html` | 02 Pillar | Drop-in | `.steps` + `.step` already retoned. The gradient connector + square step numbers come from `overrides.css`. |
| `pages/pricing.html` | 02 Pillar | Drop-in | `.pricing-grid` + `.pricing-card.featured` retoned. |
| `pages/about.html` | 02 Pillar | Light touch | Wrap body copy in `<div class="fg-prose">` for comfortable type. |
| `pages/contact.html` | 02 Pillar | Light touch | Form fields: use `auth-form.html` field markup pattern. |
| `pages/changelog.html` | Guide-ish | Light touch | Add a sticky version sidebar; use `.fg-stamp` for version tags. |
| `pages/security.html` | Legal | Drop-in | Wrap in `.fg-prose`. |
| `pages/privacy.html` | Legal | Drop-in | Wrap in `.fg-prose`. |
| `pages/terms.html` | Legal | Drop-in | Wrap in `.fg-prose`. |
| `pages/404.html` | Misc | Drop-in | Use giant `404` in Archivo Black + gradient `BACK HOME` CTA. |
| `pages/logo.html` | Brand | Custom | Logo lockup test page — show the new `.fg-logo` + wordmark variants. |
| `pages/help/index.html` | Help | Light touch | Topic cards = `.feature-card.hoverable`. |
| `pages/help/articles.html` | Help | Drop-in | Article list with `.fg-stamp` category tags. |
| `pages/help/faq.html` | Help | Drop-in | Accordion items: hairline dividers, gradient `+/–` icon. |
| `pages/help/feedback.html` | Auth-form | Drop-in | Use auth-form field styling for the textarea form. |
| `pages/guides/index.html` | Help | Drop-in | Guide cards as `.integration-card.hoverable`. |
| `pages/guides/getting-started.html` | Guide | Drop-in | Use `.fg-prose` + `.fg-band` for major sections. |
| `pages/guides/hevy-to-strava.html` | Guide | Drop-in | Same as above. |
| `pages/guides/fitbit-heart-rate.html` | Guide | Drop-in | Same. |
| `pages/guides/garmin-fit-upload.html` | Guide | Drop-in | Same. |
| `pages/guides/parkrun-automation.html` | Guide | Drop-in | Same. |
| `pages/guides/showcase.html` | Guide | Drop-in | Same. |
| `pages/auth/login.html` | 04 Auth | Light touch | Restructure into 2-col grid (brand + form). All field styling is in `auth-form.html`. |
| `pages/auth/register.html` | 04 Auth | Light touch | Same. |
| `pages/auth/forgot-password.html` | 04 Auth | Drop-in | Form-only variant — hide the brand panel on this one or keep it for consistency. |
| `pages/auth/reset-password.html` | 04 Auth | Drop-in | Same. |
| `pages/auth/verify-email.html` | 04 Auth | Drop-in | Single-state confirmation card. |
| `pages/auth/verify-email-change.html` | 04 Auth | Drop-in | Same. |
| `pages/auth/access-pending.html` | 04 Auth | Drop-in | Centred state card + gradient stamp "PENDING". |
| `pages/auth/waitlist-confirmed.html` | 04 Auth | Drop-in | Centred success card + gradient `Done →`. |
| `pages/auth/logout.html` | 04 Auth | Drop-in | Single-state. |

### Marketing templates (dynamic)

| Template | Generates | Archetype | Notes |
|---|---|---|---|
| `templates/plugin-detail.html` | All 25 booster pages + all 9 connection pages | 03 Plugin Detail | All `.showcase-card`, `.config-item`, `.connection-card` retoned in `overrides.css`. |
| `templates/connection-detail.html` | 9 connection pages | 03 Plugin Detail | Same. |
| `templates/guide.html` | All guides under `content/help-articles/` | Guide | Wrap rendered Markdown in `.fg-prose`. |

### Partials

| Partial | Notes |
|---|---|
| `partials/header.html` | Update Google Fonts `<link>`. Existing `.header` + `.nav-link*` classes retoned. **Markup unchanged.** |
| `partials/footer.html` | No changes needed — `.footer` retoned in overrides.css. **Markup unchanged.** |
| `partials/auth-head.html` | No changes if it only sets `<head>` metadata. |
| `partials/auth-footer.html` | 17-byte file — likely just closes tags. No changes. |

### React app (Vite + React 19 + Jotai · `src/app/`)

The app has its own page components. Each gets the same `main.css` so all base styling cascades. Where pages use bespoke local styling (`*Page.css` files), retone the local CSS to match.

| Page component | Archetype | Effort | Notes |
|---|---|---|---|
| `pages/DashboardPage.tsx` | BA Dashboard (`directions/06-ba-dashboard.jsx`) | Refactor | Use the dashboard pattern: top app bar + tonal heading slab + ATHLETE gradient band + 3-col body with `.fg-band` openers. |
| `pages/ActivitiesListPage.tsx` | List view | Drop-in + light touch | Activities = stacked `RunRow`-style cards. Use `.fg-stamp` for type tag, hairlines between rows, gradient `+/done` chip on the right. |
| `pages/ActivityDetailPage.tsx` (47k!) | BA Showcase + Run Detail | Refactor | Apply the Showcase pattern for hero/metrics modules AND embed the Run Detail trace (`archetypes/app-run-detail.html`) for the bottom "Pipeline Trace" sub-view. Each module (HR, Effort, Recovery, Boosters) opens with `.fg-band`, sits on a tonal `.fg-panel`. |
| `pages/UnsynchronizedDetailPage.tsx` | App · Run Detail | Drop-in + light touch | Apply the run-detail archetype (`archetypes/app-run-detail.html`). Existing `PipelineTrace` + `TraceItem` components map 1:1: rail list of steps, focused step detail, provider/dest tables, Nerd Mode JSON. Add a `.fg-stamp--rose` "SKIPPED" pill in the summary band when `execution.status === 'SKIPPED'`. |
| `pages/PendingInputsPage.tsx` (23k) | App Wizard or List | Refactor | A row of pending input cards. Treat each input as a mini-modal card on a list. |
| `pages/PhotoEditorPage.tsx` (19k) | App Modal (full-screen variant) | Refactor | Crop region centred on dark ink. Use `.fg-button` for actions. |
| `pages/ConnectionsPage.tsx` | BA Connections (`directions/06-ba-connections.jsx`) | Refactor | Apply the Connections artboard: heading + recipe band + filter strip + grouped tile grid (Sources / Destinations & Accounts). |
| `pages/ConnectionDetailPage.tsx` | Detail view | Drop-in | Hero + status panel + recent runs list. Use `.fg-band` for "Recent Runs" header. |
| `pages/ConnectionSetupPage.tsx` | 05 App Wizard | Refactor | Multi-step OAuth/config flow → use the wizard rail pattern. |
| `pages/ConnectionSuccessPage.tsx` | 04 Auth (state variant) | Drop-in | Centred success state. |
| `pages/ConnectionErrorPage.tsx` | 04 Auth (error variant) | Drop-in | Centred error state with `.fg-stamp--rose`. |
| `pages/PipelinesPage.tsx` | List view | Drop-in + light touch | List of pipeline summary cards from BA Dashboard's `PipelineSummaryCard`. |
| `pages/PipelineEditPage.tsx` (25k) | BA Pipeline Editor (`directions/06-ba-pipeline.jsx`) | Refactor | Apply the Pipeline Editor artboard: stage bands (Source → Gate → Enrichment → Metrics → AI → Destinations) + booster rows + library rail. |
| `pages/PipelineWizardPage.tsx` (33k!) | 05 App Wizard | Refactor | Heavyweight — full wizard rail with steps. |
| `pages/AccountSettingsPage.tsx` (29k) | 06 App Settings | Refactor | Section + field grid pattern. |
| `pages/EnricherDataPage.tsx` | 06 App Settings | Drop-in | Single-section settings page. |
| `pages/SubscriptionPage.tsx` (16k) | 06 App Settings + plan band | Refactor | Reuse the `stx-plan` gradient band at top + section pattern below. |
| `pages/ShowcaseManagementPage.tsx` (45k!) | 06 App Settings + List | Refactor | Showcase admin — list of public activities + edit panels. |
| `pages/RecipesPage.tsx` | List view | Drop-in | Recipe cards as `.feature-card.hoverable`. |
| `pages/AdminPage.tsx` | App Wizard or Settings | Drop-in | Admin tools — apply settings pattern. |
| `pages/NotFoundPage.tsx` | Misc | Drop-in | Mirror `pages/404.html`. |

### App components

| Component | Use which class |
|---|---|
| `ActivityCard.tsx` | List-row pattern from BA dashboard `RunRow`. |
| `BoosterExclusionPills.tsx` | `.fg-booster-chip--queued` w/ strikethrough variant. |
| `EnricherTimeline.tsx` | `.fg-band` openers per stage + hairline rows. |
| `EnricherInfoModal.tsx` | 07 Modal (info variant). |
| `ImageCropModal.tsx` | 07 Modal (large). |
| `ImportPipelineModal.tsx` | 07 Modal (form variant). |
| `KeyValueMapEditor.tsx` | Field grid from 06 Settings. |
| `LogicGateConfigForm.tsx` | Field grid from 06 Settings. |
| `MetaBadge.tsx` | `.fg-stamp`. |
| `NotificationPreferencesCard.tsx` | Toggle row pattern from 06 Settings. |
| `PipelineTrace.tsx` | Booster row pattern from BA Pipeline Editor. |
| `PluginCategorySection.tsx` | `.fg-band` + grid. |
| `ReauthModal.tsx` | 07 Modal (danger variant). |
| `RefreshControl.tsx` | `.fg-button--ghost` + spinner. |
| `RepostActionsMenu.tsx` | 07 Modal (magic-actions variant). |
| `SharePipelineModal.tsx` | 07 Modal (share variant). |
| `SmartNudge.tsx` | Aurora-wash recipe card from BA Dashboard. |
| `TraceItem.tsx` | Booster row pattern. |
| `dashboard/*` | Dashboard widget patterns from BA Dashboard. |
| `library/*` | Booster library list from BA Pipeline Editor right rail. |
| `wizard/*` | 05 Wizard patterns. |
| `onboarding/*` | Wizard + Auth patterns. |
| `recipes/*` | Recipe card grid. |
| `data/*` | Chart / stat blocks from BA Showcase. |
| `forms/*` | Field grid from 06 Settings. |
| `admin/*` | 06 Settings patterns. |

## 3.b Mobile surfaces

The reskin assumes the existing responsive markup keeps working at narrow widths — most marketing pages already collapse correctly under the existing `@media (max-width: 768px)` blocks in `main.css`. The handoff package adds **`handoff/css/mobile.css`** with three new patterns for surfaces that need a dedicated mobile layout:

- **`.fg-mobile-bar`** — sticky bottom tab bar (5 tabs) for the authenticated app. Replaces the top app bar on phones.
- **`.fg-mobile-app-bar`** — slim sticky top bar with logo + avatar.
- **`.fg-mobile-hscroll`** — horizontal-scroll chip strip. Use for booster walls on public pages.
- **`.fg-mobile-sheet`** — bottom-sheet modal container. Use for Share, Magic Actions, Booster info on phones.
- **`.fg-mobile-stat-stack`** — stacked stat blocks separated by hairlines instead of vertical dividers.
- **`.fg-mobile-collapse`** — `<details>`-based accordion section for collapsing long content (booster lists, pipeline steps).

Reference mockups at native phone width (390 × 844):

| Surface | File | Notes |
|---|---|---|
| **Showcase Profile** (priority) | `archetypes/mobile/showcase-profile.html` | Most-shared link people open on phones. Hero compresses to row layout (avatar + name); streak band sits inline; activity cards stack with hairlines between. |
| **Showcase Activity** (priority) | `archetypes/mobile/showcase-activity.html` | The shared workout page. AI Banner becomes a 4:3 hero, stat trio scales down, zones bar chart stays full-width. |
| App · Dashboard (sample) | `archetypes/mobile/dashboard.html` | Demonstrates the bottom tab bar + 2×2 stat grid + stacked recent runs feed. Use the same pattern for Activities List, Connections, Pipelines list. |

For other app surfaces:
- **Pipeline Editor / Wizard** → step-by-step full-screen on mobile (rail becomes a top progress strip). Use the same `.wiz__step` styling but `flex-direction: column` and one step visible at a time.
- **Pipeline Run Detail** → collapse the rail into a single scrollable feed where each step is a card. Tap a step to expand inline.
- **Activity Detail (in-app)** → reuse `mobile/showcase-activity.html` layout with the addition of "Magic Actions" sheet from the bottom.

## 4. Markup refactor notes

A few places where existing markup actively fights the new system. These are surgical — most files are still drop-in.

### a) Landing hero carousel
The `.hero-carousel` + `.hc-card` system was built for the old soft frosted look. The retone in `overrides.css` keeps it functional, but the new direction wants a **live pipeline preview** instead of rotating stat cards. Replace the `.hero-carousel` block in `pages/index.html` with the markup from `archetypes/marketing-landing.html` (the `.lp-pipeline` block). Keep the JS in `partials/footer.html` for back-compat but it'll no-op when `#flow-source` etc. don't exist.

### b) Buttons that were pills
The `.btn` retone removes `border-radius` and switches to Archivo Black caps. Two places have inline `style="border-radius: …"` overrides — search for those and remove them.

### c) Heading case
Existing markup has lots of `<h2>Heart Rate Zones</h2>` content in sentence case. The reskin uppercases ALL headings globally via `tokens.css`. This is intentional for marketing/app chrome, but article body content (guides, legal) needs `text-transform: none`. The `.markdown-content` and `.fg-prose` selectors in tokens.css already restore comfortable case — wrap your guide/legal content in one of those classes.

### d) `feature-card` gradient backgrounds
`.feature-card.premium` previously had a gold gradient. The retone moves it to violet. Any inline `background:` overrides on premium cards should be removed.

### e) `.text-gradient` cross-browser
Already correct in the existing CSS, but Safari can pixelate. The Safari workaround properties (`background-repeat: no-repeat`, `background-origin: content-box`) are retained.

### f) Logo placement
`.logo-fit` / `.logo-glue` is now `paper / aurora-gradient` instead of `pink / purple`. If you want the new mini square FG logo (the one in `.fg-logo`), drop it next to the text wordmark in the header partial — see `archetypes/auth-form.html` for the lockup.

### g) App top bar
The React app currently has its own top nav inside `App.tsx` / a layout component. Build a new shared `<AppBar />` component matching the `.app-bar` pattern in `archetypes/app-wizard.html` and `app-settings.html`. Use it in every authenticated page.

## 5. Build order

Work in this order for maximum compounding wins:

1. **Drop the three CSS files in.** Run `npm run dev:static` and `npm run dev` — most pages will already look 60–70% reskinned just from the variable swaps and overrides.
2. **Update fonts in `partials/header.html`** — type changes the feel more than anything else.
3. **Landing page** (`pages/index.html`) — the most-seen marketing page. Apply markup tweaks from §4a.
4. **Plugin/connection detail pages** (`templates/plugin-detail.html`, `templates/connection-detail.html`) — covers 34 dynamic pages in one edit.
5. **Pillar pages** (features, how-it-works, pricing) — add `.fg-band` section openers.
6. **Auth pages** (refactor to split-panel layout).
7. **Guides + help + legal** — wrap content in `.fg-prose`, add section bands.
8. **Build the shared `<AppBar />` React component.** Don't reskin app pages until this exists.
9. **App pages — in order of traffic:**
   - DashboardPage
   - ActivityDetailPage (the polished public showcase pattern)
   - PipelineEditPage
   - ConnectionsPage
   - PipelinesPage + ConnectionDetailPage
   - AccountSettingsPage + SubscriptionPage
   - PipelineWizardPage + ConnectionSetupPage
   - Long-tail: PendingInputs, ShowcaseManagement, Admin, Photo editor
10. **Modals**, then state pages (ConnectionSuccess/Error, NotFound, etc.).

After each batch, run `npm run preflight` (typecheck + lint + build) to catch regressions early.

## 6. Reference artifacts

Read these directly:

| File | Purpose |
|---|---|
| `handoff/css/tokens.css` | Single source of truth for design tokens. |
| `handoff/css/components.css` | All new reusable `.fg-*` classes with inline docs. |
| `handoff/css/overrides.css` | Retoning of every existing class — read top-to-bottom to see what changes. |
| `handoff/archetypes/*.html` | Working HTML mockups using real FitGlue content. |
| `directions/06-ba-system.jsx` | React/JSX version of the same system (atoms, hooks). Useful when working in the React app. |
| `directions/06-ba-dashboard.jsx` | Dashboard reference (React). |
| `directions/06-ba-pipeline.jsx` | Pipeline editor reference (React). |
| `directions/06-ba-showcase.jsx` | Activity showcase reference (React). |
| `directions/06-ba-connections.jsx` | Connections page reference (React). |
| `directions/06-ba-marketing.jsx` | Marketing hero reference (React, mirrors `archetypes/marketing-landing.html`). |

## 7. What's intentionally NOT in this brief

- **Mobile breakpoints below 768px** — existing `@media (max-width: 768px)` blocks in `main.css` should still work since they only target spacing/layout. Validate after CSS drop-in. If anything breaks, apply the same Brutal × Aurora system at smaller sizes — bands shrink, type scales down via the existing scale variables.
- **Email templates** — out of scope. If they exist in another repo, follow the same tokens for inline-style emails.
- **PWA icons / favicon** — `public/favicon.ico` and Apple touch icon should be regenerated to use the new mini-square FG logo (aurora/ink split) — but that's a 2-minute Figma export, not in this brief.
- **Sentry / analytics** — untouched.

## 8. Quality bar

Before opening the PR:

- [ ] Every page loads without console errors.
- [ ] `npm run preflight` passes (tsc + lint + build).
- [ ] Spot-check landing, plugin detail, dashboard, activity detail, account settings on desktop 1440 and mobile 375.
- [ ] No `border-radius` > 0 anywhere except `.nav-link-cta`/`.nav-link-ghost` (legacy pills) and `.radius-full` for very specific cases (avatars, status dots).
- [ ] No remaining pink-on-purple gradients from the old palette — search for `#FF006E`, `#8338EC`, `#3A86FF` in source files outside `tokens.css`.
- [ ] Every gradient renders edge-to-edge (no faded mid-stops). The aurora is `pink → violet → cyan`, not `pink → violet`.
- [ ] Heading hierarchy reads as: huge headlines in Archivo Black caps, body comfortable in Archivo, labels/metadata in JetBrains Mono caps.

---

**Questions?** The design source-of-truth is the `directions/06-ba-*.jsx` files + the archetypes. When in doubt, match what's there. If the system needs a new pattern that isn't covered, build it once as a new `.fg-*` class in `components.css` and document it inline.
