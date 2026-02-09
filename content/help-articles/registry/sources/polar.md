---
title: Polar source — setup and troubleshooting
excerpt: Import activities from Polar watches and sensors into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Polar source imports activities from Polar watches and heart rate sensors. Polar devices provide high-quality heart rate data with features like orthostatic test results, running index, and training load metrics. This is a great source for users with Polar Vantage, Grit X, Ignite, or Pacer series watches.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Polar Flow |
| **Activity type** | Running, cycling, swimming, and 100+ sport profiles |
| **Start time & duration** | Full timestamps |
| **Distance** | GPS-measured distance |
| **Calories** | Polar's calorie estimate based on HR and user profile |
| **Heart rate** | Continuous HR stream (chest strap or wrist sensor) |
| **GPS data** | Route coordinates for outdoor activities |
| **Cadence** | Running cadence or cycling cadence |
| **Speed** | Pace and speed data |

### What is NOT available

- **Power data** — Only available with Polar-compatible power meters for cycling.
- **Running dynamics** — Limited dynamics compared to Garmin.
- **Strength exercise details** — Not tracked at the set/rep level.

### Sync mechanism

Polar uses the **Polar Accesslink API** with webhook notifications. Activities sync when your device syncs with the Polar Flow app.

## Setup

1. **Connect Polar** — See [Connecting Polar](/help/articles/registry/integrations/polar) for the OAuth setup.
2. **Create a pipeline** — Add Polar as the source.

## Tier

The Polar source is included in **Hobbyist** (free tier).

## Common Issues

**Activities not appearing** — Polar activities must first sync from your watch to Polar Flow. Check the Polar Flow app to confirm, then verify your FitGlue connection status.

**Heart rate data quality** — Polar's wrist-based HR is generally accurate, but can be affected by cold weather, tattoos on the wrist, or a loose band. Polar's chest strap (H10, H9) provides the most accurate readings.

**No GPS for indoor activities** — Indoor activities will not have GPS data. This is expected behavior for any indoor-based workout.

**Delayed sync** — Polar Flow can take a few minutes to process activities. If you don't see your activity, wait 5–10 minutes and check again.

## Dependencies

- **Required integration**: [Polar connection](/help/articles/registry/integrations/polar) (OAuth)

## Related

- [Connecting Polar](/help/articles/registry/integrations/polar)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Training Load booster](/help/articles/registry/enrichers/training-load)
