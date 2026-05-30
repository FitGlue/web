import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import ShowcaseNotFound from '../components/ShowcaseNotFound';
import { formatDuration, formatDistance, formatWeight, formatActivityType, formatSource } from '../utils/format';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];
type RoundupActivityTypeBreakdown = components['schemas']['RoundupActivityTypeBreakdown'];
type ShowcaseTopPR = components['schemas']['ShowcaseTopPR'];

const ZONE_COLORS = ['#334155', '#22d3ee', '#a3ff3d', '#ffd60a', '#ff3da6', '#ff0000'];
const ZONE_NAMES = ['Z1 · RECOVERY', 'Z2 · BASE', 'Z3 · AEROBIC', 'Z4 · THRESHOLD', 'Z5 · MAX', 'Z6 · ANAEROBIC'];

function periodLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) {
    const [, week, year] = periodKey.split('-');
    return `Week ${parseInt(week, 10)} · ${year}`;
  }
  if (periodKey.startsWith('month-')) {
    const [, month, year] = periodKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();
  }
  if (periodKey.startsWith('year-')) {
    return periodKey.replace('year-', '');
  }
  return periodKey;
}

function periodTitle(periodKey: string): string {
  if (periodKey.startsWith('week-')) return 'WEEKLY ROUNDUP';
  if (periodKey.startsWith('month-')) return 'MONTHLY ROUNDUP';
  if (periodKey.startsWith('year-')) return 'YEAR IN REVIEW';
  return 'TRAINING ROUNDUP';
}

function PRValue({ pr }: { pr: ShowcaseTopPR }) {
  const { value, unit } = pr;
  if (!value) return null;

  let display = '';
  let sup = '';
  if (unit === 'seconds') {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = Math.floor(value % 60);
    display = h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  } else if (unit === 'kg') {
    display = String(Math.round(value));
    sup = 'kg';
  } else {
    display = String(Math.round(value));
    sup = unit ?? '';
  }

  return (
    <span>
      {display}
      {sup && <sup>{sup}</sup>}
    </span>
  );
}

function TypeBreakdownCard({ bd }: { bd: RoundupActivityTypeBreakdown }) {
  const name = formatActivityType(bd.activityType);
  const isStrength = bd.totalSets && bd.totalSets > 0;

  return (
    <div className="roundup-type-card">
      <div className="roundup-type-card__name">{name}</div>
      <div className="roundup-type-card__count">{bd.activityCount} {bd.activityCount === 1 ? 'session' : 'sessions'}</div>
      {bd.totalDistanceMeters && bd.totalDistanceMeters > 0
        ? <div className="roundup-type-card__stat">{formatDistance(bd.totalDistanceMeters)}</div>
        : null}
      {isStrength && (
        <div className="roundup-type-card__stat">
          {bd.totalSets} sets · {formatWeight(bd.totalWeightKg) ?? '—'}
        </div>
      )}
      {bd.totalDurationSeconds && bd.totalDurationSeconds > 0
        ? <div className="roundup-type-card__dur">{formatDuration(bd.totalDurationSeconds)}</div>
        : null}
    </div>
  );
}

function RoundupZoneBar({ zoneMinutes }: { zoneMinutes?: number[] }) {
  if (!zoneMinutes || zoneMinutes.length === 0) return null;
  const total = zoneMinutes.reduce((s, m) => s + (m ?? 0), 0);
  if (total < 30) return null;

  const totalHours = Math.round(total / 60);

  return (
    <div className="zone-band">
      <div className="zone-band__label">❤️ HR ZONES THIS PERIOD · {totalHours}H TRACKED</div>
      <div className="zone-bar">
        {zoneMinutes.map((mins, i) => {
          const pct = (mins / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={i}
              className="zone-bar__seg"
              style={{ width: `${pct.toFixed(2)}%`, background: ZONE_COLORS[i] ?? ZONE_COLORS[5] }}
              title={`${ZONE_NAMES[i]}: ${Math.round(pct)}%`}
            />
          );
        })}
      </div>
      <div className="zone-legend">
        {zoneMinutes.map((mins, i) => {
          const pct = Math.round((mins / total) * 100);
          if (pct < 1) return null;
          const hours = Math.round(mins / 60);
          return (
            <div key={i} className="zone-legend__item">
              <span className="zone-legend__dot" style={{ background: ZONE_COLORS[i] ?? ZONE_COLORS[5] }} />
              <span className="zone-legend__name">{ZONE_NAMES[i]}</span>
              <span className="zone-legend__pct">{pct}%</span>
              {hours > 0 && <span className="zone-legend__hours">{hours}h</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ShowcaseRoundupPage() {
  const { slug: rawSlug, id: periodKey } = useParams<{ slug: string; id: string }>();
  const slug = rawSlug?.startsWith('@') ? rawSlug.slice(1) : rawSlug;

  const [roundup, setRoundup] = useState<ShowcaseRoundup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !periodKey) { setNotFound(true); setLoading(false); return; }
    publicClient
      .GET('/showcase/{slug}/roundup/{periodKey}', {
        params: { path: { slug, periodKey } },
      })
      .then(({ data }) => {
        if (!data) { setNotFound(true); return; }
        setRoundup(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, periodKey]);

  if (loading) {
    return (
      <div className="showcase-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Loading roundup…
          </span>
        </div>
      </div>
    );
  }

  if (notFound || !roundup) {
    return <ShowcaseNotFound type="activity" />;
  }

  const hasPRs = (roundup.prsAchieved?.length ?? 0) > 0;
  const hasZones = (roundup.hrZoneMinutes?.some(m => (m ?? 0) > 0)) ?? false;
  const hasStrength = roundup.activityTypeBreakdowns?.some(bd => (bd.totalSets ?? 0) > 0) ?? false;
  const hasSources = (roundup.sources?.length ?? 0) > 0;

  return (
    <div className="showcase-page">
        {/* Hero */}
        <div className="roundup-hero">
          <div className="roundup-hero__eyebrow">{periodTitle(periodKey ?? '')}</div>
          <div className="roundup-hero__period">{periodLabel(periodKey ?? '')}</div>
          {roundup.ownerDisplayName && (
            <div className="roundup-hero__athlete">
              {roundup.ownerProfilePictureUrl && (
                <img className="roundup-hero__avatar" src={roundup.ownerProfilePictureUrl} alt="" />
              )}
              <span>{roundup.ownerDisplayName}</span>
            </div>
          )}
          <div className="roundup-hero__headline">
            {roundup.totalActivities} {roundup.totalActivities === 1 ? 'SESSION' : 'SESSIONS'}
          </div>
        </div>

        {/* Stats banner */}
        <div className="roundup-stats-banner">
          {roundup.totalDurationSeconds && roundup.totalDurationSeconds > 0 ? (
            <div className="roundup-stat">
              <div className="roundup-stat__val">{formatDuration(roundup.totalDurationSeconds)}</div>
              <div className="roundup-stat__lbl">TOTAL TIME</div>
            </div>
          ) : null}
          {roundup.totalDistanceMeters && roundup.totalDistanceMeters > 0 ? (
            <div className="roundup-stat">
              <div className="roundup-stat__val">{formatDistance(roundup.totalDistanceMeters)}</div>
              <div className="roundup-stat__lbl">DISTANCE</div>
            </div>
          ) : null}
          {hasStrength && roundup.activityTypeBreakdowns ? (
            <div className="roundup-stat">
              <div className="roundup-stat__val">
                {formatWeight(roundup.activityTypeBreakdowns.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0)) ?? '—'}
              </div>
              <div className="roundup-stat__lbl">WEIGHT MOVED</div>
            </div>
          ) : null}
          {roundup.totalCaloriesKcal && roundup.totalCaloriesKcal > 0 ? (
            <div className="roundup-stat">
              <div className="roundup-stat__val">{roundup.totalCaloriesKcal.toLocaleString()}</div>
              <div className="roundup-stat__lbl">CALORIES</div>
            </div>
          ) : null}
        </div>

        {/* Activity type breakdown */}
        {(roundup.activityTypeBreakdowns?.length ?? 0) > 0 && (
          <div className="roundup-section">
            <div className="roundup-section__title">BY SPORT</div>
            <div className="roundup-type-grid">
              {roundup.activityTypeBreakdowns!.map((bd, i) => (
                <TypeBreakdownCard key={i} bd={bd} />
              ))}
            </div>
          </div>
        )}

        {/* HR Zones */}
        {hasZones && <RoundupZoneBar zoneMinutes={roundup.hrZoneMinutes} />}

        {/* PRs */}
        {hasPRs && (
          <div className="roundup-section medal-band">
            <div className="medal-band__label">🏆 PRS THIS PERIOD · {roundup.prsAchieved!.length} NEW</div>
            <div className="medals">
              {roundup.prsAchieved!.map((pr, i) => (
                <div key={i} className="medal medal--gr">
                  <div>
                    <div className="medal__icon">{pr.unit === 'seconds' ? '⚡' : '🏋️'}</div>
                    <div className="medal__label">
                      {(pr.recordType ?? '').replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="medal__n"><PRValue pr={pr} /></div>
                    {pr.previousValue != null && pr.value != null && (
                      <div className="medal__sub">
                        {pr.unit === 'kg'
                          ? `+${Math.round(pr.value - pr.previousValue)} kg`
                          : `−${Math.round(pr.previousValue - pr.value)}s`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {hasSources && (
          <div className="roundup-sources">
            DATA FROM{' '}
            {roundup.sources!.map(s => formatSource(s)).join(' · ')}
          </div>
        )}

        {/* Back link */}
        <div className="roundup-back">
          <Link to={`/@${roundup.ownerProfileSlug ?? slug}`} className="roundup-back__link">
            ← {roundup.ownerDisplayName ?? 'Athlete'}&apos;s Profile
          </Link>
        </div>
    </div>
  );
}
