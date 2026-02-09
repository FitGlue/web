---
title: Hevy source — setup and troubleshooting
excerpt: Import strength training workouts from Hevy into FitGlue for enhancement and distribution.
date: 2026-02-08
category: registry
---

## Overview

The Hevy source imports your weight training workouts from Hevy into FitGlue. Every exercise, set, rep, and weight is captured with full fidelity. When you complete a workout in Hevy, FitGlue receives a webhook notification and imports the full workout data into your pipeline.

Hevy is the ideal source for users who want to cross-post strength training sessions to Strava, generate muscle heatmaps, or create AI-powered workout summaries. It is the primary source for any pipeline involving strength training data.

## Data Ingested

When an activity arrives from Hevy, FitGlue captures the following:

| Field | Details |
|---|---|
| **Title** | Your workout title from Hevy (e.g. "Push Day") |
| **Start time & duration** | The timestamp and total duration of the workout |
| **Exercises** | Full list of exercises, in order, as logged in Hevy |
| **Sets, reps, weights** | Every set with rep count, weight, and rest period duration |
| **Activity type** | Mapped to "Weight Training" |
| **Superset grouping** | Preserved from Hevy's superset structure |

### What is NOT available from Hevy

- **Heart rate data** — Hevy does not record heart rate. Use the [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) or [FIT File Heart Rate](/help/articles/registry/enrichers/fit-file-heart-rate) booster to merge HR from a wearable.
- **GPS or location data** — Hevy is a gym logging app with no location tracking. Use [Virtual GPS](/help/articles/registry/enrichers/virtual-gps) if you want a map on your activity.
- **Calorie data** — Hevy does not provide calorie estimates. Use the [Calories Burned](/help/articles/registry/enrichers/calories-burned) booster for MET-based calorie estimation.
- **Cadence, power, or speed data** — Not applicable to strength training.

### Sync mechanism

Hevy uses **real-time webhooks**. When you finish and save a workout in Hevy, FitGlue is notified within seconds and the activity enters your pipeline immediately.

## Setup

1. **Get Hevy Pro** — The Hevy Developer API is only available to **Hevy Pro** subscribers. Free tier accounts cannot generate an API key.
2. **Connect Hevy** — See [Connecting Hevy](/help/articles/registry/integrations/hevy) for step-by-step setup of your API key.
3. **Create a pipeline** — In your FitGlue Dashboard, create a new pipeline with Hevy as the source, add your desired boosters (Workout Summary, Muscle Heatmap, AI Companion, etc.), and set a target (Strava, Showcase, or both).

After setup, your next completed Hevy workout should appear in your FitGlue dashboard within seconds.

## Tier

The Hevy source is included in **Hobbyist** (free tier). No Athlete subscription required.

## How Content Appears on Destinations

### On Strava

Hevy workouts uploaded to Strava via FitGlue appear as "Weight Training" activities. The title is preserved from Hevy. The description contains all booster output (workout summary, muscle heatmap, etc.) as plain text — Strava does not render markdown. If you have boosters that generate images (Muscle Heatmap Image, AI Banner), these are not displayed on Strava's activity feed but are visible on the linked Showcase page.

### On Showcase

Hevy workouts on Showcase display the full description with formatted booster sections. Any generated image assets (muscle heatmap diagrams, AI banners) are embedded as visuals in the Showcase page. The Showcase page also shows the activity's heart rate graph if HR data was merged.

### On Hevy (as destination)

If you have Hevy as both a source and destination, FitGlue's loop prevention ensures the same activity is not re-imported. This scenario is useful when activities from other sources (e.g., Strava runs) are sent to Hevy as destination.

## Common Issues

**"Hevy Pro required"** — The Hevy API is only available to Pro subscribers. If you see this error, check your Hevy subscription status in the Hevy app under Settings → Account.

**"Connection failed" or "Invalid API key"** — Ensure the API key was copied correctly with no leading or trailing spaces. You can regenerate the key in Hevy app → Settings → Developer → Generate API Key.

**Workouts not syncing** — Check that your Hevy connection status is "Connected" in FitGlue Dashboard → Connections. If connected but workouts aren't appearing, try logging a new workout in Hevy — only workouts completed _after_ connecting will sync.

**Exercises showing wrong names** — Hevy allows custom exercise names. FitGlue's muscle mapping uses fuzzy matching against a database of 100+ canonical exercises. Custom names like "Dave's Bench Press" are matched correctly, but very unusual names may fall back to generic muscle groups. This affects the Muscle Heatmap booster's accuracy.

**Missing rest period data** — Rest periods are only captured if you use Hevy's built-in rest timer. Manually skipping the timer results in no rest data for that set.

## Dependencies

- **Required integration**: [Hevy connection](/help/articles/registry/integrations/hevy) (API key)
- **Hevy Pro subscription** on the Hevy platform

## Related

- [Connecting Hevy](/help/articles/registry/integrations/hevy)
- [Hevy as a destination](/help/articles/registry/destinations/hevy)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
- [Muscle Heatmap booster](/help/articles/registry/enrichers/muscle-heatmap)
- [Hevy to Strava guide](/guides/hevy-to-strava)
