---
title: Calories Burned booster — configuration and troubleshooting
excerpt: Estimate calories burned using MET-based calculation for activities without calorie data.
date: 2026-02-08
category: registry
---

## Overview

The Calories Burned booster estimates the calories you burned during your activity using MET (Metabolic Equivalent of Task) values. It's designed for sources that don't provide calorie data (like Hevy) or when you want a standardized calorie estimate across all your activities regardless of source.

## Configuration

### Body Weight (`weight`)

Your body weight in kilograms. Used in the MET calculation: `calories = MET × weight × duration_hours`. Default: **70 kg**.

**Important**: This significantly affects accuracy. A 25% error in bodyweight produces a ~25% error in calorie estimates.

### Show Equivalents (`show_equivalents`)

When enabled (default: **true**), displays fun food equivalents alongside the calorie number (e.g., "≈ 1.7 slices of pizza 🍕"). This adds personality to your description.

## Data Requirements

- **Activity type and duration** — MET values are looked up based on activity type and intensity.
- Works with **any source** — doesn't require HR data (but HR-based estimates would be more accurate).

## How Content Appears

### On Strava (description)

```
🔥 Calories: 485 kcal
≈ 1.7 slices of pizza 🍕
≈ 2.4 beers 🍺
```

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Calorie estimate seems wrong** — Check your `weight` setting. MET-based estimation is inherently approximate (±20%). It doesn't account for fitness level, muscle mass, or individual metabolism.

**Overrides source calories** — If your source already provides calorie data, this booster may override it. Consider whether you want the source's estimate or the MET-based estimate.

**"Running" and "Trail Running" give different estimates** — Different activity types have different MET values. Trail running has a higher MET than flat running, which increases the calorie estimate.

**Food equivalents seem silly for serious athletes** — Disable `show_equivalents` for a cleaner, data-only output.

## Dependencies

- No integration dependencies
- Requires body weight to be set

## Related

- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
- [Heart Rate Summary booster](/help/articles/registry/enrichers/heart-rate-summary)
