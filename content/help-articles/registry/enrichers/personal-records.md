---
title: Personal Records booster — configuration and troubleshooting
excerpt: Track and display personal records across your activities.
date: 2026-02-08
category: registry
---

## Overview

The Personal Records booster tracks your best performances across activities and highlights when you achieve a new PR. It monitors metrics like fastest 5K, longest run, highest power, heaviest lift, and more — then adds a celebratory note to your activity description when a record is broken.

## Configuration

### Track Types (`track_types`)

Select which record types to track:

| Option | Tracks |
|---|---|
| **Running PRs** | Fastest 1K, 5K, 10K, half marathon, marathon |
| **Cycling PRs** | Longest ride, highest avg power, best 20-min power |
| **Strength PRs** | Heaviest 1RM per exercise (from Hevy) |
| **General PRs** | Longest activity, highest calorie burn |

Multiple types can be selected.

### Show Near-Misses (`show_near_misses`)

When enabled, notes when you come within 5% of a PR ("Almost broke your 5K record — missed by 12 seconds!").

## Data Requirements

- Records are tracked per-user and persist across all activities
- Different record types require different data (e.g., running PRs need distance + time, strength PRs need exercise + weight data)

## How Content Appears

### On Strava (description)

```
🏆 NEW PERSONAL RECORD!
Fastest 5K: 22:34 (previous: 23:01)
```

Or for strength:
```
🏆 NEW PR: Bench Press 1RM — 100kg (previous: 95kg)
```

## Tier & Access

The Personal Records booster requires the **Athlete** (paid) tier.

## Common Issues

**PRs not tracking accurately** — PRs are only tracked from activities processed through FitGlue. Historical activities from before you connected will not establish baseline records. You may want to manually set baseline PRs or allow the first few activities to establish them.

**Strength PR not detected** — The booster calculates estimated 1RM from your sets/reps/weight data. Very high-rep sets (15+ reps) produce less reliable 1RM estimates.

**Strength PRs imported from Hevy** — You can also import historical strength PRs using the [Hevy integration](/help/articles/registry/integrations/hevy) action "Import Strength PRs", which pulls 12 months of data.

**PR broken every session** — If you just started tracking, the first activity sets the baseline, and subsequent similar activities may superficially "break" records. This stabilizes after a few weeks of data.

## Dependencies

- No integration dependencies (but benefits from Hevy for strength PRs)
- Requires **Athlete tier**

## Related

- [Hevy integration](/help/articles/registry/integrations/hevy) (Import Strength PRs action)
- [Streak Tracker booster](/help/articles/registry/enrichers/streak-tracker)
- [Distance Milestones booster](/help/articles/registry/enrichers/distance-milestones)
