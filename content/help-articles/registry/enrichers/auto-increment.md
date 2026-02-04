---
title: Auto Increment booster — setup and troubleshooting
excerpt: Appends an incrementing counter number to activity titles
date: 2026-02-04
category: registry
---

## Overview

The Auto Increment booster automatically adds incrementing numbers to your activity titles. Define a counter key and optional title filter. Activities matching the filter get an incrementing number appended, like "Leg Day #1", "Leg Day #2", etc. Each counter key maintains its own sequence. Great for tracking workout series.

## Setup

1. Add the Auto Increment booster to your pipeline.
2. Configure:
   - **Counter Key** — Select existing counter or create new one (from /users/me/counters)
   - **Title Filter** — Only increment if title contains this (optional)
   - **Initial Value** — Starting number (optional, default: 1)

## Config Options

| Field | Description |
|-------|-------------|
| Counter Key | Select or create counter |
| Title Filter | Only apply if title contains this text |
| Initial Value | Starting number (default: 1) |

## Use Cases

- Number workout series (Leg Day #1, #2, #3)
- Track session counts
- Create numbered runs

## Multiple Instances

You can add multiple Auto Increment boosters with different counter keys and filters.

## Related

- [User Input booster](/help/articles/registry/enrichers/user-input) (manual title editing)
