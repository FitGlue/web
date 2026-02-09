---
title: Pace Summary booster — configuration and troubleshooting
excerpt: Add pace statistics and split breakdowns to your running activities.
date: 2026-02-08
category: registry
---

## Overview

The Pace Summary booster adds detailed pace statistics to your running (or walking/hiking) activities. It calculates average pace, best split pace, negative split analysis, and optional per-kilometer or per-mile splits. This gives followers insight into your pacing strategy on Strava.

## Configuration

### Unit (`unit`)

| Option | Display |
|---|---|
| **min/km** (default) | Pace in minutes per kilometer |
| **min/mi** | Pace in minutes per mile |

### Show Splits (`show_splits`)

When enabled (default: **false**), includes per-km or per-mile split times. This can produce long output for long runs.

### Negative Split Analysis (`negative_split`)

When enabled (default: **true**), notes whether you ran a negative or positive split (second half faster or slower than first half).

## Data Requirements

- **Distance and time data** — Needs total distance and elapsed time at minimum.
- **GPS stream** — Required for per-split breakdowns (not just total pace).
- Works best with running activities from Strava, Garmin, or Polar.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Pace seems wrong** — Check the unit setting. A 5:30 min/km pace is very different from 5:30 min/mi. Also note that "pace" includes stopped time unless the source provides "moving time" separately.

**No splits showing** — Enable `show_splits` and ensure the activity has GPS data. Without GPS, only total pace can be calculated.

**Pace shows for cycling activities** — This booster may activate for any activity with distance/time data. Use the [Activity Filter](/help/articles/registry/enrichers/activity-filter) booster upstream to restrict it to running activities only.

## Dependencies

- No integration dependencies
- Requires distance + time data from source

## Related

- [Speed Summary booster](/help/articles/registry/enrichers/speed-summary)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
