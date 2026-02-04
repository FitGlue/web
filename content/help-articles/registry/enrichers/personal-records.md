---
title: Personal Records booster — setup and troubleshooting
excerpt: Detects and celebrates new PRs for cardio and strength activities
date: 2026-02-04
category: registry
---

## Overview

The Personal Records booster automatically detects when you've achieved a new personal record and adds a celebration to your activity. Cardio records tracked: Fastest 5K, 10K, Half Marathon; Longest Run/Ride; Highest Elevation Gain. Strength records (per exercise): 1RM (Epley formula), Volume, Max Reps. All records are stored in Firestore and persist across time.

## Setup

1. Add the Personal Records booster to your pipeline.
2. Configure:
   - **Track Cardio PRs** — 5K, 10K, longest distance, etc. (default: true)
   - **Track Strength PRs** — 1RM, volume, max reps (default: true)
   - **Celebrate in Title** — Add 🎉 emoji to activity title when PR achieved (default: false)

## Config Options

| Field | Default | Description |
|-------|---------|-------------|
| Track Cardio PRs | true | 5K, 10K, longest run/ride, elevation |
| Track Strength PRs | true | 1RM, volume, max reps per exercise |
| Celebrate in Title | false | Add 🎉 to title on PR |

## Output Example

```
🏆 NEW PR! Deadlift 1RM: 140kg (previous: 135kg, +3.7%)
```

## Use Cases

- Celebrate running PRs automatically
- Track strength progression over time
- Share PR achievements on your activity feed

## Related

- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary) (strength exercise details)
- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
