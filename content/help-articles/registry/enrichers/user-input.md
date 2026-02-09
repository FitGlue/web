---
title: User Input booster — configuration and troubleshooting
excerpt: Pause the pipeline to collect custom input from you before continuing.
date: 2026-02-08
category: registry
---

## Overview

The User Input booster pauses your pipeline and asks you a question or requests custom text before continuing. This lets you add a personal note, race report, or custom message to your activity description. The pipeline waits for your response via the FitGlue app or web dashboard before proceeding.

## Configuration

### Prompt (`prompt`)

The question or instruction shown to you when input is requested. Default: "Add a note to this activity".

Examples:
- "How did the workout feel?"
- "Add your race report"
- "Rate this session (1-10)"

### Timeout (`timeout`)

How long (in hours) the pipeline waits before continuing without input. Default: **24 hours**. After the timeout, the pipeline continues with no user input — the description section for this booster will be empty.

## How It Works

1. The pipeline reaches the User Input booster and pauses.
2. You receive a notification (push notification if enabled, or visible on your Dashboard).
3. You enter your text response in the app or web interface.
4. The pipeline resumes, and your text is included in the activity description.

## Tier & Access

Available on the **Hobbyist** (free) tier.

## Common Issues

**Pipeline stuck waiting** — Check your Dashboard → Activity History for pending inputs. If you don't want to add input, you can skip it or wait for the timeout.

**Missed the notification** — Enable push notifications in your FitGlue settings to receive timely alerts. Check Dashboard regularly for pending activities.

**Input disappeared / not saved** — Ensure your text was submitted, not just typed. Look for the submit/confirm button in the pending input UI.

**Timeout too short** — If you often miss the input window, increase the `timeout` value. Note that very long timeouts delay the entire pipeline.

## Dependencies

- No integration dependencies

## Related

- [FIT File Heart Rate booster](/help/articles/registry/enrichers/fit-file-heart-rate) (also uses pending input)
- [AI Companion booster](/help/articles/registry/enrichers/ai-companion)
