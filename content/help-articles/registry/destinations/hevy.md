---
title: Hevy destination — setup and troubleshooting
excerpt: Upload activities to Hevy from other sources via FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Hevy destination uploads activities to your Hevy account from other sources. This is useful if you want activities from Strava, Garmin, or other platforms to appear in your Hevy workout log. FitGlue translates the activity data into Hevy's workout format.

## How It Works

Activities from non-Hevy sources are converted to Hevy workout format and uploaded via the Hevy API. The translation preserves as much data as possible, but Hevy's workout format is focused on strength training — cardio-only activities without exercise data will appear as simple timed workouts.

## Loop Prevention

If Hevy is configured as both a source _and_ destination, FitGlue prevents loops automatically. Hevy workouts imported as a source are not re-uploaded as a destination.

## Configuration

No configurable options. The destination automatically handles the upload.

## Tier & Access

The Hevy destination is included in **Hobbyist** (free tier).

## Common Issues

**"Hevy Pro required"** — The Hevy API requires a Pro subscription for both reading and writing.

**Cardio activities appearing empty** — Hevy is primarily a strength training app. Runs and rides uploaded without exercise data will appear as minimal timed entries.

**Exercise names not matching** — FitGlue maps exercise names to Hevy's exercise database using fuzzy matching. Very unusual exercise names may not map correctly.

## Dependencies

- **Required integration**: [Hevy connection](/help/articles/registry/integrations/hevy) (API key)
- **Hevy Pro subscription**

## Related

- [Hevy as a source](/help/articles/registry/sources/hevy)
- [Connecting Hevy](/help/articles/registry/integrations/hevy)
