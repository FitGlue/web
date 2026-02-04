---
title: Running Dynamics booster — setup and troubleshooting
excerpt: Summarize Running Dynamics data (GCT, Stride, Vertical Oscillation)
date: 2026-02-04
category: registry
---

## Overview

The Running Dynamics booster automatically summarizes advanced running telemetry for compatible devices. Metrics included: **Ground Contact Time (GCT)** — how much time your foot spends on the ground; **Stride Length** — distance between each step; **Vertical Oscillation** — how much you "bounce" while running. The booster extracts telemetry from your activity file and appends a single-line summary to your activity description.

## Tier: Athlete Only

This booster is available **exclusively to Athlete-tier** users.

## Setup

1. Add the Running Dynamics booster to your pipeline.
2. No configuration required — it activates automatically when compatible data is present.

## Requirements

- Activity must contain running dynamics data (from compatible devices such as Garmin with running dynamics pod or compatible watch)
- Athlete tier subscription

## Output Example

```
👟 Running Dynamics:
Ground Contact Time: 242ms • Stride Length: 1.12m • Vertical Oscillation: 8.4cm
```

## Related

- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
