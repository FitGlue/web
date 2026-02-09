---
title: Source Link booster — configuration and troubleshooting
excerpt: Add a link back to the original activity on the source platform.
date: 2026-02-08
category: registry
---

## Overview

The Source Link booster appends a link back to the original activity on the source platform. For example, if an activity originated from Hevy, the description will include a "View on Hevy" link. This helps followers discover the original activity with full detail on the native platform.

## Configuration

The Source Link booster has no configurable options. The link is generated automatically based on the source platform and activity ID.

## How Content Appears

### On Strava (description)

A text link is added to the description:

```
📎 View original on Hevy: https://hevy.com/workout/...
```

### On Showcase

A clickable button linking to the original activity.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**No link generated** — Not all sources provide external URLs. Some sources (like File Upload) have no external platform to link to.

**Link is broken** — If the original activity was deleted on the source platform, the link will 404. This is expected behavior.

## Dependencies

- No additional configuration needed

## Related

- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
