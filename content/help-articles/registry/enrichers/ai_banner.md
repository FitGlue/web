---
title: AI Activity Banner booster — setup and troubleshooting
excerpt: Generates a custom AI header image for your activity
date: 2026-02-04
category: registry
---

## Overview

The AI Activity Banner booster creates stunning, custom header images for your activities using Google's Gemini AI. Each banner is uniquely generated based on your activity type, time of day, and conditions. The image is stored in Cloud Storage and displayed as the hero background in your Showcase page, and used for OpenGraph/Twitter social sharing cards.

## Tier: Athlete Only

This premium visual enricher is available **exclusively to Athlete-tier** users.

## Setup

1. Add the AI Activity Banner booster to your pipeline.
2. Configure optional settings:
   - **Image Style** — Vibrant & Energetic, Minimal & Clean, or Dramatic & Bold
   - **Subject Type** — Male Athlete, Female Athlete, or Abstract (No People)
3. The banner is generated automatically when the activity is processed.

## Config Options

| Field | Options |
|-------|---------|
| Image Style | Vibrant, Minimal, Dramatic |
| Subject Type | Male Athlete, Female Athlete, Abstract |

## Common Issues

**"Premium feature"** — Upgrade to Athlete tier to use this booster.

**Generation failed** — AI generation can occasionally fail. The activity will still process; you can retry by re-running the pipeline or contacting support.

## Related

- [Showcase destination](/help/articles/registry/destinations/showcase)
- [AI Activity Companion booster](/help/articles/registry/enrichers/ai-companion)
