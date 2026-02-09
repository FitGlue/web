---
title: Location Naming booster — configuration and troubleshooting
excerpt: Add the location name to your activity based on GPS coordinates.
date: 2026-02-08
category: registry
---

## Overview

The Location Naming booster reverse-geocodes your activity's GPS start point and adds a human-readable location name to the description or title. "Morning Run" becomes "Morning Run — Victoria Embankment, London". This adds geographic context to your activities without manual effort.

## Configuration

### Display Position (`position`)

Where to show the location:

| Option | Example |
|---|---|
| **Title suffix** (default) | `Morning Run — Hyde Park, London` |
| **Description** | Location appears in the description text |

### Detail Level (`detail`)

| Option | Example |
|---|---|
| **Neighbourhood** | "Hyde Park" |
| **City** (default) | "Hyde Park, London" |
| **Full** | "Hyde Park, Westminster, London, UK" |

## Data Requirements

- **GPS data** — Activity must have coordinates for reverse geocoding.
- Without GPS, no location can be determined.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Wrong location name** — Reverse geocoding approximates based on the starting GPS point. If your activity starts in a car park or transition area, the name may reference a nearby street rather than the park or trail.

**No location added** — Activity has no GPS data. Indoor workouts, Hevy sessions, and file uploads without GPS won't get location data.

**Location is too generic** — Switch to a higher detail level. "Neighbourhood" is the most specific but may not always be available — it falls back to "City" when specific data isn't found.

## Dependencies

- Requires GPS data on the activity
- No integration dependencies (geocoding service built-in)

## Related

- [Weather booster](/help/articles/registry/enrichers/weather)
- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
