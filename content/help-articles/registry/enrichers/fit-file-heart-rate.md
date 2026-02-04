---
title: FIT File Heart Rate booster — setup and troubleshooting
excerpt: Upload a FIT file to add heart rate data to your activity with smart GPS alignment
date: 2026-02-04
category: registry
---

## Overview

The FIT File Heart Rate booster lets you upload a FIT file from another device or activity to merge heart rate data into your current activity. Perfect for activities where HR was recorded on a separate device (e.g., chest strap syncing to a different device, Peloton). When an activity is imported without heart rate, FitGlue can create a pending input request for a FIT file upload. FitGlue extracts heart rate samples and merges them using the "Elastic Match" algorithm to align with GPS timestamps when present.

## Setup

1. Add the FIT File Heart Rate booster to your pipeline.
2. Optional: **Force Overwrite** — Overwrite existing heart rate data if present (default: false).
3. When an activity lacks HR, you'll be prompted to upload a FIT file containing HR data.

## No Integrations Required

This booster does not require any external connections. You upload the FIT file manually when prompted.

## Smart GPS Alignment

When your activity has GPS data, FitGlue uses Elastic Match to align the uploaded heart rate with GPS timestamps, handling clock drift between devices automatically (±2 seconds accuracy).

## Use Cases

- Add heart rate from indoor bikes to indoor workouts
- Merge chest strap HR with phone-tracked activities
- Combine HR from one device with GPS from another
- Complete heart rate data on pool swims

## Related

- [Fitbit Heart Rate booster](/help/articles/registry/enrichers/fitbit-heart-rate) (automatic HR from Fitbit)
- [User Input booster](/help/articles/registry/enrichers/user-input) (for manual intervention flows)
