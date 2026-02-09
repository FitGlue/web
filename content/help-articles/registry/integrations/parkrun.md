---
title: Connecting Parkrun — setup and troubleshooting
excerpt: How to connect your parkrun profile to FitGlue.
date: 2026-02-08
category: registry
---

## Overview

Parkrun connects to FitGlue using your **public parkrun athlete ID**. No OAuth or API key needed — just the number printed on your parkrun barcode. FitGlue uses this ID to look up your results from the parkrun website.

## Authentication Type

**Public ID** — Your parkrun athlete number.

## Setup

1. **Find your athlete ID** — It's the number on your parkrun barcode (e.g., A1234567). You can also find it at parkrun.org.uk → your profile.
2. **Connect in FitGlue** — Dashboard → Connections → Parkrun → Enter your athlete ID.
3. **Verify** — Wait until your next parkrun event and check that results are imported.

## Common Issues

**Wrong results** — Double-check your athlete ID number. An incorrect ID will pull someone else's results.

**"No results found"** — Results take 1–2 hours to be published after the event. FitGlue can't find results that haven't been processed by parkrun yet.

**Visiting a different parkrun** — FitGlue searches all events for your athlete ID, so tourist parkruns should still be found.

## Related

- [Parkrun Results source](/help/articles/registry/sources/parkrun_results)
- [Parkrun booster](/help/articles/registry/enrichers/parkrun)
