---
title: Goal Tracker booster — configuration and troubleshooting
excerpt: Track progress toward your fitness goals and display it on activities.
date: 2026-02-08
category: registry
---

## Overview

The Goal Tracker booster lets you set fitness goals (e.g., "Run 100km this month", "Complete 20 workouts this month") and displays your progress toward each goal on every activity. Progress is shown with emoji progress bars so followers can see how close you are to hitting your targets.

## Configuration

### Goals (`goals`)

Define one or more goals, each with:

| Field | Description | Example |
|---|---|---|
| **Metric** | What to track | Distance, Count, Duration, Calories |
| **Target** | The goal value | 100 (km), 20 (workouts) |
| **Period** | Time frame | Weekly, Monthly, Yearly |
| **Activity Filter** | Optional: only count specific types | Running, Cycling |

### Display Style (`style`)

| Option | Example |
|---|---|
| **Progress Bar** (default) | `🏃 Monthly Run Goal: 🟩🟩🟩🟩⬜ 78/100 km (78%)` |
| **Percentage** | `78% toward 100km monthly goal` |
| **Fraction** | `78/100 km` |

## Data Requirements

- Works with **any activity** from any source
- Tracks cumulative progress across all activities in the period

## How Content Appears

### On Strava (description)

```
🎯 Goal Progress
🏃 Monthly Run Goal: 🟩🟩🟩🟩⬜ 78/100 km (78%)
💪 Workouts This Month: 🟩🟩🟩⬜⬜ 15/20 (75%)
```

## Tier & Access

The Goal Tracker booster requires the **Athlete** (paid) tier.

## Common Issues

**Progress seems wrong** — Goals only track activities processed through FitGlue. Activities not routed through a pipeline with this booster won't count toward the goal.

**Goal reset unexpectedly** — Goals reset based on the configured period (weekly on Monday, monthly on the 1st). Check the period setting.

**Multiple activities on the same day** — All activities count individually. A morning run + evening gym session both contribute to your goals.

## Dependencies

- Requires **Athlete tier**
- No integration dependencies

## Related

- [Streak Tracker booster](/help/articles/registry/enrichers/streak-tracker)
- [Distance Milestones booster](/help/articles/registry/enrichers/distance-milestones)
- [Personal Records booster](/help/articles/registry/enrichers/personal-records)
