---
title: Sources, boosters, and targets — the full picture
excerpt: How FitGlue's three-part model works.
date: 2026-02-04
category: concepts
---

## Sources

Sources are where your activities come from:

- **Hevy** — Strength training workouts
- **Strava** — Runs, rides, swims
- **Fitbit** — Activities from your Fitbit device
- **Apple Health / Health Connect** — Via the FitGlue mobile app
- **File Upload** — Manual FIT file uploads

Each source connects via OAuth or API key. When you complete an activity, FitGlue imports it into your pipeline.

## Boosters

Boosters transform your activity before it reaches the target:

- **Workout Summary** — Exercise breakdown for strength training
- **Muscle Heatmap** — Emoji or image showing muscles worked
- **Fitbit Heart Rate** — Overlay heart rate from Fitbit onto activities
- **AI Companion** — AI-generated descriptions (Athlete tier)
- **Parkrun** — Official results, times, PBs
- **Weather** — Conditions at activity time
- And many more...

Some boosters are free (Hobbyist); others require the Athlete tier.

## Targets

Targets are where boosted activities land:

- **Strava** — Upload to your Strava account
- **Showcase** — Create a shareable public page
- **Hevy** — Post to Hevy
- **TrainingPeaks** — Send to your coach
- **Google Sheets** — Log to a spreadsheet

You can have multiple targets in one pipeline—e.g. Strava and Showcase.

## The flow

```
Source (Hevy) → Booster (Workout Summary) → Booster (Muscle Heatmap) → Target (Strava)
```

Data flows left to right. Each booster adds or modifies the activity. The final result is sent to all targets.

## Related

- [What is a pipeline?](/help/articles/concepts/what-is-a-pipeline)
- [Getting started](/help/articles/getting-started)
