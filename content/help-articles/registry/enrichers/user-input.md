---
title: User Input booster — setup and troubleshooting
excerpt: Pauses pipeline to wait for user input (title, description, etc.)
date: 2026-02-04
category: registry
---

## Overview

The User Input booster pauses the pipeline to let you manually add or edit activity details before continuing. When an activity reaches this booster, it's held pending your input. You receive a notification and can update the title, description, or other fields. Once you confirm, the activity continues through the pipeline.

## Setup

1. Add the User Input booster to your pipeline.
2. Configure **Required Fields** — Which fields you want to provide (default: description). Options: Title, Description.
3. When an activity hits this booster, you'll get a notification to complete the input.

## Config Options

| Field | Description |
|-------|-------------|
| Required Fields | Title, Description (multi-select) |

## Use Cases

- Add personal notes to activities
- Review before publishing to destinations
- Custom titles per workout

## Multiple Instances

You can add multiple User Input boosters at different points in your pipeline (e.g., one for title, one for description later).

## Related

- [FIT File Heart Rate booster](/help/articles/registry/enrichers/fit-file-heart-rate) (also uses pending input for file upload)
- [Condition Matcher booster](/help/articles/registry/enrichers/condition-matcher) (auto-templates)
