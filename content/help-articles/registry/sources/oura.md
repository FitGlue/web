---
title: Oura source — setup and troubleshooting
excerpt: Import activity and health data from Oura Ring into FitGlue.
date: 2026-02-08
category: registry
---

## Overview

The Oura source imports activities and health data from your Oura Ring. While Oura is primarily known as a sleep and recovery tracker, it also detects workouts and provides heart rate data. This source is useful for users who want to combine Oura's health metrics with data from other sources in their FitGlue pipelines.

## Data Ingested

| Field | Details |
|---|---|
| **Title** | Auto-detected activity name |
| **Activity type** | Walking, running, or general activity |
| **Start time & duration** | Activity timestamps |
| **Calories** | Estimated active calories |
| **Heart rate** | Continuous HR from Oura Ring's optical sensor |

### What is NOT available

- **GPS data** — Oura Ring has no GPS sensor.
- **Cadence, power, speed data** — Not tracked by Oura.
- **Detailed exercise data** — No set/rep/weight tracking.
- **Distance data** — Oura estimates steps but does not provide GPS distance.

### Sync mechanism

Oura uses the **Oura Cloud API** with webhook notifications. Data syncs when your Oura Ring connects to the Oura app via Bluetooth.

## Setup

1. **Connect Oura** — See [Connecting Oura](/help/articles/registry/integrations/oura) for the OAuth setup.
2. **Create a pipeline** — Add Oura as the source.

## Tier

The Oura source is included in **Hobbyist** (free tier).

## Common Issues

**No activities detected** — Oura auto-detects activities based on motion patterns. Short or low-intensity activities may not be detected. Oura works best for continuous movement activities like walking and running.

**Heart rate data sparse** — Oura Ring's optical sensor takes readings at intervals (not continuously during non-workout periods). During detected workouts, HR sampling increases, but it may not match the fidelity of a chest strap or wrist-based watch.

**Delayed sync** — Oura Ring syncs to the cloud when you open the Oura app. If activities aren't appearing, open the Oura app to trigger a sync.

**No overnight/sleep data imported** — FitGlue imports activities, not sleep data. The [Recovery Advisor](/help/articles/registry/enrichers/recovery-advisor) booster can use recovery metrics independently.

## Dependencies

- **Required integration**: [Oura connection](/help/articles/registry/integrations/oura) (OAuth)

## Related

- [Connecting Oura](/help/articles/registry/integrations/oura)
- [Recovery Advisor booster](/help/articles/registry/enrichers/recovery-advisor)
