---
title: Logic Gate booster — setup and troubleshooting
excerpt: Evaluate rules to conditionally continue or halt the pipeline
date: 2026-02-04
category: registry
---

## Overview

The Logic Gate booster lets you create powerful rules to filter, route, or halt activities based on any combination of conditions. Define rules using fields like activity type, day of week, time, location, or title/description content. Combine them with AND/ANY/NONE logic and choose whether to continue or halt the pipeline on match or no match.

## Setup

1. Add the Logic Gate booster to your pipeline.
2. Configure:
   - **Match Mode** — All rules must match (AND), Any rule matches (OR), No rules match (NOR)
   - **Rules** — JSON array of rules: `[{field, op, values, negate}]`
   - **On Match** — Continue or Halt pipeline
   - **On No Match** — Continue or Halt pipeline

## Supported Rule Fields

- **activity_type** — Match by activity type (Run, Ride, etc.)
- **days** — Match by day of week (Mon, Tue, etc.)
- **time_start / time_end** — Match by time of day (HH:MM)
- **location** — Match by GPS coordinates within radius
- **title_contains / description_contains** — Match text content

## Use Cases

- Filter out test workouts (halt when title contains "test")
- Only sync activities from specific locations
- Route morning runs to different destinations (use multiple pipelines)
- Block activities on certain days

## Multiple Instances

You can add multiple Logic Gates for complex branching logic.

## Related

- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter) (simpler include/exclude)
- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher) (template application)
