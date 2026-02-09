---
title: Connecting Polar — setup and troubleshooting
excerpt: How to connect your Polar account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Polar connects to FitGlue via **OAuth** through the Polar Accesslink API. This allows FitGlue to import activities from your Polar watch.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Polar → Connect.
2. **Sign in** with your Polar Flow account.
3. **Grant permissions** for activity data access.
4. **Verify** — Sync an activity from your Polar watch and check it appears.

## Common Issues

**Token expired** — Polar tokens may expire. Reconnect via Dashboard → Connections.

**Data not syncing** — Ensure your Polar device has synced to Polar Flow first (via Polar Flow app or FlowSync desktop software). FitGlue reads from Polar's cloud, not directly from the device.

**Wrong account** — If you have multiple Polar accounts, ensure you connect the one linked to your device.

## Related

- [Polar as a source](/help/articles/registry/sources/polar)
