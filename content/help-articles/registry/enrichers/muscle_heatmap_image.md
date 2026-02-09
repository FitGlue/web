---
title: Muscle Heatmap Image booster — configuration and troubleshooting
excerpt: Generate a visual body diagram showing muscle activation from your workout.
date: 2026-02-08
category: registry
---

## Overview

The Muscle Heatmap Image booster generates a body diagram image where muscles are color-coded based on activation intensity from your workout. Unlike the text-based [Muscle Heatmap](/help/articles/registry/enrichers/muscle-heatmap) booster, this version creates an actual image asset that appears on your Showcase page as a visual body diagram. This is a premium feature designed for users who want a professional-looking visual representation of their strength training.

## Configuration

The Muscle Heatmap Image booster has no user-configurable options. The image is auto-generated based on the exercise data in your activity, using the same muscle mapping database as the text-based Muscle Heatmap booster.

## Data Requirements

- **Strength exercise data from source** — Requires exercise names with sets/reps/weights, typically from the [Hevy source](/help/articles/registry/sources/hevy).
- Muscle mapping uses fuzzy matching against 100+ canonical exercises.
- Without exercise data, no image is generated.

## How Content Appears

### On Showcase

A colour-coded body diagram image is embedded directly in the Showcase activity page. Muscles are shaded from light (low activation) to dark (high activation). Both front and rear body views are included. The image is generated server-side and stored as a visual asset.

### On Strava

Strava does not support embedded images in descriptions. The heatmap image is available via the Showcase link. Users can download the image and manually attach it to their Strava activity photos.

## Tier & Access

The Muscle Heatmap Image booster requires the **Athlete** (paid) tier.

## Common Issues

**No image generated** — Like the text heatmap, this booster requires exercise data. Activities from Strava or Garmin without exercise details will not produce an image.

**Image not visible on Strava** — Strava's API doesn't support image attachment in descriptions. The image is only visible on your Showcase page. You can download it from Showcase and manually add it to your Strava photos.

**Image quality / resolution** — The generated image is optimized for web and mobile display. It is not print-quality resolution but is perfectly clear on screen.

**Muscles appear under-represented** — Custom exercise names may map to fewer muscle groups than expected. Use standard exercise names in Hevy for the most accurate mapping.

## Dependencies

- Requires **exercise data from source** (Hevy recommended)
- Works alongside the text-based [Muscle Heatmap](/help/articles/registry/enrichers/muscle-heatmap) booster — you can use both in the same pipeline
- Requires **Athlete tier**

## Related

- [Muscle Heatmap booster](/help/articles/registry/enrichers/muscle-heatmap) (text version)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
- [AI Banner booster](/help/articles/registry/enrichers/ai_banner)
- [Hevy source](/help/articles/registry/sources/hevy)
