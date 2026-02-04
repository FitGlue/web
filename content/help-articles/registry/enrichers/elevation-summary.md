---
title: Elevation Summary booster — setup and troubleshooting
excerpt: Calculates elevation gain, loss, and maximum altitude from activity records
date: 2026-02-04
category: registry
---

## Overview

The Elevation Summary booster automatically calculates and appends elevation statistics to your activity description. When your activity contains altitude data (from GPS tracks or barometric sensors), this enricher calculates total ascent (gain), total descent (loss), and maximum altitude reached. Zero or negative altitude records are filtered for accurate calculations.

## Setup

1. Add the Elevation Summary booster to your pipeline.
2. No configuration required — it activates automatically when altitude data is present.

## Requirements

Activity must have altitude data (typically from GPS or barometric altimeter on outdoor activities).

## Output Example

```
⛰️ Elevation: +342m gain • -289m loss • 1,245m max
```

## Use Cases

- Hilly runs and rides
- Mountain hiking and climbing
- Track total effort on vertical terrain

## Related

- [Weather booster](/help/articles/registry/enrichers/weather) (adds weather to outdoor activities)
- [Location Naming booster](/help/articles/registry/enrichers/location_naming)
