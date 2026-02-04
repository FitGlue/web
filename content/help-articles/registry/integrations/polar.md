---
title: Connecting Polar Flow — setup and troubleshooting
excerpt: Import activities from Polar wearables
date: 2026-02-04
category: registry
---

## Overview

Polar Flow is the cloud platform for Polar wearables and sports watches. FitGlue connects to your Polar Flow account via OAuth and imports your activities via webhooks. Heart rate data, GPS routes, and training metrics flow through your FitGlue pipeline for enhancement and distribution to destinations like Strava. Polar uses a unique transaction-based API that ensures no activities are lost.

## Temporarily Unavailable

The Polar Flow integration is currently **temporarily unavailable**. FitGlue is working on restoring this connection.

## Setup (when available)

1. Open the **FitGlue Dashboard**
2. Navigate to **Connections** and click **Connect** on Polar Flow
3. Sign in to your **Polar account** when redirected
4. Review and **Accept Permissions** to allow FitGlue to access your activities
5. You're connected!

**Note:** App registration at admin.polaraccesslink.com may be required.

## Auth Type: OAuth

Secure OAuth connection. Your Polar password is never stored by FitGlue.

## Related

- [Polar Flow source](/help/articles/registry/sources/polar)
