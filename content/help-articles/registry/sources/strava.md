---
title: Strava source — importing activities
excerpt: Import runs, rides, swims, and workouts from Strava into FitGlue via real-time webhooks.
date: 2026-02-04
category: registry
---

## Overview

The Strava source imports your activities from Strava into FitGlue. Runs, rides, swims, and workouts are synced in real-time via webhooks the moment they're uploaded to Strava. Heart rate, GPS, and power data are included.

## Setup

1. **Connect Strava** — See [Connecting Strava](/help/articles/registry/integrations/strava).
2. **Create a pipeline** — Add Strava as the source. Choose boosters (e.g. Fitbit Heart Rate to overlay HR, Parkrun for official results) and targets.

## Loop Prevention

FitGlue prevents duplicate sync loops. If you upload a boosted activity **to** Strava, FitGlue will **not** re-import it from Strava. No duplicates, no infinite loops. You can safely use Strava as both a source and a target in different pipelines.

## Common Use Cases

- Enhance Strava activities with AI descriptions and muscle heatmaps
- Overlay Fitbit heart rate onto Strava activities
- Add Parkrun official results to your Strava parkrun
- Cross-post to other platforms (Hevy, TrainingPeaks, Showcase)

## Related

- [Connecting Strava](/help/articles/registry/integrations/strava)
- [Strava as a destination](/help/articles/registry/destinations/strava)
- [Loop prevention](/help/articles/concepts/what-is-a-pipeline)
