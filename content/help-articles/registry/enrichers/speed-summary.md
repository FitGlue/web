---
title: Speed Summary booster — configuration and troubleshooting
excerpt: Add speed statistics to your cycling, running, or other activities.
date: 2026-02-08
category: registry
---

## Overview

The Speed Summary booster adds speed statistics — average speed, max speed, and speed distribution — to your activity description. This is preferred over pace for cycling activities but works for any sport.

## Configuration

### Unit (`unit`)

| Option | Display |
|---|---|
| **km/h** (default) | Speed in kilometres per hour |
| **mph** | Speed in miles per hour |

## Data Requirements

- **Speed or distance + time data** — Calculated from GPS stream or provided by source.
- Works best with outdoor activities that have GPS tracking.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Speed seems wrong** — Check the unit setting. Also note that average speed includes any stopped time unless the source differentiates between elapsed and moving time.

**No output** — Activity has no speed or distance data. Indoor activities without distance tracking won't produce output.

## Dependencies

- No integration dependencies

## Related

- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
- [Power Summary booster](/help/articles/registry/enrichers/power-summary)
