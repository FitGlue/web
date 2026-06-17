/**
 * Export card frames for the roundup share modal. Each is a forwardRef 1080px
 * card that reuses the configurable RoundupCharts and honours the shared card
 * config (background, shape, accent, text). Chart/text colours resolve against
 * the chosen background so cards read on dark, aurora (light) or transparent.
 */
import React from 'react';
import type { components } from '../../shared/api/schema-public';
import { DonutChart, HRRingsChart, ConsistencyViz } from './RoundupCharts';
import {
  buildSportVMs,
  buildCalendarDays,
  buildDeltas,
  periodShortLabel,
  fmtKm,
  HR_ZONES,
  fmtHM,
  formatClock,
  formatMuscle,
  type ShowcaseRoundup as RoundupT,
  type RoundupPhoto,
  type RoundupRoute,
} from '../utils/roundup';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

export const EXPORT_W = 1080;
const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

export type ExportCardVariant = 'sport' | 'hr' | 'calendar' | 'vs';

export interface CardConfig {
  bg: { id: string; style: string };
  shape: { id: string; ratio: string };
  accent: string;
  textColor: string;
  showWatermark: boolean;
}

function periodTypeLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) return 'WEEKLY ROUNDUP';
  if (periodKey.startsWith('month-')) return 'MONTHLY ROUNDUP';
  if (periodKey.startsWith('year-')) return 'YEAR IN REVIEW';
  return 'TRAINING ROUNDUP';
}

export function cardColors(cfg: CardConfig) {
  const isClear = cfg.bg.id === 'clear';
  const isAurora = cfg.bg.id === 'aurora';
  const text = isAurora ? '#070710' : cfg.textColor;
  const accent = isAurora ? '#070710' : cfg.accent;
  const muted = isAurora ? 'rgba(7,7,16,0.55)' : 'rgba(245,243,235,0.55)';
  const track = isAurora ? 'rgba(7,7,16,0.12)' : 'rgba(245,243,235,0.08)';
  const bg = isClear
    ? 'transparent'
    : cfg.bg.style !== 'transparent'
      ? cfg.bg.style
      : 'linear-gradient(135deg,#0a0a0a 0%,#1a0a20 50%,#0a0a0a 100%)';
  const shadow = isClear ? '0 2px 18px rgba(0,0,0,0.9)' : undefined;
  return { isClear, isAurora, text, accent, muted, track, bg, shadow };
}

export type Colors = ReturnType<typeof cardColors>;

/* ---- Photo wall ----
   A mosaic of roundup photos, feature-first like the page's rp-photos grid.
   Reused by the Story card's photo-hero and photo-wall layouts. Cross-origin
   images need host CORS to survive html-to-image export (same caveat as
   MediaCardFrame); the on-screen preview always works. */

export function PhotoWall({
  photos,
  height,
  radius = 0,
  gap = 8,
  accent,
}: {
  photos: RoundupPhoto[];
  height: number | string;
  radius?: number;
  gap?: number;
  accent: string;
}) {
  const list = photos.filter((p) => !!p.url).slice(0, 6);
  if (list.length === 0) return null;
  const feature = list.length >= 5;
  const cols = list.length <= 2 ? list.length : list.length === 4 ? 2 : 3;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridAutoRows: '1fr',
      gap: `${gap}px`,
      height: typeof height === 'number' ? `${height}px` : height,
      width: '100%',
    }}>
      {list.map((p, i) => {
        const span = feature && i === 0;
        return (
          <figure key={i} style={{
            position: 'relative', margin: 0, overflow: 'hidden',
            borderRadius: `${radius}px`,
            gridColumn: span ? 'span 2' : undefined,
            gridRow: span ? 'span 2' : undefined,
            background: 'rgba(245,243,235,0.04)',
            boxShadow: `inset 0 0 0 1px ${accent}22`,
          }}>
            <img src={p.url} crossOrigin="anonymous" alt={p.activityTitle ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {(p.activityTitle || p.date) && (
              <figcaption style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, padding: span ? '20px' : '12px',
                background: 'linear-gradient(0deg, rgba(7,7,16,0.85) 0%, rgba(7,7,16,0) 100%)',
              }}>
                {p.activityTitle && (
                  <div style={{ fontFamily: DISPLAY, fontSize: span ? '24px' : '16px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f5f3eb', lineHeight: 1.05 }}>
                    {p.activityTitle}
                  </div>
                )}
                {p.date && (
                  <div style={{ fontFamily: MONO, fontSize: span ? '14px' : '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,243,235,0.6)', marginTop: '4px' }}>
                    {p.date}
                  </div>
                )}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

function Grain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }} />
  );
}

function Watermark({ colors }: { colors: Colors }) {
  return (
    <div style={{
      position: 'absolute', bottom: '24px', right: '40px', fontFamily: DISPLAY, fontSize: '22px',
      color: colors.isClear || colors.isAurora ? 'rgba(7,7,16,0.3)' : 'rgba(245,243,235,0.22)', letterSpacing: '0.04em',
    }}>
      FIT<span style={{ color: colors.accent }}>GLUE</span>
    </div>
  );
}

const Shell = React.forwardRef<HTMLDivElement, {
  cfg: CardConfig;
  colors: Colors;
  typeLabel: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}>(({ cfg, colors, typeLabel, title, note, children }, ref) => {
  const isStory = cfg.shape.id === 'story';
  return (
    <div ref={ref} style={{
      width: `${EXPORT_W}px`, aspectRatio: cfg.shape.ratio, background: colors.bg,
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      padding: isStory ? '96px 72px' : '72px', display: 'flex', flexDirection: 'column', fontFamily: DISPLAY,
    }}>
      {!colors.isClear && <Grain />}
      <div style={{ position: 'relative', marginBottom: '36px' }}>
        <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.accent, marginBottom: '14px', textShadow: colors.shadow }}>
          {typeLabel}
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: isStory ? '64px' : '72px', lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase', color: colors.text, textShadow: colors.shadow }}>
          {title}
        </div>
        {note && (
          <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted, marginTop: '14px' }}>
            {note}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
        {children}
      </div>
      {cfg.showWatermark && <Watermark colors={colors} />}
    </div>
  );
});
Shell.displayName = 'Shell';

/* ---- Chart card (sport / hr / calendar) ---- */

export const ChartCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  variant: 'sport' | 'hr' | 'calendar';
  cfg: CardConfig;
}>(({ roundup, periodKey, variant, cfg }, ref) => {
  const colors = cardColors(cfg);
  const isStory = cfg.shape.id === 'story';
  const chartSize = isStory ? 560 : 440;
  const rowMono: React.CSSProperties = {
    fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  if (variant === 'sport') {
    const vms = buildSportVMs(roundup.activityTypeBreakdowns ?? []);
    const total = vms.reduce((a, s) => a + s.count, 0);
    return (
      <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="By Sport" note={`${vms.length} sports · ${total} sessions`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '56px', flexDirection: isStory ? 'column' : 'row' }}>
          <DonutChart data={vms} total={total} width={chartSize} maxWidth={chartSize}
            trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', width: isStory ? '100%' : undefined }}>
            {vms.slice(0, 6).map((s) => (
              <div key={s.type} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 0', borderTop: `1px solid ${colors.track}` }}>
                <span style={{ width: '16px', height: '16px', background: s.color, flexShrink: 0 }} />
                <span style={{ fontFamily: DISPLAY, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: colors.text, flex: 1 }}>{s.label}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: '30px', letterSpacing: '-0.02em', color: colors.accent }}>{s.count}</span>
                <span style={{ ...rowMono, fontSize: '18px', color: colors.muted, minWidth: '64px', textAlign: 'right' }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (variant === 'hr') {
    const minutes = roundup.hrZoneMinutes ?? [];
    const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
    const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
    return (
      <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Heart-Rate Zones" note={`${Math.round(total / 60)}h tracked · Z1 → Z5`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '56px', flexDirection: isStory ? 'column' : 'row' }}>
          <HRRingsChart minutes={minutes} width={chartSize} maxWidth={chartSize}
            trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', width: isStory ? '100%' : undefined }}>
            {HR_ZONES.map((z, idx) => {
              const { h, m } = fmtHM(zoneMin[idx] * 60);
              return (
                <div key={z.z} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 0', borderTop: `1px solid ${colors.track}` }}>
                  <span style={{ width: '16px', height: '16px', background: z.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: colors.text, flex: 1 }}>{z.z} <span style={{ color: colors.muted, fontSize: '20px' }}>{z.name}</span></span>
                  <span style={{ ...rowMono, color: colors.muted }}>{h}h {m}m</span>
                  <span style={{ fontFamily: DISPLAY, fontSize: '28px', letterSpacing: '-0.02em', color: colors.accent, minWidth: '80px', textAlign: 'right' }}>{Math.round((zoneMin[idx] / total) * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  // calendar
  const days = (roundup.periodStart && roundup.periodEnd)
    ? buildCalendarDays(roundup.periodStart, roundup.periodEnd, roundup.dayEntries ?? [])
    : [];
  const yearLabel = roundup.periodStart ? String(new Date(roundup.periodStart).getUTCFullYear()) : '';
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Consistency" note="Intensity = effort level">
      <ConsistencyViz periodType={roundup.periodType} days={days} yearLabel={yearLabel} cell={isStory ? 18 : 22} gap={4}
        textColor={colors.text} mutedColor={colors.muted} />
    </Shell>
  );
});
ChartCardFrame.displayName = 'ChartCardFrame';

/* ---- Best efforts card ---- */

export const EffortsCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cfg: CardConfig;
}>(({ roundup, periodKey, cfg }, ref) => {
  const colors = cardColors(cfg);
  const isStory = cfg.shape.id === 'story';
  const efforts = (roundup.bestEfforts ?? []).filter((be) => (be.timeSeconds ?? 0) > 0);
  const cols = isStory ? 2 : efforts.length > 4 ? 3 : 2;
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Best Efforts" note="Fastest known times this period">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>
        {efforts.slice(0, cols * 3).map((be, i) => (
          <div key={i} style={{
            border: `1px solid ${colors.track}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.accent }}>
              {be.display ?? be.distanceKey}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: isStory ? '44px' : '52px', letterSpacing: '-0.03em', color: colors.text, lineHeight: 1 }}>
              {formatClock(be.timeSeconds ?? 0)}
            </div>
            <div style={{ fontFamily: MONO, fontSize: '14px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted }}>Fastest</div>
          </div>
        ))}
      </div>
    </Shell>
  );
});
EffortsCardFrame.displayName = 'EffortsCardFrame';

/* ---- Muscles card ---- */

export const MusclesCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cfg: CardConfig;
}>(({ roundup, periodKey, cfg }, ref) => {
  const colors = cardColors(cfg);
  const muscles = (roundup.muscles ?? []).filter((m) => (m.count ?? 0) > 0).slice(0, 8);
  const max = Math.max(...muscles.map((m) => m.count ?? 0), 1);
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Muscles Worked" note="Primary movers, by session count">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {muscles.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '14px 0', borderTop: `1px solid ${colors.track}` }}>
            <span style={{ fontFamily: DISPLAY, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: colors.text, width: '300px', flexShrink: 0 }}>{formatMuscle(m.name ?? '')}</span>
            <span style={{ flex: 1, height: '18px', background: colors.track, position: 'relative' }}>
              <span style={{ position: 'absolute', inset: 0, width: `${((m.count ?? 0) / max) * 100}%`, background: colors.accent }} />
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: '30px', letterSpacing: '-0.02em', color: colors.accent, minWidth: '56px', textAlign: 'right' }}>{m.count}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
});
MusclesCardFrame.displayName = 'MusclesCardFrame';

/* ---- Places card ---- */

export const PlacesCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cfg: CardConfig;
}>(({ roundup, periodKey, cfg }, ref) => {
  const colors = cardColors(cfg);
  const places = (roundup.places ?? []).slice(0, 8);
  const countries = new Set(places.map((p) => p.country).filter((c): c is string => !!c));
  const note = countries.size > 1
    ? `${places.length} places · ${countries.size} countries`
    : `${places.length} ${places.length === 1 ? 'place' : 'places'}`;
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Where It Happened" note={note}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {places.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '20px', padding: '16px 0', borderTop: `1px solid ${colors.track}` }}>
            <span style={{ fontFamily: DISPLAY, fontSize: '30px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: colors.text, flex: 1 }}>{p.name}</span>
            {p.country && <span style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted }}>{p.country}</span>}
            <span style={{ fontFamily: DISPLAY, fontSize: '30px', letterSpacing: '-0.02em', color: colors.accent, minWidth: '64px', textAlign: 'right' }}>×{p.activityCount}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
});
PlacesCardFrame.displayName = 'PlacesCardFrame';

/* ---- Weather card ---- */

export const WeatherCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cfg: CardConfig;
}>(({ roundup, periodKey, cfg }, ref) => {
  const colors = cardColors(cfg);
  const w = roundup.weather;
  const cells: Array<{ n: string; l: string }> = [];
  if (w) {
    if ((w.rainCount ?? 0) > 0) cells.push({ n: String(w.rainCount), l: 'Sessions in the wet' });
    if (w.coldestTempC != null) cells.push({ n: `${Math.round(w.coldestTempC)}°`, l: 'Coldest start' });
    if (w.hottestTempC != null) cells.push({ n: `${Math.round(w.hottestTempC)}°`, l: 'Hottest start' });
    cells.push({ n: String(w.sessionCount ?? 0), l: 'Sessions tracked' });
  }
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Whatever the Weather" note="The grit index">
      <div style={{ display: 'grid', gridTemplateColumns: cells.length >= 3 ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {cells.map((c, i) => (
          <div key={i} style={{ border: `1px solid ${colors.track}`, padding: '32px' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: '72px', letterSpacing: '-0.03em', color: colors.accent, lineHeight: 1 }}>{c.n}</div>
            <div style={{ fontFamily: MONO, fontSize: '17px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted, marginTop: '12px' }}>{c.l}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
});
WeatherCardFrame.displayName = 'WeatherCardFrame';

/* ---- Comparison card ---- */

export const ComparisonCardFrame = React.forwardRef<HTMLDivElement, {
  roundup: ShowcaseRoundup;
  periodKey: string;
  previousRoundup: ShowcaseRoundup;
  cfg: CardConfig;
}>(({ roundup, periodKey, previousRoundup, cfg }, ref) => {
  const colors = cardColors(cfg);
  const deltas = buildDeltas(roundup as RoundupT, previousRoundup as RoundupT);
  const prevLabel = periodShortLabel(previousRoundup.periodKey ?? '');
  const upColor = '#a3ff3d';
  const downColor = colors.isAurora ? '#b81d57' : '#ff5d6c';
  return (
    <Shell ref={ref} cfg={cfg} colors={colors} typeLabel={periodTypeLabel(periodKey)} title="Vs Last Period" note={`Versus ${prevLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {deltas.map((d) => {
          const arrow = d.dir === 'up' ? '↑' : d.dir === 'down' ? '↓' : '→';
          const c = d.dir === 'up' ? upColor : d.dir === 'down' ? downColor : colors.muted;
          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '22px 0', borderTop: `1px solid ${colors.track}` }}>
              <span style={{ fontFamily: DISPLAY, fontSize: '44px', lineHeight: 1, color: c, width: '44px' }}>{arrow}</span>
              <span style={{ fontFamily: DISPLAY, fontSize: '52px', letterSpacing: '-0.03em', color: c, minWidth: '180px' }}>{d.value}</span>
              <span style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.text }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </Shell>
  );
});
ComparisonCardFrame.displayName = 'ComparisonCardFrame';

/* ---- Media card (photo / route) ----
   The image is captured by html-to-image at export; cross-origin images need
   the host to allow CORS, otherwise the on-screen preview still works but the
   exported PNG may omit the image. */

export const MediaCardFrame = React.forwardRef<HTMLDivElement, {
  variant: 'photo' | 'route';
  item: RoundupPhoto | RoundupRoute;
  periodKey: string;
  cfg: CardConfig;
}>(({ variant, item, periodKey, cfg }, ref) => {
  const accent = cfg.accent;
  const url = variant === 'photo' ? (item as RoundupPhoto).url : (item as RoundupRoute).thumbnailUrl;
  const title = item.activityTitle || (variant === 'photo' ? 'Moment' : 'Route');
  const date = item.date ?? '';
  const dist = variant === 'route' ? ((item as RoundupRoute).distanceMeters ?? 0) : 0;
  return (
    <div ref={ref} style={{
      width: `${EXPORT_W}px`, aspectRatio: cfg.shape.ratio, position: 'relative', overflow: 'hidden',
      background: '#070710', fontFamily: DISPLAY,
    }}>
      {url && (
        <img src={url} crossOrigin="anonymous" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(7,7,16,0.12) 28%, rgba(7,7,16,0.92) 100%)' }} />
      <div style={{ position: 'absolute', top: '56px', left: '64px', right: '64px',
        fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent }}>
        {periodTypeLabel(periodKey)}
      </div>
      <div style={{ position: 'absolute', left: '64px', right: '64px', bottom: '72px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: '72px', lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#f5f3eb' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', marginTop: '18px' }}>
          {date && (
            <span style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,243,235,0.7)' }}>{date}</span>
          )}
          {variant === 'route' && dist > 500 && (
            <span style={{ fontFamily: DISPLAY, fontSize: '44px', letterSpacing: '-0.03em', color: accent }}>
              {fmtKm(dist)}<span style={{ fontSize: '0.5em', color: 'rgba(245,243,235,0.6)' }}>km</span>
            </span>
          )}
        </div>
      </div>
      {cfg.showWatermark && (
        <div style={{ position: 'absolute', bottom: '24px', right: '40px', fontFamily: DISPLAY, fontSize: '22px', color: 'rgba(245,243,235,0.85)', letterSpacing: '0.04em' }}>
          FIT<span style={{ color: accent }}>GLUE</span>
        </div>
      )}
    </div>
  );
});
MediaCardFrame.displayName = 'MediaCardFrame';
