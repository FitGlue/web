---
title: Activity Filter booster — configuration and troubleshooting
excerpt: Filter which activities pass through your pipeline based on type, distance, or keywords.
date: 2026-02-08
category: registry
---

## Overview

The Activity Filter booster selectively allows or blocks activities from continuing through your pipeline based on configurable criteria. Use it to ensure only certain activity types (e.g., runs over 5km) get processed, or to exclude activities that match specific criteria (e.g., skip "Walk" activities).

## Configuration

### Filter Mode (`mode`)

| Option | Behavior |
|---|---|
| **Allow** | Only matching activities proceed |
| **Block** | Matching activities are stopped |

### Activity Types (`activity_types`)

Select which activity types to filter on. Multiple types can be selected.

### Minimum Distance (`min_distance`)

Optional. Activities shorter than this distance (in meters) are filtered. Useful for ignoring very short activities.

### Title Keywords (`title_keywords`)

Optional. Comma-separated keywords. Activities with matching title text are affected by the filter.

## Data Requirements

- Works with any activity from any source
- Uses activity metadata (type, distance, title)

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**All activities being blocked** — Check your filter configuration carefully. In "Allow" mode with specific types selected, any activity that doesn't match a selected type is blocked. Switch to "Block" mode if you want to selectively remove specific types.

**Filter not working on short activities** — Make sure `min_distance` is set in **meters**, not kilometers. 5 km = 5000 meters.

**Title keyword not matching** — Keywords are matched case-insensitively. Check for typos in your keyword list.

**Activity filtered but I want it processed** — You can re-post the activity after updating your filter configuration. The filter is evaluated on each pipeline run.

## Dependencies

- No integration dependencies
- Place this booster **early** in your pipeline to prevent unnecessary processing of filtered activities

## Related

- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher)
- [Logic Gate booster](/help/articles/registry/enrichers/logic-gate)
- [Type Mapper booster](/help/articles/registry/enrichers/type-mapper)
