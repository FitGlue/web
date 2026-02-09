---
title: Condition Matcher booster — configuration and troubleshooting
excerpt: Route activities through different pipeline paths based on configurable conditions.
date: 2026-02-08
category: registry
---

## Overview

The Condition Matcher booster evaluates your activity against configurable conditions and tags or routes it accordingly. It's the "if-this-then-that" logic layer in your pipeline — allowing you to apply different boosters or skip sections based on activity type, distance, title keywords, or other properties.

## Configuration

### Conditions (`conditions`)

A list of condition rules. Each rule has:

| Field | Description | Example |
|---|---|---|
| **Field** | The activity field to test | `type`, `title`, `distance` |
| **Operator** | Comparison operator | `equals`, `contains`, `greater_than`, `less_than` |
| **Value** | The value to compare against | `Running`, `parkrun`, `10000` |
| **Tag** | A tag to apply when the condition matches | `is_run`, `is_race`, `is_long_run` |

### Match Mode (`match_mode`)

| Option | Behavior |
|---|---|
| **Any** (default) | At least one condition must match |
| **All** | All conditions must match |

## Data Requirements

- Works with **any activity** — evaluates based on metadata fields

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Conditions not matching** — Check that the field name exactly matches what your source provides. Different sources may use slightly different field names or formats.

**Wrong match mode** — If using "All" mode, every condition must match. Switch to "Any" if you want OR logic.

**Tags not working downstream** — Ensure downstream boosters are configured to read condition tags. Tags are internal pipeline metadata — they don't appear in the activity description.

## Dependencies

- No integration dependencies
- Often used with [Logic Gate](/help/articles/registry/enrichers/logic-gate) and [Activity Filter](/help/articles/registry/enrichers/activity-filter)

## Related

- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter)
- [Logic Gate booster](/help/articles/registry/enrichers/logic-gate)
- [Type Mapper booster](/help/articles/registry/enrichers/type-mapper)
