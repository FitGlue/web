---
title: Type Mapper booster — setup and troubleshooting
excerpt: Maps activity types based on title keywords
date: 2026-02-04
category: registry
---

## Overview

The Type Mapper booster automatically changes an activity's type based on keywords in the title. Define rules like "title contains 'Virtual Ride'" → Virtual Ride or "title contains 'Treadmill'" → Run. When activities are processed, their type is updated if the title matches your pattern. Case-insensitive matching. Multiple rules and multiple instances supported.

## Setup

1. Add the Type Mapper booster to your pipeline.
2. Configure **Type Mapping Rules** — Key-value pairs: text to match (case-insensitive) → activity type.
3. Example: "Indoor Bike" → Virtual Ride, "Treadmill" → Run

## Config

| Field | Description |
|-------|-------------|
| Type Mapping Rules | Map title keywords to activity types. Full dropdown of activity types available. |

## Use Cases

- Categorize indoor cycling sessions correctly
- Mark treadmill runs as Run instead of Workout
- Fix incorrect activity types from source apps

## Multiple Instances

You can add multiple Type Mapper boosters to apply different rules in sequence.

## Related

- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher) (conditional title/description)
- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter) (filter by type)
