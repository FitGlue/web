---
title: Parkrun booster — configuration and troubleshooting
excerpt: Enrich your running activity with parkrun event results data.
date: 2026-02-08
category: registry
---

## Overview

The Parkrun booster enriches your running activity with data from your parkrun results — including finishing position, age grade, PB status, and event details. It matches your Saturday morning run to the parkrun results page and adds the race-specific stats to your activity description.

## Configuration

### Event Name (`event_name`)

Your home parkrun event name (e.g., "Colwick"). This is used to look up your results.

### Athlete ID (`athlete_id`)

Your parkrun athlete ID (the number on your barcode). Used to find your specific result from the event.

## Data Requirements

- **Parkrun connection** — See [Connecting Parkrun](/help/articles/registry/integrations/parkrun).
- The activity must have occurred on a **Saturday morning** (the standard parkrun time).
- Results are typically available 1–2 hours after the event.

## How Content Appears

### On Strava (description)

```
🏃 parkrun Results — Colwick parkrun #487
Position: 42 / 312
Time: 22:34
Age Grade: 68.2%
🏆 New PB!
```

### On Showcase

Formatted as a results card with visual elements.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No results found** — Results aren't published for 1–2 hours after the event. Wait and re-post the activity. Also check that your athlete ID is correct.

**Results from wrong event** — If you ran at a different location, update the `event_name` configuration or check that the booster supports event detection.

**PB not showing** — The PB flag comes from the parkrun website. If parkrun hasn't marked it as a PB, FitGlue can't either.

## Dependencies

- **Required integration**: [Parkrun connection](/help/articles/registry/integrations/parkrun)

## Related

- [Parkrun Results source](/help/articles/registry/sources/parkrun_results)
- [Connecting Parkrun](/help/articles/registry/integrations/parkrun)
- [Pace Summary booster](/help/articles/registry/enrichers/pace-summary)
