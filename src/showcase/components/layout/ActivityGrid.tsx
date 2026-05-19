import React, { useState, useMemo } from 'react';
import type { components } from '../../../shared/api/schema-public';
import { CATEGORY_ACCENT, resolveCategory } from '../../utils/activityCategory';
import { getActivityIcon } from '../../utils/activityMeta';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

type FilterKey = 'ALL' | 'RUN' | 'RIDE' | 'STRENGTH' | 'OTHER';

function entryCategory(e: ShowcaseProfileEntry): string {
  const t = e.activityType ?? '';
  const runTypes = ['ACTIVITY_TYPE_RUN', 'ACTIVITY_TYPE_TRAIL_RUN', 'ACTIVITY_TYPE_VIRTUAL_RUN'];
  const rideTypes = ['ACTIVITY_TYPE_RIDE', 'ACTIVITY_TYPE_GRAVEL_RIDE', 'ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE', 'ACTIVITY_TYPE_EBIKE_RIDE', 'ACTIVITY_TYPE_VIRTUAL_RIDE'];
  const strengthTypes = ['ACTIVITY_TYPE_WEIGHT_TRAINING', 'ACTIVITY_TYPE_CROSSFIT'];
  if (runTypes.includes(t)) return 'RUN';
  if (rideTypes.includes(t)) return 'RIDE';
  if (strengthTypes.includes(t) || (e.totalSets ?? 0) > 0) return 'STRENGTH';
  return 'OTHER';
}

function formatDur(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDist(m: number): string {
  if (m <= 0) return '';
  const km = m / 1000;
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
}

function groupByDate(entries: ShowcaseProfileEntry[]): { dateKey: string; entries: ShowcaseProfileEntry[] }[] {
  const map = new Map<string, ShowcaseProfileEntry[]>();
  for (const e of entries) {
    const d = e.startTime
      ? new Date(e.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Unknown date';
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }
  return Array.from(map.entries()).map(([dateKey, entries]) => ({ dateKey, entries }));
}

const FILTERS: FilterKey[] = ['ALL', 'RUN', 'RIDE', 'STRENGTH', 'OTHER'];

interface Props {
  entries: ShowcaseProfileEntry[];
}

export default function ActivityGrid({ entries }: Props): React.ReactElement {
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return entries;
    return entries.filter((e) => entryCategory(e) === filter);
  }, [entries, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div>
      {/* Filter chips */}
      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' filter-chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity feed */}
      <div className="activity-feed">
        {grouped.map(({ dateKey, entries: dayEntries }) => (
          <React.Fragment key={dateKey}>
            <div className="feed-day-separator">{dateKey}</div>
            {dayEntries.map((e) => {
              const cat = resolveCategory({ activityType: e.activityType, activityData: undefined });
              const accent = CATEGORY_ACCENT[cat];
              const icon = getActivityIcon(e.activityType);
              const dist = formatDist(e.distanceMeters ?? 0);
              const dur = formatDur(e.durationSeconds ?? 0);

              return (
                <a
                  key={e.showcaseId}
                  href={`/showcase/activity/${e.showcaseId}`}
                  className="feed-card"
                >
                  <div
                    className="feed-card__category-bar"
                    style={{ background: accent }}
                  />
                  <div className="feed-card__main">
                    <div className="feed-card__title">
                      {icon} {e.title ?? 'Activity'}
                    </div>
                    <div className="feed-card__meta">
                      {dist && <span>{dist}</span>}
                      {dur && <span>{dur}</span>}
                      {(e.avgHeartRate ?? 0) > 0 && <span>{e.avgHeartRate} bpm</span>}
                      {(e.caloriesKcal ?? 0) > 0 && <span>{e.caloriesKcal} kcal</span>}
                      {(e.totalSets ?? 0) > 0 && <span>{e.totalSets} sets</span>}
                      {(e.boosterCount ?? 0) > 0 && <span>{e.boosterCount} boosters</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </React.Fragment>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 'var(--space-md) 0', color: 'var(--color-text-muted)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            No activities
          </div>
        )}
      </div>
    </div>
  );
}
