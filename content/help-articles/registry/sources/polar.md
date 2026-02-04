---
title: Polar Flow source — setup and troubleshooting
excerpt: Import activities from Polar wearables
date: 2026-02-04
category: registry
---

## Overview

The Polar Flow source imports your runs, rides, swims, and workouts from Polar devices. Activities are synced via webhooks when you complete them on your Polar watch or sync with Polar Flow. Heart rate data, GPS tracks, and training load metrics are included.

## Temporarily Unavailable

The Polar Flow source is currently **temporarily unavailable**. FitGlue is working on restoring this integration.

## Setup (when available)

1. **Connect Polar** — See [Connecting Polar Flow](/help/articles/registry/integrations/polar). Note: App registration at admin.polaraccesslink.com may be required.
2. **Create a pipeline** — Add Polar Flow as the source, then add boosters and targets.
3. **Sync** — FitGlue receives webhook notifications and imports the full activity data.

## Auth Type: OAuth

Polar uses secure OAuth. Your Polar password is never stored by FitGlue.

## Transaction-Based Sync

Polar uses a unique transaction-based API that ensures reliable data delivery. FitGlue handles all the complexity automatically.

## Related

- [Connecting Polar Flow](/help/articles/registry/integrations/polar)
