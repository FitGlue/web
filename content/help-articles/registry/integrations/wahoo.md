---
title: Connecting Wahoo — setup and troubleshooting
excerpt: How to connect your Wahoo account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Wahoo connects to FitGlue via **OAuth**. This enables FitGlue to import cycling and running activities from Wahoo ELEMNT bike computers and TICKR heart rate monitors.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Wahoo → Connect.
2. **Sign in** with your Wahoo account.
3. **Grant permissions** for activity data access.
4. **Verify** — Complete an activity on your ELEMNT and check it syncs.

## Common Issues

**Token expired** — Wahoo OAuth tokens may expire. Reconnect via Dashboard → Connections.

**Activities not syncing** — Ensure your ELEMNT has synced to the Wahoo app first. FitGlue reads from Wahoo's cloud API.

**"Connection failed"** — Try clearing browser cookies and reconnecting. Use an incognito window if issues persist.

## Related

- [Wahoo as a source](/help/articles/registry/sources/wahoo)
