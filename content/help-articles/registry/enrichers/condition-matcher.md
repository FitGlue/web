---
title: Condition Matcher booster — setup and troubleshooting
excerpt: Applies title/description templates when conditions match
date: 2026-02-04
category: registry
---

## Overview

The Condition Matcher booster applies custom titles and descriptions based on when, where, and what type of activity you're doing. Define conditions like "Saturday morning run near the park" and specify a title template. When activities match your conditions, the template is applied automatically. Perfect for recurring workouts like "Morning Gym Session" or "Sunday Long Run".

## Setup

1. Add the Condition Matcher booster to your pipeline.
2. Configure conditions (all optional; combine as needed):
   - **Activity Type** — Run, Ride, Weight Training, etc.
   - **Days of Week** — Mon, Tue, Wed, etc.
   - **Start Time / End Time** — 24-hour format (e.g., 09:00, 17:00)
   - **Location** — Latitude, longitude, radius (meters)
   - **Title Template** — New title when conditions match
   - **Description Template** — New description when conditions match

## Config Options

| Field | Description |
|-------|-------------|
| Activity Type | Match specific type (optional) |
| Days of Week | Match activities on these days |
| Start/End Time | Time window (24h format) |
| Location Lat/Long + Radius | Match activities near a location |
| Title Template | Template when match |
| Description Template | Template when match |

## Use Cases

- Auto-title recurring workouts (e.g., "Morning Gym Session")
- Name activities by location
- Set titles by day or time (e.g., "Sunday Long Run")

## Multiple Instances

You can add multiple Condition Matcher boosters for different rule sets.

## Related

- [Type Mapper booster](/help/articles/registry/enrichers/type-mapper)
- [Location Naming booster](/help/articles/registry/enrichers/location_naming)
