---
title: Connecting Strava — setup and troubleshooting
excerpt: How to connect your Strava account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Strava connects to FitGlue via **OAuth**. This is the most common integration — used by the majority of FitGlue users. Once connected, FitGlue can both read activities from Strava (source) and upload enhanced activities back to Strava (destination).

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Strava → Connect.
2. **Sign in to Strava** — You'll be redirected to Strava's authorization page.
3. **Grant permissions** — Allow FitGlue to read and write activity data.
4. **Return to FitGlue** — You'll be redirected back. Connection status should show "Connected".

## Permissions Requested

- **Read activities** — Required for using Strava as a source
- **Write activities** — Required for using Strava as a destination
- **Read profile** — Used for user identification

## Common Issues

**"Authorization failed"** — Check that you're signed into the correct Strava account. Clear your browser cache or try an incognito window if you're stuck on a different account.

**"Strava webhook not receiving"** — After connecting, FitGlue registers a webhook with Strava. In rare cases, this registration can fail. Disconnect and reconnect to re-register.

**Rate limiting** — Strava allows 100 API requests per 15 minutes and 1000 per day. Heavy usage may trigger limits. FitGlue handles this with automatic retry queues.

**Connected but "Needs re-authorization"** — OAuth tokens expire. FitGlue auto-refreshes them, but if the refresh token is also expired (e.g., revoked from Strava's settings), you need to reconnect manually.

**Revoking access** — If you want to disconnect, do it from both FitGlue (Dashboard → Connections) and Strava (Settings → My Apps → FitGlue → Revoke Access).

## Related

- [Strava as a source](/help/articles/registry/sources/strava)
- [Strava as a destination](/help/articles/registry/destinations/strava)
