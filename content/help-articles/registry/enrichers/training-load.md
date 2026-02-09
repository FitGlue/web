---
title: Training Load booster — configuration and troubleshooting
excerpt: Calculate and display training stress and load metrics for your activities.
date: 2026-02-08
category: registry
---

## Overview

The Training Load booster calculates TRIMP (Training Impulse) and other training stress metrics based on your heart rate data. It provides insight into how hard a workout was relative to your capacity and helps track cumulative training load over time. This is valuable for athletes who want to monitor training stress across platforms.

## Configuration

### Max Heart Rate (`max_hr`)

Your maximum heart rate in BPM. Default: **220 - age**. Affects TRIMP calculation accuracy.

### Resting Heart Rate (`resting_hr`)

Your resting heart rate in BPM. Default: **60**. Used in TRIMP calculation formula. A lower resting HR indicates higher fitness.

### Show Cumulative (`show_cumulative`)

When enabled, shows your rolling 7-day and 28-day training load alongside the single-session value.

## Data Requirements

- **Heart rate stream** — TRIMP requires second-by-second HR data. Summary HR is not sufficient.
- Session duration is also used in the calculation.

## How Content Appears

### On Strava (description)

```
📊 Training Load
TRIMP: 142 (Hard)
7-day Load: 485 | 28-day Load: 1,842
Estimated Recovery: 18–24 hours
```

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**TRIMP seems too high/low** — Check your `max_hr` and `resting_hr` values. Incorrect values dramatically affect the TRIMP calculation. Use actual measured values if possible.

**No training load data** — Requires HR stream data. Activities without heart rate don't produce TRIMP values.

**Cumulative load not showing** — Enable `show_cumulative`. Note that cumulative load requires historical data — it may not be accurate until you've processed several activities.

**Different TRIMP than my watch** — Different platforms use different TRIMP formulas. FitGlue uses the Banister TRIMP formula. Your watch may use a proprietary variant.

## Dependencies

- Requires HR stream data
- No integration dependencies

## Related

- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Recovery Advisor booster](/help/articles/registry/enrichers/recovery-advisor)
