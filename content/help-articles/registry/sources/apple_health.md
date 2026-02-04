---
title: Apple Health source — setup and troubleshooting
excerpt: Import workouts and health data from iOS devices
date: 2026-02-04
category: registry
---

## Overview

The Apple Health source imports workouts, heart rate data, and GPS routes directly from Apple Health on your iPhone or Apple Watch. FitGlue's mobile app syncs your health data seamlessly. When you complete a workout, it flows through your FitGlue pipeline for enrichment and distribution.

## Setup

1. **Install the FitGlue mobile app** — Download FitGlue from the App Store on your iOS device.
2. **Connect Apple Health** — See [Connecting Apple Health](/help/articles/registry/integrations/apple-health).
3. **Grant access** — When prompted, grant FitGlue access to Apple Health (workouts, heart rate, routes).
4. **Create a pipeline** — Add Apple Health as the source, then add boosters and targets.

## Auth Type: App Sync

Apple Health data can only be accessed from the FitGlue mobile app running on your iOS device. There is no web-based OAuth or API key — the app reads directly from HealthKit and syncs to the cloud.

## Common Issues

**Workouts not appearing** — Ensure the FitGlue app has been opened recently so background sync can run. Check Settings → Connections that Apple Health is connected.

**Missing heart rate or GPS** — Verify the source workout in Apple Health contains that data. Some indoor workouts may not have GPS.

## Related

- [Connecting Apple Health](/help/articles/registry/integrations/apple-health)
- [Health Connect source](/help/articles/registry/sources/health_connect) (Android equivalent)
