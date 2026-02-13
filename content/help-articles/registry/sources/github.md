---
title: GitHub source — setup and troubleshooting
excerpt: Import activities from a GitHub repository by pushing Markdown files with YAML frontmatter and optional FIT file attachments.
date: 2026-02-09
category: registry
---

## Overview

The GitHub source turns a Git repository into a fitness activity feed. You write (or generate) Markdown files with YAML frontmatter — title, activity type, date, distance — push them to a configured folder, and FitGlue picks them up automatically via a webhook. Each Markdown file becomes one activity in your pipeline.

This source is built for developers, quantified-self enthusiasts, and anyone who wants complete ownership of their training data. Because activities live as plain-text files in a Git repository, you get version history for free, can collaborate via pull requests, and can generate activity files programmatically from scripts, CI/CD pipelines, or other tools.

GitHub is unique among FitGlue sources because it can also serve as a **destination**. When used bidirectionally, FitGlue commits enriched results back to the same (or a different) repository. Loop prevention is built in so the commit FitGlue creates is never re-ingested as a new activity.

The source reads: activity metadata from YAML frontmatter, free-text notes from the Markdown body, and optionally full telemetry from a referenced `.fit` binary. It does **not** read images, videos, or non-Markdown files.

## Configuration

### Repository (`repo`)

The full `owner/repo` name of the GitHub repository to watch, such as `your-username/fitness-log`.

- **Required**: Yes
- **Default**: *(none — must be provided)*
- **What it controls**: Determines which repository's webhooks FitGlue responds to. If the webhook fires from a different repository, the payload is silently ignored.
- **Format**: Must exactly match the GitHub repository's full name. This is case-sensitive — `Your-Username/Fitness-Log` is different from `your-username/fitness-log`. Check your GitHub URL to be sure.
- **Edge case**: Organisation repositories work the same way, e.g. `my-org/team-fitness-log`, provided the authenticated GitHub account has read access.

### Folder Path (`folder`)

The root folder within the repository where FitGlue watches for activity Markdown files.

- **Required**: No
- **Default**: `workouts/`
- **What it controls**: Only files within this folder (and its subdirectories) are processed. Files pushed outside this folder are completely ignored by FitGlue, even if they have valid frontmatter.
- **Trailing slash**: FitGlue normalises the path internally, so `workouts`, `workouts/`, and `./workouts/` all behave identically.
- **Nested watching**: Subdirectories inside the folder are included. If your folder is `workouts/`, then `workouts/running/morning.md` and `workouts/2026/01/session.md` are both picked up.
- **Root-level usage**: Set to an empty string or `/` to watch the entire repository. Be careful — this means every `.md` file in the repo triggers processing.

## Data Ingested

FitGlue parses each `.md` file's YAML frontmatter to extract activity metadata. The Markdown body (text below the closing `---`) becomes the activity's initial description/notes.

### Frontmatter fields

| Frontmatter key | Maps to | Required | Notes |
|---|---|---|---|
| `title` | Activity title | Recommended | If omitted, FitGlue generates a name from `type` + time of day (e.g. "Morning Run") |
| `type` | Activity type | No | Must be a recognised FitGlue type: `running`, `cycling`, `swimming`, `weight_training`, `yoga`, `hiking`, `walking`, `elliptical`, `rowing`, `skiing`. Unrecognised values map to `UNSPECIFIED`. |
| `date` | Start time | No | ISO 8601 date (`2026-02-08`) or datetime (`2026-02-08T07:30:00Z`). If omitted, the commit timestamp is used. |
| `distance_km` | Distance (metres) | No | Kilometres — converted internally. Use `distance_mi` for miles. |
| `distance_mi` | Distance (metres) | No | Miles — converted internally. If both `distance_km` and `distance_mi` are present, `distance_km` takes precedence. |
| `duration_minutes` | Duration | No | Decimal minutes (e.g. `28.5` for 28 min 30 sec). |
| `calories` | Calories | No | Estimated kcal burned. |
| `fit_file` | FIT telemetry | No | Relative path to a `.fit` binary. See **FIT file support** below. |

### FIT file support

When `fit_file` is present in the frontmatter, FitGlue fetches the referenced binary from the same commit SHA and parses the full telemetry data. This unlocks telemetry-dependent boosters:

- **Heart Rate Zones** — needs HR stream data from the FIT file
- **Muscle Heatmap** — builds from exercise/HR data
- **Power Curve Analysis** — needs power meter data
- **Cadence Correlation** — needs cadence stream
- **Elevation Profile** — needs altitude/GPS data

Path resolution: paths can be relative to the Markdown file (`./morning-run.fit`), siblings (`../data/morning-run.fit`), or absolute from the repository root (`data/2026/02/morning-run.fit`).

If the FIT file cannot be found at the resolved path, FitGlue logs a warning and processes the activity without telemetry. The activity still enters the pipeline — it just won't have stream data for boosters that require it.

### What is NOT ingested

- **Files without YAML frontmatter** — Markdown files that don't start with `---` delimiters are silently skipped.
- **Non-Markdown files** — Only `.md` files trigger processing. Binary files, images, JSON, YAML, and all other formats are ignored.
- **Files outside the configured folder** — Even valid activity files are ignored if they're not within the watched folder.
- **Commits by "FitGlue Bot"** — Automatically skipped for loop prevention.

### Sync mechanism

GitHub uses **push webhooks**. When you `git push`, GitHub sends a webhook payload listing the added and modified files. FitGlue filters for `.md` files in the configured folder and processes each one individually.

- **Latency**: Activities typically appear within 5–10 seconds of pushing.
- **Batch support**: A single push with multiple Markdown files creates multiple separate activities.
- **Only push events**: Pull request events, issue events, releases, and other GitHub event types are ignored.
- **Amended commits**: If you `git commit --amend && git push --force`, FitGlue treats the file as modified and processes it again. Deduplication checks the content hash to avoid duplicate activities.

## Tier & Access

The GitHub source is included in the **Hobbyist** (free) tier. No Athlete subscription is required.

The `isPremium` flag is `false`, so this source has no Athlete badge or premium sorting in the plugin browser.

## Setup

1. **Connect your GitHub account** — Navigate to **Dashboard → Connections**, find GitHub, and click **Connect**. You'll be redirected to GitHub to authorise FitGlue. See [Connecting GitHub](/help/articles/registry/integrations/github) for full details.

2. **Create a pipeline** — Go to **Dashboard → Pipelines → New Pipeline**. Select **GitHub** as the source. Enter your repository name (e.g. `your-username/fitness-log`) and optionally change the folder path from the default `workouts/`.

3. **Add boosters and a destination** — Add any enrichment boosters you want (Workout Summary, Heart Rate Zones, etc.) and choose where enriched activities should go.

4. **Push your first activity** — Create a `.md` file in your configured folder, commit and push. Your pipeline should trigger within seconds.

### Example activity file

```markdown
---
title: "Morning Run in the Park"
type: running
date: 2026-02-08T07:30:00Z
distance_km: 5.2
duration_minutes: 28
calories: 320
fit_file: ./morning-run.fit
---

Beautiful sunrise run through Victoria Park. Started with a warm-up
lap then pushed the pace for the middle three kilometres. Felt strong
on the hills today.
```

## Common Issues & Troubleshooting

**Webhook not firing** — Open your repository's **Settings → Webhooks** and check the "Recent Deliveries" tab. A green tick means GitHub sent the payload successfully. If you see no deliveries at all, ensure the webhook is active (checkbox is ticked) and the push event is selected. If you see red crosses, the payload URL or secret may be wrong.

**Activities not appearing after push** — Verify three things: (1) the file is inside your configured folder, (2) the file has `.md` extension, and (3) the file starts with valid YAML frontmatter (two `---` lines). Files missing any of these are silently ignored. Also check that the commit is not authored by "FitGlue Bot" (which is ignored for loop prevention).

**401 Unauthorized on webhook delivery** — The webhook secret in your GitHub settings doesn't match the one FitGlue expects. Copy the secret exactly from your FitGlue dashboard — it's case-sensitive and whitespace-sensitive. Don't add quotes around it.

**Wrong activity type showing** — The `type` field must be one of FitGlue's recognised values: `running`, `cycling`, `swimming`, `weight_training`, `yoga`, `hiking`, `walking`, `elliptical`, `rowing`, `skiing`. Any other value maps to `ACTIVITY_TYPE_UNSPECIFIED`. Check for typos and ensure you're using underscores (e.g. `weight_training`, not `weight-training`).

**FIT file not found** — Ensure the path in `fit_file` is correct relative to the Markdown file's location. The FIT file must exist at the commit SHA being processed — if you add the frontmatter reference in one commit and the binary in a later commit, the first commit won't find it. Push them together.

**Duplicate activities** — Force-pushing (e.g. after a rebase or amend) re-triggers processing for all modified files. FitGlue deduplicates based on content hash, but if you changed the file contents (even whitespace), it will be treated as a new or updated activity. Use the `activity_id` frontmatter field to explicitly control deduplication.

**Pipeline stuck in "Pending"** — If the webhook fires but the pipeline doesn't complete, check the booster configuration. A booster waiting for pending input (e.g. missing provider credentials) will hold the entire pipeline. Check **Dashboard → Activities** for pending input indicators.

## Dependencies

- **Required integration**: [GitHub connection](/help/articles/registry/integrations/github) (OAuth with `repo` scope)
- **Required webhook**: Must be configured manually on the GitHub repository — FitGlue cannot add webhooks automatically
- **Works well with**: Any enrichment booster. If your activities include FIT files, Heart Rate Zones and Elevation Profile add the most value.

## Related

- [Connecting GitHub](/help/articles/registry/integrations/github) — OAuth setup and permissions
- [GitHub as a destination](/help/articles/registry/destinations/github) — commit enriched activities back to a repo
- [File Upload source](/help/articles/registry/sources/file_upload) — alternative for uploading FIT/GPX files directly without a repository
