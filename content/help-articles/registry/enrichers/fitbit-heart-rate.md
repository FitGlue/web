---
title: Fitbit Heart Rate booster — configuration and troubleshooting
excerpt: Merge heart rate data from your Fitbit onto activities from other sources.
date: 2026-02-08
category: registry
---

## Overview

The Fitbit Heart Rate booster overlays heart rate data from your Fitbit device onto activities that were imported from a _different_ source. For example, if you log a strength workout in Hevy (which has no HR tracking), this booster fetches your Fitbit's heart rate readings for the same time window and attaches them to the activity. The result is a complete activity with both exercise details AND heart rate data.

This is one of the most powerful boosters for users who wear a Fitbit as a general wearable but track specific activities in specialized apps.

## Configuration

The Fitbit Heart Rate booster has no configurable options. It automatically matches the activity's time window to the Fitbit HR stream via the API.

## Data Requirements

- **Fitbit connection required** — You must have a connected Fitbit account. See [Connecting Fitbit](/help/articles/registry/integrations/fitbit).
- **Fitbit device worn during activity** — Your Fitbit must have been worn during the activity's time window to have HR data available.
- **Activity timestamp** — The booster uses the activity's start/end time to query the correct HR data window.

## Provider Configuration

This booster relies on the [Fitbit integration](/help/articles/registry/integrations/fitbit). The OAuth connection handles authentication automatically. No additional provider configuration is needed — the booster queries the Fitbit Web API to retrieve intraday heart rate data for the activity's time range.

## How Content Appears

### On Strava

Heart rate data is added to the activity metadata. Strava displays average and max HR in the activity stats. If the activity is uploaded with a full HR stream, Strava also renders its interactive HR graph.

### On Showcase

Showcase displays a full heart rate graph rendered as an interactive chart, with zones highlighted. Average and max HR are shown in the stats panel.

## Tier & Access

The Fitbit Heart Rate booster is available on the **Hobbyist** (free) tier.

## Common Issues

**No HR data merged** — The most common cause: your Fitbit wasn't worn during the activity, or the Fitbit synced after FitGlue processed the pipeline. Fitbit needs to sync first (open the Fitbit app) so the data is available via API. You can re-post the activity to retry.

**HR data looks inaccurate** — Fitbit uses wrist-based optical HR. It can be inaccurate during activities with heavy wrist movement (e.g., bench press, push-ups). For strength training, the max HR readings may spike from grip changes rather than actual cardiac effort. A chest strap provides more accurate readings but wouldn't go through Fitbit.

**HR data appears but is for the wrong time** — Ensure your Fitbit's clock is synced correctly. Time zone mismatches between your Fitbit and FitGlue can cause the wrong HR window to be fetched. Check that your Fitbit app shows the correct local time.

**"Fitbit rate limit exceeded"** — Fitbit's API has a rate limit (150 requests/hour). If you process many activities in quick succession, you may hit this limit. Wait an hour and retry.

**HR from Fitbit overwriting HR from source** — If your activity already has HR data from its original source (e.g., Strava with a Garmin chest strap), this booster will override it with Fitbit wrist HR. Only enable this booster when your source doesn't provide HR data.

## Dependencies

- **Required integration**: [Fitbit connection](/help/articles/registry/integrations/fitbit) (OAuth)
- Fitbit device must be worn during the activity

## Related

- [Connecting Fitbit](/help/articles/registry/integrations/fitbit)
- [FIT File Heart Rate booster](/help/articles/registry/enrichers/fit-file-heart-rate) (alternative HR source)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Heart Rate Summary booster](/help/articles/registry/enrichers/heart-rate-summary)
