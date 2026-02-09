---
title: Type Mapper booster — configuration and troubleshooting
excerpt: Automatically correct or override your activity type based on title keywords.
date: 2026-02-08
category: registry
---

## Overview

The Type Mapper booster automatically corrects the activity type based on keywords in the title. Many sources misclassify activities — for example, Strava may log indoor cycling as "Workout" or a hike as "Walk". This booster lets you define keyword-based rules to fix these misclassifications before the activity reaches your destination.

## Configuration

### Mappings (`mappings`)

A set of keyword → activity type rules. Each rule specifies a keyword (or comma-separated keywords) and the activity type to map to.

| Example Keyword | Maps To | Use Case |
|---|---|---|
| `parkrun` | Running | Parkrun activities logged as "Walk" |
| `spin, spinning` | Cycling | Indoor cycling classes logged as "Workout" |
| `yoga` | Yoga | Yoga sessions logged as "Workout" |
| `hike, hiking` | Hiking | Hikes classified as "Walk" |

Rules are case-insensitive. The first matching rule wins if multiple keywords match.

### Default Type (`default_type`)

An optional fallback type applied if no keyword rules match and the original type is "Workout" (the most common misclassification). Leave blank to preserve the original type when no rules match.

## Data Requirements

- Requires an activity with a **title** — title-less activities cannot be matched
- Works with any source

## How Content Appears

The Type Mapper changes the activity type metadata, not the description. On destinations like Strava, the corrected type is reflected in the activity's sport icon, category, and stats display.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Activity type not changing** — Check that your keyword exactly appears in the activity title (case-insensitive). If the title doesn't contain any of your mapped keywords, the type won't change. Also ensure the booster is positioned early in your pipeline — type changes affect how subsequent boosters behave.

**Wrong type applied** — If multiple keywords match, the first rule wins. Reorder your mappings to prioritize more specific keywords (e.g., put "indoor cycling" before "cycling").

**Type reverted on destination** — Some destinations (like Strava) may override the activity type based on their own analysis. This is a destination-side behavior that FitGlue cannot control.

## Dependencies

- No integration dependencies
- Order matters: place this booster early in your pipeline (before boosters that filter by activity type)

## Related

- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter)
- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher)
