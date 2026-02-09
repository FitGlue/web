---
title: Power Summary booster — configuration and troubleshooting
excerpt: Add power meter statistics to your cycling activities.
date: 2026-02-08
category: registry
---

## Overview

The Power Summary booster adds power meter statistics to your activity description — average power, normalized power, max power, and power zone distribution. This is essential for cyclists who train with power and want to share their wattage data with followers.

## Configuration

### FTP (`ftp`)

Your Functional Threshold Power in watts. Used to calculate power zones and IF (Intensity Factor). Default: **200W**. Update this to match your actual FTP for accurate zone calculations.

### Show Power Zones (`show_zones`)

When enabled (default: **true**), includes time spent in each power zone.

## Data Requirements

- **Power data from source** — Requires a power meter connected to your recording device (Garmin, Wahoo, etc.).
- Without power data, no output is produced.
- Power data from Strava's estimated power feature works but is less accurate than a physical power meter.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No output** — Activity has no power data. You need a power meter paired with your recording device.

**Power zones seem wrong** — Update your `ftp` value. An incorrect FTP shifts all zone boundaries.

**Normalized power higher than average** — This is normal. NP accounts for variability — a ride with lots of sprints and coasting will have higher NP than average power.

**Strava estimated power differs** — Strava estimates power using gradient and speed. This can differ significantly from actual power meter readings. The booster uses whatever power data the source provides.

## Dependencies

- Requires power data from source
- No integration dependencies

## Related

- [Speed Summary booster](/help/articles/registry/enrichers/speed-summary)
- [Cadence Summary booster](/help/articles/registry/enrichers/cadence-summary)
- [Training Load booster](/help/articles/registry/enrichers/training-load)
