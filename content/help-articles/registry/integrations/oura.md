---
title: Connecting Oura — setup and troubleshooting
excerpt: How to connect your Oura Ring account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Oura connects to FitGlue via **OAuth**. This allows FitGlue to import activity data and heart rate from your Oura Ring via the Oura Cloud API.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Oura → Connect.
2. **Sign in** with your Oura account.
3. **Grant permissions** for activity and heart rate data access.
4. **Verify** — Check the connection status.

## Common Issues

**No activities detected** — Oura Ring auto-detects activities. Short or low-intensity activities may not trigger activity detection.

**Token expired** — Reconnect via Dashboard → Connections.

**Data delayed** — Oura data syncs when you open the Oura app. Open the app to trigger a cloud sync.

## Related

- [Oura as a source](/help/articles/registry/sources/oura)
