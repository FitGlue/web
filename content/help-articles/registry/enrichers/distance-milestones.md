---
title: Distance Milestones booster — configuration and troubleshooting
excerpt: Celebrate cumulative distance milestones across your activities.
date: 2026-02-08
category: registry
---

## Overview

The Distance Milestones booster tracks your cumulative distance across all activities and celebrates when you hit milestones — 100km, 500km, 1000km, and beyond. When a milestone is reached, a celebratory note is added to the activity description.

## Configuration

### Milestone Intervals (`interval`)

The distance between milestones (in km). Default: **100 km**. Set to a lower value (e.g., 50 or 25) for more frequent celebrations.

### Activity Filter (`activity_filter`)

| Option | Behavior |
|---|---|
| **All Activities** (default) | All activities with distance contribute |
| **Running Only** | Only running activities count |
| **Cycling Only** | Only cycling activities count |

## Data Requirements

- Requires **distance data** on activities
- Cumulative distance is persisted per-user

## How Content Appears

### On Strava (description)

```
🎉 MILESTONE: 1,000 km total running distance!
```

(Only appears when a milestone is actually reached — not on every activity.)

## Tier & Access

The Distance Milestones booster requires the **Athlete** (paid) tier.

## Common Issues

**Wrong cumulative distance** — Distance is only tracked from activities processed through FitGlue. Historical activities from before connection don't count.

**Milestone not appearing** — The booster only adds a note when a milestone threshold is crossed. If the setting is 100km and you're at 850km, nothing shows until you cross 900km.

**Celebrating too infrequently** — Lower the `interval` value (e.g., from 100km to 50km or 25km).

## Dependencies

- Requires **Athlete tier**
- Requires distance data from source

## Related

- [Streak Tracker booster](/help/articles/registry/enrichers/streak-tracker)
- [Goal Tracker booster](/help/articles/registry/enrichers/goal-tracker)
- [Personal Records booster](/help/articles/registry/enrichers/personal-records)
