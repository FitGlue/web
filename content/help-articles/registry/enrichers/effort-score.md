---
title: Effort Score booster — how it works and what it means
excerpt: Get a personal 0-100 difficulty rating for every workout based on your recent activity history.
date: 2026-02-09
category: registry
---

## Overview

The Effort Score booster rates every workout on a 0–100 scale relative to your own recent training. A score of 50 means "typical for you," while higher scores indicate harder efforts and lower scores indicate easier sessions.

Unlike TRIMP (Training Load), which measures absolute physiological stress, the Effort Score adapts to **your personal norms** — making it useful for understanding how a workout felt relative to what you've been doing recently.

## How It Works

The score combines five factors, weighted by importance:

| Factor | Weight | What It Measures |
|---|---|---|
| **Heart Rate** | 35% | How elevated your HR was vs. your average |
| **Pace** | 25% | How fast you went vs. your average speed |
| **Duration** | 20% | How long the session was vs. your average |
| **Elevation Gain** | 10% | How much climbing vs. your average |
| **Intensity (TRIMP)** | 10% | Overall training impulse vs. your average |

If a signal isn't available (e.g., no HR data from a strength workout), that factor's weight is redistributed proportionally across the remaining factors.

### Score Labels

| Score Range | Label |
|---|---|
| 0–30 | Easy |
| 31–50 | Moderate |
| 51–70 | Hard |
| 71–85 | Very Hard |
| 86–100 | All-Out |

## Data Requirements

- **Minimum 3 prior activities** — The booster needs history to establish your baseline. Until then, it silently builds your profile.
- **14-day rolling window** — Only your most recent 14 activities are used to calculate averages, so your baseline adapts as your fitness changes.

## How Content Appears

### On Strava (description)

```
💥 Effort Score: 72/100 (Hard)
• ❤️ HR: 1.15× avg
• 🏃 Pace: 1.08× avg
• ⏱️ Duration: 1.33× avg
• 📈 Harder than usual
```

## Configuration

No configuration needed — the Effort Score is fully automatic.

## Tier & Access

The Effort Score booster is available to **all tiers** (Hobbyist and Athlete).

## Common Issues

**"Insufficient history"** — This appears for the first 3 activities. Keep training and the score will activate automatically.

**Score seems wrong after a break** — If you take time off, your rolling averages will include the older activities. After 3–5 new activities, the baseline will recalibrate.

**No pace factor for strength workouts** — This is expected. Strength activities typically don't have pace data, so the score is calculated from the remaining factors (HR, duration, intensity).

## Related

- [Training Load booster](/help/articles/registry/enrichers/training-load)
- [Recovery Advisor booster](/help/articles/registry/enrichers/recovery-advisor)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
