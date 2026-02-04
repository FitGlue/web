---
title: Health Connect source — setup and troubleshooting
excerpt: Import workouts and health data from Android devices
date: 2026-02-04
category: registry
---

## Overview

The Health Connect source imports workouts, heart rate data, and GPS routes from Android Health Connect. FitGlue's mobile app syncs your health data from any compatible fitness tracker or app. Workouts are automatically synced in the background and flow through your FitGlue pipeline.

## Setup

1. **Install the FitGlue mobile app** — Download FitGlue from the Google Play Store on your Android device.
2. **Connect Health Connect** — See [Connecting Health Connect](/help/articles/registry/integrations/health-connect).
3. **Grant access** — When prompted, grant FitGlue access to Health Connect (workouts, heart rate, routes).
4. **Create a pipeline** — Add Health Connect as the source, then add boosters and targets.

## Auth Type: App Sync

Health Connect data can only be accessed from the FitGlue mobile app running on your Android device. There is no web-based OAuth or API key — the app reads directly from Health Connect and syncs to the cloud.

## Compatible Devices

Works with any Health Connect-compatible device or app: Garmin, Samsung, Fitbit, and many others that write to Health Connect.

## Common Issues

**Workouts not appearing** — Ensure the FitGlue app has been opened recently so background sync can run. Check that your fitness app is writing to Health Connect.

**Missing data** — Verify the source workout in Health Connect contains the data you expect. Some apps may not export all fields.

## Related

- [Connecting Health Connect](/help/articles/registry/integrations/health-connect)
- [Apple Health source](/help/articles/registry/sources/apple_health) (iOS equivalent)
