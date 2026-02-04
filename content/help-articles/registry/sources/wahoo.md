---
title: Wahoo source — setup and troubleshooting
excerpt: Import workouts from Wahoo Cloud with full FIT file support
date: 2026-02-04
category: registry
---

## Overview

The Wahoo source imports workouts from your Wahoo ELEMNT bike computers, KICKR trainers, and other Wahoo devices. Activities are synced in real-time via webhooks with full FIT file data. Power meters, heart rate monitors, cadence sensors, and GPS data are all captured and available for your enrichment pipeline.

## Temporarily Unavailable

The Wahoo source is currently **temporarily unavailable**. FitGlue is working on restoring this integration. In the meantime, you can use **File Upload** to manually upload FIT files from your Wahoo device.

## Setup (when available)

1. **Connect Wahoo** — See [Connecting Wahoo](/help/articles/registry/integrations/wahoo).
2. **Create a pipeline** — Add Wahoo as the source, then add boosters and targets.
3. **Sync** — When you complete a workout on your Wahoo device, FitGlue receives a webhook, downloads the full FIT file, and imports your activity.

## Auth Type: OAuth

Wahoo uses secure OAuth. Your Wahoo password is never stored by FitGlue.

## Full Sensor Data

When available, the source provides power, HR, cadence, and GPS data from the FIT file — ideal for cyclists who want complete data fidelity.

## Related

- [Connecting Wahoo](/help/articles/registry/integrations/wahoo)
- [File Upload source](/help/articles/registry/sources/file_upload) (manual workaround)
