---
title: Connecting Hevy — setup and troubleshooting
excerpt: How to connect your Hevy account to FitGlue using an API key.
date: 2026-02-08
category: registry
---

## Overview

Hevy connects to FitGlue via an **API key**. This requires a **Hevy Pro** subscription — the Developer API is not available on Hevy's free tier. Once connected, FitGlue receives real-time webhook notifications when you complete workouts, enabling automatic import and enhancement of your strength training data.

## Authentication Type

**API Key** — You generate a key in the Hevy app and paste it into FitGlue.

## Setup

1. **Ensure you have Hevy Pro** — Open the Hevy app → Settings → Account → verify you're on the Pro plan.
2. **Generate an API key** — In the Hevy app, go to Settings → Developer → Generate API Key. Copy the key.
3. **Connect in FitGlue** — Go to Dashboard → Connections → Hevy → Enter your API key and click Connect.
4. **Verify connection** — The status should change to "Connected". Log a test workout in Hevy to verify data flows.

## Actions

After connecting, you can perform these actions from Dashboard → Connections → Hevy:

| Action | Description |
|---|---|
| **Import Strength PRs** | Imports your personal records (1RM and volume) from the last 12 months of Hevy workouts |

## Common Issues

**"Hevy Pro required"** — The API key feature requires Hevy Pro. Free Hevy accounts cannot access the Developer menu.

**"Invalid API key"** — Copy the key again from Hevy, ensuring no extra spaces before or after. Keys are long alphanumeric strings.

**Connection shows "Connected" but no workouts sync** — Only workouts completed _after_ connecting will sync via webhooks. Historical workouts are not imported automatically (use the "Import Strength PRs" action for PR history).

**API key expired or revoked** — If you regenerate the key in Hevy, the old key stops working. Update the key in FitGlue Dashboard → Connections → Hevy.

## Related

- [Hevy as a source](/help/articles/registry/sources/hevy)
- [Hevy as a destination](/help/articles/registry/destinations/hevy)
- [Hevy to Strava guide](/guides/hevy-to-strava)
