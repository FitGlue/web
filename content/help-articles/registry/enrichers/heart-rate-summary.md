---
title: Heart Rate Summary booster — setup and troubleshooting
excerpt: Adds min/avg/max heart rate stats to the activity description
date: 2026-02-04
category: registry
---

## Overview

The Heart Rate Summary booster automatically calculates and appends heart rate statistics to your activity description. When your activity has heart rate data (from Fitbit, Apple Watch, or any source), this enricher analyzes all data points and adds a clean summary showing minimum, average, and maximum heart rates during the workout.

## Setup

1. Add the Heart Rate Summary booster to your pipeline.
2. No configuration required — it activates automatically when heart rate data is present.

## Requirements

Activity must have heart rate data. Use [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) or [FIT File Heart Rate](/help/articles/registry/enrichers/fit-file-heart-rate) to add HR to activities that lack it.

## Output Example

```
❤️ Heart Rate: 95 bpm min • 145 bpm avg • 178 bpm max
```

## Use Cases

- Quick HR overview on your activity feed
- Track training zones summary
- Share intensity without graphs

## Related

- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
- [Training Load booster](/help/articles/registry/enrichers/training-load) (TRIMP from HR)
