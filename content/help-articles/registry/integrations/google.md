---
title: Connecting Google — setup and troubleshooting
excerpt: How to connect your Google account to FitGlue for Google Sheets integration.
date: 2026-02-08
category: registry
---

## Overview

Google connects to FitGlue via **OAuth**. This enables the [Google Sheets destination](/help/articles/registry/destinations/googlesheets), allowing FitGlue to log activity data to your Google Sheets spreadsheets.

## Authentication Type

**OAuth 2.0** — Secure redirect-based authorization with Google's consent screen.

## Setup

1. **Go to FitGlue** — Dashboard → Connections → Google → Connect.
2. **Sign in** with your Google account.
3. **Grant permissions** — Allow FitGlue to access Google Sheets (read and write).
4. **Verify** — Check that the connection shows "Connected".

## Permissions Requested

- **Google Sheets API** — Read and write access to spreadsheets
- **Google Drive API (limited)** — Required to locate and access your spreadsheets

## Common Issues

**"Access denied" or scope error** — Google may show a "This app isn't verified" warning. Click "Advanced" → "Go to FitGlue" to proceed.

**Wrong Google account** — If you have multiple Google accounts and the wrong one is selected, sign out of all Google accounts first, then reconnect.

**Spreadsheet not found** — Ensure the target spreadsheet is owned by or shared with the Google account connected to FitGlue.

**Token expired** — Google tokens expire. FitGlue auto-refreshes, but you may need to reconnect occasionally.

## Related

- [Google Sheets destination](/help/articles/registry/destinations/googlesheets)
