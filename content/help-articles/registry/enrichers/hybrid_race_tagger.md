---
title: Hybrid Race Tagger booster — configuration and troubleshooting
excerpt: Automatically tag multi-sport activities like duathlons and triathlons.
date: 2026-02-08
category: registry
---

## Overview

The Hybrid Race Tagger booster detects multi-sport or hybrid activities (e.g., brick sessions, duathlons, triathlons) and adds appropriate tags and formatting to the description. It identifies transition points and splits the activity into sport-specific segments with individual stats for each leg.

## Configuration

The Hybrid Race Tagger has no configurable options. It automatically detects sport transitions based on activity type changes, speed patterns, and GPS behavior.

## Data Requirements

- Works best with **multi-sport or brick session** data from devices that support sport transitions (Garmin Multisport, Suunto, etc.)
- Requires activity type and speed/pace data

## Tier & Access

The Hybrid Race Tagger requires the **Athlete** (paid) tier.

## Common Issues

**Not detecting transitions** — The booster uses speed pattern analysis. If transitions are very short or the speed change is gradual, detection may fail. Works best with clear sport transitions (e.g., cycling → running with a stop).

**Tagging a single-sport activity as multi-sport** — Long stops mid-activity may be interpreted as transitions. This is a known edge case.

## Dependencies

- No integration dependencies
- Requires **Athlete tier**

## Related

- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter)
- [Type Mapper booster](/help/articles/registry/enrichers/type-mapper)
