---
title: Recovery Advisor booster — configuration and troubleshooting
excerpt: Get recovery time recommendations based on training load and activity intensity.
date: 2026-02-08
category: registry
---

## Overview

The Recovery Advisor booster analyses your workout intensity (using TRIMP/training load), recent training history, and activity type to recommend optimal recovery time. It adds a recovery estimate to your activity description, helping you plan rest days and avoid overtraining.

## Configuration

### Fitness Level (`fitness_level`)

| Option | Recovery Modifier |
|---|---|
| **Beginner** | Longer recovery times |
| **Intermediate** (default) | Standard recovery |
| **Advanced** | Shorter recovery times |

### Show Training Status (`show_status`)

When enabled, shows your current training status based on recent load:

| Status | Meaning |
|---|---|
| **Detraining** | Load is declining — consider training more |
| **Maintaining** | Load is stable |
| **Building** | Load is increasing — good progression |
| **Overreaching** | Load is very high — rest recommended |

## Data Requirements

- **Heart rate stream** — Required for TRIMP calculation
- **Activity duration** — Used in recovery estimation
- **Recent activity history** — The advisor considers your last 7–28 days of training

## How Content Appears

### On Strava (description)

```
💤 Recovery Advisor
Estimated Recovery: 18–24 hours
Training Status: Building 📈
Recommendation: Good to train again tomorrow with moderate intensity.
```

## Tier & Access

The Recovery Advisor booster requires the **Athlete** (paid) tier.

## Common Issues

**Recovery time seems too long/short** — Adjust your `fitness_level` setting. Also check your max HR and resting HR (used in TRIMP calculation) in the Training Load booster configuration.

**"Insufficient data"** — The advisor needs several activities with HR data to make accurate recommendations. After 1–2 weeks of regular activity, the recommendations stabilize.

**Multiple activities on same day not accumulating** — Each activity is assessed independently. The cumulative daily load accounts for all activities, but the most recently processed one displays the recommendation.

**Training status always shows "Building"** — This can happen if you have consistently increasing training volume. It's a correct assessment in that case.

## Dependencies

- Requires HR stream data for TRIMP calculation
- Requires **Athlete tier**
- Benefits from consistent activity history (1–2 weeks minimum)

## Related

- [Training Load booster](/help/articles/registry/enrichers/training-load)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Streak Tracker booster](/help/articles/registry/enrichers/streak-tracker)
