# FitGlue Reskin — Handoff Package

This folder contains the **Brutal × Aurora** reskin for FitGlue, packaged for handoff to Claude Code working in your `FitGlue/web` repo.

## Folder layout

```
handoff/
├── README.md                       (this file)
├── css/
│   ├── tokens.css                  Drop-in design tokens (CSS custom props)
│   ├── components.css              New reusable component classes (.fg-band, .fg-panel, etc.)
│   └── overrides.css               Reskin of existing class names (preserves your markup)
├── archetypes/                     HTML/JSX mockups — one per page archetype
│   ├── marketing-landing.html
│   ├── marketing-pillar.html
│   ├── marketing-guide.html
│   ├── marketing-help.html
│   ├── marketing-legal.html
│   ├── marketing-plugin-detail.html
│   ├── auth-form.html
│   ├── app-list.html               (Activities / Connections / Pipelines)
│   ├── app-wizard.html             (Pipeline wizard / Connection setup)
│   ├── app-settings.html           (Account / Subscription)
│   └── app-modal.html              (Share / Repost / Enricher info)
└── HANDOFF.md                      Page-by-page mapping + Claude Code build plan
```

The five canonical app surfaces (dashboard, pipeline editor, activity showcase, connections, marketing hero) live in `directions/06-ba-*.jsx` at the repo root and are referenced from `HANDOFF.md` as ground truth.

## How to use

1. Open `index.html` to compare directions. Section 06 is the chosen one.
2. Open `handoff/index.html` to browse the archetype mockups.
3. Read `handoff/HANDOFF.md` — it's the brief you hand to Claude Code along with the FitGlue/web repo.
