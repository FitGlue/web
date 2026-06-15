import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import { isNativeApp } from '../../shared/nativeBridge';
import ShowcaseNotFound from '../components/ShowcaseNotFound';
import { ShowcaseRoundupExportModal } from '../components/ShowcaseRoundupExportModal';
import { resolveFamily, FAMILY_STAMP_CLASS } from '../utils/activityFamily';
import { ACTIVITY_TYPE_ICONS } from '../utils/activityMeta';
import { formatDuration, formatWeight, formatActivityType, formatSource } from '../utils/format';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];
type RoundupActivityTypeBreakdown = components['schemas']['RoundupActivityTypeBreakdown'];

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

function formatDateRange(start?: string, end?: string): string | null {
  if (!start && !end) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return fmt(start);
  return null;
}

function formatDurationAnchor(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function PRValue({ pr }: { pr: NonNullable<ShowcaseRoundup['prsAchieved']>[number] }) {
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

function SportCard({ bd }: { bd: RoundupActivityTypeBreakdown }) {
  const family = resolveFamily(bd.activityType);
  const stampSuffix = FAMILY_STAMP_CLASS[family];
  const icon = ACTIVITY_TYPE_ICONS[bd.activityType ?? ''] ?? '🏃';
  const isStrength = (bd.totalSets ?? 0) > 0;
  const hasDistance = (bd.totalDistanceMeters ?? 0) > 500;

  let heroVal = '';
  let heroUnit = '';
  let heroLbl = '';
  if (hasDistance) {
    const km = (bd.totalDistanceMeters ?? 0) / 1000;
    heroVal = km >= 10 ? km.toFixed(1) : km.toFixed(2);
    heroUnit = 'KM';
    heroLbl = 'Distance';
  } else if (isStrength) {
    heroVal = String(bd.totalSets);
    heroUnit = '';
    heroLbl = 'Sets';
  } else {
    const mins = Math.round((bd.totalDurationSeconds ?? 0) / 60);
    heroVal = String(mins);
    heroUnit = 'MIN';
    heroLbl = 'Duration';
  }

  return (
    <div className={`roundup-sport-card roundup-sport-card--${stampSuffix}`}>
      <div className="roundup-sport-card__top">
        <span className={`act__stamp act__stamp--${stampSuffix}`}>
          {icon} {formatActivityType(bd.activityType)}
        </span>
        <span className="roundup-sport-card__count">
          {bd.activityCount} {bd.activityCount === 1 ? 'session' : 'sessions'}
        </span>
      </div>
      <div className="roundup-sport-card__hero">
        <span className="roundup-sport-card__hero-val">{heroVal}</span>
        {heroUnit && <span className="roundup-sport-card__hero-unit">{heroUnit}</span>}
      </div>
      <div className="roundup-sport-card__hero-lbl">{heroLbl}</div>
      {isStrength && (bd.totalWeightKg ?? 0) > 0 && (
        <div className="roundup-sport-card__sub">
          {formatWeight(bd.totalWeightKg)}
          {(bd.totalReps ?? 0) > 0 ? ` · ${(bd.totalReps ?? 0).toLocaleString()} reps` : ''}
        </div>
      )}
      {(bd.totalDurationSeconds ?? 0) > 0 && !(!hasDistance && !isStrength) && (
        <div className="roundup-sport-card__dur">{formatDuration(bd.totalDurationSeconds) ?? '—'}</div>
      )}
    </div>
  );
}

function EffortBand({ easy, moderate, hard }: { easy: number; moderate: number; hard: number }) {
  const total = easy + moderate + hard;
  if (total === 0) return null;

  const pctEasy = (easy / total) * 100;
  const pctMod = (moderate / total) * 100;
  const pctHard = (hard / total) * 100;

  return (
    <div className="roundup-effort-band">
      <div className="roundup-effort-band__inner">
        <div className="roundup-effort-band__cell">
          <div className="roundup-effort-band__n">{easy}</div>
          <div className="roundup-effort-band__l">EASY</div>
        </div>
        <div className="roundup-effort-band__cell">
          <div className="roundup-effort-band__n roundup-effort-band__n--moderate">{moderate}</div>
          <div className="roundup-effort-band__l">MODERATE</div>
        </div>
        <div className="roundup-effort-band__cell">
          <div className="roundup-effort-band__n roundup-effort-band__n--hard">{hard}</div>
          <div className="roundup-effort-band__l">HARD</div>
        </div>
        <div className="roundup-effort-band__cell roundup-effort-band__cell--bar">
          <div className="roundup-effort-bar">
            {pctEasy > 0.5 && <div className="roundup-effort-bar__seg roundup-effort-bar__seg--easy" style={{ width: `${pctEasy.toFixed(1)}%` }} />}
            {pctMod > 0.5 && <div className="roundup-effort-bar__seg roundup-effort-bar__seg--moderate" style={{ width: `${pctMod.toFixed(1)}%` }} />}
            {pctHard > 0.5 && <div className="roundup-effort-bar__seg roundup-effort-bar__seg--hard" style={{ width: `${pctHard.toFixed(1)}%` }} />}
          </div>
          <div className="roundup-effort-band__l">TRAINING LOAD</div>
        </div>
      </div>
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
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!slug || !periodKey) { setNotFound(true); setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (publicClient.GET as any)('/showcase/{slug}/roundup/{periodKey}', {
      params: { path: { slug, periodKey } },
    })
      .then(({ data }: { data?: ShowcaseRoundup }) => {
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
  const hasSources = (roundup.sources?.length ?? 0) > 0;
  const hasEffort = ((roundup.effortEasyCount ?? 0) + (roundup.effortModerateCount ?? 0) + (roundup.effortHardCount ?? 0)) > 0;

  const key = periodKey ?? '';
  const ownerProfileHref = roundup.ownerProfileSlug ? `/@${roundup.ownerProfileSlug}` : `/@${slug}`;

  const dateRange = formatDateRange(roundup.periodStart, roundup.periodEnd);
  const prCount = roundup.prsAchieved?.length ?? 0;

  // Total weight across all breakdowns
  const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
  const hasStrength = roundup.activityTypeBreakdowns?.some(bd => (bd.totalSets ?? 0) > 0) ?? false;
  const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;
  const hasElevation = (roundup.totalElevationGainMeters ?? 0) > 50;

  // Anchor stats: sessions / time / distance-or-weight / elevation-or-calories
  const anchorStats: Array<{ val: string; unit?: string; lbl: string }> = [
    {
      val: String(roundup.totalActivities ?? 0),
      lbl: roundup.totalActivities === 1 ? 'Session' : 'Sessions',
    },
  ];

  if ((roundup.totalDurationSeconds ?? 0) > 0) {
    anchorStats.push({ val: formatDurationAnchor(roundup.totalDurationSeconds!), lbl: 'Total Time' });
  }

  if (hasDistance) {
    const km = (roundup.totalDistanceMeters ?? 0) / 1000;
    anchorStats.push({ val: km >= 10 ? km.toFixed(1) : km.toFixed(2), unit: 'KM', lbl: 'Distance' });
  } else if (hasStrength && totalWeightKg > 0) {
    anchorStats.push({ val: formatWeight(totalWeightKg) ?? '—', lbl: 'Weight Moved' });
  }

  if (hasElevation) {
    anchorStats.push({ val: `+${Math.round(roundup.totalElevationGainMeters!).toLocaleString()}`, unit: 'M', lbl: 'Elevation' });
  } else if ((roundup.totalCaloriesKcal ?? 0) > 0) {
    anchorStats.push({ val: roundup.totalCaloriesKcal!.toLocaleString(), lbl: 'Calories' });
  }

  // Pad to 4
  while (anchorStats.length < 4) anchorStats.push({ val: '—', lbl: '—' });
  const stats = anchorStats.slice(0, 4);

  return (
    <div className="showcase-page">
      <div className="showcase-page-bg" aria-hidden="true" />
      <div className="showcase-page-wrap">

        {/* Sticky public nav */}
        {!isNativeApp && (
          <nav className="showcase-pubbar">
            <a className="showcase-pubbar__brand" href="/">
              <span className="showcase-pubbar__brand-icon" aria-hidden="true">FG</span>
              <span className="showcase-pubbar__brand-wordmark" aria-hidden="true">FITGLUE</span>
            </a>
            <span className="showcase-pubbar__crumb">
              <a href={ownerProfileHref}>{roundup.ownerDisplayName?.toUpperCase() ?? 'PROFILE'}</a>
              {' '}
              <b>· {periodTitle(key)}</b>
            </span>
            <div className="showcase-pubbar__actions">
              <button
                className="showcase-pubbar__share-btn"
                onClick={() => setShareOpen(true)}
                aria-label="Share roundup"
              >
                ↑ SHARE
              </button>
            </div>
          </nav>
        )}

        {/* Full-bleed gradient hero */}
        <section className="activity-hero-section">
          <div className="activity-hero__grain" aria-hidden="true" />
          <div className="activity-hero__inner">
            {/* Top stamps */}
            <div className="activity-hero__stamps">
              <span className="stamp stamp--untraditional">{periodTitle(key)}</span>
              {dateRange && <span className="stamp stamp--hero-date">{dateRange}</span>}
              {prCount > 0 && <span className="stamp stamp--hero-pr">+{prCount} PRS</span>}
              {hasSources && roundup.sources!.map(s => (
                <span key={s} className="stamp stamp--hero-source">
                  VIA {formatSource(s).toUpperCase()}
                </span>
              ))}
            </div>

            {/* Title + credit + stats */}
            <div>
              <h1 className="activity-hero__quote">{periodLabel(key)}</h1>
              {roundup.ownerDisplayName && (
                <div className="activity-hero__credit">
                  BY{' '}
                  <b>
                    <a href={ownerProfileHref} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {roundup.ownerDisplayName.toUpperCase()}
                    </a>
                  </b>
                </div>
              )}
              <div className="activity-hero__anchor">
                {stats.map((s, i) => (
                  <div key={i} className="activity-hero__anchor-cell">
                    <div className="activity-hero__anchor-n">
                      {s.val}
                      {s.unit && <span>{s.unit}</span>}
                    </div>
                    <div className="activity-hero__anchor-l">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI summary pull-quote */}
        {roundup.aiSummary && (
          <div className="roundup-ai-summary">
            <div className="roundup-ai-summary__quote-mark" aria-hidden="true">&ldquo;</div>
            <p className="roundup-ai-summary__body">{roundup.aiSummary}</p>
          </div>
        )}

        {/* Effort distribution band */}
        {hasEffort && (
          <EffortBand
            easy={roundup.effortEasyCount ?? 0}
            moderate={roundup.effortModerateCount ?? 0}
            hard={roundup.effortHardCount ?? 0}
          />
        )}

        {/* Sport breakdown */}
        {(roundup.activityTypeBreakdowns?.length ?? 0) > 0 && (
          <div className="roundup-section">
            <div className="roundup-section__title">BY SPORT</div>
            <div className="roundup-sport-grid">
              {roundup.activityTypeBreakdowns!.map((bd, i) => (
                <SportCard key={i} bd={bd} />
              ))}
            </div>
          </div>
        )}

        {/* Highlights — best single activity stats */}
        {(() => {
          const highlights: Array<{ label: string; value: string; sub?: string }> = [];
          const longest = roundup.longestActivityDurationSeconds ?? 0;
          if (longest > 60) {
            const h = Math.floor(longest / 3600);
            const m = Math.floor((longest % 3600) / 60);
            highlights.push({ label: 'LONGEST SESSION', value: h > 0 ? `${h}h ${m}m` : `${m}m` });
          }
          const cph = roundup.highestCaloriesPerHourKcal ?? 0;
          if (cph > 0)
            highlights.push({ label: 'HIGHEST CAL/HR', value: `${Math.round(cph)} kcal/h` });
          const bpm = roundup.highestAvgBpm ?? 0;
          if (bpm > 0)
            highlights.push({ label: 'PEAK AVG BPM', value: `${bpm} bpm`, sub: roundup.highestAvgBpmActivityTitle ?? undefined });
          return highlights.length > 0 ? (
            <div className="roundup-section">
              <div className="roundup-section__title">✦ HIGHLIGHTS</div>
              <div className="roundup-highlights">
                {highlights.map((h, i) => (
                  <div key={i} className="roundup-highlight-card">
                    <div className="roundup-highlight-card__val">{h.value}</div>
                    <div className="roundup-highlight-card__lbl">{h.label}</div>
                    {h.sub && <div className="roundup-highlight-card__sub">{h.sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* HR Zones */}
        {hasZones && <RoundupZoneBar zoneMinutes={roundup.hrZoneMinutes} />}

        {/* PRs */}
        {hasPRs && (
          <div className="roundup-section medal-band" style={{ paddingTop: '32px' }}>
            <div className="medal-band__label">
              🏆 PRS THIS PERIOD
              <b>{roundup.prsAchieved!.length} NEW</b>
            </div>
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

        {/* Footer */}
        {hasSources && (
          <div className="roundup-sources">
            DATA FROM{' '}
            {roundup.sources!.map(s => formatSource(s)).join(' · ')}
          </div>
        )}

        <div className="roundup-back">
          <Link to={ownerProfileHref} className="roundup-back__link">
            ← {roundup.ownerDisplayName ?? 'Athlete'}&apos;s Profile
          </Link>
        </div>

      </div>

      {/* Export modal */}
      {shareOpen && (
        <ShowcaseRoundupExportModal
          roundup={roundup}
          periodKey={key}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
