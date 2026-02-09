---
title: Garmin source — setup and troubleshooting
excerpt: Import activities from Garmin devices into FitGlue with full sensor data.
date: 2026-02-08
category: registry
---

## Overview

The Garmin source imports activities from your Garmin wearable or bike computer into FitGlue. Garmin devices are among the most data-rich fitness trackers available, providing detailed heart rate streams, GPS routes, cadence, power, running dynamics, and much more. This source is ideal for serious athletes who want to enhance their already comprehensive data with FitGlue's boosters.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Garmin Connect |
| **Activity type** | Running, cycling, swimming, hiking, etc. |
| **Start time & duration** | Full timestamps with elapsed and moving time |
| **Distance** | Total distance with GPS precision |
| **Calories** | Garmin's calorie estimate based on HR and activity |
| **Heart rate** | Second-by-second HR stream (wrist or chest strap) |
| **GPS data** | High-fidelity route coordinates |
| **Cadence** | Step cadence (running) or pedal cadence (cycling) |
| **Power** | Watt data from power meters (cycling) |
| **Elevation** | Barometric altitude with gain/loss |
| **Running dynamics** | Ground contact time, stride length, vertical oscillation (with compatible accessories) |

### What is NOT available

- **Strength exercise details** — Garmin records strength sessions as a single activity without individual set/rep/weight breakdown. Use [Hevy source](/help/articles/registry/sources/hevy) for detailed strength data.

### Sync mechanism

Garmin uses **webhooks** via the Garmin Connect API. When your device syncs with Garmin Connect (via phone or USB), FitGlue is notified automatically.

## Setup

1. **Connect Garmin** — See [Connecting Garmin](/help/articles/registry/integrations/garmin) for the OAuth setup.
2. **Create a pipeline** — Add Garmin as the source, add boosters, and set a target.

## Tier

The Garmin source is included in **Hobbyist** (free tier).

## Common Issues

**Activities not syncing** — Garmin activities must first sync from your device to Garmin Connect. Check that the activity appears in Garmin Connect before expecting it in FitGlue. If it's in Garmin Connect but not FitGlue, check your connection status in Dashboard → Connections.

**Running dynamics missing** — Running dynamics (GCT, stride length, vertical oscillation) require a compatible accessory like the Garmin HRM-Run, HRM-Pro, or Running Dynamics Pod. Standard wrist-based recording does not include these metrics.

**Power data missing for cycling** — Ensure your power meter is paired with your Garmin device and that the activity was recorded with power enabled.

**Delayed sync** — Garmin Connect can sometimes take several minutes to process an activity before sending the webhook. This is a Garmin-side delay, not a FitGlue issue. Activities typically appear within 5–15 minutes.

**OAuth re-authorization required** — Garmin OAuth tokens may expire. If you see "Connection needs re-authorization", visit Dashboard → Connections and reconnect.

## Dependencies

- **Required integration**: [Garmin connection](/help/articles/registry/integrations/garmin) (OAuth)

## Related

- [Connecting Garmin](/help/articles/registry/integrations/garmin)
- [Running Dynamics booster](/help/articles/registry/enrichers/running-dynamics)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
