---
title: Connecting Apple Health — setup and troubleshooting
excerpt: How to connect Apple Health to FitGlue via the mobile app.
date: 2026-02-08
category: registry
---

## Overview

Apple Health connects to FitGlue via the **FitGlue mobile app** on iOS. This uses Apple's HealthKit framework, which only allows health data access from apps installed on the device. There is no web-based connection — you must install the FitGlue app from the App Store.

## Authentication Type

**App Sync** — HealthKit permissions requested within the FitGlue iOS app.

## Setup

1. **Install the FitGlue app** from the Apple App Store.
2. **Sign in** to your FitGlue account in the app.
3. **Grant HealthKit permissions** — The app will prompt you to allow access to workouts, heart rate, and route data. Enable all categories.
4. **Verify** — Your recent Apple Watch workouts should begin appearing in your FitGlue dashboard.

## Permissions Requested

- **Workouts** — Activity type, duration, distance, calories
- **Heart Rate** — HR samples during workouts
- **Workout Routes** — GPS coordinates for outdoor activities

## Common Issues

**"No HealthKit permissions"** — Go to iPhone Settings → Privacy & Security → Health → FitGlue and enable all categories. You may need to toggle them off and on if they were previously denied.

**Background sync not working** — Enable Background App Refresh for FitGlue in iPhone Settings → General → Background App Refresh. iOS aggressively restricts background activity for battery life.

**Old workouts not syncing** — The app syncs workouts incrementally. Very old workouts (before the app was installed) may require opening the app multiple times to trigger a full historical sync.

**No GPS routes** — Routes are only available for outdoor activities recorded with GPS (Apple Watch with GPS or connected phone GPS). Indoor workouts have no routes.

## Related

- [Apple Health as a source](/help/articles/registry/sources/apple_health)
- [Health Connect (Android equivalent)](/help/articles/registry/integrations/health-connect)
