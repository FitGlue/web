---
title: TrainingPeaks destination — setup and troubleshooting
excerpt: Upload enhanced activities to TrainingPeaks for structured training analysis.
date: 2026-02-08
category: registry
---

## Overview

The TrainingPeaks destination uploads your boosted activities to your TrainingPeaks account. This is useful for athletes using TrainingPeaks for structured training plans who want their activities from other sources (Hevy, Fitbit, etc.) to appear in their TrainingPeaks calendar alongside planned workouts.

## How It Works

Activities are uploaded to TrainingPeaks with available metrics (distance, duration, HR, power) and booster-enhanced descriptions. TrainingPeaks then calculates its own TSS and training metrics from the uploaded data.

## Configuration

No configurable options.

## Tier & Access

The TrainingPeaks destination is included in **Hobbyist** (free tier).

## Common Issues

**TSS not calculating** — TrainingPeaks needs HR or power data to calculate TSS. Activities without these metrics will appear but won't have a training stress score.

**Activity not matching planned workout** — TrainingPeaks auto-matching depends on activity type, date, and duration. Manual matching may be needed.

**"Authorization expired"** — Reconnect via Dashboard → Connections.

## Dependencies

- **Required integration**: [TrainingPeaks connection](/help/articles/registry/integrations/trainingpeaks) (OAuth)

## Related

- [Connecting TrainingPeaks](/help/articles/registry/integrations/trainingpeaks)
- [Training Load booster](/help/articles/registry/enrichers/training-load)
