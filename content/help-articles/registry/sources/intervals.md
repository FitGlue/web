---
title: Intervals.icu source — setup and troubleshooting
excerpt: Import activities from Intervals.icu
date: 2026-02-04
category: registry
---

## Overview

The Intervals.icu source imports your activities from Intervals.icu into FitGlue. Power data, heart rate, cadence, GPS, and all performance metrics are captured for enhancement and distribution. FitGlue polls your Intervals.icu account for new activities and imports them into your pipeline.

## Temporarily Unavailable

The Intervals.icu source is currently **temporarily unavailable**. FitGlue is working on restoring this integration.

## Setup (when available)

1. **Connect Intervals.icu** — See [Connecting Intervals.icu](/help/articles/registry/integrations/intervals). You'll need your API Key and Athlete ID from Settings → Developer Settings.
2. **Create a pipeline** — Add Intervals.icu as the source, then add boosters and targets.
3. **Sync** — FitGlue polls for new activities and imports them when found.

## Auth Type: API Key

Intervals.icu uses an API key and Athlete ID — no OAuth required. Find both in Intervals.icu → Settings → Developer Settings.

## Data Included

- Full power data
- Heart rate, cadence, and GPS
- Performance metrics and training load

## Related

- [Connecting Intervals.icu](/help/articles/registry/integrations/intervals)
- [Intervals.icu destination](/help/articles/registry/destinations/intervals)
