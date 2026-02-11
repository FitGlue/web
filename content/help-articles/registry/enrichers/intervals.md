---
title: Intervals booster — setup and troubleshooting
excerpt: Detect and summarize structured intervals from workout plans
date: 2026-02-11
category: registry
---

## Overview

The Intervals booster automatically detects structured interval data embedded in your FIT files and produces a formatted summary. It reads the `Intensity` field from each lap (warmup, active, recovery, cooldown) and, when available, the `WorkoutDefinition` from the Workout/WorkoutStep messages in the FIT file.

This booster is most useful for runners and cyclists who follow structured interval sessions pushed from platforms like Garmin Connect, TrainingPeaks, or watch-based workout builders. If your activity was recorded with a structured workout loaded on the device, the booster can detect it automatically.

The booster writes to the **description** only — it does not modify the title or activity metadata beyond its own status keys.

## Configuration

### Show All Intervals (`show_all_intervals`)

Controls whether every individual interval is listed underneath the grouped summary line.

| Value | Behaviour |
|---|---|
| **false** (default) | Repeated intervals are grouped: `💨 3×0:40 sprints: avg 3:43/km` |
| **true** | Each interval is listed individually beneath the group header |

When enabled, you'll see individual runs like:

```text
💨 3×0:40 sprints: avg 3:28/km, peak 162bpm
  💨 Run 1: 0:40 • 3:27/km • 193m (150bpm)
  💨 Run 2: 0:40 • 3:44/km • 178m (163bpm)
  💨 Run 3: 0:40 • 3:12/km • 208m (162bpm)
```

Most users should keep this **off** for clean summaries. Enable it when you want to review individual effort variation across sets.

### Show Progression (`show_progression`)

Controls whether a sprint fade or progression line is appended.

| Value | Behaviour |
|---|---|
| **true** (default) | Compares first and last active group pace: `📉 Sprint fade: 3:28 → 3:44/km (+8%)` |
| **false** | Omits the progression line |

If your pace improved across sets, the emoji switches to 📈 with a negative percentage. The line is only shown when there are at least two active groups.

### Show Summary (`show_summary`)

Controls whether the active vs recovery comparison line is shown.

| Value | Behaviour |
|---|---|
| **true** (default) | Shows `📊 Active vs Recovery: 4.42 m/s vs 2.23 m/s (1.98× ratio)` |
| **false** | Omits the summary line |

This is useful for seeing how much faster your work intervals are compared to your rest periods. The ratio gives a quick sense of effort contrast.

## Data Requirements

The booster requires **at least one lap with a non-empty `Intensity` field**. This data comes from FIT files that contain structured workout information.

- **FIT files from structured workouts** — Activities recorded with a workout loaded on a Garmin, Wahoo, or similar device will have intensity data on each lap. This is the primary use case.
- **Workout Definition (optional)** — If the FIT file contains `Workout` and `WorkoutStep` messages, the booster uses the workout name (e.g., "20min Sprints") as the section title. If absent, it falls back to "Structured Intervals."
- **Heart rate records (optional)** — If lap records contain heart rate data, average and peak HR are shown. If absent, HR is simply omitted.
- **Activities without intensity data** — The booster skips silently with `intervals_status: skipped` in metadata. This covers free-form activities, manual entries, and sources that don't provide structured lap intensities (Hevy, TCX files).

### Which sources provide this data?

| Source | Interval data available? |
|---|---|
| Garmin devices (FIT) | ✅ Yes — structured workouts with intensity and workout steps |
| Wahoo (FIT) | ✅ Yes — if a structured workout was loaded |
| Apple Watch (via FIT export) | ⚠️ Partial — depends on the workout app used |
| Strava | ❌ No — Strava's API doesn't expose lap intensity |
| Hevy | ❌ No — strength workouts don't have interval structure |
| Fitbit | ❌ No — Fitbit doesn't provide lap intensity data |

## Output & How Content Appears

The booster adds a dedicated section to the description under the `⏱️ Intervals:` header (Rule G40 compliant, so other boosters' sections are kept separate).

### Default output (grouped)

```text
⏱️ Intervals: 20min Sprints
🔥 Warmup: 5:00 • 5:47/km • 863m
💨 3×40s sprints: avg 3:28/km, peak 162bpm
💨 4×30s sprints: avg 3:47/km, peak 169bpm
💨 3×20s sprints: avg 3:18/km, peak 167bpm
❄️ Cooldown: 5:26 • 6:33/km • 772m
📊 Active vs Recovery: 4.42 m/s vs 2.23 m/s (1.98× ratio)
📉 Sprint fade: 3:28 → 3:44/km (+8%)
```

### Grouping logic

Active intervals with durations within ±25% of each other are grouped as repeats (e.g., `3×0:40`). If your intervals have varying durations (e.g., a ladder workout with 20s, 30s, 40s intervals), they'll appear as separate groups.

Warmup laps at the start and cooldown laps at the end are extracted and displayed separately. Recovery laps between active intervals are not listed individually but contribute to the active vs recovery summary.

### Metadata keys

The booster emits the following keys in enrichment metadata for use by data cards:

| Key | Example value | Description |
|---|---|---|
| `intervals_status` | `success` or `skipped` | Whether intervals were detected |
| `intervals_workout` | `20min Sprints` | Workout name |
| `intervals_active` | `10` | Number of active intervals |
| `intervals_recovery` | `9` | Number of recovery intervals |
| `intervals_total_laps` | `22` | Total laps with intensity data |

## Tier & Access

The Intervals booster is available to **all tiers** (Hobbyist and Athlete). No premium gate.

## Setup

1. Open the **FitGlue Dashboard** → **Pipelines**
2. Edit an existing pipeline or create a new one
3. In the **Boosters** section, find **Intervals** (⏱️ icon)
4. Click to add it — default configuration works well for most users
5. Optionally expand the config to toggle individual intervals, progression, or summary

### Recommended ordering

Place the Intervals booster **after** heart rate enrichers (FIT File Heart Rate, Fitbit Heart Rate) so that HR data is available in records when the booster calculates average and peak heart rates per interval.

## Common Issues

**No intervals detected** — This means your activity doesn't have structured lap intensity data. Only FIT files recorded with a structured workout loaded on the device will have this data. Free-form runs, manual laps, or activities from Hevy/Strava won't trigger the booster.

**Wrong workout name** — The name comes from the FIT file's `Workout` message. If no workout was loaded, it falls back to "Structured Intervals". The booster cannot rename workouts.

**Intervals not grouped as expected** — The grouping algorithm uses a ±25% duration similarity threshold. If your intervals have widely varying durations (e.g., a 30s sprint followed by a 60s sprint), they'll appear as separate groups rather than being merged.

**No heart rate data shown** — HR is shown only if the lap's records contain heart rate measurements. If your device didn't record HR, or if HR data hasn't been merged via the FIT File Heart Rate or Fitbit Heart Rate boosters, the HR columns will be omitted.

**Sprint fade seems inaccurate** — The fade is calculated by comparing the average speed of the first active group to the last active group. If your workout has different interval durations across groups (e.g., 40s sprints then 20s sprints), the comparison may not be meaningful — shorter intervals naturally have faster paces.

## Dependencies

- No required integrations — works with any FIT file source
- Works best after: [FIT File Heart Rate](/help/articles/registry/enrichers/fit-file-heart-rate) (for HR overlay)
- Complements: [Pace Summary](/help/articles/registry/enrichers/pace-summary), [Heart Rate Zones](/help/articles/registry/enrichers/heart-rate-zones)

## Related

- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary) — overall pace stats
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones) — time in each HR zone
- [Recovery Advisor booster](/help/articles/registry/enrichers/recovery-advisor) — recovery recommendations after hard intervals
- [Effort Score booster](/help/articles/registry/enrichers/effort-score) — relative workout difficulty
