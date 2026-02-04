---
title: Fitbit Heart Rate booster — overlay heart rate on activities
excerpt: Overlay Fitbit heart rate data onto activities from any source.
date: 2026-02-04
category: registry
---

## Overview

The Fitbit Heart Rate booster takes heart rate data from your connected Fitbit and overlays it onto activities — even activities that didn't come from Fitbit. Perfect for adding accurate HR to Strava activities when your watch didn't record, or merging Fitbit's 24/7 HR with a Hevy strength workout.

## Requirements

- **Fitbit connection** — You must have Fitbit connected. See [Connecting Fitbit](/help/articles/registry/integrations/fitbit).

## Tier

Fitbit Heart Rate is included in **Hobbyist**. No Athlete tier required.

## How It Works

Fitbit captures heart rate continuously. When an activity flows through your pipeline, FitGlue matches the activity's time window to your Fitbit HR data and adds average/max HR, calories, and training zones to the activity description.

## Best For

- Strava activities where your GPS watch didn't capture HR
- Hevy strength workouts — add HR from your Fitbit worn during the session
- Any source that lacks built-in heart rate

## Related

- [Connecting Fitbit](/help/articles/registry/integrations/fitbit)
- [Fitbit source](/help/articles/registry/sources/fitbit)
- [Fitbit Heart Rate guide](/guides/fitbit-heart-rate)
