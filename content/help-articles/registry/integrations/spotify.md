---
title: Connecting Spotify — setup and troubleshooting
excerpt: How to connect your Spotify account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Spotify connects to FitGlue via **OAuth**. This allows the [Spotify Tracks booster](/help/articles/registry/enrichers/spotify-tracks) to fetch your recently played music during activities, adding a workout playlist to your descriptions.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Spotify → Connect.
2. **Sign in** with your Spotify account.
3. **Grant permissions** — Allow FitGlue to read your recently played tracks.
4. **Verify** — After your next activity, check if tracks appear.

## Permissions Requested

- **Read recently played** — Access to your listening history
- **User profile** — Basic profile identification

## Common Issues

**"Connection failed"** — Ensure you're signing into the correct Spotify account. If you have both free and premium accounts, use the one you listen with during workouts.

**No tracks found** — Spotify must have been actively playing during the activity's time window. Offline listening history may not sync to the API in time.

**Token expired** — Spotify OAuth tokens expire. FitGlue auto-refreshes, but reconnection may occasionally be needed.

## Related

- [Spotify Tracks booster](/help/articles/registry/enrichers/spotify-tracks)
