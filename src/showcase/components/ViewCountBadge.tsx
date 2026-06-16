import React from 'react';
import type { components } from '../../shared/api/schema-client';

type ShowcaseViewStats = components['schemas']['ShowcaseViewStats'];

/** int64 fields arrive as strings over protojson; coerce safely. */
function toNumber(v: string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Compact count formatting: 1234 → "1.2k". */
function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}

/**
 * Owner-only chip showing de-duplicated view metrics inline on a public showcase
 * page. Rendered only when the viewer is the logged-in owner; visitors never
 * receive these counts (the underlying endpoints are ownership-scoped).
 */
export function ViewCountBadge({ stats }: { stats: ShowcaseViewStats | null }) {
  if (!stats) return null;
  const views = toNumber(stats.views);
  const visitors = toNumber(stats.visitors);

  return (
    <span className="showcase-view-badge" title="Only you can see this — your own visits aren't counted">
      <span aria-hidden="true">👁</span>
      <span>{formatCount(views)} {views === 1 ? 'view' : 'views'}</span>
      <span className="showcase-view-badge__sep">·</span>
      <span>{formatCount(visitors)} {visitors === 1 ? 'visitor' : 'visitors'}</span>
    </span>
  );
}

export default ViewCountBadge;
