/**
 * Configurable SVG chart components for the roundup page AND the share-card
 * exporter. Each is self-contained (no dependency on rp-* CSS for its core
 * rendering) and accepts size + colour props so it reads correctly on any
 * card background (dark page, light aurora, transparent, etc.). Center labels
 * live inside the SVG viewBox so the charts scale to any width.
 */
import React, { useMemo } from 'react';
import { HR_ZONES, fmtKm, fmtHM, type SportVM, type CalDay } from '../utils/roundup';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['', 'MON', '', 'WED', '', 'FRI', ''];

const DEFAULT_TRACK = 'rgba(245,243,235,0.06)';
const DEFAULT_TEXT = 'var(--fg-paper)';
const DEFAULT_MUTED = 'var(--color-text-muted)';

// Heatmap level colours (rest → peak), matching the page legend.
export const DEFAULT_LEVEL_COLORS = [
  'rgba(245,243,235,0.05)',
  'rgba(139,92,246,0.4)',
  'rgba(139,92,246,0.7)',
  '#ff3da6',
  '#22d3ee',
];

interface ChartColors {
  trackColor?: string;
  textColor?: string;
  mutedColor?: string;
}

/* ---- Sport donut ---- */

export function DonutChart({
  data,
  total,
  width = '100%',
  maxWidth = 360,
  centerSub = 'Sessions',
  trackColor = DEFAULT_TRACK,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
}: {
  data: SportVM[];
  total: number;
  width?: number | string;
  maxWidth?: number | string;
  centerSub?: string;
} & ChartColors) {
  const R = 70, C = 2 * Math.PI * R, cx = 100, cy = 100;
  let offset = 0;
  const segs = data.map((d) => {
    const frac = total > 0 ? d.count / total : 0;
    const seg = { ...d, frac, dash: frac * C, offset: offset * C };
    offset += frac;
    return seg;
  });
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Sessions by sport"
      style={{ width, maxWidth, height: 'auto', display: 'block', margin: '0 auto' }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={trackColor} strokeWidth="26" />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segs.map((s) => (
          <circle key={s.type} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="26"
            strokeDasharray={`${s.dash} ${C - s.dash}`} strokeDashoffset={-s.offset}>
            <title>{`${s.label}: ${s.count} (${Math.round(s.frac * 100)}%)`}</title>
          </circle>
        ))}
      </g>
      <text x="100" y="104" textAnchor="middle"
        style={{ fontFamily: 'var(--fg-font-display)', fontSize: '32px', letterSpacing: '-0.04em', fill: textColor }}>
        {total}
      </text>
      <text x="100" y="121" textAnchor="middle"
        style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', fill: mutedColor }}>
        {centerSub.toUpperCase()}
      </text>
    </svg>
  );
}

/* ---- HR concentric rings ---- */

export function HRRingsChart({
  minutes,
  width = '100%',
  maxWidth = 360,
  trackColor = DEFAULT_TRACK,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
}: {
  minutes: number[];
  width?: number | string;
  maxWidth?: number | string;
} & ChartColors) {
  const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
  const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
  const cx = 100, cy = 100;
  const sw = 9;
  const radii = [92, 76, 60, 44, 32]; // outer Z1 → inner Z5; inner hole ~54px for the count
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Time in heart-rate zones"
      style={{ width, maxWidth, height: 'auto', display: 'block', margin: '0 auto' }}>
      {radii.map((R, idx) => {
        const C = 2 * Math.PI * R;
        const frac = zoneMin[idx] / total;
        const z = HR_ZONES[idx];
        return (
          <g key={z.z} transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={trackColor} strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={z.color} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${frac * C} ${C}`}
              style={{ filter: idx >= 3 ? `drop-shadow(0 0 4px ${z.color})` : 'none' }}>
              <title>{`${z.z} ${z.name}: ${Math.round(zoneMin[idx] / 60)}h (${Math.round(frac * 100)}%)`}</title>
            </circle>
          </g>
        );
      })}
      <text x="100" y="100" textAnchor="middle"
        style={{ fontFamily: 'var(--fg-font-display)', fontSize: '24px', letterSpacing: '-0.04em', fill: textColor }}>
        {Math.round(total / 60)}h
      </text>
      <text x="100" y="114" textAnchor="middle"
        style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '6.5px', fontWeight: 700, letterSpacing: '0.14em', fill: mutedColor }}>
        HR TRACKED
      </text>
    </svg>
  );
}

export function HRLegend({
  minutes,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
}: { minutes: number[] } & ChartColors) {
  const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
  const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="rp-hrlegend" style={{ color: textColor }}>
      {HR_ZONES.map((z, idx) => {
        const { h, m } = fmtHM(zoneMin[idx] * 60);
        return (
          <div key={z.z} className="rp-hrlegend__row">
            <span className="rp-hrlegend__dot" style={{ background: z.color }} />
            <span className="rp-hrlegend__name">{z.z}<span style={{ color: mutedColor }}>{z.name}</span></span>
            <span className="rp-hrlegend__time">{h}h {m}m</span>
            <span className="rp-hrlegend__pct" style={{ color: mutedColor }}>{Math.round((zoneMin[idx] / total) * 100)}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Stacked distance bar ---- */

export function StackedDistance({ data }: { data: SportVM[] }) {
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
            <div key={d.type} className="rp-stack__seg" style={{ width: `${pct}%`, background: d.color }}
              title={`${d.label}: ${fmtKm(d.distanceMeters)} km`}>
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

/* ---- Consistency calendar (GitHub-style heatmap) ---- */

export function ConsistencyCalendar({
  days,
  yearLabel,
  cell = 14,
  gap = 3,
  levelColors = DEFAULT_LEVEL_COLORS,
  showFoot = true,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
}: {
  days: CalDay[];
  yearLabel: string;
  cell?: number;
  gap?: number;
  levelColors?: string[];
  showFoot?: boolean;
} & ChartColors) {
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
  const labelW = cell * 2.4;
  const monoLabel: React.CSSProperties = {
    fontFamily: 'var(--fg-font-mono)', fontSize: `${Math.max(7, cell * 0.62)}px`,
    fontWeight: 700, letterSpacing: '0.1em', color: mutedColor, textTransform: 'uppercase',
  };

  return (
    <div style={{ overflowX: 'auto', color: textColor }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        {/* month labels */}
        <div style={{ display: 'flex', gap: `${gap}px`, marginLeft: `${labelW + gap}px`, marginBottom: '6px' }}>
          {weeks.map((_, wi) => {
            const mk = monthMarks.find((m) => m.wi === wi);
            return <div key={wi} style={{ ...monoLabel, width: `${cell}px`, flex: '0 0 auto', whiteSpace: 'nowrap' }}>{mk ? MONTHS[mk.mo] : ''}</div>;
          })}
        </div>
        <div style={{ display: 'flex', gap: `${gap}px` }}>
          {/* day-of-week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: `${labelW}px`, flex: '0 0 auto' }}>
            {DOW.map((d, i) => <div key={i} style={{ ...monoLabel, height: `${cell}px`, lineHeight: `${cell}px` }}>{d}</div>)}
          </div>
          {/* week columns */}
          <div style={{ display: 'flex', gap: `${gap}px` }}>
            {weeks.map((wk, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, flex: '0 0 auto' }}>
                {wk.map((d, di) => (
                  <div key={di}
                    style={{
                      width: `${cell}px`, height: `${cell}px`,
                      background: d ? levelColors[d.level] : 'transparent',
                      boxShadow: d && d.level >= 4 ? '0 0 8px rgba(34,211,238,0.7)' : undefined,
                    }}
                    title={d ? `${new Date(d.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${levelNames[d.level]}` : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showFoot && (
        <div className="rp-cal-foot">
          <div className="rp-cal-legend" style={{ color: mutedColor }}>
            Less
            {levelColors.map((c, i) => (
              <i key={i} style={{ background: c, boxShadow: i >= 4 ? '0 0 8px rgba(34,211,238,0.7)' : undefined }} />
            ))}
            More
          </div>
          <div className="rp-cal-stats">
            <div className="rp-cal-stat"><b>{active}</b><span style={{ color: mutedColor }}>Active Days</span></div>
            <div className="rp-cal-stat"><b>{days.length > 0 ? Math.round((active / days.length) * 100) : 0}%</b><span style={{ color: mutedColor }}>Of {yearLabel}</span></div>
            <div className="rp-cal-stat"><b>{hard}</b><span style={{ color: mutedColor }}>Hard / Peak</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
