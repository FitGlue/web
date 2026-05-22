import React, { useState, useMemo } from 'react';
import type { components } from '../../../shared/api/schema-public';
import { resolveFamily, FAMILY_STAMP_CLASS, type ActivityFamily } from '../../utils/activityFamily';
import { getActivityIcon } from '../../utils/activityMeta';
import { formatActivityType } from '../../utils/format';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

type FilterKey = 'ALL' | 'RUN' | 'RIDE' | 'STRENGTH' | 'SWIM' | 'OTHER';

const FILTER_FAMILIES: Record<FilterKey, ActivityFamily[]> = {
  ALL:      [],
  RUN:      ['run'],
  RIDE:     ['ride'],
  STRENGTH: ['strength', 'crossfit', 'hiit'],
  SWIM:     ['swim'],
  OTHER:    ['yoga', 'sport', 'paddle', 'hike', 'other'],
};

const FILTERS: FilterKey[] = ['ALL', 'RUN', 'RIDE', 'STRENGTH', 'SWIM', 'OTHER'];

interface Metric { value: string; label: string; }

function buildMetricTrio(family: ActivityFamily, e: ShowcaseProfileEntry): Metric[] {
  const distKm = (e.distanceMeters ?? 0) / 1000;
  const distKmStr = distKm >= 10 ? distKm.toFixed(1) : distKm > 0 ? distKm.toFixed(2) : '—';
  const distMStr = e.distanceMeters ? Math.round(e.distanceMeters).toLocaleString() : '—';
  const durS = e.durationSeconds ?? 0;
  const durStr = durS > 0
    ? (durS >= 3600
        ? `${Math.floor(durS / 3600)}:${String(Math.floor((durS % 3600) / 60)).padStart(2, '0')}`
        : `${Math.floor(durS / 60)}m`)
    : '—';
  const hrStr = (e.avgHeartRate ?? 0) > 0 ? String(e.avgHeartRate) : '—';
  const kcalStr = (e.caloriesKcal ?? 0) > 0 ? e.caloriesKcal!.toLocaleString() : '—';
  const setsStr = (e.totalSets ?? 0) > 0 ? String(e.totalSets) : '—';
  const kgStr = (e.totalWeightKg ?? 0) > 0 ? Math.round(e.totalWeightKg!).toLocaleString() : '—';

  switch (family) {
    case 'run':
    case 'ride':
    case 'hike':
      return [
        { value: distKmStr, label: 'KM' },
        { value: durStr, label: 'DURATION' },
        { value: hrStr, label: 'AVG BPM' },
      ];
    case 'swim':
      return [
        { value: distMStr, label: 'M' },
        { value: durStr, label: 'DURATION' },
        { value: hrStr, label: 'AVG BPM' },
      ];
    case 'strength':
    case 'crossfit':
      return [
        { value: setsStr, label: 'SETS' },
        { value: kgStr, label: 'KG MOVED' },
        { value: durStr, label: 'DURATION' },
      ];
    default:
      return [
        { value: durStr, label: 'DURATION' },
        { value: hrStr, label: 'AVG BPM' },
        { value: kcalStr, label: 'KCAL' },
      ];
  }
}

function buildSparkPath(values: number[] | undefined): string {
  if (!values || values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 26 - ((v - min) / range) * 22;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

interface Props {
  entries: ShowcaseProfileEntry[];
  totalActivities?: number;
}

export default function ActivityGrid({ entries, totalActivities }: Props): React.ReactElement {
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const familyMap = useMemo(() => {
    const map = new Map<string, ActivityFamily>();
    for (const e of entries) {
      if (e.showcaseId) map.set(e.showcaseId, resolveFamily(e.activityType));
    }
    return map;
  }, [entries]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      ALL: entries.length,
      RUN: 0, RIDE: 0, STRENGTH: 0, SWIM: 0, OTHER: 0,
    };
    for (const e of entries) {
      const fam = resolveFamily(e.activityType);
      for (const [key, families] of Object.entries(FILTER_FAMILIES) as [FilterKey, ActivityFamily[]][]) {
        if (key !== 'ALL' && families.includes(fam)) counts[key]++;
      }
    }
    return counts;
  }, [entries]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return entries;
    const families = FILTER_FAMILIES[filter];
    return entries.filter((e) => families.includes(familyMap.get(e.showcaseId ?? '') ?? 'other'));
  }, [entries, filter, familyMap]);

  return (
    <div>
      {/* Feed head */}
      <div className="feed__head">
        <h2>🏃 Activity feed</h2>
        <div className="feed__filters">
          {FILTERS.map((f) => {
            const count = f === 'ALL' ? (totalActivities ?? filterCounts.ALL) : filterCounts[f];
            return (
              <span
                key={f}
                className={`feed__filter${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setFilter(f)}
              >
                {f}{count > 0 ? ` · ${count.toLocaleString()}` : ''}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2-column activity grid */}
      <div className="act-grid">
        {filtered.map((e) => {
          const family = familyMap.get(e.showcaseId ?? '') ?? 'other';
          const stampCls = FAMILY_STAMP_CLASS[family];
          const icon = getActivityIcon(e.activityType);
          const label = formatActivityType(e.activityType).toUpperCase();
          const metrics = buildMetricTrio(family, e);
          const sparkPath = buildSparkPath(e.sparkline?.values);
          const dateStr = e.startTime
            ? new Date(e.startTime).toLocaleDateString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short',
              }).toUpperCase()
            : '';

          return (
            <a
              key={e.showcaseId}
              href={`/showcase/activity/${e.showcaseId}`}
              className="act"
            >
              <div className="act__top">
                <span className={`act__stamp act__stamp--${stampCls}`}>
                  {icon} {label}
                </span>
                <span className="act__date">{dateStr}</span>
              </div>

              <div className="act__title">
                {e.title ?? 'Activity'}
              </div>

              <div className="act__metrics">
                {metrics.map((m, i) => (
                  <div key={i} className="act__metric">
                    <div className="act__metric-n">{m.value}</div>
                    <div className="act__metric-l">{m.label}</div>
                  </div>
                ))}
              </div>

              {sparkPath && (
                <svg className="act__spark" viewBox="0 0 100 28" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spark-g" x1="0" x2="1">
                      <stop offset="0" stopColor="#ff3da6" />
                      <stop offset=".5" stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <path d={sparkPath} stroke="url(#spark-g)" strokeWidth="1.5" fill="none" />
                </svg>
              )}

              {e.prLabel && (
                <span className="act__pr">{e.prLabel}</span>
              )}
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '24px 32px', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          No activities
        </div>
      )}
    </div>
  );
}
