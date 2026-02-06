---
title: Recovery Advisor booster — setup and options
excerpt: Calculate training load and receive smart recovery time recommendations.
date: 2026-02-06
category: registry
---

## Overview

The Recovery Advisor booster uses TRIMP (Training Impulse) to estimate your session's training load and suggests optimal recovery time. It also monitors your 7-day rolling load to give context-aware recommendations.

## Configuration

No configuration required. The booster uses the same TRIMP calculation as the Training Load booster.

## Tier

Recovery Advisor requires the **Athlete** tier.

## How It Works

After each activity, the booster calculates session TRIMP, classifies the intensity, and reviews your accumulated 7-day training stress. Based on all of this, it recommends a recovery window (e.g. "36 hours") to help you plan your next session.

## Best For

- Preventing overtraining
- Balancing hard and easy sessions
- Athletes managing high training volume

## Dependencies

Requires heart rate data on the activity — either from the source device or merged via the Fitbit Heart Rate or FIT File Heart Rate booster.

## Related

- [Training Load booster](/help/articles/registry/enrichers/training-load)
- [Heart Rate Summary booster](/help/articles/registry/enrichers/heart-rate-summary)
- [Heart Rate Zones booster](/help/articles/registry/enrichers/heart-rate-zones)
