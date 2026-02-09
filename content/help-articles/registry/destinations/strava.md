---
title: Strava destination — setup and troubleshooting
excerpt: Upload enhanced activities from FitGlue to Strava with full booster output.
date: 2026-02-08
category: registry
---

## Overview

The Strava destination uploads your boosted activities to Strava. This is the most popular destination in FitGlue — used by runners, cyclists, and gym-goers who want their enhanced descriptions, muscle heatmaps, and workout summaries visible on the world's largest fitness social network.

When an activity flows through your FitGlue pipeline with boosters and then reaches the Strava destination, FitGlue either **creates a new activity** on Strava or **updates an existing activity** (if the activity originally came from Strava).

## How It Works

### For activities from Strava (update flow)

If the activity originated from your Strava account, FitGlue updates the existing Strava activity by modifying the **title** and **description** fields. The original GPS, HR, and stats data remain untouched. Only the text fields are enhanced with booster output.

### For activities from other sources (create flow)

If the activity originated from Hevy, Fitbit, Garmin, or another non-Strava source, FitGlue creates a **new activity** on Strava with the enhanced title, description, and any available metrics (distance, duration, HR, GPS).

## Loop Prevention

If Strava is configured as both a source _and_ destination in your pipelines, FitGlue automatically prevents infinite loops. Activities uploaded **to** Strava by FitGlue are tagged internally and will not be re-imported **from** Strava. This is fully automatic — no configuration needed.

## What Appears on Strava

### Title

Your activity title, potentially modified by boosters (Location Naming, Auto Increment, Streak Tracker, etc.).

### Description

All booster text output is concatenated into the description, with each booster section clearly separated:

```
🤖 Great push day! You crushed the bench at 80kg...

📋 Workout Summary
Bench Press: 3×10 @ 80kg...

💪 Muscle Heatmap
Chest:     🟪🟪🟪🟪⬜  80%
Triceps:   🟪🟪🟪⬜⬜  60%

🔥 Calories: 485 kcal ≈ 1.7 slices of pizza 🍕
```

### Limitations on Strava

- **No images in descriptions** — Strava does not support embedded images. Booster-generated images (AI Banner, Muscle Heatmap Image, Route Thumbnail) are only visible on Showcase.
- **3000-character description limit** — Very large booster outputs may be truncated.
- **No markdown rendering** — Strava displays plain text only. Emoji and line breaks work, but no bold/italic/links.
- **Activity type** — Set by the source or Type Mapper booster. Strava may override certain types based on its own analysis.

## Configuration

The Strava destination has no configurable options. It automatically determines whether to create or update based on the activity's origin.

## Tier & Access

The Strava destination is included in **Hobbyist** (free tier).

## Common Issues

**"Strava rate limit exceeded"** — Strava's API has a rate limit (100 requests per 15 minutes, 1000 per day). If you process many activities rapidly, you may hit this. Activities are queued and retried automatically.

**Description truncated** — Strava has a 3000-character limit. If your booster output exceeds this, sections at the end are truncated. Consider reducing the number of boosters or setting them to more compact display modes.

**Activity uploaded but description is empty** — Check that your boosters produced output. If all boosters require data that's missing (e.g., HR boosters without HR data), the description may be minimal.

**Duplicate activity on Strava** — This can happen if FitGlue creates a new activity on Strava while the original already exists there. Ensure that for Strava-origin activities, FitGlue is updating rather than creating. Check your pipeline's source configuration.

**"Authorization expired"** — Reconnect Strava via Dashboard → Connections. OAuth tokens expire and need periodic refresh.

## Dependencies

- **Required integration**: [Strava connection](/help/articles/registry/integrations/strava) (OAuth)

## Related

- [Strava as a source](/help/articles/registry/sources/strava)
- [Connecting Strava](/help/articles/registry/integrations/strava)
- [Showcase destination](/help/articles/registry/destinations/showcase) (for images and rich content)
