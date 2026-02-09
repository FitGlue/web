---
title: Weather booster — configuration and troubleshooting
excerpt: Add weather conditions at the time and location of your activity.
date: 2026-02-08
category: registry
---

## Overview

The Weather booster fetches historical weather data for the time and location of your activity and adds it to the description. Temperature, conditions (sunny, rain, overcast), wind speed, and humidity are displayed, giving context about the conditions you trained in.

## Configuration

### Unit (`unit`)

| Option | Display |
|---|---|
| **Metric** (default) | °C, km/h wind |
| **Imperial** | °F, mph wind |

### Detail Level (`detail`)

| Option | Included |
|---|---|
| **Basic** (default) | Temperature, conditions |
| **Full** | Temperature, conditions, humidity, wind speed/direction, feels-like |

## Data Requirements

- **GPS data** — Location is needed to look up weather. Activities without GPS won't get weather data.
- **Timestamp** — Used to fetch historical weather for the correct time.

## How Content Appears

### On Strava (description)

```
🌤️ Weather: 18°C, Partly Cloudy
Humidity: 65% | Wind: 12 km/h NW
Feels Like: 16°C
```

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No weather data** — Activity has no GPS. Indoor workouts, Hevy sessions, and activities without location can't get weather.

**Weather seems wrong** — Weather data is sourced from the nearest weather station. In remote areas, the nearest station may be far away and conditions can differ.

**Weather in wrong units** — Check the `unit` setting matches your preference.

## Dependencies

- Requires GPS data on the activity
- No integration dependencies (weather API is built-in)

## Related

- [Location Naming booster](/help/articles/registry/enrichers/location_naming)
- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
