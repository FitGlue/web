---
title: Fitbit source — setup and troubleshooting
excerpt: Import activities from Fitbit into FitGlue with heart rate and GPS data.
date: 2026-02-08
category: registry
---

## Overview

The Fitbit source imports activities tracked by your Fitbit device into FitGlue. Runs, walks, bike rides, swims, and workouts complete with heart rate data and GPS tracks (if available) are all supported. This is one of the most popular sources for users who wear a Fitbit as their primary fitness tracker and want to enhance their activities with FitGlue's boosters.

Fitbit is also the provider behind the [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) booster, which can merge Fitbit HR data onto activities from _other_ sources (e.g., overlaying Fitbit heart rate onto a Hevy strength workout).

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Fitbit (e.g., "Walk", "Run") |
| **Activity type** | Auto-detected by Fitbit (Run, Walk, Bike, Swim, Workout, etc.) |
| **Start time & duration** | Full timestamp, duration, and active minutes |
| **Distance** | Total distance (if GPS was available) |
| **Calories** | Fitbit's calorie estimate based on HR and activity |
| **Heart rate data** | Second-by-second HR stream from wrist optical sensor |
| **Heart rate zones** | Time spent in Fitbit's predefined HR zones |
| **GPS tracks** | Route coordinates for outdoor activities (from connected phone GPS or Fitbit GPS models) |

### What is NOT available

- **Cadence data** — Fitbit does not expose cadence through the API.
- **Power data** — No power meter integration via Fitbit.
- **Elevation gain/loss** — Available only on GPS-equipped Fitbit models. Older or non-GPS models do not provide altitude data.
- **Detailed exercise sets** — Fitbit logs activities as summary entries, not individual sets/reps/weights. For detailed strength logging, use [Hevy source](/help/articles/registry/sources/hevy).

### Sync mechanism

FitGlue connects to the **Fitbit API** and receives webhook notifications when you complete activities. Syncing happens automatically when your Fitbit device syncs with the Fitbit app on your phone.

## Setup

1. **Connect Fitbit** — See [Connecting Fitbit](/help/articles/registry/integrations/fitbit) for the OAuth flow.
2. **Create a pipeline** — Add Fitbit as the source, add boosters, and set a target.

After connection, your next Fitbit activity sync should trigger a pipeline run.

## Tier

The Fitbit source is included in **Hobbyist** (free tier). No Athlete subscription required.

## Common Issues

**No heart rate on imported activities** — Ensure your Fitbit device was worn snugly during the activity. Loose-fitting bands produce inconsistent or missing HR readings. Check that you see heart rate in the Fitbit app before expecting it in FitGlue.

**GPS data missing** — Not all Fitbit devices have built-in GPS. Budget models rely on "Connected GPS" from your phone — if you didn't carry your phone, there will be no GPS data. Check whether your Fitbit model supports GPS directly.

**Sporadic sync failures** — Fitbit's API occasionally has latency. If an activity doesn't appear, wait 10–15 minutes and check again. You can also check Dashboard → Activity History to see if a pipeline run was triggered.

**Activities showing as "Walk" when running** — Fitbit auto-detects activity type based on pace and movement. Short or slow runs may be classified as walks. Use the [Type Mapper](/help/articles/registry/enrichers/type-mapper) booster to override based on title keywords.

**OAuth token expired** — Fitbit OAuth tokens expire periodically. FitGlue automatically refreshes them, but if you see "Connection needs re-authorization", visit Dashboard → Connections and reconnect.

## Dependencies

- **Required integration**: [Fitbit connection](/help/articles/registry/integrations/fitbit) (OAuth)

## Related

- [Connecting Fitbit](/help/articles/registry/integrations/fitbit)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
