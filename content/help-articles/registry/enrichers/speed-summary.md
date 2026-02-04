---
title: Speed Summary booster — setup and troubleshooting
excerpt: Adds avg/max speed stats (km/h) to the activity description
date: 2026-02-04
category: registry
---

## Overview

The Speed Summary booster automatically calculates and appends speed statistics to your activity description. When your activity has speed data (from GPS or sensors), this enricher calculates avg/max speed and adds a clean summary in km/h format.

## Setup

1. Add the Speed Summary booster to your pipeline.
2. No configuration required — it activates automatically when speed data is present.

## Requirements

Activity must have speed data (typically from GPS).

## Output Example

```
🚀 Speed: 28.5 km/h avg • 42.1 km/h max
```

## Use Cases

- Quick speed overview on your activity feed
- Track cycling speed
- Monitor activity performance

## Related

- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary) (min/km for running)
- [Power Summary booster](/help/articles/registry/enrichers/power-summary)
