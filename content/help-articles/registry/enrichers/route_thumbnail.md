---
title: Route Thumbnail booster — setup and troubleshooting
excerpt: Generates a stunning SVG map image of your GPS route
date: 2026-02-04
category: registry
---

## Overview

The Route Thumbnail booster creates a beautiful stylized SVG map of your GPS route. FitGlue extracts GPS coordinates, simplifies the route using the Douglas-Peucker algorithm, and generates a stunning SVG with FitGlue's signature gradient colors and animated start/finish markers. The image is stored in Cloud Storage and automatically embedded in your Showcase page.

## Tier: Athlete Only

This premium visual enricher is available **exclusively to Athlete-tier** users.

## Setup

1. Add the Route Thumbnail booster to your pipeline.
2. No configuration required — it activates automatically for activities with GPS data.
3. The generated SVG appears in your Showcase and as a shareable asset.

## Requirements

- Activity must have GPS data (outdoor runs, rides, etc.)
- Athlete tier subscription

## Common Issues

**No image generated** — Ensure your activity has GPS coordinates. Indoor activities won't produce a route.

**"Premium feature"** — Upgrade to Athlete tier to use this booster.

## Related

- [Showcase destination](/help/articles/registry/destinations/showcase)
- [Virtual GPS booster](/help/articles/registry/enrichers/virtual-gps) (adds GPS to indoor activities)
