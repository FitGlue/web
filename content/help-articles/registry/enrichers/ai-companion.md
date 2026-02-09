---
title: AI Companion booster — configuration and troubleshooting
excerpt: Generate an AI-written motivational commentary for your activity.
date: 2026-02-08
category: registry
---

## Overview

The AI Companion booster uses generative AI to write a personalized, motivational commentary based on your activity data. It analyses your workout stats, exercise selection, personal records, weather, and time of day to create an engaging narrative paragraph. Think of it as having a virtual training partner who writes up your session with personality and insight.

## Configuration

### Tone (`tone`)

Controls the personality of the AI commentary.

| Option | Description | Example Flavor |
|---|---|---|
| **Motivational** (default) | Upbeat, encouraging | "Crushed it! That extra set on bench shows real commitment." |
| **Coach** | Analytical, constructive | "Good volume today. Consider adding a warm-up set at 60kg next time." |
| **Casual** | Relaxed, conversational | "Solid push day! The tricep work at the end was a nice touch." |
| **Hype** | High-energy, celebratory | "BEAST MODE ACTIVATED! 🔥 You absolutely destroyed that workout!" |

### Length (`length`)

Controls how long the generated commentary is.

| Option | Approximate Length |
|---|---|
| **Short** | 1–2 sentences |
| **Medium** (default) | 3–5 sentences |
| **Long** | Full paragraph (6–10 sentences) |

## Data Requirements

- Works with **any activity type** from any source
- Richer data produces better commentary — exercises, metrics, HR, weather, PBs all contribute
- Minimal activities produce more generic output

## How Content Appears

### On Strava (description)

The AI commentary appears as a text paragraph in the description, typically at the start (before other booster sections). Example:

```
🤖 What a push day! You put in serious work on the bench — 3 sets
at 80kg is no joke. The incline press at 25kg showed great
endurance, and wrapping up with tricep pushdowns was the perfect
finisher. Keep this consistency going and you'll be hitting 90kg
bench in no time.
```

### On Showcase

Displayed as formatted text with distinctive styling.

## Tier & Access

The AI Companion booster requires the **Athlete** (paid) tier.

## Common Issues

**Commentary feels generic** — The AI needs data to personalize. Activities with just a title and no exercise details, no HR, no distance will produce generic motivational text. Use a rich source like Hevy or Garmin for the best results.

**Commentary references wrong exercises** — If exercise data is incorrect or missing, the AI may hallucinate exercise names. This is a known limitation of AI models. Ensure your source data is accurate.

**Commentary is in the wrong language** — The AI currently generates English text only. Multi-language support is not yet available.

**Pipeline takes longer than expected** — AI generation adds 5–15 seconds to pipeline processing. This is expected and does not block other boosters.

## Dependencies

- Requires **Athlete tier**
- No integration dependencies
- Benefits from rich activity data

## Related

- [AI Banner booster](/help/articles/registry/enrichers/ai_banner)
- [Workout Summary booster](/help/articles/registry/enrichers/workout-summary)
