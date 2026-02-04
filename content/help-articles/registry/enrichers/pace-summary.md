---
title: Pace Summary booster — setup and troubleshooting
excerpt: Adds avg/best pace stats (min/km) to the activity description
date: 2026-02-04
category: registry
---

## Overview

The Pace Summary booster automatically calculates and appends pace statistics to your activity description. When your activity has speed data (from GPS or sensors), this enricher converts speed to pace and adds a clean summary showing average and best pace in min/km format.

## Setup

1. Add the Pace Summary booster to your pipeline.
2. No configuration required — it activates automatically when speed data is present.

## Requirements

Activity must have speed data (typically from GPS for runs/rides).

## Output Example

```
⚡ Pace: 5:32/km avg • 4:45/km best
```

## Use Cases

- Quick pace overview on your activity feed
- Track running performance
- Share pace without complex stats

## Related

- [Speed Summary booster](/help/articles/registry/enrichers/speed-summary) (km/h)
- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
