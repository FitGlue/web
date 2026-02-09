---
title: Virtual GPS booster — configuration and troubleshooting
excerpt: Add a visual map route to indoor activities that have no GPS data.
date: 2026-02-08
category: registry
---

## Overview

The Virtual GPS booster generates a synthetic GPS route for indoor activities that have no location data. Treadmill runs, indoor cycling sessions, and gym workouts can all receive a visual map by tracing a real-world route near your location. This gives otherwise map-less activities a route preview on destination platforms.

## Configuration

### Location (`location`)

Your default location, used as the starting point for generating the route. You can set a city or address, and the route will be generated in that area.

### Distance Matching (`distance_matching`)

When enabled (default: **true**), the generated route matches the activity's recorded distance. A 5km treadmill run gets a 5km route on the map. When disabled, a standard-length loop route is generated.

## Data Requirements

- Works with **any activity that has no GPS data**
- If GPS data already exists, this booster is skipped (it does not overwrite existing routes)
- Distance data is used for distance matching when available

## How Content Appears

### On Strava

Strava displays the generated route as a map on the activity. The activity appears to have been done outdoors with the generated route. Note: Strava may flag suspicious GPS data if the route doesn't match the activity type expectations.

### On Showcase

The route map image appears on the Showcase page as if it were a real outdoor route.

## Tier & Access

The Virtual GPS booster is available on the **Hobbyist** (free) tier.

## Common Issues

**Route appears in wrong location** — Check your configured Location setting. If not set, the route defaults to a generic area. Update your location in the booster configuration.

**Route distance doesn't match activity distance** — Ensure Distance Matching is enabled. Without it, a standard loop is generated regardless of actual activity distance.

**Route overwrites real GPS** — The booster is designed to skip activities that already have GPS data. If you're seeing unexpected behavior, check whether the source is correctly providing GPS coordinates.

## Dependencies

- No integration dependencies
- Optional: Location setting for route placement

## Related

- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
- [Location Naming booster](/help/articles/registry/enrichers/location_naming)
