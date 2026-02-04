---
title: Why can I only have one source per pipeline?
excerpt: Understanding FitGlue's one-source-per-pipeline design.
date: 2026-02-04
category: troubleshooting
---

## The short answer

Each pipeline processes one activity at a time from a single source. This keeps the flow simple and predictable. If you want to sync from multiple sources (e.g. Hevy and Strava), create separate pipelines for each.

## Why it works this way

**One activity, one flow.** A pipeline takes an activity from a source, runs it through boosters, and sends it to targets. Mixing sources would complicate:

- **Activity matching** — How would we know which source an activity came from?
- **Booster compatibility** — Some boosters only work with certain activity types (e.g. Workout Summary expects strength data from Hevy)
- **Debugging** — When something goes wrong, a single-source pipeline is easier to trace

## What to do instead

Create one pipeline per source:

- **Pipeline 1:** Hevy → Workout Summary + Muscle Heatmap → Strava
- **Pipeline 2:** Strava → Fitbit Heart Rate → Strava (re-upload)
- **Pipeline 3:** Fitbit → Weather → Strava

Each pipeline runs independently. Your sync limit applies across all pipelines combined.

## Related

- [What is a pipeline?](/help/articles/concepts/what-is-a-pipeline)
- [Getting started](/help/articles/getting-started)
