---
title: Location Naming booster — setup and troubleshooting
excerpt: Auto-generates activity titles from GPS location
date: 2026-02-04
category: registry
---

## Overview

The Location Naming booster gives your activities meaningful names based on where you exercised. When your activity has GPS data, it uses OpenStreetMap's Nominatim API to reverse geocode your starting location. It prioritizes parks and leisure venues, falling back to suburb or city names when no specific location is found. Instead of "Morning Run", get "Morning Run in Hyde Park".

## Setup

1. Add the Location Naming booster to your pipeline.
2. Configure:
   - **Mode** — Generate Title or Add to Description
   - **Title Template** — e.g., "{activity_type} in {location}" (for title mode)
   - **Use City Fallback** — Use city name if no park/leisure found (default: true)

## Config Options

| Field | Default | Description |
|-------|---------|-------------|
| Mode | title | Generate Title or Add to Description |
| Title Template | {activity_type} in {location} | Template for title mode |
| Use City Fallback | true | Fall back to city if no specific location |

## Requirements

Activity must have GPS data (outdoor activities).

## Use Cases

- Give runs and rides meaningful location names
- Track which parks and venues you visit
- Share location context on your activity feed

## Related

- [Virtual GPS booster](/help/articles/registry/enrichers/virtual-gps) (add GPS to indoor)
- [Weather booster](/help/articles/registry/enrichers/weather)
