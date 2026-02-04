---
title: Activity Filter booster — setup and troubleshooting
excerpt: Skips activities matching exclude patterns or not matching include patterns
date: 2026-02-04
category: registry
---

## Overview

The Activity Filter booster skips activities you don't want synced based on type or title/description patterns. Define include or exclude rules by activity type or keyword. Activities matching exclude patterns (or not matching include patterns) are skipped and won't be sent to destinations. Perfect for filtering out test workouts or specific activity types.

## Setup

1. Add the Activity Filter booster to your pipeline.
2. Configure include/exclude rules:
   - **Exclude Activity Types** — Skip these types (e.g., Yoga, Walk)
   - **Exclude Titles/Descriptions Containing** — Comma-separated patterns
   - **Include Only Activity Types** — Only allow these types (whitelist)
   - **Include Only Titles/Descriptions Containing** — Comma-separated patterns

## Config Options

| Field | Description |
|-------|-------------|
| Exclude Activity Types | Skip these types |
| Exclude Titles/Descriptions Containing | Skip if contains |
| Include Only Activity Types | Whitelist types |
| Include Only Titles/Descriptions Containing | Only allow if contains |

## Use Cases

- Skip test workouts (exclude title "test")
- Filter by activity type (e.g., only sync strength sessions)
- Exclude low-intensity activities from certain destinations

## Multiple Instances

You can chain multiple Activity Filters for complex logic, or use Logic Gate for more advanced rules.

## Related

- [Logic Gate booster](/help/articles/registry/enrichers/logic-gate) (advanced conditional control)
- [Type Mapper booster](/help/articles/registry/enrichers/type-mapper) (change type before filtering)
