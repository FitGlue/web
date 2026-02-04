---
title: My pipeline isn't running — what do I check?
excerpt: Common causes and how to fix them when your pipeline isn't syncing activities.
date: 2026-02-04
category: troubleshooting
---

## Checklist

When your pipeline isn't syncing, work through these in order:

### 1. Are your connections active?

Go to **Settings → Connections** and check that all connections used by your pipeline show a green status. If a connection was revoked (e.g. you changed your Strava password), you'll need to reconnect it.

### 2. Is there new data to sync?

FitGlue syncs when your source has new activities. If you haven't completed a workout or uploaded an activity since creating the pipeline, there's nothing to sync yet. Try completing a workout in your source app and wait a few minutes.

### 3. Have you hit your sync limit?

Hobbyist accounts have 25 syncs per month. If you've reached the limit, syncs pause until the next month. Check your usage in **Settings → Subscription**. Upgrade to Athlete for unlimited syncs.

### 4. Is the pipeline enabled?

In **Pipelines**, ensure your pipeline isn't paused. Toggle it on if needed.

### 5. Webhook or polling delay

Some sources (e.g. Strava, Hevy) use webhooks and sync within minutes. Others may have a short delay. If it's been more than 30 minutes and you've ruled out the above, [contact support](mailto:support@fitglue.tech).

## Still stuck?

- [Why can I only have one source per pipeline?](/help/articles/troubleshooting/why-one-source-per-pipeline)
- [Contact us](/contact)
