---
title: Hevy destination — setup and troubleshooting
excerpt: Upload boosted activities to Hevy
date: 2026-02-04
category: registry
---

## Overview

The Hevy destination uploads all your activities to Hevy — from strength training to cardio. Activities pass through your Pipeline and are uploaded via the official API. Strength sets, reps, and weights are preserved. Cardio activities (runs, rides, walks) are mapped to Hevy's distance-based exercise templates. Exercise names are fuzzy-matched to Hevy's library; unknown exercises automatically create custom templates.

## Setup

1. **Connect Hevy** — You need a Hevy connection first. See [Connecting Hevy](/help/articles/registry/integrations/hevy). Hevy Pro is required for the API.
2. **Create a pipeline** — Add your source and boosters, then add Hevy as a target.
3. **Configure** — No additional config required. Activities upload automatically.

## Dependencies

Requires the **Hevy** integration to be connected. Hevy Pro subscription is required for API access.

## Common Issues

**"Connection failed"** — Ensure your Hevy API key is valid and you have Hevy Pro.

**Exercise not found** — Hevy will create custom exercise templates for unknown exercises. Fuzzy matching handles most common variations.

**Cardio mapping** — Cardio activities are mapped to distance-based templates (e.g., Run, Ride). Check Hevy's exercise library for supported types.

## Related

- [Connecting Hevy](/help/articles/registry/integrations/hevy)
- [Hevy source](/help/articles/registry/sources/hevy)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
