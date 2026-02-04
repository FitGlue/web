---
title: Hybrid Race Tagger booster — setup and troubleshooting
excerpt: Tag and merge laps for hybrid races like Hyrox, ATHX, and multi-sport events
date: 2026-02-04
category: registry
---

## Overview

The Hybrid Race Tagger booster properly categorizes each segment of your hybrid race. Smartwatches often record multi-sport events (Hyrox, ATHX, etc.) as a single activity type, but each lap is a different exercise. When this enricher is active, your pipeline pauses and asks you to tag each lap with the correct exercise (e.g., "SkiErg", "Sled Push", "Running"). You can also merge adjacent laps that belong together (e.g., a 1km run split across multiple watch laps). Tagged laps can be automatically mapped to exercises in connected strength apps via fuzzy matching.

## Setup

1. Add the Hybrid Race Tagger booster to your pipeline.
2. No configuration required — when an activity with multiple laps is processed, you'll be prompted to tag each lap.
3. Optionally merge adjacent laps into logical segments.

## Use Cases

- Track Hyrox workouts with correct exercise tagging
- Segment ATHX events into individual stations
- Create accurate records for multi-sport activities
- Properly categorize triathlon or duathlon segments

## Manual Step

This booster requires user input — you'll need to tag laps when the activity is processed. Ensure you complete the tagging for the activity to continue through the pipeline.

## Related

- [User Input booster](/help/articles/registry/enrichers/user-input)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
