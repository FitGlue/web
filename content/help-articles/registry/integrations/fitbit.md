---
title: Connecting Fitbit — setup and troubleshooting
excerpt: How to connect your Fitbit account to FitGlue via OAuth.
date: 2026-02-08
category: registry
---

## Overview

Fitbit connects to FitGlue via **OAuth**. You authorize FitGlue to access your Fitbit data through Fitbit's secure authorization flow. No API keys needed — you simply sign in with your Fitbit account and grant permissions.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Fitbit → Connect.
2. **Sign in to Fitbit** — You'll be redirected to Fitbit's login page. Sign in with your Fitbit account credentials.
3. **Grant permissions** — Authorize FitGlue to access your activity, heart rate, and profile data.
4. **Return to FitGlue** — You'll be redirected back. The status should show "Connected".
5. **Verify** — Sync a Fitbit activity to confirm data flows.

## Permissions Requested

- **Activity & Exercise** — Required for importing workouts
- **Heart Rate** — Required for the [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
- **Profile** — Used for age-based HR zone defaults

## Common Issues

**"Authorization failed"** — Ensure you're signing into the correct Fitbit account. If you have multiple accounts, verify you're using the one linked to your device.

**Token expired / "Needs re-authorization"** — FitGlue automatically refreshes OAuth tokens, but occasionally a full re-authorization is needed. Visit Dashboard → Connections and reconnect.

**No heart rate data after connecting** — The Fitbit HR booster requires intraday HR access. If you're on a Fitbit Premium trial, intraday access is included. On the free tier, check Fitbit's current data access policies.

**Connected but no activities** — Ensure your Fitbit device has synced to the Fitbit app recently. FitGlue reads from Fitbit's cloud API, not directly from the device.

## Related

- [Fitbit as a source](/help/articles/registry/sources/fitbit)
- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate)
