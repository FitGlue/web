---
title: Intervals.icu source — setup and troubleshooting
excerpt: Import structured training activities from Intervals.icu into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Intervals.icu source imports activities from Intervals.icu, a popular free training analysis platform. Intervals.icu aggregates data from multiple sources (Garmin, Strava, TrainingPeaks) and provides detailed analytics. Using it as a FitGlue source gives you access to all activities flowing through your Intervals.icu account.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Intervals.icu |
| **Activity type** | Running, cycling, swimming, and other supported types |
| **Start time & duration** | Full timestamps |
| **Distance** | Total distance |
| **Calories** | Estimated calories |
| **Heart rate** | HR data if available from source device |
| **GPS data** | Route coordinates if available |
| **Power** | Power data for cycling (including estimated power) |
| **Cadence** | Cadence data if recorded |
| **TSS/Training load** | Intervals.icu's training stress score |

### What is NOT available

- **Strength exercise details** — Not provided through the API.
- **Running dynamics** — Not forwarded by Intervals.icu.

### Sync mechanism

Intervals.icu uses **API polling** with webhook-like notifications. Activities appear when they're processed by Intervals.icu.

## Setup

1. **Connect Intervals.icu** — See [Connecting Intervals.icu](/help/articles/registry/integrations/intervals) for setup with your API key.
2. **Create a pipeline** — Add Intervals.icu as the source.

## Tier

The Intervals.icu source is included in **Hobbyist** (free tier).

## Common Issues

**Activities not syncing** — Intervals.icu must first receive the activity from its own sources (Garmin, Strava, etc.). There's a cascade delay: device → Garmin/Strava → Intervals.icu → FitGlue. Allow up to 30 minutes for the full chain.

**Duplicate activities** — If you have both Strava and Intervals.icu as FitGlue sources, and Intervals.icu receives data from Strava, the same activity will appear twice. Use only one as your FitGlue source to avoid duplicates.

**API key issues** — Ensure your Intervals.icu API key is correct and has not expired. You can find your API key in Intervals.icu Settings → Developer.

## Dependencies

- **Required integration**: [Intervals.icu connection](/help/articles/registry/integrations/intervals) (API key)

## Related

- [Connecting Intervals.icu](/help/articles/registry/integrations/intervals)
- [Intervals.icu as a destination](/help/articles/registry/destinations/intervals)
- [Training Load booster](/help/articles/registry/enrichers/training-load)
