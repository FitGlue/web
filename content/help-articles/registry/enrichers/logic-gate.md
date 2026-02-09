---
title: Logic Gate booster — configuration and troubleshooting
excerpt: Control pipeline flow with AND, OR, and NOT logic applied to booster conditions.
date: 2026-02-08
category: registry
---

## Overview

The Logic Gate booster combines the output of multiple [Condition Matcher](/help/articles/registry/enrichers/condition-matcher) boosters into complex logical expressions. It evaluates tags set by upstream Condition Matchers and makes routing decisions based on AND, OR, and NOT operations. This is the most advanced pipeline flow control tool in FitGlue.

## Configuration

### Gate Type (`gate_type`)

| Option | Behavior |
|---|---|
| **AND** | All specified tags must be present |
| **OR** | At least one specified tag must be present |
| **NOT** | None of the specified tags should be present |

### Required Tags (`tags`)

The tags to evaluate. These must be tags set by upstream Condition Matcher boosters.

### Action on Match (`action`)

| Option | Behavior |
|---|---|
| **Continue** (default) | Pipeline continues if the logic gate passes |
| **Stop** | Pipeline stops if the logic gate passes |

## Data Requirements

- Requires **Condition Matcher** boosters upstream in the pipeline to set tags
- Evaluates pipeline metadata, not activity data directly

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Gate never passes** — Ensure upstream Condition Matchers are correctly setting the tags you're evaluating. Check that tag names match exactly (case-sensitive).

**Pipeline stops unexpectedly** — Check the `action` setting. If set to "Stop" and the gate passes, the pipeline will halt. This may be unintentional.

**Complex logic not behaving as expected** — Break complex expressions into multiple gates. Test each Condition Matcher independently before combining with Logic Gates.

## Dependencies

- Requires [Condition Matcher](/help/articles/registry/enrichers/condition-matcher) booster(s) upstream
- No integration dependencies

## Related

- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher)
- [Activity Filter booster](/help/articles/registry/enrichers/activity-filter)
