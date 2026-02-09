---
title: GitHub destination — setup and expected output
excerpt: Commit enriched activities as version-controlled Markdown files to your own GitHub repository.
date: 2026-02-09
category: registry
---

## Overview

The GitHub destination commits your enriched activities as Markdown files to a Git repository. After an activity passes through your FitGlue pipeline — with boosters adding AI descriptions, workout summaries, heart rate zones, muscle heatmaps, and more — the full enriched result is committed to your chosen repository as a structured, version-controlled document.

This is particularly valuable for developers and data-conscious athletes who want to own their training data in a format they control. Every commit creates a permanent, diffable record. You can build a GitHub Pages training log, run data analysis scripts against your activity archive, or simply maintain a fitness journal with full version history.

The destination writes Markdown files with YAML frontmatter metadata and the full enriched description. It supports both `CREATE` (new activities) and `UPDATE` (re-enriched activities) operations, and preserves any content you add below a special `<!-- fitglue:end -->` marker.

## Configuration

### Repository (`repo`)

The full `owner/repo` name of the target repository where enriched activities will be committed.

- **Required**: Yes
- **Default**: *(none — must be provided)*
- **What it controls**: Determines where FitGlue commits files. The authenticated GitHub account must have write (push) access to this repository.
- **Format**: Exact match required. Case-sensitive. For organisation repositories, use the full path (e.g. `my-org/fitness-archive`).
- **Edge case**: If the repository doesn't exist or the user lacks write access, the upload fails with a clear error message visible in **Dashboard → Activities → Pipeline Run**.

### Folder Path (`folder`)

Root folder within the repository where activity files are committed.

- **Required**: No
- **Default**: `workouts/`
- **What it controls**: Sets the base directory for the date-based folder hierarchy. The full path for a committed file looks like: `{folder}/{YYYY}/{MM}/{YYYY-MM-DD-activity-slug}/activity.md`.
- **Trailing slash**: Normalised automatically — `workouts`, `workouts/`, and `./workouts/` all behave the same.
- **Non-existent folders**: Created automatically on the first commit. You do not need to pre-create the folder structure.
- **Same folder as source**: If you use the same repository and folder for both source and destination, loop prevention handles it automatically (see below).

## Output & How Content Appears

Each enriched activity is committed as a single Markdown file, placed inside a date-organised folder hierarchy.

### Folder structure

```text
workouts/
├── 2026/
│   ├── 01/
│   │   ├── 2026-01-15-morning-run/
│   │   │   └── activity.md
│   │   └── 2026-01-16-strength-session/
│   │       └── activity.md
│   └── 02/
│       └── 2026-02-08-morning-run/
│           └── activity.md
```

The subfolder name is generated from the activity date and a URL-safe slug of the title. Each activity gets its own directory, which makes it easy to later add related files (photos, GPX exports, extra notes) alongside the Markdown.

### File contents

Each committed file has three sections:

**1. YAML frontmatter** — structured metadata for programmatic access:

```yaml
---
title: "Morning Run"
type: ACTIVITY_TYPE_RUNNING
date: 2026-02-08T07:30:00Z
source: SOURCE_STRAVA
activity_id: "abc123"
pipeline_id: "pipe456"
enrichments: [workout_summary, heart_rate_zones, streak_tracker]
tags: [morning, long-run]
---
```

**2. Enriched body** — the heading, full description with all booster output (workout stats, HR zone breakdown, recovery advice, streak counts, etc.), rendered as Markdown.

**3. `<!-- fitglue:end -->` marker** — everything below this HTML comment is treated as user-owned content. FitGlue never modifies or replaces content below the marker, even when updating the activity. This is where you can add personal notes, photos, or any other content.

### Example committed file

```markdown
---
title: "Morning Run"
type: ACTIVITY_TYPE_RUNNING
date: 2026-02-08T07:30:00Z
source: SOURCE_STRAVA
activity_id: "abc123"
pipeline_id: "pipe456"
enrichments: [workout_summary, heart_rate_zones, streak_tracker]
tags: [morning, long-run]
---

# Morning Run

🏃 Workout Summary
• Distance: 5.2 km
• Duration: 28:00
• Pace: 5:23/km
• Calories: 320

❤️ Heart Rate Zones
• Zone 1 (Recovery): 2:00
• Zone 2 (Aerobic): 12:00
• Zone 3 (Tempo): 10:00
• Zone 4 (Threshold): 4:00

🔥 Streak Tracker
• Running streak: 15 days 🔥

<!-- fitglue:end -->

Personal notes: New shoes feel great on uphills.
```

### Commit metadata

- **Author**: "FitGlue Bot" (`bot@fitglue.com`)
- **New activities**: `Add {Activity Title} — {Date}`
- **Updates**: `Update {Activity Title}`

The "FitGlue Bot" identity is critical — it's how the source handler identifies and ignores FitGlue's own commits for loop prevention.

### Updates and content preservation

When FitGlue updates an existing activity (e.g. a booster runs again with new data, or a delayed enrichment like Parkrun results arrives), it:

1. Fetches the current file's content and SHA from the repository
2. Replaces everything **above** the `<!-- fitglue:end -->` marker with the new enriched content
3. **Preserves** everything below the marker untouched
4. Commits the updated file with a new SHA

If you've written personal notes, embedded images, or added any other content below the marker, it survives every update.

## Tier & Access

The GitHub destination is included in the **Hobbyist** (free) tier. No Athlete subscription is required.

The `isPremium` flag is `false`, so this destination has no Athlete badge or premium sorting in the plugin browser.

## Setup

1. **Connect your GitHub account** — Navigate to **Dashboard → Connections**, find GitHub, and click **Connect**. See [Connecting GitHub](/help/articles/registry/integrations/github) for full details.

2. **Create or edit a pipeline** — Go to **Dashboard → Pipelines**. Either create a new pipeline or edit an existing one.

3. **Add GitHub as a destination** — In the pipeline wizard, select **GitHub** under destinations. Enter:
   - **Repository**: The full `owner/repo` name (e.g. `your-username/fitness-log`)
   - **Folder Path**: Where to commit files (defaults to `workouts/`)

4. **Trigger an activity** — Your next activity from the pipeline's source will be enriched and committed to the repository automatically.

5. **Verify the commit** — Check your repository on GitHub. You should see a new commit by "FitGlue Bot" containing the activity Markdown file in the configured folder.

## Common Issues & Troubleshooting

**Commit not appearing** — Check the pipeline run status in **Dashboard → Activities → Pipeline Run**. If it shows "Failed", the error message will indicate whether it's a permissions issue (HTTP 403 — wrong OAuth scope or missing write access) or a configuration error (HTTP 404 — repository not found).

**HTTP 401 Unauthorized** — The GitHub OAuth token has been revoked. GitHub OAuth tokens don't expire on their own, but they are revoked if you remove FitGlue from **GitHub Settings → Applications → Authorized OAuth Apps**. Reconnect via **Dashboard → Connections → GitHub → Connect**.

**Wrong folder structure** — Verify the folder path is correct. Remember the full committed path is `{folder}/{YYYY}/{MM}/{YYYY-MM-DD-slug}/activity.md`. If you set the folder to `workouts/` and see files appearing at `workouts/workouts/`, the folder value may be duplicated in your configuration.

**Content below marker being overwritten** — Ensure the marker is exactly `<!-- fitglue:end -->` on its own line with no extra whitespace or characters. If the marker is malformed or missing, FitGlue cannot detect user content and will replace the entire file.

**Merge conflicts** — FitGlue uses the GitHub Contents API, which operates at the file level. If you manually edit a file at the same time FitGlue tries to update it, one operation may fail with a SHA mismatch. FitGlue fetches the latest SHA before each write to minimise this, but rapid concurrent edits can still collide. FitGlue will retry once automatically.

**Activities appearing as new instead of updating** — Updates match by file path. If the activity title changes between the original commit and the update, the slug changes, resulting in a new file path. The old file remains in the repository (it's not deleted). To force an update to an existing file, ensure the title stays consistent.

**Rate limiting** — GitHub's API allows up to 5,000 requests per hour for authenticated users. Under normal usage this is never a concern, but if you batch-import hundreds of activities simultaneously, some commits may be rate-limited. FitGlue handles this by queuing and retrying.

## Dependencies

- **Required integration**: [GitHub connection](/help/articles/registry/integrations/github) (OAuth with `repo` scope)
- **Write access**: The authenticated GitHub account must have push access to the target repository
- **Works well with**: Any combination of boosters — all booster output is included in the committed Markdown

## Related

- [Connecting GitHub](/help/articles/registry/integrations/github) — OAuth setup and permissions
- [GitHub as a source](/help/articles/registry/sources/github) — import activities from a repo
- [Google Sheets destination](/help/articles/registry/destinations/googlesheets) — alternative structured destination for tabular logging
- [Showcase destination](/help/articles/registry/destinations/showcase) — alternative for public shareable activity pages
