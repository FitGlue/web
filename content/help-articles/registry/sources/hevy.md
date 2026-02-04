---
title: Hevy source — setup and troubleshooting
excerpt: Import strength training workouts from Hevy into FitGlue for enhancement and distribution.
date: 2026-02-04
category: registry
---

## Overview

The Hevy source imports your weight training workouts from Hevy into FitGlue. Every exercise, set, rep, and weight is captured with full fidelity. When you complete a workout in Hevy, FitGlue receives a webhook notification and imports the full workout data into your pipeline.

## Setup

1. **Connect Hevy** — You need a Hevy connection first. See [Connecting Hevy](/help/articles/registry/integrations/hevy).
2. **Create a pipeline** — Add Hevy as the source, then add boosters (Workout Summary, Muscle Heatmap) and a target (Strava, Showcase).

## Important: Hevy Pro Required

The Hevy source requires a **Hevy Pro** subscription. The Hevy Developer API is only available to Pro users. Free tier accounts cannot generate an API key or connect to FitGlue.

If you're on Hevy Pro, find your API key in **Hevy app → Settings → Developer → Generate API Key**.

## Common Issues

**"Connection failed"** — Ensure your Hevy API key is valid and you have an active Hevy Pro subscription.

**Workouts not syncing** — Check that your Hevy connection is active in Settings → Connections. Webhooks should fire when you complete a workout in Hevy.

## Related

- [Connecting Hevy](/help/articles/registry/integrations/hevy)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
- [Muscle Heatmap booster](/help/articles/registry/enrichers/muscle-heatmap)
- [Hevy to Strava guide](/guides/hevy-to-strava)
