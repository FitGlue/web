---
title: Wahoo source — setup and troubleshooting
excerpt: Import cycling and running activities from Wahoo devices into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Wahoo source imports activities from Wahoo cycling computers (ELEMNT, ELEMNT BOLT, ELEMNT ROAM) and the Wahoo TICKR heart rate monitors. Wahoo devices are popular among cyclists and provide detailed power, cadence, speed, and heart rate data.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Wahoo |
| **Activity type** | Cycling, running, or other activity types |
| **Start time & duration** | Full timestamps |
| **Distance** | GPS-measured distance |
| **Calories** | Estimated calories |
| **Heart rate** | HR stream if wearing a compatible Wahoo HR monitor |
| **GPS data** | Route coordinates from ELEMNT bike computer |
| **Cadence** | Pedal cadence for cycling |
| **Power** | Watt data from paired power meters |
| **Speed** | Average and max speed |

### What is NOT available

- **Running dynamics** — Wahoo devices do not provide GCT, stride length, or vertical oscillation.
- **Strength data** — Not applicable to Wahoo's primary use case.

### Sync mechanism

Wahoo uses **webhooks** via the Wahoo API. When your ELEMNT syncs with the Wahoo app, FitGlue is notified.

## Setup

1. **Connect Wahoo** — See [Connecting Wahoo](/help/articles/registry/integrations/wahoo) for the OAuth setup.
2. **Create a pipeline** — Add Wahoo as the source.

## Tier

The Wahoo source is included in **Hobbyist** (free tier).

## Common Issues

**Activities not syncing** — Ensure your ELEMNT device has synced to the Wahoo app first. Check the Wahoo app to confirm the activity is uploaded, then verify your FitGlue connection status.

**Power data missing** — Power requires a compatible power meter paired with your ELEMNT. Check the sensor pairing in the Wahoo app.

**No heart rate data** — Wahoo bike computers don't have built-in HR sensors. You need a separate heart rate strap (e.g., Wahoo TICKR) paired with the ELEMNT. Without it, use the [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) booster.

**OAuth re-authorization** — If your connection shows as expired, reconnect via Dashboard → Connections.

## Dependencies

- **Required integration**: [Wahoo connection](/help/articles/registry/integrations/wahoo) (OAuth)

## Related

- [Connecting Wahoo](/help/articles/registry/integrations/wahoo)
- [Power Summary booster](/help/articles/registry/enrichers/power-summary)
- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
