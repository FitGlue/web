---
title: AI Banner booster — configuration and troubleshooting
excerpt: Generate a custom AI-powered banner image for your activity.
date: 2026-02-08
category: registry
---

## Overview

The AI Banner booster uses generative AI to create a unique, visually striking banner image for your activity. The banner is generated based on your activity type, metrics, and context (time of day, weather, location if available). This is a premium feature designed for users who want their activities to stand out with custom visual assets on Showcase or social media.

## Configuration

### Style (`style`)

Controls the visual style of the generated banner.

| Option | Description |
|---|---|
| **Dynamic** (default) | AI selects the best style based on activity context |
| **Minimalist** | Clean, simple designs with metric overlays |
| **Vibrant** | Bold colors and energetic compositions |
| **Photorealistic** | Attempts a realistic scene representing the activity |

### Include Metrics (`include_metrics`)

When enabled (default: **true**), key activity metrics (distance, time, pace, HR) are overlaid on the banner image. Set to **false** for a cleaner image without text overlays.

## Data Requirements

- Works with **any activity type** from any source
- Richer activities (with GPS, HR, weather data) produce more contextual and relevant banners
- Minimal activities (no GPS, no metrics) will produce more generic banner designs

## How Content Appears

### On Showcase

The AI Banner is displayed as the hero image at the top of your Showcase activity page. It creates a dramatic visual header for the shared activity.

### On Strava

Strava does not support programmatic image attachment. The banner is available on Showcase and can be downloaded for manual sharing.

## Tier & Access

The AI Banner booster requires the **Athlete** (paid) tier.

## Common Issues

**Banner looks generic** — The more data available (GPS, weather, HR, activity type), the more contextual the generated image. Activities with minimal data produce more generic results. Ensure you have a rich data source connected.

**Banner generation takes a long time** — AI image generation is computationally intensive. Banner creation may take 10–30 seconds. This does not block other boosters in your pipeline.

**Banner contains inaccurate text** — AI-generated text in images can sometimes contain errors (a known limitation of generative AI models). If the text overlay is problematic, try disabling `include_metrics` and relying on other boosters for text-based stats.

**No banner generated** — Check that you have an active Athlete subscription. This is a premium feature. Also verify that the pipeline completed successfully in your Dashboard.

## Dependencies

- Requires **Athlete tier**
- No integration dependencies
- Benefits from rich activity data (GPS, HR, weather)

## Related

- [Muscle Heatmap Image booster](/help/articles/registry/enrichers/muscle_heatmap_image)
- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
- [Weather booster](/help/articles/registry/enrichers/weather)
