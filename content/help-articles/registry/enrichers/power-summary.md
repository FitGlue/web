---
title: Power Summary booster — setup and troubleshooting
excerpt: Adds avg/max power stats (watts) to the activity description
date: 2026-02-04
category: registry
---

## Overview

The Power Summary booster automatically calculates and appends power statistics to your activity description. When your activity has power data (from a power meter), this enricher calculates avg/max power and adds a clean summary in watts. Perfect for cyclists with power meters.

## Setup

1. Add the Power Summary booster to your pipeline.
2. No configuration required — it activates automatically when power data is present.

## Requirements

Activity must have power data from a power meter (typically cycling activities).

## Output Example

```
⚡ Power: 245W avg • 380W max
```

## Use Cases

- Quick power overview on your activity feed
- Track cycling power output
- Share power stats easily

## Related

- [Training Load booster](/help/articles/registry/enrichers/training-load) (TRIMP from HR)
- [Speed Summary booster](/help/articles/registry/enrichers/speed-summary)
