---
title: Heart Rate Summary booster — configuration and troubleshooting
excerpt: Add heart rate statistics to your activity description.
date: 2026-02-08
category: registry
---

## Overview

The Heart Rate Summary booster adds a formatted section to your activity description with key heart rate statistics — average HR, max HR, minimum HR, and time in each heart rate zone. This turns raw HR data into a readable summary for your followers on Strava or visitors to your Showcase page.

## Configuration

### Show Zones (`show_zones`)

When enabled (default: **true**), includes time spent in each HR zone (Zone 1–5). When disabled, only shows avg/max/min HR.

### Zone Source (`zone_source`)

Where heart rate zone thresholds come from:

| Option | Behavior |
|---|---|
| **Default** | Standard age-based zones (220 - age) |
| **Custom** | You define zone thresholds manually |

### Zone Thresholds (`zone_thresholds`)

*Only visible when Zone Source = "Custom"*

Custom BPM boundaries for Zone 1–5. Example: `120, 140, 160, 175` (values represent the upper bound of each zone).

## Data Requirements

- **Heart rate data** must exist on the activity — either from the source (Strava, Garmin, Fitbit) or merged by another booster ([Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate), [FIT File Heart Rate](/help/articles/registry/enrichers/fit-file-heart-rate)).
- Without HR data, no output is produced.

## How Content Appears

### On Strava (description)

```
❤️ Heart Rate Summary
Average: 142 bpm | Max: 178 bpm
Zone 1 (Recovery):  🟦🟦⬜⬜⬜  8 min
Zone 2 (Aerobic):   🟩🟩🟩⬜⬜  15 min
Zone 3 (Tempo):     🟨🟨🟨🟨⬜  22 min
Zone 4 (Threshold): 🟧🟧⬜⬜⬜  7 min
Zone 5 (Max):       🟥⬜⬜⬜⬜  2 min
```

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No heart rate summary showing** — The activity has no HR data. Check your source or ensure an HR booster (Fitbit HR, FIT File HR) is placed before this booster in the pipeline.

**Zone calculations seem wrong** — Check your age in your FitGlue profile for correct default zone calculation. If using custom zones, verify the thresholds are in BPM and correctly ordered.

**Zone bars not displaying** — The emoji progress bars require platform support. Most modern platforms render them correctly. If not, consider the percentage display option.

## Dependencies

- Requires HR data on the activity
- Pairs with [Heart Rate Zones](/help/articles/registry/enrichers/heart-rate-zones)

## Related

- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
- [FIT File Heart Rate booster](/help/articles/registry/enrichers/fit-file-heart-rate)
