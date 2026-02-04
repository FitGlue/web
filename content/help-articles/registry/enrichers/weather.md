---
title: Weather booster — setup and troubleshooting
excerpt: Adds weather conditions to outdoor activities
date: 2026-02-04
category: registry
---

## Overview

The Weather booster automatically adds weather conditions to your outdoor activities. When your activity has GPS data, this enricher fetches historical weather data from Open-Meteo for the exact time and location of your workout. It adds a clean summary showing temperature, weather conditions, and optionally wind information. Free API, no authentication required.

## Setup

1. Add the Weather booster to your pipeline.
2. Optional: **Include Wind** — Show wind speed and direction (default: true)
3. No API key or integration required.

## Config Options

| Field | Default | Description |
|-------|---------|-------------|
| Include Wind | true | Show wind speed and direction |

## Requirements

Activity must have GPS data (outdoor activities with location).

## Output Example

```
🌤️ Weather: 18°C, Partly Cloudy • Wind: 12 km/h W
```

## Use Cases

- Track weather conditions for training analysis
- Remember what the weather was like
- Share outdoor conditions on your activity feed

## Related

- [Location Naming booster](/help/articles/registry/enrichers/location_naming)
- [Elevation Summary booster](/help/articles/registry/enrichers/elevation-summary)
