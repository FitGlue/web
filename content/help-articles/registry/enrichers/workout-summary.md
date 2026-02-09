---
title: Workout Summary booster — configuration and troubleshooting
excerpt: Automatically generate a detailed exercise-by-exercise summary in your activity description.
date: 2026-02-08
category: registry
---

## Overview

The Workout Summary booster generates a structured, human-readable breakdown of your workout directly in the activity description. For strength training, each exercise is listed with sets, reps, and weights. For cardio activities, summary stats are displayed. This is one of the most popular boosters, especially for users cross-posting Hevy workouts to Strava where the native description would otherwise be empty.

**Golden rule**: If your Strava description is empty or just says "Morning Run" and you want a rich exercise breakdown — this is the booster for you.

## Configuration

The Workout Summary booster has no configurable options. It automatically formats the workout data from your activity source into a clear, structured summary. The format adapts based on the data available:

- **Strength activities** (from Hevy): Lists each exercise with sets, reps, and weight values.
- **Cardio activities**: Shows key metrics like distance, pace, duration, and heart rate.
- **Mixed activities**: Combines both formats.

## Data Requirements

This booster requires activity data from a connected source. For the richest output:

- **Hevy source** — Produces detailed exercise/set/rep/weight breakdowns.
- **Strava / Garmin / Fitbit sources** — Produces metric summaries (distance, pace, HR).
- If no exercise data is available, the summary will be minimal.

## How Content Appears

### On Strava (description)

The summary appears as plain text in the activity description. Strava does not render markdown or formatting, so the booster uses line breaks and simple text formatting:

```
📋 Workout Summary

Bench Press
  3 × 10 @ 80kg
  1 × 8 @ 85kg

Incline Dumbbell Press
  3 × 12 @ 25kg

Tricep Pushdown
  3 × 15 @ 30kg

Duration: 52 min
```

### On Showcase

The summary is displayed with full formatting, section headers, and styled metric cards.

## Tier & Access

The Workout Summary booster is available on the **Hobbyist** (free) tier.

## Common Issues

**Empty summary** — The booster can only summarize data that exists. If your source provides no exercise details (e.g., a manually created Strava activity with no data), the summary will be empty or show only basic timing info. Switch to a richer source like Hevy for strength workouts.

**Exercise names look weird** — Exercise names come directly from your source. If you use custom names in Hevy (e.g., "Dave's Bench"), they'll appear as-is. This doesn't affect the summary quality.

**Summary is too long for Strava** — Strava has a 3000-character description limit. Very large workouts (20+ exercises) may be truncated. The booster prioritizes exercises in order, so the most important ones appear first.

**Summary formatting lost** — If you see the summary as a single line with no breaks, this usually indicates a rendering issue on the destination platform. Strava should render line breaks correctly. Contact support if formatting appears broken.

## Dependencies

- Requires activity data from any connected source
- Works best with **Hevy** for strength exercise breakdowns
- No integration dependencies

## Related

- [Hevy source](/help/articles/registry/sources/hevy)
- [Muscle Heatmap booster](/help/articles/registry/enrichers/muscle-heatmap)
- [AI Companion booster](/help/articles/registry/enrichers/ai-companion)
