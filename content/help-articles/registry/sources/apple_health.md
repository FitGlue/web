---
title: Apple Health source — setup and troubleshooting
excerpt: Import workouts and health data from iOS devices into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Apple Health source imports workouts, heart rate data, and GPS routes directly from Apple Health on your iPhone or Apple Watch. FitGlue's mobile app syncs your health data seamlessly in the background, making this the primary source for iOS users who track activities with Apple Watch or any app that writes to Apple Health.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Activity name from Apple Health (usually the workout type) |
| **Activity type** | Mapped from Apple's workout type (Running, Cycling, Swimming, etc.) |
| **Start time & duration** | Full workout timestamps |
| **Distance** | Total distance (for outdoor activities) |
| **Calories** | Active and total calories from Apple's estimate |
| **Heart rate** | Wrist-based HR stream from Apple Watch |
| **GPS routes** | Full route coordinates for outdoor activities |
| **Elevation** | Altitude data from Apple Watch barometer |

### What is NOT available

- **Detailed strength exercise data** — Apple Health does not provide individual set/rep/weight details. For strength logging, use [Hevy source](/help/articles/registry/sources/hevy).
- **Power data** — Not available unless a power meter writes to Apple Health.
- **Cadence data** — Not consistently available through Apple Health's API.

### Sync mechanism

The FitGlue mobile app reads Apple Health data via the HealthKit API and performs **background sync** when the app is installed on your iOS device. Workouts sync automatically when you open the FitGlue app or in the background at regular intervals.

## Setup

1. **Install the FitGlue mobile app** from the App Store on your iOS device.
2. **Sign in** with your FitGlue account.
3. **Grant Apple Health permissions** when prompted — allow access to workouts, heart rate, and route data.
4. **Create a pipeline** — Add Apple Health as the source, add boosters, and set a target.

After setup, your Apple Watch workouts will begin syncing.

## Tier

Apple Health source is included in **Hobbyist** (free tier). No Athlete subscription required.

## Common Issues

**No activities syncing** — Apple Health data can only be accessed from the FitGlue mobile app on your physical iOS device. Make sure the app is installed, signed in, and has Apple Health permissions granted. Check Settings → Privacy → Health → FitGlue on your iPhone.

**Heart rate data missing** — Ensure your Apple Watch was worn during the activity and the workout was started via the Workout app (or an app that writes HR to Apple Health). Activities without a companion Apple Watch will not have HR data.

**GPS routes missing for indoor activities** — Apple Health only records GPS for outdoor activity types. Indoor workouts (treadmill, indoor cycling) will not have location data. Use [Virtual GPS](/help/articles/registry/enrichers/virtual-gps) to add a map to indoor activities.

**Background sync not working** — iOS restricts background app activity. Ensure FitGlue has "Background App Refresh" enabled in iOS Settings → FitGlue. Opening the app periodically also triggers a sync.

**Duplicate workouts** — If the same workout is written to Apple Health by multiple apps (e.g., your running app AND Apple Watch), both may sync. Use the [Activity Filter](/help/articles/registry/enrichers/activity-filter) booster or remove duplicate source apps from Apple Health.

## Dependencies

- **Required integration**: [Apple Health connection](/help/articles/registry/integrations/apple-health) (HealthKit via mobile app)
- **iOS device** with FitGlue mobile app installed

## Related

- [Connecting Apple Health](/help/articles/registry/integrations/apple-health)
- [Health Connect source (Android equivalent)](/help/articles/registry/sources/health_connect)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
