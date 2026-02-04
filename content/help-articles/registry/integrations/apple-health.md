---
title: Connecting Apple Health — setup and troubleshooting
excerpt: Sync workouts and health data from your iOS device
date: 2026-02-04
category: registry
---

## Overview

Apple Health is the centralized health data repository on iOS. FitGlue's mobile app reads your workout data from Apple Health and syncs it to the cloud. Workouts complete with heart rate data and GPS routes flow through your FitGlue pipeline for enhancement and distribution to destinations like Strava.

## Auth Type: App Sync

Apple Health data can only be accessed from the FitGlue mobile app on your iOS device. There is no web-based OAuth or API key.

## Setup

1. Download **FitGlue** from the App Store on your iOS device
2. Sign in with your FitGlue account
3. Grant access to Apple Health when prompted
4. Your workouts will sync automatically in the background

## Permissions

When prompted, grant FitGlue access to:
- Workouts
- Heart rate data
- GPS routes (for outdoor activities)

## Common Issues

**Workouts not syncing** — Ensure the FitGlue app has been opened recently. Background sync may be limited by iOS. Check Settings → Connections that Apple Health is connected.

**Missing data** — Verify the source workout in Apple Health contains the data you expect. Some apps may not write all fields.

## Related

- [Apple Health source](/help/articles/registry/sources/apple_health)
- [Health Connect](/help/articles/registry/integrations/health-connect) (Android equivalent)
