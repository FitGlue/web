---
title: Connecting Garmin — setup and troubleshooting
excerpt: How to connect your Garmin Connect account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Garmin connects to FitGlue via **OAuth** through the Garmin Connect API. This is a popular connection for serious athletes using Garmin watches and bike computers. Once connected, FitGlue receives webhook notifications when you sync activities with Garmin Connect, enabling automatic import of your richly detailed Garmin data.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization through Garmin Connect.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Garmin → Connect.
2. **Sign in** with your Garmin Connect account.
3. **Grant permissions** — Allow FitGlue to access your activity data.
4. **Verify** — Sync an activity from your Garmin device and check it appears in FitGlue.

## Permission Scopes

- **Activity data** — Workouts, runs, rides, and all recorded metrics
- **Activity summary** — Distance, duration, calories, HR averages
- **Activity details** — GPS tracks, HR streams, cadence, power, running dynamics

## Common Issues

**Activities not syncing** — Ensure your Garmin device has synced to Garmin Connect first (via Garmin Connect app, Garmin Express, or Wi-Fi sync). FitGlue reads from Garmin's cloud API.

**Slow sync** — Garmin Connect can take 5–15 minutes to process an activity and send the webhook. This is a Garmin-side delay.

**Token expired / "Needs re-authorization"** — Garmin OAuth tokens may expire. Visit Dashboard → Connections → Garmin and reconnect.

**"This application is not authorized"** — This can happen if Garmin temporarily revokes third-party access. Disconnect and reconnect.

## Related

- [Garmin as a source](/help/articles/registry/sources/garmin)
- [Running Dynamics booster](/help/articles/registry/enrichers/running-dynamics)
