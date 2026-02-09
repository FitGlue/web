---
title: Connecting GitHub — authentication and webhook setup
excerpt: How to connect your GitHub account to FitGlue for repository-based activity tracking — OAuth setup, webhook configuration, and permissions explained.
date: 2026-02-09
category: registry
---

## Overview

The GitHub integration connects your GitHub account to FitGlue via secure OAuth 2.0, enabling bidirectional activity sync through Git repositories. Once connected, you can use GitHub as a **source** (import activities from Markdown files you push), a **destination** (commit enriched activities as Markdown), or both simultaneously.

This is a developer-focused integration. Unlike fitness platform integrations (Strava, Fitbit) that sync structured workout data over APIs, GitHub works with plain-text Markdown files version-controlled in a Git repository. This gives you full ownership, portability, and auditability of your training data.

The integration handles authentication only — it provides the OAuth token that the GitHub source and destination plugins use to interact with the GitHub API. The source also requires a webhook (configured separately on your repository) to receive push notifications.

## Setup

### Step 1: Connect via OAuth

1. Open the **FitGlue Dashboard** at `app.fitglue.com`
2. Navigate to **Connections** (in the side navigation)
3. Find **GitHub** in the list and click **Connect**
4. You'll be redirected to GitHub's authorisation page at `github.com`
5. Review the requested permissions — FitGlue asks for the `repo` scope
6. Click **Authorize FitGlue**
7. You'll be redirected back to FitGlue with a success message
8. The connection status changes to **Connected** ✅ with your GitHub username displayed

After authorisation, FitGlue stores an encrypted OAuth access token. GitHub OAuth tokens are long-lived — they don't expire unless you explicitly revoke them.

### Step 2: Configure a pipeline

Once connected, use GitHub as a source, destination, or both:

- **As a source**: Enter the repository name (e.g. `your-username/fitness-log`) and the folder to watch (defaults to `workouts/`). You'll also need to set up a webhook (Step 3).
- **As a destination**: Enter the repository name and folder where enriched activities should be committed.
- **Bidirectional**: Configure one pipeline with GitHub as source and another pipeline (or the same one) with GitHub as destination. Loop prevention is automatic.

### Step 3: Webhook setup (source only)

If you're using GitHub as a **source**, you must add a webhook to your repository so GitHub notifies FitGlue when new activity files are pushed. This step is not needed for destination-only use.

1. Go to your repository on GitHub
2. Navigate to **Settings → Webhooks → Add webhook**
3. Fill in the configuration:

| Field | Value |
|---|---|
| **Payload URL** | `https://api.fitglue.com/hooks/github` |
| **Content type** | `application/json` |
| **Secret** | The shared webhook secret from your FitGlue dashboard |
| **Events** | Select **Just the push event** |
| **Active** | ✅ Checked |

4. Click **Add webhook**
5. GitHub sends a test ping — check the **Recent Deliveries** tab for a green tick ✅

The webhook secret provides HMAC-SHA256 signature verification. Every incoming payload is verified against this secret before processing. If the signature doesn't match, the payload is rejected with an HTTP 401.

## Permissions

FitGlue requests the `repo` OAuth scope. This is the most granular scope GitHub offers that allows reading and writing individual files.

| What `repo` grants | How FitGlue uses it |
|---|---|
| Read repository contents | Fetching `.md` and `.fit` files when used as a source |
| Write repository contents | Committing enriched Markdown files when used as a destination |
| Read repository metadata | Verifying repository access and resolving file paths |

**What FitGlue does NOT do:** FitGlue does not read your code, issues, pull requests, actions, secrets, or any content outside your configured repository and folder. It does not create branches, open pull requests, or modify repository settings. It does not access any repository other than the one(s) you explicitly configure.

## Bidirectional Use

GitHub can function as both a source and a destination. Here's the data flow when used bidirectionally:

```text
You push an activity file (.md)
    ↓
GitHub fires webhook → FitGlue Source
    ↓
FitGlue pipeline enriches the activity
    ↓
FitGlue commits enriched file → GitHub Destination (as "FitGlue Bot")
    ↓
GitHub fires webhook → FitGlue Source
    ↓
Source checks commit author → "FitGlue Bot" → IGNORED ✅
```

Loop prevention works by checking the commit author name. All destination commits use the "FitGlue Bot" identity, and the source handler skips any commits from this author. This is completely automatic — no configuration is needed.

You can use the **same** repository and folder for both source and destination, or different repositories/folders. All combinations are supported:

| Source repo | Destination repo | Works? | Notes |
|---|---|---|---|
| Same | Same | ✅ | Loop prevention handles it |
| Same | Different | ✅ | No loop risk |
| Different | Same | ✅ | No loop risk |
| Different | Different | ✅ | Fully independent |

## Security

| Mechanism | Details |
|---|---|
| **OAuth tokens** | Stored encrypted in Firestore using AES-256. Never logged, never exposed in API responses. |
| **Webhook verification** | Every incoming webhook payload is verified via HMAC-SHA256 using the shared secret. Invalid signatures return HTTP 401. |
| **Scope limitation** | FitGlue only accesses the specific repository and folder you configure — never other repos. |
| **Commit attribution** | All FitGlue commits are authored by "FitGlue Bot" for clear traceability. |
| **Loop prevention** | FitGlue Bot commits are automatically ignored by the source handler. |
| **Token revocation** | You can revoke access at any time from **GitHub → Settings → Applications → Authorized OAuth Apps → FitGlue → Revoke**. |

## Tier & Access

The GitHub integration is available on the **Hobbyist** (free) tier. Both source and destination features are included at no additional cost.

## Common Issues & Troubleshooting

**"User Not Found" error during OAuth** — This occurs when the OAuth callback can't match your GitHub account to a FitGlue user. Make sure you're logged into FitGlue **before** clicking Connect. If you have multiple browser profiles or incognito windows, ensure the FitGlue session is active in the same browser window.

**Webhook returning 401** — The webhook secret doesn't match. The secret is case-sensitive, whitespace-sensitive, and must be an exact copy. Don't add quotes or trailing newlines. Re-copy it from your FitGlue dashboard and paste it into the GitHub webhook settings.

**Webhook returning 200 but no activity appears** — A 200 response means the webhook was received and verified, but no actionable files were found. Check that your pushed file: (1) is inside the configured folder, (2) has a `.md` extension, (3) contains valid YAML frontmatter, and (4) was not authored by "FitGlue Bot".

**"Connection expired" in dashboard** — GitHub OAuth tokens don't expire on their own, but they can be revoked. If you removed FitGlue from GitHub's Authorized Apps, or an organisation admin revoked third-party app access, the token becomes invalid. Click **Connect** again to re-authenticate.

**Permission denied on destination commit** — The authenticated GitHub account must have **write** (push) access to the target repository. For personal repositories, the owner always has write access. For organisation repositories, check with your org admin that (1) third-party OAuth apps are allowed, and (2) your account has the Maintain or Admin role.

**Webhook not appearing in GitHub settings** — Only repository admins can manage webhooks. If you don't see **Settings → Webhooks**, you may not have admin access to the repository. Ask the repository owner to add the webhook, or transfer the repo to your own account.

**Multiple repositories** — Each pipeline can target one repository. To use GitHub with multiple repositories, create separate pipelines — one per repository. Each pipeline independently configures its own `repo` and `folder`.

## Disconnecting

To disconnect GitHub from FitGlue:

1. Go to **Dashboard → Connections**
2. Find GitHub and click **Disconnect**
3. Optionally, revoke the OAuth token on GitHub: **Settings → Applications → Authorized OAuth Apps → FitGlue → Revoke**

Disconnecting removes the stored access token from FitGlue. Existing committed files in your repository are not affected — they remain as permanent Git history. Pipelines using GitHub will stop processing until you reconnect.

## Dependencies

- **OAuth account**: A GitHub account (free or paid) with access to the target repositories
- **Webhook (source only)**: Must be manually configured on each repository used as a source
- **Repository access**: Write access is required for destination use; read access is sufficient for source-only use

## Related

- [GitHub as a source](/help/articles/registry/sources/github) — import activities from Markdown files
- [GitHub as a destination](/help/articles/registry/destinations/github) — commit enriched activities as Markdown
- [Strava connection](/help/articles/registry/integrations/strava) — similar OAuth-based integration for a fitness platform
- [Google connection](/help/articles/registry/integrations/google) — similar OAuth flow for Google Sheets
