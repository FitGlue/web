---
title: Connecting Intervals.icu — setup and troubleshooting
excerpt: How to connect your Intervals.icu account to FitGlue using an API key.
date: 2026-02-08
category: registry
---

## Overview

Intervals.icu connects to FitGlue via an **API key**. Intervals.icu is a free training analysis platform. Once connected, FitGlue can both import activities from Intervals.icu (source) and upload enhanced activities to it (destination).

## Authentication Type

**API Key** — Generated from Intervals.icu settings.

## Setup

1. **Get your API key** — Log in to Intervals.icu → Settings → Developer → copy your API key.
2. **Get your Athlete ID** — Also available in Settings → Developer (the number in your Intervals.icu URL).
3. **Connect in FitGlue** — Dashboard → Connections → Intervals.icu → Enter your API key and Athlete ID.
4. **Verify** — Check the connection status changes to "Connected".

## Common Issues

**"Invalid API key"** — Copy the key again, ensuring no extra spaces. The key is typically a long alphanumeric string.

**"Athlete ID not found"** — The Athlete ID is the numeric ID in your Intervals.icu URL (e.g., `intervals.icu/athletes/i12345`). Use the full format including the `i` prefix.

**Activities not appearing** — Intervals.icu receives activities from its own connected sources (Garmin, Strava). There's an inherent cascade delay.

## Related

- [Intervals.icu as a source](/help/articles/registry/sources/intervals)
- [Intervals.icu as a destination](/help/articles/registry/destinations/intervals)
