# Hand to Claude Code

Copy the text between the lines below and paste it into a fresh Claude Code session that has access to the **FitGlue/web** repository.

---

You are reskinning the FitGlue web frontend to a new design direction called **Brutal × Aurora** — pure midnight background, hard 3px paper-white rules, magenta→violet→cyan aurora gradient as the energy color, Archivo Black display + JetBrains Mono labels.

A complete design package has been prepared. Read it before writing any code:

1. **`handoff/HANDOFF.md`** — the brief. Page-by-page mapping for all 56 pages (32 marketing + 24 app), build order, markup refactor notes, quality bar.
2. **`handoff/css/tokens.css`** — drop-in replacement for the `:root` block in `assets/styles/main.css`.
3. **`handoff/css/components.css`** — new `.fg-*` reusable classes (band, panel, stamp, button, booster-chip, inline-stat, chrome-bar, logo, prose, bg).
4. **`handoff/css/overrides.css`** — retones every existing un-prefixed class (`.btn`, `.header`, `.feature-card`, `.steps`, `.cta-section`, `.footer`, etc.) so existing markup keeps rendering.
5. **`handoff/css/mobile.css`** — phone-specific additions (`.fg-mobile-bar` bottom tabs, `.fg-mobile-app-bar`, `.fg-mobile-sheet`, etc.).
6. **`handoff/css/base.css`** — **DO NOT SHIP.** Demo-only file used by the archetype mockups so they render standalone. The real `main.css` already provides those primitives.
7. **`handoff/archetypes/*.html`** — 10 desktop archetypes + 3 mobile archetypes (`mobile/showcase-profile.html`, `mobile/showcase-activity.html`, `mobile/dashboard.html`). These are working HTML pages using the real FitGlue class names. Treat them as visual ground truth.
8. **`directions/06-ba-*.jsx`** — React/JSX references for the five core app surfaces (dashboard, pipeline editor, activity showcase, connections, marketing hero). Use these when working in `src/app/`.

## Work order

Follow **§5 Build Order** in HANDOFF.md. In short:

1. Replace the `:root` block in `assets/styles/main.css` with `handoff/css/tokens.css`.
2. Concatenate `handoff/css/components.css` and `handoff/css/overrides.css` to the end of `assets/styles/main.css` (in that order). Concatenate `handoff/css/mobile.css` last.
3. Update Google Fonts in `partials/header.html` to load Archivo, Archivo Black, JetBrains Mono in addition to Inter (one-line `<link>` change — exact URL in HANDOFF.md §2).
4. Verify with `npm run dev:static` that most pages already look ~70% reskinned just from the variable swaps and overrides.
5. Apply the surgical markup refactors listed in HANDOFF.md §4 (landing hero carousel → live pipeline preview, build shared `<AppBar />` React component, etc.).
6. Work through the pages in the order in §5, starting with the highest-leverage edits (`templates/plugin-detail.html` reskins 34 dynamic pages in one go).
7. After each batch, run `npm run preflight`.

## Rules of engagement

- **Preserve existing markup wherever possible.** Most pages are CSS-only edits. The `.fg-*` classes are additive; the un-prefixed classes are retoned by `overrides.css`.
- **Use the archetype HTML files as visual ground truth.** When in doubt about how a component should look on the new system, open the relevant archetype and match.
- **Two mobile pages are critical:** Showcase Profile (`/showcase/[username]`) and Showcase Activity (`/showcase/activity/[slug]`). These are the most-shared FitGlue links and are usually opened on phones. Match `handoff/archetypes/mobile/showcase-profile.html` and `mobile/showcase-activity.html` precisely.
- **Do not introduce new gradient stops, new fonts, or new radii.** The aurora is exactly `#ff3da6 → #8b5cf6 → #22d3ee` at `linear-gradient(95deg, …)`. Display is Archivo Black, body is Archivo, labels are JetBrains Mono. Radii are 0 except `--radius-full: 999px` (kept for legacy nav pills and avatars only).
- **Headings are uppercase + tight tracking** by default. Article/legal/guide body content uses `.fg-prose` or `.markdown-content` to restore comfortable case.
- **Emoji stays.** Existing booster emoji are kept as small identity marks; type carries the weight, not emoji size.
- **Open a feature branch** off `main`, e.g. `feat/brutal-aurora-reskin`. PR back when §5 is complete.

## Done criteria

- `npm run preflight` (tsc + lint + build) passes.
- Every page loads without console errors.
- No `border-radius` > 0 outside `.nav-link-cta`, `.nav-link-ghost`, avatars, and status dots.
- Old hex codes (`#FF006E`, `#8338EC`, `#3A86FF`) appear nowhere except `tokens.css`.
- Spot-check landing, plugin detail, dashboard, activity detail, showcase profile, showcase activity at desktop 1440 and mobile 390 — all match the corresponding archetype.

Ask before going off-spec. The design has been iterated; if something looks wrong on a page, it's usually a markup issue, not a design call.
