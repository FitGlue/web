---
title: File Upload source — setup and troubleshooting
excerpt: Manually upload FIT or GPX files to FitGlue for enhancement.
date: 2026-02-08
category: registry
---

## Overview

The File Upload source lets you manually upload FIT or GPX files directly to FitGlue. This is useful when you have activity data from a device that doesn't have a direct FitGlue integration, or when you want to process an older activity file. FIT files from Garmin, Wahoo, and other ANT+ devices are the richest format, containing full sensor streams (HR, power, cadence, GPS, running dynamics). GPX files contain GPS routes but typically lack sensor data.

## Data Ingested

| Field | Details |
|---|---|
| **FIT files** | Full sensor streams: HR, GPS, cadence, power, speed, altitude, running dynamics, temperature — everything recorded by the device |
| **GPX files** | GPS coordinates and timestamps; elevation if recorded by device |
| **Title** | Auto-generated from activity type and time of day (e.g., "Morning Run") unless you provide a custom title |
| **Activity type** | Detected from the file's activity type field |

### FIT vs GPX comparison

| Capability | FIT | GPX |
|---|---|---|
| GPS route | ✅ | ✅ |
| Heart rate stream | ✅ | ❌ (usually) |
| Power data | ✅ | ❌ |
| Cadence | ✅ | ❌ |
| Running dynamics | ✅ | ❌ |
| Lap/split data | ✅ | ❌ |
| Temperature | ✅ | ❌ |
| File size | Smaller (binary) | Larger (XML) |

### Sync mechanism

**Manual upload** — You drag and drop a file or select one from your device in the FitGlue web interface or mobile app. The activity enters your pipeline immediately upon upload.

## Setup

1. No integration or connection is required for file upload.
2. Navigate to your FitGlue Dashboard and use the upload panel.
3. Drop a `.fit` or `.gpx` file, or tap to select one from your device.
4. Optionally provide a custom title (leave blank for auto-generated names).
5. Select the pipeline you want the activity to flow through.

## Tier

File Upload is included in **Hobbyist** (free tier).

## Common Issues

**"Unsupported file format"** — Only `.fit` and `.gpx` files are supported. TCX, CSV, and other formats are not currently accepted. If you have a TCX file, many online tools can convert it to GPX.

**Activity title shows "File Upload" or filename** — If you upload without providing a custom title, FitGlue auto-generates a descriptive name from the activity type and time of day (e.g., "Afternoon Ride"). Earlier versions used the filename — this is now fixed.

**No heart rate in GPX upload** — GPX files rarely contain heart rate data. If you need HR, use the original FIT file from your device (check the device storage or manufacturer's desktop app). Alternatively, use the [Fitbit Heart Rate](/help/articles/registry/enrichers/fitbit-heart-rate) booster to merge HR from a wearable.

**Large file upload timeout** — Very large FIT files (multi-hour activities with dense sensor recording) may time out. Try reducing the recording frequency on your device for future activities, or contact support if a critical file fails to upload.

**FIT file from unknown device** — FitGlue supports FIT files from all major manufacturers (Garmin, Wahoo, Suunto, Coros, etc.). If a FIT file fails to parse, it may use a non-standard extension to the FIT protocol.

## Dependencies

- None — File Upload requires no external integration.

## Related

- [FIT File Heart Rate booster](/help/articles/registry/enrichers/fit-file-heart-rate)
- [Running Dynamics booster](/help/articles/registry/enrichers/running-dynamics)
- [Route Thumbnail booster](/help/articles/registry/enrichers/route_thumbnail)
