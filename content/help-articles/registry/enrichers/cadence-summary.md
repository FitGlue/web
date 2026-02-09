---
title: Cadence Summary booster — configuration and troubleshooting
excerpt: Add cadence statistics to your running or cycling activities.
date: 2026-02-08
category: registry
---

## Overview

The Cadence Summary booster adds cadence statistics to your activity description — average cadence, max cadence, and cadence distribution. For runners, cadence is steps per minute (SPM). For cyclists, it's pedal revolutions per minute (RPM). Higher cadence is generally associated with more efficient movement.

## Configuration

### Activity Type (`activity_type`)

| Option | Metric |
|---|---|
| **Running** (default) | Steps per minute (SPM) |
| **Cycling** | RPM (pedal revolutions) |

## Data Requirements

- **Cadence data from source** — Your device must record cadence. Most running watches (Garmin, Polar, Apple Watch) record step cadence. Cycling cadence requires a cadence sensor on your bike.
- Without cadence data, no output is produced.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No cadence data** — Not all devices record cadence. Check whether your source device supports it. Fitbit, for example, does not expose cadence through its API.

**Running cadence showing as RPM** — Check the `activity_type` setting. If set to Cycling, cadence is labelled as RPM even for running activities.

**Cadence seems low** — Some devices report "single-leg" cadence (actual ground contacts per foot per minute), while others report "double-leg" (total steps per minute). FitGlue uses the value as-provided by the source.

## Dependencies

- Requires cadence data from source
- No integration dependencies

## Related

- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
- [Running Dynamics booster](/help/articles/registry/enrichers/running-dynamics)
- [Speed Summary booster](/help/articles/registry/enrichers/speed-summary)
