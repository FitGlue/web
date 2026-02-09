---
title: Health Connect source — setup and troubleshooting
excerpt: Import workouts and health data from Android devices into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Health Connect source imports workouts, heart rate data, and GPS routes from Android Health Connect. FitGlue's mobile app syncs your health data from any compatible fitness tracker or app, making this the primary source for Android users who track activities with Samsung, Garmin, Fitbit, or any Health Connect-compatible wearable.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Workout name from Health Connect |
| **Activity type** | Mapped from Health Connect's exercise type |
| **Start time & duration** | Full workout timestamps |
| **Distance** | Total distance (for outdoor activities) |
| **Calories** | Calorie estimates from the source device |
| **Heart rate** | HR stream from the connected wearable |
| **GPS routes** | Route coordinates for outdoor activities |

### What is NOT available

- **Detailed strength exercise data** — Health Connect does not provide individual set/rep/weight details. Use [Hevy source](/help/articles/registry/sources/hevy) for strength.
- **Power data** — Not consistently available through Health Connect.
- **Running dynamics** — GCT, stride length, and vertical oscillation are not provided.

### Sync mechanism

The FitGlue mobile app reads Health Connect data and performs **background sync** on your Android device.

## Setup

1. **Install the FitGlue mobile app** from the Google Play Store.
2. **Sign in** with your FitGlue account.
3. **Grant Health Connect permissions** when prompted.
4. **Create a pipeline** — Add Health Connect as the source.

## Tier

Health Connect source is included in **Hobbyist** (free tier). No Athlete subscription required.

## Common Issues

**No activities syncing** — Health Connect data can only be accessed from the FitGlue mobile app on your Android device. Ensure the app is installed and Health Connect permissions are granted. You may also need to ensure the Health Connect app itself is installed and that your wearable is writing data to it.

**Heart rate data missing** — Ensure your wearable was actively recording during the activity. Some wearables only write summary HR (avg/max) rather than a stream.

**Wrong activity type** — Health Connect types are determined by the source app. Use the [Type Mapper](/help/articles/registry/enrichers/type-mapper) booster to correct misclassified activities.

**"Health Connect not found"** — On older Android versions, you may need to install the Health Connect app separately from the Play Store. On Android 14+, it's built-in.

**Background sync not working** — Check that FitGlue has the necessary background permissions in Android Settings. Some manufacturers (Samsung, Xiaomi, Huawei) aggressively kill background apps — you may need to whitelist FitGlue from battery optimization.

## Dependencies

- **Required integration**: [Health Connect connection](/help/articles/registry/integrations/health-connect) (via mobile app)
- **Android device** with FitGlue mobile app installed

## Related

- [Connecting Health Connect](/help/articles/registry/integrations/health-connect)
- [Apple Health source (iOS equivalent)](/help/articles/registry/sources/apple_health)
