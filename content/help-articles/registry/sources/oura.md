---
title: Oura Ring source — setup and troubleshooting
excerpt: Import workouts from Oura Ring
date: 2026-02-04
category: registry
---

## Overview

The Oura Ring source imports workouts tracked by your Oura Ring into FitGlue. Heart rate data, calories, and workout metrics are captured for enhancement and distribution. When you complete a workout, FitGlue receives a webhook notification and imports the workout data into your pipeline.

## Temporarily Unavailable

The Oura Ring source is currently **temporarily unavailable**. FitGlue is working on restoring this integration.

## Setup (when available)

1. **Connect Oura** — See [Connecting Oura Ring](/help/articles/registry/integrations/oura).
2. **Create a pipeline** — Add Oura Ring as the source, then add boosters and targets.
3. **Sync** — Workouts will sync automatically via webhooks when you complete them.

## Auth Type: OAuth

Oura uses secure OAuth. Your Oura password is never stored by FitGlue.

## Data Included

- Heart rate (average and max)
- Calories and duration
- Workout type and metrics

## Use Cases

- Track workouts without GPS for indoor activities
- Combine sleep/readiness context with workout data
- Enhance Oura workouts with AI descriptions

## Related

- [Connecting Oura Ring](/help/articles/registry/integrations/oura)
