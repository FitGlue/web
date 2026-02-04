---
title: Google Sheets destination — setup and troubleshooting
excerpt: Log activities to a Google Spreadsheet
date: 2026-02-04
category: registry
---

## Overview

The Google Sheets destination automatically logs all your activities to a Google Sheet for personal tracking, analysis, and visualization. Once you connect your Google account and provide a Spreadsheet ID, FitGlue appends a new row for each activity. Columns include date, type, title, duration, distance, calories, heart rate, and more. Optionally, muscle heatmaps and route thumbnails can be embedded using IMAGE formulas.

## Temporarily Unavailable

The Google Sheets destination is currently **temporarily unavailable**. FitGlue is working on restoring this integration.

## Setup (when available)

1. **Connect Google** — See [Connecting Google](/help/articles/registry/integrations/google).
2. **Create a pipeline** — Add your source and boosters, then add Google Sheets as a target.
3. **Configure** — Provide your Spreadsheet ID (from the URL: docs.google.com/spreadsheets/d/{ID}/edit) and optionally:
   - **Sheet Name** — Which tab to append to (default: "Activities")
   - **Include Showcase Link** — Add a column with the Showcase URL
   - **Include Visual Assets** — Add IMAGE formulas for muscle heatmaps and route thumbnails

## Config Fields

| Field | Description |
|-------|-------------|
| Spreadsheet ID | From your Google Sheets URL |
| Sheet Name | Tab to append to (default: Activities) |
| Include Showcase Link | Add Showcase URL column |
| Include Visual Assets | Embed muscle heatmaps and route thumbnails via IMAGE formulas |

## Dependencies

Requires the **Google** integration (OAuth) to be connected.

## Related

- [Connecting Google](/help/articles/registry/integrations/google)
