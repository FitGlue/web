---
title: Elevation Summary booster — configuration and troubleshooting
excerpt: Add elevation gain, loss, and profile data to your activity description.
date: 2026-02-08
category: registry
---

## Overview

The Elevation Summary booster adds elevation statistics — total ascent, total descent, max altitude, min altitude — to your activity description. For trail runners, hikers, and cyclists who ride hilly routes, this provides useful context about the terrain.

## Configuration

### Unit (`unit`)

| Option | Display |
|---|---|
| **Meters** (default) | Elevation in meters |
| **Feet** | Elevation in feet |

### Show Profile (`show_profile`)

When enabled, generates a text-based elevation profile using emoji characters to show the terrain shape.

## Data Requirements

- **Altitude/elevation data** — Requires barometric or GPS-derived altitude from your recording device.
- Devices with barometric altimeters (most modern Garmin, Suunto, Coros watches) provide more accurate elevation than GPS-only devices.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Elevation seems inaccurate** — GPS-derived elevation is notoriously inaccurate (±10–20m). Barometric altimeters are more accurate but can be affected by weather changes. Both methods have limitations.

**No elevation data** — Indoor activities, Hevy workouts, and some budget devices don't record altitude. No output will be produced.

**Elevation profile looks flat** — Very flat routes naturally produce a flat profile. The visualization scales to the activity's elevation range.

## Dependencies

- Requires altitude data from source
- No integration dependencies

## Related

- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
