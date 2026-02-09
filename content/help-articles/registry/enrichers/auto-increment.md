---
title: Auto Increment booster — configuration and troubleshooting
excerpt: Automatically number your activities with a running counter.
date: 2026-02-08
category: registry
---

## Overview

The Auto Increment booster adds a sequential number to your activity title or description. For example, "Morning Run" becomes "Morning Run #47". This is useful for tracking how many times you've done a specific activity type, maintaining a running count of workouts, or creating a numbered series.

## Configuration

### Position (`position`)

Where to display the counter:

| Option | Example |
|---|---|
| **Title suffix** (default) | `Morning Run #47` |
| **Title prefix** | `#47 Morning Run` |
| **Description** | Counter appears in the description text |

### Counter Scope (`scope`)

What the counter tracks:

| Option | Behavior |
|---|---|
| **All activities** (default) | One counter for everything |
| **Per activity type** | Separate counters per type (Run #23, Ride #15) |
| **Per pipeline** | Counter scoped to this specific pipeline |

### Start Number (`start_number`)

The starting value for the counter. Default: **1**. Useful if you want to continue an existing numbering system.

## Data Requirements

- Works with any activity from any source
- Counter state is persisted and incremented per-user

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Counter seems wrong** — If you added the booster after already processing activities, the counter starts from where you configure it, not from historical activities. Set `start_number` to match your actual count.

**Counter incremented but activity failed** — If a pipeline fails after the counter increments, the counter does not roll back. This may create gaps in numbering.

**Duplicate numbers** — In rare cases with multiple activities processing simultaneously, a race condition could produce duplicate numbers. This is uncommon with normal usage patterns.

## Dependencies

- No integration dependencies

## Related

- [Streak Tracker booster](/help/articles/registry/enrichers/streak-tracker)
- [Distance Milestones booster](/help/articles/registry/enrichers/distance-milestones)
