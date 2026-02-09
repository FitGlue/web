---
title: Connecting Health Connect — setup and troubleshooting
excerpt: How to connect Health Connect to FitGlue via the Android app.
date: 2026-02-08
category: registry
---

## Overview

Health Connect connects to FitGlue via the **FitGlue mobile app** on Android. This uses Android's Health Connect API, which is built into Android 14+ and available as a separate app on older versions.

## Authentication Type

**App Sync** — Health Connect permissions requested within the FitGlue Android app.

## Setup

1. **Ensure Health Connect is installed** — On Android 14+, it's built-in. On older versions, install from the Play Store.
2. **Install the FitGlue app** from the Google Play Store.
3. **Sign in** to your FitGlue account.
4. **Grant Health Connect permissions** when prompted.
5. **Verify** — Recent workouts from connected devices should begin syncing.

## Common Issues

**"Health Connect not found"** — Install the Health Connect app from the Play Store (required on Android 13 and below).

**No data appearing** — Ensure your wearable app (Samsung Health, Garmin Connect, etc.) is configured to write data to Health Connect.

**Background sync restricted** — Some Android manufacturers (Xiaomi, Huawei, OnePlus) aggressively kill background apps. Whitelist FitGlue from battery optimization in Settings → Battery → App battery management.

**Permissions denied** — Go to Health Connect app → Permissions → FitGlue and enable all data types.

## Related

- [Health Connect as a source](/help/articles/registry/sources/health_connect)
- [Apple Health (iOS equivalent)](/help/articles/registry/integrations/apple-health)
