---
title: Training Load booster — setup and troubleshooting
excerpt: Calculates Training Impulse (TRIMP) from heart rate data
date: 2026-02-04
category: registry
---

## Overview

The Training Load booster calculates your Training Impulse (TRIMP) using the scientifically validated Banister Formula. FitGlue analyzes your heart rate stream, calculates Heart Rate Reserve (HRR), and applies the Banister Formula (weighted for gender) to determine total TRIMP. The load is categorized into Effort Zones from Recovery to Very Hard. TRIMP is cumulative — a long easy session can equal a short intense one in total load.

## Setup

1. Add the Training Load booster to your pipeline.
2. Optional config (improves accuracy):
   - **Max Heart Rate** — Your maximum HR (default: 190)
   - **Resting Heart Rate** — Your resting HR (default: 60)
   - **Gender** — Male or Female (for TRIMP coefficient)

## Config Options

| Field | Default | Description |
|-------|---------|-------------|
| Max Heart Rate | 190 | Your max HR |
| Resting Heart Rate | 60 | Your resting HR |
| Gender | male | Used for Banister coefficient |

## Requirements

Activity must have heart rate data. Use [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) or [FIT File Heart Rate](/help/articles/registry/enrichers/fit-file-heart-rate) if needed.

## Output Example

```
💪 Training Load: 142 (Hard)
```

## Use Cases

- Track total training stress on your activity feed
- Compare intensity between different activities
- Monitor recovery needs based on load

## Related

- [Heart Rate Summary booster](/help/articles/registry/enrichers/heart-rate-summary)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
