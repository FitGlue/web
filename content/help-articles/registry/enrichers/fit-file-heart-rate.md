---
title: FIT File Heart Rate booster — configuration and troubleshooting
excerpt: Merge heart rate data from an uploaded FIT file onto your activity.
date: 2026-02-08
category: registry
---

## Overview

The FIT File Heart Rate booster extracts heart rate data from an uploaded FIT file and merges it onto an activity from another source. This is the most accurate way to add HR data because FIT files contain second-by-second heart rate streams from a chest strap or wrist sensor. Unlike the Fitbit Heart Rate booster that queries an API, this approach uses the raw data file directly.

**Use case**: You record a strength workout in Hevy and simultaneously record HR with a Garmin chest strap. Upload the Garmin FIT file, and this booster merges the HR stream onto the Hevy workout — giving you a complete activity with exercises AND accurate heart rate.

## Configuration

The FIT File Heart Rate booster has no configurable options. It automatically matches the FIT file's HR stream to the activity's time window.

## Data Requirements

- **A FIT file with heart rate data** — The file must contain an HR data stream. FIT files from Garmin, Wahoo, Suunto, Coros, and other ANT+ devices are supported.
- **Activity timestamp alignment** — The HR data in the FIT file must overlap with the activity's time window. If the timestamps don't align (e.g., wrong timezone on the recording device), HR matching may fail.

## How It Works

1. The pipeline reaches this booster and pauses, requesting a FIT file via the **Pending Input** system.
2. You receive a notification (push or dashboard) asking you to upload a FIT file.
3. You upload the file through the web interface or mobile app.
4. The booster extracts the HR stream and merges it onto the activity.
5. The pipeline continues with subsequent boosters.

## How Content Appears

### On Strava / Showcase

Same as the Fitbit Heart Rate booster — HR data appears as average/max HR stats and an interactive HR graph. The quality is typically better because FIT files contain raw, unprocessed sensor data at higher resolution.

## Tier & Access

The FIT File Heart Rate booster is available on the **Hobbyist** (free) tier.

## Common Issues

**Pipeline stuck at "Waiting for input"** — The booster is waiting for you to upload a FIT file. Check your Dashboard or notifications. The pipeline will resume once the file is uploaded.

**"No heart rate data found in file"** — The uploaded FIT file does not contain HR data. This happens if the recording device had no HR sensor connected. Check the FIT file in another tool (like Garmin Connect or FIT File Viewer) to verify it contains HR.

**HR data doesn't match activity times** — The booster uses timestamp alignment. If your FIT recording device's clock is off, the HR stream may not align with your activity. Ensure both devices are time-synced.

**Wrong FIT file uploaded** — If you uploaded the wrong file, you can re-post the activity from the Dashboard to restart the pipeline and upload the correct file.

**FIT file from simultaneous activities** — If your Garmin was also recording a separate activity at the same time, the FIT file may contain data for that activity. Use the FIT file from the HR recording device, not a separate multi-sport device.

## Dependencies

- No integration dependencies — works with raw FIT file uploads
- Pairs well with [Heart Rate Zones](/help/articles/registry/enrichers/heart-rate-zones) and [Heart Rate Summary](/help/articles/registry/enrichers/heart-rate-summary) boosters

## Related

- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate) (alternative: API-based HR)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
- [File Upload source](/help/articles/registry/sources/file_upload)
