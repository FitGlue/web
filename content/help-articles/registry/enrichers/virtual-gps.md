---
title: Virtual GPS booster — setup and troubleshooting
excerpt: Adds GPS coordinates from a virtual route to indoor activities
date: 2026-02-04
category: registry
---

## Overview

The Virtual GPS booster adds GPS coordinates to indoor activities so they appear with a map on your activity feed. Choose from preset routes in famous locations like London's Hyde Park (~4km loop) or NYC's Central Park (~10km loop). The route is scaled to match your workout duration, giving your indoor session a scenic virtual location.

## Setup

1. Add the Virtual GPS booster to your pipeline.
2. Configure:
   - **Route** — London Hyde Park or NYC Central Park
   - **Force Override** — Override existing GPS data if present (default: false)
3. Activities without GPS (or with override enabled) get the virtual route.

## Config Options

| Field | Options |
|-------|---------|
| Route | London Hyde Park (~4km), NYC Central Park (~10km) |
| Force Override | Override existing GPS |

## Use Cases

- Get indoor activities on your activity heatmap
- Add visual interest to home gym sessions
- Virtual touring while on the treadmill

## Common Issues

**Route not applied** — If the activity already has GPS and Force Override is false, the booster won't change it. Set Force Override to true to replace existing GPS.

## Related

- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail) (generates map image from GPS)
- [Location Naming booster](/help/articles/registry/enrichers/location_naming) (names activities by location)
