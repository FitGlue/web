---
title: Spotify Tracks booster — configuration and troubleshooting
excerpt: Add the songs you were listening to during your workout.
date: 2026-02-08
category: registry
---

## Overview

The Spotify Tracks booster fetches your recently played tracks from Spotify that overlap with your activity's time window and adds them to the description. Your followers can see exactly what music powered your workout, with artist names and track titles listed in order.

## Configuration

### Max Tracks (`max_tracks`)

Maximum number of tracks to display. Default: **10**. Set lower for shorter descriptions.

### Show BPM (`show_bpm`)

When enabled, displays the BPM (beats per minute) of each track alongside the title. Useful for runners who train to cadence-matched music.

## Data Requirements

- **Spotify connection** — See [Connecting Spotify](/help/articles/registry/integrations/spotify).
- **Active listening during the activity** — Spotify must have been playing during the activity's time window.

## How Content Appears

### On Strava (description)

```
🎵 Workout Playlist
1. Blinding Lights — The Weeknd (171 BPM)
2. Don't Start Now — Dua Lipa (124 BPM)
3. Levels — Avicii (126 BPM)
```

## Tier & Access

The Spotify Tracks booster requires the **Athlete** (paid) tier.

## Common Issues

**No tracks found** — Spotify wasn't playing during your activity, or the activity's timestamp doesn't overlap with your listening history.

**Wrong tracks listed** — Spotify's API provides "recently played" which may include tracks from before or after the activity if timestamps are close. The booster attempts to match the activity time window.

**"Spotify connection expired"** — Reconnect via Dashboard → Connections. Spotify OAuth tokens expire periodically.

## Dependencies

- **Required integration**: [Spotify connection](/help/articles/registry/integrations/spotify) (OAuth)
- Requires **Athlete tier**

## Related

- [Connecting Spotify](/help/articles/registry/integrations/spotify)
