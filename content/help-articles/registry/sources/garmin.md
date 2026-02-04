---
title: Garmin source — setup and troubleshooting
excerpt: Import activities from Garmin Connect
date: 2026-02-04
category: registry
---

## Overview

The Garmin source imports activities from Garmin Connect. When you complete a workout on your Garmin device, FitGlue can import the full activity data including heart rate, GPS, and training metrics for enhancement and distribution.

## Temporarily Unavailable

The Garmin source is currently **temporarily unavailable**. FitGlue is working on restoring this integration. In the meantime, you can:

- Use **File Upload** to manually upload FIT files exported from Garmin Connect
- Use **Apple Health** or **Health Connect** if your Garmin syncs to those platforms on your phone

## Setup (when available)

1. **Connect Garmin** — See [Connecting Garmin](/help/articles/registry/integrations/garmin).
2. **Create a pipeline** — Add Garmin as the source, then add boosters and targets.
3. **Sync** — Activities will sync automatically via OAuth when you complete workouts on your Garmin device.

## Auth Type: OAuth

Garmin uses secure OAuth. Your Garmin password is never stored by FitGlue.

## Related

- [Connecting Garmin](/help/articles/registry/integrations/garmin)
- [File Upload source](/help/articles/registry/sources/file_upload) (manual FIT upload workaround)
