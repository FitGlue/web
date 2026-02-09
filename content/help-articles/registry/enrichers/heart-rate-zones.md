---
title: Heart Rate Zones booster — configuration and troubleshooting
excerpt: Display time spent in each heart rate zone with visual progress bars.
date: 2026-02-08
category: registry
---

## Overview

The Heart Rate Zones booster analyses your heart rate stream and calculates time spent in each training zone (Zone 1 through Zone 5). It generates a visual breakdown with emoji progress bars showing the intensity distribution of your workout. This is particularly useful for endurance athletes who want to share their training zone distribution on Strava.

## Configuration

### Max Heart Rate (`max_hr`)

Your maximum heart rate in BPM. Default: calculated as **220 - age** (from your profile). Override this if you know your actual max HR from a lab test or field test.

**Practical tip**: Using the generic 220 - age formula can be inaccurate by ±10–15 BPM. If your zone data consistently looks wrong (e.g., you're always in Zone 5 despite feeling comfortable), you likely need a lower max HR value.

### Zone Model (`zone_model`)

| Option | Zone Boundaries |
|---|---|
| **5-Zone** (default) | Zones at 50%, 60%, 70%, 80%, 90% of max HR |
| **3-Zone** (simple) | Easy / Moderate / Hard |
| **Custom** | Define your own boundaries |

### Display Style (`style`)

| Option | Example |
|---|---|
| **Emoji Bars** (default) | `Zone 3: 🟨🟨🟨⬜⬜ 22 min` |
| **Percentage** | `Zone 3: 42% (22 min)` |
| **Time Only** | `Zone 3: 22 min` |

### Bar Length (`bar_length`)

*Only visible when Style = "Emoji Bars"*

Number of emoji squares per bar. Range: **3–10** (default: **5**).

## Data Requirements

- **Heart rate stream** — Second-by-second or higher resolution HR data required. Summary HR (avg/max only) is not sufficient for zone calculations.
- Sources like Garmin, Fitbit, and Strava typically provide HR streams. Hevy does not.

## How Content Appears

### On Strava (description)

```
💓 Heart Rate Zones
Zone 1 (Recovery):  🟦🟦⬜⬜⬜  12%
Zone 2 (Aerobic):   🟩🟩🟩🟩⬜  28%
Zone 3 (Tempo):     🟨🟨🟨🟨🟨  38%
Zone 4 (Threshold): 🟧🟧⬜⬜⬜  15%
Zone 5 (Max):       🟥⬜⬜⬜⬜   7%
```

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**All time in one zone** — Your `max_hr` is probably wrong. If set too high, all effort lands in Zone 1–2. If set too low, everything is Zone 4–5. Adjust your max HR based on actual testing.

**No output / "Insufficient HR data"** — The activity needs an HR stream, not just avg/max values. Sources that only provide summary HR won't work with this booster.

**Bar length not changing** — Only applies when Style = "Emoji Bars". No visual effect with Percentage or Time Only styles.

**Zone distribution doesn't match my watch** — Different platforms use different zone models. Your Garmin may use lactate-based zones while FitGlue defaults to percentage-of-max zones. Set up Custom zone boundaries to match your watch's zones if exact parity is important.

## Dependencies

- Requires HR stream data on the activity
- No integration dependencies

## Related

- [Heart Rate Summary booster](/help/articles/registry/enrichers/heart-rate-summary)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
- [Training Load booster](/help/articles/registry/enrichers/training-load)
