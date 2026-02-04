---
title: Cadence Summary booster — setup and troubleshooting
excerpt: Adds avg/max cadence stats to the activity description
date: 2026-02-04
category: registry
---

## Overview

The Cadence Summary booster automatically calculates and appends cadence statistics to your activity description. When your activity has cadence data (from sensors), this enricher calculates avg/max cadence and adds a clean summary. Uses spm (steps per minute) for running activities and rpm for cycling.

## Setup

1. Add the Cadence Summary booster to your pipeline.
2. No configuration required — it activates automatically when cadence data is present.

## Requirements

Activity must have cadence data from a compatible device (running pod, cycling cadence sensor, etc.).

## Output Example

```
🦶 Cadence: 172 spm avg • 185 spm max
```

## Use Cases

- Track running cadence efficiency
- Monitor cycling cadence
- Analyze stride consistency

## Related

- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
- [Running Dynamics booster](/help/articles/registry/enrichers/running-dynamics) (GCT, stride, vertical oscillation)
