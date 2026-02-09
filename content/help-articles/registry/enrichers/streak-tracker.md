---
title: Streak Tracker booster — configuration and troubleshooting
excerpt: Track consecutive days of activity and display your current streak.
date: 2026-02-08
category: registry
---

## Overview

The Streak Tracker booster counts consecutive days of activity and displays your current streak on each activity. "Day 42 of the running streak 🔥" is the kind of motivational data point that keeps you consistent and impresses followers.

## Configuration

### Activity Filter (`activity_filter`)

| Option | Behavior |
|---|---|
| **Any Activity** (default) | Any type of activity counts toward the streak |
| **Specific Type** | Only selected activity types (e.g., Running) count |

### Streak Display (`display`)

| Option | Example |
|---|---|
| **Title suffix** (default) | `Morning Run 🔥 Day 42` |
| **Description** | Streak info in the description text |

### Grace Period (`grace_hours`)

Hours allowed between activities before streak resets. Default: **36 hours** (allows for a full day without breaking the streak). Range: 24–72 hours.

## Data Requirements

- Works with **any activity** from any source
- Streak state is persisted per-user

## How Content Appears

### On Strava

Title: `Morning Run 🔥 Day 42`

Or in description:
```
🔥 Running Streak: Day 42
Longest streak: 67 days
```

## Tier & Access

The Streak Tracker booster requires the **Athlete** (paid) tier.

## Common Issues

**Streak reset unexpectedly** — Check the `grace_hours` setting. If you exercised late one day and early two days later, the gap may exceed the grace period. Increase it to 48 or 72 hours for more flexibility.

**Streak counting wrong day number** — The booster counts calendar days with activity. Multiple activities on the same day count as one streak day, not multiple. If two activities arrive out of order for the same day, the counter should not double-count (this was fixed in a recent update).

**"Running streak started!" when it shouldn't have** — If the activity type changes (e.g., you were on a "any activity" streak and switched to "Running" filter), the streak resets because the filter criteria changed.

**Streak not persisting after pipeline changes** — Streak data is stored per-user, independent of pipeline configuration. Changing boosters in your pipeline does not reset the streak. However, creating a completely new pipeline does start a fresh counter.

## Dependencies

- Requires **Athlete tier**
- No integration dependencies

## Related

- [Goal Tracker booster](/help/articles/registry/enrichers/goal-tracker)
- [Distance Milestones booster](/help/articles/registry/enrichers/distance-milestones)
- [Auto Increment booster](/help/articles/registry/enrichers/auto-increment)
