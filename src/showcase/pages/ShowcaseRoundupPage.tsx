import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import { isNativeApp } from '../../shared/nativeBridge';
import ShowcaseNotFound from '../components/ShowcaseNotFound';
import { ShowcaseRoundupExportModal } from '../components/ShowcaseRoundupExportModal';
import { formatSource, formatWeight } from '../utils/format';
import {
  type ShowcaseRoundup,
  type SportVM,
  type CalDay,
  HR_ZONES,
  SOURCE_PALETTE,
  fmtKm,
  fmtHM,
  periodWord,
  heroTitle,
  periodShortLabel,
  formatDateRange,
  ownerInitials,
  computePrevPeriodKey,
  buildSportVMs,
  buildCalendarDays,
  calloutVisual,
  buildPRVM,
  buildDeltas,
  activityGlyph,
  formatClock,
  formatMuscle,
  elevationComparison,
} from '../utils/roundup';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['', 'MON', '', 'WED', '', 'FRI', ''];

/* ============================================================
   SVG charts (pure, no chart lib)
   ============================================================ */

function SportDonut({ data, total }: { data: SportVM[]; total: number }) {
  const R = 70, C = 2 * Math.PI * R, cx = 100, cy = 100;
  let offset = 0;
  const segs = data.map((d) => {
    const frac = total > 0 ? d.count / total : 0;
    const seg = { ...d, frac, dash: frac * C, offset: offset * C };
    offset += frac;
    return seg;
  });
  return (
    <div className="rp-donut-wrap">
      <svg className="rp-donut" viewBox="0 0 200 200" role="img" aria-label="Sessions by sport">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(245,243,235,0.06)" strokeWidth="26" />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {segs.map((s) => (
            <circle
              key={s.type}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="26"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.offset}
            >
              <title>{`${s.label}: ${s.count} sessions (${Math.round(s.frac * 100)}%)`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="rp-donut__center">
        <b>{total}</b>
        <span>Sessions</span>
      </div>
    </div>
  );
}

function StackedDistance({ data }: { data: SportVM[] }) {
  const withDist = data.filter((d) => d.distanceMeters > 0);
  if (withDist.length === 0) return null;
  const total = withDist.reduce((a, d) => a + d.distanceMeters, 0);
  return (
    <div className="rp-stack">
      <div className="rp-stack__head">
        <span className="rp-stack__title">Distance by sport</span>
        <span className="rp-stack__total">{fmtKm(total)} km</span>
      </div>
      <div className="rp-stack__bar">
        {withDist.map((d) => {
          const pct = (d.distanceMeters / total) * 100;
          return (
            <div
              key={d.type}
              className="rp-stack__seg"
              style={{ width: `${pct}%`, background: d.color }}
              title={`${d.label}: ${fmtKm(d.distanceMeters)} km`}
            >
              {pct > 12 && <b>{fmtKm(d.distanceMeters)} km</b>}
            </div>
          );
        })}
      </div>
      <div className="rp-stack__legend">
        {withDist.map((d) => (
          <span key={d.type} className="rp-stack__item">
            <i style={{ background: d.color }} />
            {d.label} <b>{fmtKm(d.distanceMeters)} km</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function HRRings({ minutes }: { minutes: number[] }) {
  const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
  const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
  const cx = 100, cy = 100;
  const radii = [86, 70, 54, 38, 22]; // outer Z1 → inner Z5
  return (
    <div className="rp-hrring-wrap">
      <svg className="rp-hrring" viewBox="0 0 200 200" role="img" aria-label="Time in heart-rate zones">
        {radii.map((R, idx) => {
          const C = 2 * Math.PI * R;
          const frac = zoneMin[idx] / total;
          const z = HR_ZONES[idx];
          return (
            <g key={z.z} transform={`rotate(-90 ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(245,243,235,0.06)" strokeWidth="11" />
              <circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={z.color}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={`${frac * C} ${C}`}
                style={{ filter: idx >= 3 ? `drop-shadow(0 0 4px ${z.color})` : 'none' }}
              >
                <title>{`${z.z} ${z.name}: ${Math.round(zoneMin[idx] / 60)}h (${Math.round(frac * 100)}%)`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <div className="rp-hrring__center">
        <b>{Math.round(total / 60)}h</b>
        <span>HR Tracked</span>
      </div>
    </div>
  );
}

function HRLegend({ minutes }: { minutes: number[] }) {
  const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
  const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="rp-hrlegend">
      {HR_ZONES.map((z, idx) => {
        const { h, m } = fmtHM(zoneMin[idx] * 60);
        return (
          <div key={z.z} className="rp-hrlegend__row">
            <span className="rp-hrlegend__dot" style={{ background: z.color }} />
            <span className="rp-hrlegend__name">{z.z}<span>{z.name}</span></span>
            <span className="rp-hrlegend__time">{h}h {m}m</span>
            <span className="rp-hrlegend__pct">{Math.round((zoneMin[idx] / total) * 100)}%</span>
          </div>
        );
      })}
    </div>
  );
}

function ConsistencyCalendar({ days, yearLabel }: { days: CalDay[]; yearLabel: string }) {
  const weeks = useMemo(() => {
    const cols: (CalDay | null)[][] = [];
    let cur: (CalDay | null)[] = [];
    if (days.length === 0) return cols;
    const first = days[0];
    for (let i = 0; i < first.dow; i++) cur.push(null);
    days.forEach((d) => {
      cur.push(d);
      if (d.dow === 6) { cols.push(cur); cur = []; }
    });
    if (cur.length) { while (cur.length < 7) cur.push(null); cols.push(cur); }
    return cols;
  }, [days]);

  const monthMarks = useMemo(() => {
    const marks: { wi: number; mo: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((wk, wi) => {
      const firstReal = wk.find((d) => d);
      if (!firstReal) return;
      const mo = new Date(firstReal.ts).getUTCMonth();
      if (mo !== lastMonth) { marks.push({ wi, mo }); lastMonth = mo; }
    });
    return marks;
  }, [weeks]);

  const active = days.filter((d) => d.level > 0).length;
  const hard = days.filter((d) => d.level >= 3).length;
  const levelNames = ['Rest', 'Easy', 'Moderate', 'Hard', 'Peak'];

  return (
    <div>
      <div className="rp-cal">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'grid',
              gridAutoFlow: 'column',
              gap: '3px',
              marginLeft: '34px',
              marginBottom: '6px',
              gridTemplateColumns: `repeat(${weeks.length}, 14px)`,
            }}
          >
            {weeks.map((_, wi) => {
              const mk = monthMarks.find((m) => m.wi === wi);
              return (
                <div key={wi} className="rp-cal__monthlbl" style={{ gridColumn: `${wi + 1}` }}>
                  {mk ? MONTHS[mk.mo] : ''}
                </div>
              );
            })}
          </div>
          <div className="rp-cal__row">
            <div className="rp-cal__days">
              {DOW.map((d, i) => <div key={i} className="rp-cal__daylbl">{d}</div>)}
            </div>
            <div className="rp-cal__weeks" style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
              {weeks.map((wk, wi) => (
                <div key={wi} className="rp-cal__week">
                  {wk.map((d, di) => d
                    ? (
                      <div
                        key={di}
                        className="rp-cal__cell"
                        data-l={d.level}
                        title={`${new Date(d.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${levelNames[d.level]}`}
                      />
                    )
                    : <div key={di} className="rp-cal__cell rp-cal__cell--empty" />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="rp-cal-foot">
        <div className="rp-cal-legend">
          Less
          <i style={{ background: 'rgba(245,243,235,0.05)' }} />
          <i style={{ background: 'rgba(139,92,246,0.4)' }} />
          <i style={{ background: 'rgba(139,92,246,0.7)' }} />
          <i style={{ background: 'var(--fg-pink)' }} />
          <i style={{ background: 'var(--fg-cyan)', boxShadow: '0 0 8px rgba(34,211,238,0.7)' }} />
          More
        </div>
        <div className="rp-cal-stats">
          <div className="rp-cal-stat"><b>{active}</b><span>Active Days</span></div>
          <div className="rp-cal-stat"><b>{days.length > 0 ? Math.round((active / days.length) * 100) : 0}%</b><span>Of {yearLabel}</span></div>
          <div className="rp-cal-stat"><b>{hard}</b><span>Hard / Peak</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Small shared bits
   ============================================================ */

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  );
}

function ShareStat({ onShare }: { onShare: () => void }) {
  return (
    <button className="rp-share-stat" onClick={onShare} type="button">
      <ShareIcon /> Share
    </button>
  );
}

function SecHead({ eyebrow, title, note }: { eyebrow: string; title: React.ReactNode; note?: string }) {
  return (
    <div className="rp-sec-head">
      <div className="rp-sec-head__l">
        <span className="rp-eyebrow">{eyebrow}</span>
        <h2 className="rp-sec-title">{title}</h2>
      </div>
      {note && <div className="rp-sec-note">{note}</div>}
    </div>
  );
}

/* ============================================================
   Hooks
   ============================================================ */

// Entrance reveal — adds .rp-reveal to .rp-anim elements as they scroll in.
function useReveal(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const els = document.querySelectorAll('.rp-anim:not(.rp-reveal)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('rp-reveal'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('rp-reveal');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [active]);
}

function usePreviousRoundup(slug: string | undefined, prevKey: string | null): ShowcaseRoundup | null {
  const [prev, setPrev] = useState<ShowcaseRoundup | null>(null);
  useEffect(() => {
    if (!slug || !prevKey) { setPrev(null); return; }
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (publicClient.GET as any)('/showcase/{slug}/roundup/{periodKey}', {
      params: { path: { slug, periodKey: prevKey } },
    })
      .then(({ data }: { data?: ShowcaseRoundup }) => {
        if (!cancelled && data) setPrev(data);
      })
      .catch(() => { /* comparison is best-effort */ });
    return () => { cancelled = true; };
  }, [slug, prevKey]);
  return prev;
}

/* ============================================================
   Page
   ============================================================ */

export default function ShowcaseRoundupPage() {
  const { slug: rawSlug, id: periodKeyParam } = useParams<{ slug: string; id: string }>();
  const slug = rawSlug?.startsWith('@') ? rawSlug.slice(1) : rawSlug;

  const [roundup, setRoundup] = useState<ShowcaseRoundup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slug || !periodKeyParam) { setNotFound(true); setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (publicClient.GET as any)('/showcase/{slug}/roundup/{periodKey}', {
      params: { path: { slug, periodKey: periodKeyParam } },
    })
      .then(({ data }: { data?: ShowcaseRoundup }) => {
        if (!data) { setNotFound(true); return; }
        setRoundup(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, periodKeyParam]);

  const prevKey = useMemo(() => (roundup ? computePrevPeriodKey(roundup) : null), [roundup]);
  const previousRoundup = usePreviousRoundup(slug, prevKey);

  useReveal(!!roundup);

  // Sticky share bar appears after the hero.
  useEffect(() => {
    if (!roundup) return;
    const onScroll = () => setBarVisible(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [roundup]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  const onShare = useCallback(() => setShareOpen(true), []);
  const onCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => { /* noop */ });
    }
    showToast('✓ Public link copied');
  }, [showToast]);

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

  const key = periodKeyParam ?? '';
  const ownerProfileHref = roundup.ownerProfileSlug ? `/@${roundup.ownerProfileSlug}` : `/@${slug}`;
  const pWord = periodWord(roundup.periodType);
  const dateRange = formatDateRange(roundup.periodStart, roundup.periodEnd);

  // Anchor stats (adaptive 4-up).
  const { h: totH, m: totM } = fmtHM(roundup.totalDurationSeconds ?? 0);
  const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;
  const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
  const hasStrength = (roundup.activityTypeBreakdowns?.some((bd) => (bd.totalSets ?? 0) > 0)) ?? false;
  const hasElevation = (roundup.totalElevationGainMeters ?? 0) > 50;

  const anchorCells: Array<{ n: React.ReactNode; l: string }> = [
    { n: roundup.totalActivities ?? 0, l: 'Total Sessions' },
    { n: <>{totH}<sub>h</sub> {totM}<sub>m</sub></>, l: 'Total Time' },
  ];
  if (hasDistance) {
    anchorCells.push({ n: <>{fmtKm(roundup.totalDistanceMeters ?? 0)}<sub>km</sub></>, l: 'Distance Covered' });
  } else if (hasStrength && totalWeightKg > 0) {
    anchorCells.push({ n: formatWeight(totalWeightKg) ?? '—', l: 'Weight Moved' });
  } else if (hasElevation) {
    anchorCells.push({ n: <>+{Math.round(roundup.totalElevationGainMeters ?? 0).toLocaleString()}<sub>m</sub></>, l: 'Elevation' });
  }
  if ((roundup.totalCaloriesKcal ?? 0) > 0) {
    const kcal = roundup.totalCaloriesKcal ?? 0;
    anchorCells.push(
      kcal >= 1000
        ? { n: <>{(kcal / 1000).toFixed(1)}<sub>k</sub></>, l: 'Calories Burned' }
        : { n: kcal.toLocaleString(), l: 'Calories Burned' },
    );
  } else if (hasElevation && anchorCells.length < 4) {
    anchorCells.push({ n: <>+{Math.round(roundup.totalElevationGainMeters ?? 0).toLocaleString()}<sub>m</sub></>, l: 'Elevation' });
  }
  while (anchorCells.length < 4) anchorCells.push({ n: '—', l: '—' });
  const anchors = anchorCells.slice(0, 4);

  // Section data.
  const sportVMs = buildSportVMs(roundup.activityTypeBreakdowns ?? []);
  const sportTotal = sportVMs.reduce((a, s) => a + s.count, 0);

  const callouts = roundup.calloutActivities ?? [];

  const calDays = (roundup.periodStart && roundup.periodEnd)
    ? buildCalendarDays(roundup.periodStart, roundup.periodEnd, roundup.dayEntries ?? [])
    : [];
  const calYearLabel = roundup.periodStart
    ? String(new Date(roundup.periodStart).getUTCFullYear())
    : pWord;

  const hrMinutes = roundup.hrZoneMinutes ?? [];
  const hrTracked = [1, 2, 3, 4, 5].reduce((s, i) => s + (hrMinutes[i] ?? 0), 0);
  const hasHR = hrTracked >= 30;

  const highlights: Array<{ value: string; unit: string; label: string; sub: string }> = [];
  const longest = roundup.longestActivityDurationSeconds ?? 0;
  if (longest > 60) {
    const { h, m } = fmtHM(longest);
    highlights.push({ value: h > 0 ? `${h}h ${m}m` : `${m}m`, unit: '', label: 'Longest Session', sub: '' });
  }
  const cph = roundup.highestCaloriesPerHourKcal ?? 0;
  if (cph > 0) {
    highlights.push({ value: String(Math.round(cph)), unit: 'kcal/h', label: 'Highest Burn Rate', sub: '' });
  }
  const bpm = roundup.highestAvgBpm ?? 0;
  if (bpm > 0) {
    highlights.push({ value: String(bpm), unit: 'bpm', label: 'Peak Avg HR', sub: roundup.highestAvgBpmActivityTitle ?? '' });
  }
  const elevation = roundup.totalElevationGainMeters ?? 0;
  if (elevation > 50) {
    highlights.push({
      value: `+${Math.round(elevation).toLocaleString()}`,
      unit: 'm climbed',
      label: 'Total Vertical',
      sub: elevationComparison(elevation) ?? '',
    });
  }

  const bestEfforts = roundup.bestEfforts ?? [];

  const prVMs = (roundup.prsAchieved ?? []).map(buildPRVM);
  const prTotal = prVMs.length;

  const sources = roundup.sources ?? [];
  const deltas = previousRoundup ? buildDeltas(roundup, previousRoundup) : [];

  return (
    <div className="showcase-page">
      <div className="rp-grain" aria-hidden="true" />
      <div className="rp-aura" aria-hidden="true">
        <span className="a1" /><span className="a2" /><span className="a3" />
      </div>

      <div className="rp-root">
        {/* Public nav */}
        {!isNativeApp && (
          <nav className="rp-bar" id="top">
            <a className="rp-bar__brand" href="/">
              <span className="rp-bar__mark">FG</span>
              <span className="rp-bar__word">FitGlue</span>
            </a>
            <span className="rp-bar__crumb">
              <a href={ownerProfileHref} style={{ color: 'inherit', textDecoration: 'none' }}>
                <b>{roundup.ownerDisplayName?.toUpperCase() ?? 'PROFILE'}</b>
              </a>{' '}
              · {periodShortLabel(key)} ROUNDUP
            </span>
            <button className="rp-bar__share" onClick={onShare} type="button">↑ Share</button>
          </nav>
        )}

        {/* 1 · Hero */}
        <header className="rp-hero">
          <div className="rp-wrap rp-hero__inner">
            <div className="rp-hero__crest">
              <div className="rp-hero__avatar">
                {roundup.ownerProfilePictureUrl
                  ? <img src={roundup.ownerProfilePictureUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : ownerInitials(roundup.ownerDisplayName)}
              </div>
              <div className="rp-hero__meta">
                <div className="rp-hero__byline">
                  By <b>{roundup.ownerDisplayName ?? 'Athlete'}</b>
                  {roundup.ownerProfileSlug ? ` · @${roundup.ownerProfileSlug}` : ''}
                </div>
              </div>
            </div>
            <p className="rp-hero__kicker">Your {pWord} in Sport</p>
            <h1 className="rp-hero__title"><span className="rp-grad">{heroTitle(key)}</span></h1>
            <div className="rp-hero__dates">
              {dateRange ?? periodShortLabel(key)}<span />{roundup.totalActivities ?? 0} Sessions Logged
            </div>

            <div className="rp-anchor rp-anim">
              {anchors.map((a, i) => (
                <div key={i} className="rp-anchor__cell">
                  <div className="rp-anchor__n">{a.n}</div>
                  <div className="rp-anchor__l">{a.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rp-hero__scroll">Scroll</div>
        </header>

        {/* 2 · AI Summary */}
        {roundup.aiSummary && (
          <section className="rp-sec" id="sec-summary">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <div className="rp-quote rp-anim">
                <div className="rp-quote__bar" />
                <div className="rp-quote__body">
                  <span className="rp-quote__mark" aria-hidden="true">&ldquo;</span>
                  <div className="rp-quote__lede">✦ The {pWord.toLowerCase()}, in words · AI-written</div>
                  <p className="rp-quote__text">{roundup.aiSummary}</p>
                  <div className="rp-quote__sig">— FitGlue AI Companion · synthesised from {roundup.totalActivities ?? 0} sessions</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3 · Comparison */}
        {deltas.length > 0 && previousRoundup && (
          <section className="rp-sec" id="sec-vs" style={{ padding: 0 }}>
            <div className="rp-ticker-wrap rp-anim">
              <div className="rp-ticker">
                <div className="rp-ticker__lead">
                  <b>VS {periodShortLabel(previousRoundup.periodKey ?? '')}</b>
                  <span>PERIOD ON PERIOD</span>
                </div>
                <div className="rp-ticker__track">
                  {deltas.map((dl) => {
                    const cls = dl.dir === 'up' ? 'rp-delta--up' : dl.dir === 'reg' ? 'rp-delta--reg' : 'rp-delta--down';
                    const arrow = dl.dir === 'up' ? '↑' : dl.dir === 'down' ? '↓' : '→';
                    return (
                      <div key={dl.label} className={`rp-delta ${cls}`}>
                        <span className="rp-delta__arrow">{arrow}</span>
                        <div>
                          <div className="rp-delta__v">{dl.value}</div>
                          <div className="rp-delta__l">{dl.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4 · Callouts */}
        {callouts.length > 0 && (
          <section className="rp-sec" id="sec-callouts">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead eyebrow="Spotlight" title={<>The moments<br />that defined it</>} note="Sessions that earned their place" />
              <div className="rp-callouts">
                {callouts.map((c, i) => {
                  const { glyph, color } = calloutVisual(c);
                  const subParts = [c.sub, c.date].filter((p): p is string => !!p);
                  return (
                    <article key={i} className="rp-callout rp-anim" style={{ transitionDelay: `${i * 80}ms` }}>
                      <div className="rp-callout__glow" style={{ background: color }} />
                      <div className="rp-callout__top">
                        <span className="rp-callout__kind">{c.kind}</span>
                        <span className="rp-callout__glyph">{glyph}</span>
                      </div>
                      <h3 className="rp-callout__title">{c.title}</h3>
                      <div className="rp-callout__stat">
                        <div className="rp-callout__n" style={{ color }}>{c.statValue}</div>
                        <div className="rp-callout__u">{c.statUnit}</div>
                        {subParts.length > 0 && <div className="rp-callout__sub">{subParts.join(' · ')}</div>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5 · Sport breakdown */}
        {sportVMs.length > 0 && (
          <section className="rp-sec" id="sec-sport">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead
                eyebrow="Discipline"
                title="Where the work went"
                note={`${sportVMs.length} ${sportVMs.length === 1 ? 'sport' : 'sports'} · ${sportTotal} sessions`}
              />
              <div className="rp-sport rp-anim">
                <SportDonut data={sportVMs} total={sportTotal} />
                <div className="rp-legend">
                  {sportVMs.map((s) => (
                    <div key={s.type} className="rp-legend__row">
                      <span className="rp-legend__dot" style={{ background: s.color }} />
                      <span className="rp-legend__name"><span>{s.glyph}</span>{s.label}</span>
                      <span className="rp-legend__count">{s.count}</span>
                      <span className="rp-legend__pct">{sportTotal > 0 ? Math.round((s.count / sportTotal) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rp-anim"><StackedDistance data={sportVMs} /></div>
            </div>
          </section>
        )}

        {/* 5a · Muscles worked */}
        {(roundup.muscles?.length ?? 0) > 0 && (() => {
          const maxCount = Math.max(...roundup.muscles!.map((m) => m.count ?? 0), 1);
          return (
            <section className="rp-sec" id="sec-muscles">
              <div className="rp-wrap">
                <ShareStat onShare={onShare} />
                <SecHead eyebrow="Anatomy" title="Muscles under load" note="Primary movers, by session count" />
                <div className="rp-muscles rp-anim">
                  {roundup.muscles!.map((m, i) => (
                    <div key={i} className="rp-muscle">
                      <span className="rp-muscle__n">{formatMuscle(m.name ?? '')}</span>
                      <div className="rp-muscle__track">
                        <div className="rp-muscle__fill" style={{ width: `${((m.count ?? 0) / maxCount) * 100}%` }} />
                      </div>
                      <span className="rp-muscle__c">{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* 5b · Route wall */}
        {(roundup.routes?.length ?? 0) > 0 && (
          <section className="rp-sec" id="sec-routes">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead
                eyebrow="Terrain"
                title="Ground covered"
                note={`${roundup.routes!.length} ${roundup.routes!.length === 1 ? 'route' : 'routes'} mapped`}
              />
              <div className="rp-routes rp-anim">
                {roundup.routes!.map((r, i) => (
                  <article key={i} className="rp-route">
                    <img src={r.thumbnailUrl} alt={r.activityTitle ?? 'Route'} loading="lazy" />
                    <div className="rp-route__grad" aria-hidden="true" />
                    <span className="rp-route__glyph" aria-hidden="true">{activityGlyph(r.activityType)}</span>
                    <div className="rp-route__meta">
                      <div>
                        <div className="rp-route__t">{r.activityTitle}</div>
                        {r.date && <div className="rp-route__d">{r.date}</div>}
                      </div>
                      {(r.distanceMeters ?? 0) > 500 && (
                        <div className="rp-route__dist">{fmtKm(r.distanceMeters ?? 0)}<sub>km</sub></div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5c · Places trained */}
        {(roundup.places?.length ?? 0) > 0 && (() => {
          const countries = new Set(
            roundup.places!.map((p) => p.country).filter((c): c is string => !!c),
          );
          const note = countries.size > 1
            ? `${roundup.places!.length} places · ${countries.size} countries`
            : `${roundup.places!.length} ${roundup.places!.length === 1 ? 'place' : 'places'}`;
          return (
            <section className="rp-sec" id="sec-places">
              <div className="rp-wrap">
                <ShareStat onShare={onShare} />
                <SecHead eyebrow="Geography" title="Where it happened" note={note} />
                <div className="rp-places rp-anim">
                  {roundup.places!.map((p, i) => (
                    <div key={i} className="rp-place">
                      <span className="rp-place__n">{p.name}</span>
                      {p.country && <span className="rp-place__c">{p.country}</span>}
                      <span className="rp-place__x">×{p.activityCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* 5d · Weather grit */}
        {roundup.weather && (roundup.weather.sessionCount ?? 0) > 0 && (() => {
          const w = roundup.weather!;
          const cells: Array<{ n: string; l: string }> = [];
          if ((w.rainCount ?? 0) > 0) cells.push({ n: String(w.rainCount), l: 'Sessions in the wet' });
          if (w.coldestTempC != null) cells.push({ n: `${Math.round(w.coldestTempC)}°`, l: 'Coldest start' });
          if (w.hottestTempC != null) cells.push({ n: `${Math.round(w.hottestTempC)}°`, l: 'Hottest start' });
          cells.push({ n: String(w.sessionCount), l: 'Sessions tracked' });
          return (
            <section className="rp-sec" id="sec-weather">
              <div className="rp-wrap">
                <ShareStat onShare={onShare} />
                <SecHead eyebrow="Conditions" title="Whatever the weather" note="The grit index" />
                <div className="rp-weather rp-anim">
                  {cells.map((c, i) => (
                    <div key={i} className="rp-weather__cell">
                      <div className="rp-weather__n">{c.n}</div>
                      <div className="rp-weather__l">{c.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* 6 · Consistency calendar */}
        {calDays.length > 1 && (
          <section className="rp-sec" id="sec-cal">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead eyebrow="Consistency" title="Every day, accounted for" note="Cell intensity = effort level" />
              <div className="rp-anim"><ConsistencyCalendar days={calDays} yearLabel={calYearLabel} /></div>
            </div>
          </section>
        )}

        {/* 7 · Effort deep dive */}
        <section className="rp-sec" id="sec-effort">
          <div className="rp-wrap">
            {hasHR ? (
              <>
                <ShareStat onShare={onShare} />
                <SecHead eyebrow="Effort" title="Time under tension" note={`${Math.round(hrTracked / 60)}h tracked · Z1 easy → Z5 max`} />
                <div className="rp-effort rp-anim">
                  <HRRings minutes={hrMinutes} />
                  <HRLegend minutes={hrMinutes} />
                </div>
              </>
            ) : (
              <>
                <SecHead eyebrow="Effort" title="Heart-rate zones" />
                <div className="rp-empty rp-anim">
                  <div className="rp-empty__glyph">❤️</div>
                  <div className="rp-empty__h">No heart-rate data</div>
                  <div className="rp-empty__p">None of this period&apos;s sessions carried HR. Connect a chest strap or watch to unlock zone analysis.</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 7b · Best efforts */}
        {bestEfforts.length > 0 && (
          <section className="rp-sec" id="sec-efforts">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead eyebrow="Benchmarks" title="Fastest known times" note="Quickest effort at each distance this period" />
              <div className="rp-efforts rp-anim">
                {bestEfforts.map((be, i) => (
                  <div key={i} className="rp-effort-card">
                    <div className="rp-effort-card__d">{be.display ?? be.distanceKey}</div>
                    <div className="rp-effort-card__t">{formatClock(be.timeSeconds ?? 0)}</div>
                    <div className="rp-effort-card__u">Fastest</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8 · Highlights */}
        {highlights.length > 0 && (
          <section className="rp-sec" id="sec-highlights">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead eyebrow="Personal Bests" title="The ceiling, raised" note="Single-session peaks" />
              <div className="rp-highlights rp-anim">
                {highlights.map((hl, i) => (
                  <div key={i} className="rp-highlight">
                    <div className="rp-highlight__n">{hl.value}</div>
                    <div className="rp-highlight__u">{hl.unit}</div>
                    <div className="rp-highlight__l">{hl.label}</div>
                    <div className="rp-highlight__sub">{hl.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9 · PR wall */}
        <section className="rp-sec" id="sec-prs">
          <div className="rp-wrap">
            {prTotal > 0 ? (
              <>
                <ShareStat onShare={onShare} />
                <SecHead eyebrow="Records" title="The records wall" note={`${prTotal} broken`} />
                <div className="rp-pr-count rp-anim">
                  <b className="rp-grad">{prTotal}</b>
                  <span>Personal records<br />broken in {periodShortLabel(key)}</span>
                </div>
                <div className="rp-prs">
                  {prVMs.map((pr, i) => (
                    <article key={i} className="rp-pr rp-anim" style={{ transitionDelay: `${(i % 6) * 50}ms` }}>
                      <div className="rp-pr__top">
                        <span className="rp-pr__sport">{pr.glyph} {pr.sport}</span>
                        {pr.date && <span className="rp-pr__date">{pr.date}</span>}
                      </div>
                      <div className="rp-pr__label">{pr.label}</div>
                      <div className="rp-pr__val"><b>{pr.value}</b>{pr.unit && <i>{pr.unit}</i>}</div>
                      {pr.delta && <span className={`rp-pr__delta ${pr.delta === 'NEW' ? 'rp-pr__delta--new' : ''}`}>{pr.delta}</span>}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <SecHead eyebrow="Records" title="Personal records" />
                <div className="rp-empty rp-anim">
                  <div className="rp-empty__glyph">🏆</div>
                  <div className="rp-empty__h">No new records this period</div>
                  <div className="rp-empty__p">Maintenance blocks matter too. PRs return when the load ramps back up.</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 9b · Photo mosaic */}
        {(roundup.photos?.length ?? 0) > 0 && (
          <section className="rp-sec" id="sec-photos">
            <div className="rp-wrap">
              <ShareStat onShare={onShare} />
              <SecHead
                eyebrow="Moments"
                title="Caught in motion"
                note={`${roundup.photos!.length} ${roundup.photos!.length === 1 ? 'photo' : 'photos'} this period`}
              />
              <div className="rp-photos rp-anim">
                {roundup.photos!.map((p, i) => (
                  <figure
                    key={i}
                    className={`rp-photo${i === 0 && roundup.photos!.length >= 5 ? ' rp-photo--feature' : ''}`}
                  >
                    <img src={p.url} alt={p.activityTitle ?? 'Activity photo'} loading="lazy" />
                    <figcaption className="rp-photo__cap">
                      {p.activityTitle && <div className="rp-photo__t">{p.activityTitle}</div>}
                      {p.date && <div className="rp-photo__d">{p.date}</div>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="rp-foot">
          <div className="rp-wrap">
            <div className="rp-foot__row">
              {sources.length > 0 && (
                <div className="rp-foot__sources">
                  <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
                    Data from
                  </span>
                  {sources.map((s, i) => (
                    <span key={s} className="rp-foot__src">
                      <i style={{ background: SOURCE_PALETTE[i % SOURCE_PALETTE.length] }} />
                      {formatSource(s)}
                    </span>
                  ))}
                </div>
              )}
              <Link className="rp-foot__back" to={ownerProfileHref}>
                {`← ${roundup.ownerDisplayName ?? 'Athlete'}'s profile`}
              </Link>
            </div>
            <div className="rp-foot__note">
              FitGlue · Brutal × Aurora · {dateRange ? `Roundup synthesised ${dateRange}` : 'Roundup'} · Numbers are earned, not estimated.
            </div>
          </div>
        </footer>

        {/* Sticky share bar */}
        <div className={`rp-sharebar ${barVisible ? 'is-visible' : ''}`}>
          <button className="rp-sharebtn rp-sharebtn--primary" onClick={onShare} type="button">
            <ShareIcon /> Share Card
          </button>
          <div className="rp-sharebar__div" />
          <button className="rp-sharebtn rp-sharebtn--ghost" onClick={onCopy} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
            <span className="rp-lbl-long">Copy Link</span>
          </button>
          <div className="rp-sharebar__div" />
          <button className="rp-sharebtn rp-sharebtn--soon" disabled type="button">
            Create Reel <span className="rp-soon">Soon</span>
          </button>
        </div>

        <div className={`rp-toast ${toast ? 'is-visible' : ''}`}>{toast}</div>
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
