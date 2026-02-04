---
title: What is a pipeline?
excerpt: Understanding how FitGlue moves and transforms your fitness data.
date: 2026-02-04
category: concepts
---

## The basics

A **pipeline** is a flow: **Source → Boosters → Target**.

1. **Source** — Where your activity comes from (Hevy, Strava, Fitbit, etc.)
2. **Boosters** — Transformations applied to the activity (summaries, heatmaps, heart rate, etc.)
3. **Target** — Where the boosted activity goes (Strava, Showcase, TrainingPeaks, etc.)

One source per pipeline. Multiple boosters. One or more targets.

## Example

**Hevy → Strava with muscle heatmaps**

- **Source:** Hevy (your strength workouts)
- **Boosters:** Workout Summary, Muscle Heatmap
- **Target:** Strava

When you complete a workout in Hevy, FitGlue receives it, adds the summary and heatmap, and uploads the enhanced activity to Strava.

## Why pipelines?

Your fitness data lives in many places. FitGlue unifies it by letting you define exactly how data flows and what gets added along the way. No manual copying, no duplicate entry—just automatic transformation.

## Learn more

- [Sources, boosters, and targets explained](/help/articles/concepts/sources-boosters-targets-explained)
- [Getting started](/help/articles/getting-started)
