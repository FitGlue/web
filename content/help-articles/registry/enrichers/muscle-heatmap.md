---
title: Muscle Heatmap booster — configuration and troubleshooting
excerpt: Add a visual breakdown of which muscle groups were activated in your workout.
date: 2026-02-08
category: registry
---

## Overview

The Muscle Heatmap booster analyses the exercises in your strength workout and generates a text-based representation of which muscle groups were activated and how intensely. This is output as part of the activity description — showing primary and secondary muscles hit, with configurable display formats ranging from emoji progress bars to percentage values or text labels.

Ideal for users who post strength workouts to Strava and want followers to see which muscles they worked at a glance.

## Configuration

### Style (`style`)

Controls how muscle activation is displayed. This is the core visual choice for the booster.

| Option | Example Output | Best For |
|---|---|---|
| **Emoji Bars** (default) | `Chest: 🟪🟪🟪🟪⬜ 80%` | Visual, eye-catching posts |
| **Percentage** | `Chest: 80%` | Clean, data-focused |
| **Text Only** | `High: Chest, Medium: Legs` | Minimal, compact summaries |

### Bar Length (`bar_length`)

*Only visible when Style = "Emoji Bars"*

Controls how many emoji squares make up each bar. Range: **3–10** (default: **5**).

- **Lower values (3–4)**: More compact, suitable for long exercise lists.
- **Higher values (8–10)**: More granular visual resolution, but takes up more space.

**Practical tip**: If your workouts typically hit 8+ muscle groups, use a bar length of 4–5 to keep the output compact. For targeted workouts (3–4 muscle groups), bar length of 7–8 provides better visual differentiation.

### Rollup (`rollup`)

When enabled, individual muscles are grouped into broader categories:

| Category | Included Muscles |
|---|---|
| **Arms** | Biceps, Triceps, Forearms |
| **Back** | Lats, Traps, Rhomboids, Lower Back |
| **Chest** | Pectorals |
| **Core** | Abs, Obliques |
| **Legs** | Quads, Hamstrings, Glutes, Calves |
| **Shoulders** | Front Delts, Lateral Delts, Rear Delts |

This is useful when you want a simpler summary (e.g., "Legs: 🟪🟪🟪🟪🟪") instead of listing every individual muscle.

## Data Requirements

- **Strength exercise data from source** — This booster needs exercise names with sets/reps/weights. The [Hevy source](/help/articles/registry/sources/hevy) is the primary provider of this data.
- Muscle mapping uses a database of 100+ canonical exercises with fuzzy matching for custom exercise names.
- **Without exercise data**, this booster produces no output (e.g., a plain Strava run has no exercises to map).

## How Content Appears

### On Strava (description)

```
💪 Muscle Heatmap

Chest:     🟪🟪🟪🟪⬜  80%
Triceps:   🟪🟪🟪⬜⬜  60%
Shoulders: 🟪🟪⬜⬜⬜  40%
Core:      🟪⬜⬜⬜⬜  20%
```

### On Showcase

Rendered with colored bars and larger visual presentation.

## Tier & Access

The Muscle Heatmap booster is available on the **Hobbyist** (free) tier.

## Common Issues

**All muscles showing 0% or no output** — This booster requires exercise data. If your activity comes from Strava or Garmin (which don't include exercise details), there are no exercises to map. Use the [Hevy source](/help/articles/registry/sources/hevy) for strength workouts.

**Unknown exercise mapped to wrong muscles** — FitGlue uses fuzzy matching against a database of 100+ exercises. Very unusual custom exercise names (e.g., "Dave's Special Move") may map incorrectly or fall back to generic muscle groups. Consider renaming exercises in Hevy to standard names for better accuracy.

**Heatmap is too long** — Workouts hitting many muscle groups produce lengthy output. Enable the **Rollup** option to consolidate individual muscles into categories, or switch to **Percentage** or **Text Only** style for more compact output.

**Bar length not changing** — The `bar_length` option only appears when `style` is set to "Emoji Bars". If you've selected Percentage or Text Only, bar length has no effect.

**Emoji bars rendering incorrectly** — Some platforms (older email clients, certain Android devices) may not render the colored square emojis correctly. Switch to Percentage style if you see broken characters.

## Dependencies

- Requires **exercise data from source** (Hevy recommended)
- Works in combination with [Workout Summary](/help/articles/registry/enrichers/workout-summary) — place Workout Summary first in your pipeline for best results
- Optionally pair with [Muscle Heatmap Image](/help/articles/registry/enrichers/muscle_heatmap_image) for a visual body diagram

## Related

- [Muscle Heatmap Image booster](/help/articles/registry/enrichers/muscle_heatmap_image)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
- [Hevy source](/help/articles/registry/sources/hevy)
