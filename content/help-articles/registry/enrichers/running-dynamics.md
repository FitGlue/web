---
title: Running Dynamics booster — configuration and troubleshooting
excerpt: Add advanced running form metrics to your activity description.
date: 2026-02-08
category: registry
---

## Overview

The Running Dynamics booster adds advanced running form metrics to your activity description — ground contact time (GCT), vertical oscillation, stride length, and ground contact time balance. These metrics help runners understand their form efficiency and identify areas for improvement.

## Configuration

### Show Comparison (`show_comparison`)

When enabled, compares your dynamics against optimal ranges for your pace. For example: "GCT 235ms (optimal: 200–250ms for your pace ✅)".

## Data Requirements

- **Running dynamics data from source** — Requires a device that records these metrics:
  - **Garmin** with HRM-Run, HRM-Pro, or Running Dynamics Pod
  - **Garmin Forerunner/Fenix** watches with built-in accelerometer
  - **FIT file uploads** with dynamics data
- Most other sources (Strava, Fitbit, Apple Watch, Polar) do NOT provide these metrics.

## How Content Appears

### On Strava (description)

```
🏃 Running Dynamics
Ground Contact Time: 235ms
Vertical Oscillation: 7.2cm
Stride Length: 1.12m
GCT Balance: 49.8% L / 50.2% R ✅
```

## Tier & Access

The Running Dynamics booster requires the **Athlete** (paid) tier.

## Common Issues

**No dynamics data** — This is the most common issue. Running dynamics require specific hardware (Garmin HRM-Pro, Running Dynamics Pod). Standard wrist-based watches don't provide these metrics.

**GCT/Oscillation seems wrong** — Readings can be affected by HRM strap placement, running surface, and fatigue. Data from chest straps is more accurate than wrist-based estimates.

**Data only shows for some runs** — Check that the dynamics accessory was paired and active for every run. If you forget the HRM-Pro, no dynamics data is recorded.

## Dependencies

- Requires running dynamics data from source (Garmin + compatible accessory)
- Requires **Athlete tier**

## Related

- [Garmin source](/help/articles/registry/sources/garmin)
- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
