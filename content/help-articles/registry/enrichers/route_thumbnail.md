---
title: Route Thumbnail booster — configuration and troubleshooting
excerpt: Generate a map image of your activity route for visual display.
date: 2026-02-08
category: registry
---

## Overview

The Route Thumbnail booster generates a styled map image of your activity's GPS route. The route is rendered as a colored line on a satellite or street map background, creating a visually appealing route preview. This image appears on your Showcase page and can be used as a visual asset wherever images are supported.

## Configuration

The Route Thumbnail booster has no user-configurable options. The map style, zoom level, and line color are automatically optimized based on the route geometry and activity type.

## Data Requirements

- **GPS data from source** — The activity must contain GPS coordinates. Activities from GPS-equipped devices (Garmin, Strava, Apple Watch, Polar) work perfectly.
- **No GPS = no thumbnail** — Indoor activities (treadmill, indoor cycling, gym workouts) and sources without GPS (Hevy, Oura) will not produce a route thumbnail.
- Use [Virtual GPS](/help/articles/registry/enrichers/virtual-gps) to add a synthetic route to indoor activities if you want a map visual.

## How Content Appears

### On Showcase

The route map image is displayed prominently on the Showcase activity page. It shows the full route with start/end markers.

### On Strava

Strava already generates its own route map, so the route thumbnail is primarily useful for Showcase. The generated image can be downloaded and used for social media sharing.

## Tier & Access

The Route Thumbnail booster is available on the **Hobbyist** (free) tier.

## Common Issues

**No map generated** — The activity has no GPS data. Check whether your source device recorded GPS (some indoor workouts or budget devices don't have GPS).

**Map appears zoomed too far out** — This can happen with activities that have outlier GPS points (e.g., GPS glitches at the start or end). These are usually transient GPS accuracy issues from the recording device.

**Map appears blank or grey** — The map tile server may have had a temporary issue during image generation. Re-running the pipeline (via re-post) should regenerate the image.

**Route line looks jagged** — This reflects the GPS accuracy of your recording device. Wrist-based GPS (most watches) has lower accuracy than phone GPS or dedicated bike computers, especially in areas with tall buildings or dense tree cover.

## Dependencies

- Requires **GPS data** in the activity
- No integration dependencies

## Related

- [Virtual GPS booster](/help/articles/registry/enrichers/virtual-gps) (for indoor activities)
- [AI Banner booster](/help/articles/registry/enrichers/ai_banner)
- [Elevation Summary booster](/help/articles/registry/enrichers/elevation-summary)
