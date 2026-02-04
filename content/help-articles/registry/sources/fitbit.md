---
title: Fitbit source — setup guide
excerpt: Import activities tracked by your Fitbit device into FitGlue.
date: 2026-02-04
category: registry
---

## Overview

The Fitbit source imports activities from your Fitbit device into FitGlue. Runs, walks, bike rides, and workouts with heart rate and calorie data are all supported. FitGlue connects to the Fitbit API and receives notifications when you complete activities.

## Setup

1. **Connect Fitbit** — See [Connecting Fitbit](/help/articles/registry/integrations/fitbit). Uses secure OAuth.
2. **Create a pipeline** — Add Fitbit as the source. Choose boosters and targets.

## What Gets Imported

- All Fitbit-tracked activities
- Heart rate data (average, max, zones)
- GPS tracks for outdoor activities
- Calories and duration

## Common Use Cases

- Enhance Fitbit activities with AI descriptions
- Add weather or location context
- Sync to Strava, Showcase, or TrainingPeaks
- Use Fitbit heart rate to boost activities from other sources (e.g. Hevy)

## Related

- [Connecting Fitbit](/help/articles/registry/integrations/fitbit)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate) — overlay HR onto other activities
