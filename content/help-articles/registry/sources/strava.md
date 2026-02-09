---
title: Strava source — setup and troubleshooting
excerpt: Import activities from Strava via real-time webhooks for enhancement and distribution.
date: 2026-02-08
category: registry
---

## Overview

The Strava source imports your runs, rides, swims, and workouts from Strava into FitGlue. Activities are synced in real-time via webhooks the moment they're uploaded to Strava. This is the most popular source in FitGlue, ideal for users who want to enhance their Strava activities with AI descriptions, stats summaries, and visual assets then distribute them to other platforms or Showcase.

Strava can also be used as a **destination** — and FitGlue is smart enough to prevent infinite loops when you use it as both.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity title as set in Strava |
| **Description** | Activity description (if any) |
| **Activity type** | Run, Ride, Swim, Weight Training, etc. — mapped to FitGlue's standard types |
| **Start time & duration** | Full timestamp and elapsed/moving time |
| **Distance** | Total distance in meters |
| **Calories** | Strava's estimated calories |
| **Heart rate** | Average and max HR (stream data if available from connected device) |
| **GPS data** | Full polyline coordinates for map rendering |
| **Speed/pace** | Average and max speed |
| **Cadence** | Average cadence (if recorded by device) |
| **Power** | Average watts (if power meter connected) |
| **Elevation** | Total elevation gain and loss |
| **Segment efforts** | Strava segment data (not currently used by boosters) |

### What is NOT available

- **Individual exercise sets/reps/weights** — Strava does not provide detailed strength data. For strength workouts, use the [Hevy source](/help/articles/registry/sources/hevy) instead.
- **Lap-level detail** — Strava's API provides summary data; for full FIT-file-level detail, use the source device directly (e.g., [Garmin](/help/articles/registry/sources/garmin) or [File Upload](/help/articles/registry/sources/file_upload)).

### Sync mechanism

Strava uses **real-time webhooks**. When you complete an activity on Strava (or when your device syncs to Strava), FitGlue is notified immediately and imports the activity data.

## Setup

1. **Connect Strava** — See [Connecting Strava](/help/articles/registry/integrations/strava) for the OAuth flow.
2. **Create a pipeline** — Add Strava as the source, add boosters, and choose a target.

After setup, your next Strava activity should trigger a pipeline run within seconds.

## Tier

The Strava source is included in **Hobbyist** (free tier). No Athlete subscription required.

## Loop Prevention

If Strava is configured as both a **source** and a **destination** in your pipelines, FitGlue's intelligent loop prevention ensures that activities uploaded _to_ Strava by FitGlue are not re-imported _from_ Strava. This is handled automatically — you do not need to configure anything. Each uploaded activity is tagged internally to prevent re-ingestion. No duplicates, no infinite loops.

## Common Issues

**Activities not syncing** — Check that your Strava connection is active in Dashboard → Connections. If Strava shows "Connected" but activities aren't appearing, try disconnecting and reconnecting. Webhooks can occasionally stall if Strava's API has an outage.

**Duplicate activities appearing** — This should not happen with loop prevention enabled. If you see duplicates, check whether you have the same activity arriving from multiple sources (e.g., Strava _and_ Garmin both sending the same run). Use the [Activity Filter](/help/articles/registry/enrichers/activity-filter) booster to deduplicate.

**Heart rate data missing** — Strava only includes heart rate if it was recorded by a connected device (chest strap, wrist HR watch). If your activity has no HR data from Strava, use the [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) booster to merge it.

**Wrong activity type** — Strava's type mapping is sometimes incorrect (e.g., indoor cycling logged as "Workout"). Use the [Type Mapper](/help/articles/registry/enrichers/type-mapper) booster to fix activity types based on title keywords.

**Manual activities not syncing** — Only activities created via device sync or the Strava app trigger webhooks. Manually created activities on the Strava website may not send a webhook notification.

## Dependencies

- **Required integration**: [Strava connection](/help/articles/registry/integrations/strava) (OAuth)

## Related

- [Connecting Strava](/help/articles/registry/integrations/strava)
- [Strava as a destination](/help/articles/registry/destinations/strava)
- [Hevy to Strava guide](/guides/hevy-to-strava)
