---
title: Google Sheets destination — setup and troubleshooting
excerpt: Log your activities to a Google Sheets spreadsheet for custom tracking.
date: 2026-02-08
category: registry
---

## Overview

The Google Sheets destination logs your activity data to a Google Sheets spreadsheet. Each activity becomes a row in your sheet with columns for date, title, type, distance, duration, calories, and booster output. This is ideal for athletes who want to build custom training logs, dashboards, or data analysis in a spreadsheet format.

## How It Works

FitGlue can operate in two modes:

### CREATE mode

A new row is appended to the spreadsheet for each activity. This builds an ongoing activity log.

### UPDATE mode

An existing row (matched by activity ID) is updated with the latest data. This is useful for activities that go through multiple processing stages.

## Configuration

### Spreadsheet ID (`spreadsheet_id`)

The ID of your Google Sheet. Found in the sheet's URL: `https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit`.

### Sheet Name (`sheet_name`)

The name of the specific tab within the spreadsheet. Default: "Sheet1".

### Operation Mode (`mode`)

| Option | Behavior |
|---|---|
| **CREATE** (default) | Append new rows |
| **UPDATE** | Update existing rows by activity ID |

### Column Mapping (`column_mapping`)

Defines which activity fields map to which columns. Default mapping includes the most common fields (date, title, type, distance, duration, calories).

## Data Requirements

- **Google connection** — See [Connecting Google](/help/articles/registry/integrations/google).
- The spreadsheet must exist and be accessible by the connected Google account.

## Tier & Access

The Google Sheets destination requires the **Athlete** (paid) tier.

## Common Issues

**"Spreadsheet not found"** — Check the `spreadsheet_id` is correct. Also ensure the Google account connected to FitGlue has edit access to the spreadsheet. The sheet must be shared with or owned by the connected account.

**Data appearing in wrong columns** — Check your `column_mapping` configuration. The default mapping assumes a specific column order. If your sheet has custom columns, update the mapping accordingly.

**Duplicate rows** — In CREATE mode, every pipeline run appends a new row. Re-posting an activity creates a duplicate row. Switch to UPDATE mode if you want idempotent writes.

**"Google token expired"** — Reconnect via Dashboard → Connections. Google OAuth tokens expire and need periodic refresh.

**Empty cells** — Some fields may be empty if the source or boosters don't provide that data (e.g., no calories for a Hevy workout without the Calories Burned booster).

## Dependencies

- **Required integration**: [Google connection](/help/articles/registry/integrations/google) (OAuth)
- Requires **Athlete tier**

## Related

- [Connecting Google](/help/articles/registry/integrations/google)
