---
title: Connecting Health Connect — setup and troubleshooting
excerpt: Sync workouts and health data from your Android device
date: 2026-02-04
category: registry
---

## Overview

Health Connect is Android's unified health data platform. FitGlue's mobile app reads your workout data from Health Connect and syncs it to the cloud. Workouts from Garmin, Samsung, Fitbit, and other compatible devices flow through your FitGlue pipeline for enhancement and distribution.

## Auth Type: App Sync

Health Connect data can only be accessed from the FitGlue mobile app on your Android device. There is no web-based OAuth or API key.

## Setup

1. Download **FitGlue** from the Google Play Store on your Android device
2. Sign in with your FitGlue account
3. Grant access to Health Connect when prompted
4. Your workouts will sync automatically in the background

## Compatible Devices

Works with any Health Connect-compatible device or app: Garmin, Samsung, Fitbit, and many others that write to Health Connect.

## Common Issues

**Workouts not syncing** — Ensure the FitGlue app has been opened recently. Check that your fitness app is writing to Health Connect.

**Missing data** — Verify the source workout in Health Connect contains the data you expect.

## Related

- [Health Connect source](/help/articles/registry/sources/health_connect)
- [Apple Health](/help/articles/registry/integrations/apple-health) (iOS equivalent)
