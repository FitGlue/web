import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { logger } from '../../shared/logger';
import { saveImage } from '../utils/exportImage';
import type { components } from '../../shared/api/schema-public';
import { formatSource } from '../utils/format';
import { ACCENTS, accentSwatchStyle, TEXT_SWATCHES, textSwatchStyle } from './ShowcaseExportModal';
import { ChartCardFrame, ComparisonCardFrame, MediaCardFrame, EffortsCardFrame, PhotoWall, cardColors, type CardConfig } from './RoundupExportCards';
import { DonutChart, HRRingsChart, ConsistencyViz } from './RoundupCharts';
import { RoundupReelPanel } from './RoundupReelPanel';
import { buildDeltas, buildSportVMs, buildCalendarDays, formatClock, HR_ZONES } from '../utils/roundup';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

export type RoundupExportTab = 'overview' | 'prs' | 'story' | 'sport' | 'hr' | 'calendar' | 'efforts' | 'vs' | 'photo' | 'route' | 'reel';

// ─── Shared constants ─────────────────────────────────────────────────────────

const EXPORT_W = 1080;
const PREVIEW_SIZE = 280;

const CARD_BACKGROUNDS = [
  { id: 'aurora',   label: 'Aurora',   style: 'linear-gradient(135deg, #ff3da6 0%, #8b5cf6 50%, #22d3ee 100%)' },
  { id: 'dark',     label: 'Dark',     style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)' },
  { id: 'midnight', label: 'Midnight', style: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)' },
  { id: 'ember',    label: 'Ember',    style: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #0a0a0a 100%)' },
  { id: 'forest',   label: 'Forest',   style: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0d 50%, #0a0a0a 100%)' },
  { id: 'clear',    label: 'Clear',    style: 'transparent' },
];

const CARD_SHAPES = [
  { id: 'landscape', label: 'Landscape', ratio: '16/7'  },
  { id: 'square',    label: 'Square',    ratio: '1/1'   },
  { id: 'story',     label: 'Story',     ratio: '9/16'  },
];

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (periodKey.startsWith('year-')) return periodKey.replace('year-', '');
  return periodKey;
}

function periodTypeLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) return 'WEEKLY ROUNDUP';
  if (periodKey.startsWith('month-')) return 'MONTHLY ROUNDUP';
  if (periodKey.startsWith('year-')) return 'YEAR IN REVIEW';
  return 'TRAINING ROUNDUP';
}

function fmtDateRange(roundup: ShowcaseRoundup): string | null {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  if (roundup.periodStart && roundup.periodEnd) return `${fmt(roundup.periodStart)} – ${fmt(roundup.periodEnd)}`;
  if (roundup.periodStart) return fmt(roundup.periodStart);
  return null;
}

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtVal(pr: NonNullable<ShowcaseRoundup['prsAchieved']>[number]): string {
  const { value, unit } = pr;
  if (!value) return '—';
  if (unit === 'seconds') {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = Math.floor(value % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }
  if (unit === 'kg') return `${Math.round(value)}kg`;
  return `${Math.round(value)}${unit ?? ''}`;
}

// ─── Stat system ──────────────────────────────────────────────────────────────

interface StatOption { id: string; label: string; value: string }

function buildRoundupStats(roundup: ShowcaseRoundup): StatOption[] {
  const stats: StatOption[] = [];
  const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
  const hasStrength = roundup.activityTypeBreakdowns?.some(bd => (bd.totalSets ?? 0) > 0) ?? false;
  const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;

  stats.push({ id: 'sessions', label: 'Sessions', value: String(roundup.totalActivities ?? 0) });

  if ((roundup.totalDurationSeconds ?? 0) > 0)
    stats.push({ id: 'duration', label: 'Total Time', value: fmtDuration(roundup.totalDurationSeconds!) });

  if (hasDistance) {
    const km = (roundup.totalDistanceMeters ?? 0) / 1000;
    stats.push({ id: 'distance', label: 'Distance', value: `${km >= 10 ? km.toFixed(1) : km.toFixed(2)} km` });
  }

  if (hasStrength && totalWeightKg > 0) {
    const t = totalWeightKg / 1000;
    stats.push({ id: 'weight', label: 'Weight Moved', value: t >= 1 ? `${t.toFixed(1)}t` : `${Math.round(totalWeightKg)}kg` });
  }

  if ((roundup.totalElevationGainMeters ?? 0) > 50)
    stats.push({ id: 'elevation', label: 'Elevation', value: `+${Math.round(roundup.totalElevationGainMeters!)}m` });

  if ((roundup.totalCaloriesKcal ?? 0) > 0)
    stats.push({ id: 'calories', label: 'Calories', value: `${roundup.totalCaloriesKcal!.toLocaleString()} kcal` });

  const prCount = roundup.prsAchieved?.length ?? 0;
  if (prCount > 0)
    stats.push({ id: 'prs', label: 'PRs', value: `${prCount} 🏆` });

  const easy = roundup.effortEasyCount ?? 0;
  const moderate = roundup.effortModerateCount ?? 0;
  const hard = roundup.effortHardCount ?? 0;
  if (easy + moderate + hard > 0)
    stats.push({ id: 'hard', label: 'Hard Sessions', value: String(hard) });

  const longest = roundup.longestActivityDurationSeconds ?? 0;
  if (longest > 60) {
    const h = Math.floor(longest / 3600);
    const m = Math.floor((longest % 3600) / 60);
    stats.push({ id: 'longest', label: 'Longest Session', value: h > 0 ? `${h}h ${m}m` : `${m}m` });
  }

  const cph = roundup.highestCaloriesPerHourKcal ?? 0;
  if (cph > 0)
    stats.push({ id: 'cph', label: 'Peak Cal/hr', value: `${Math.round(cph)} kcal/h` });

  const bpm = roundup.highestAvgBpm ?? 0;
  if (bpm > 0)
    stats.push({ id: 'bpm', label: 'Peak Avg BPM', value: `${bpm} bpm` });

  return stats;
}

// ─── Overview frame ───────────────────────────────────────────────────────────

interface OverviewFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cardBg: typeof CARD_BACKGROUNDS[number];
  cardShape: typeof CARD_SHAPES[number];
  accent: string;
  textColor: string;
  stats: StatOption[];
  showTypeLabel: boolean;
  showAthleteName: boolean;
  showDateRange: boolean;
  showSources: boolean;
  showWatermark: boolean;
}

const OverviewFrame = React.forwardRef<HTMLDivElement, OverviewFrameProps>(
  ({ roundup, periodKey, cardBg, cardShape, accent, textColor, stats, showTypeLabel, showAthleteName, showDateRange, showSources, showWatermark }, ref) => {
    const isClear = cardBg.id === 'clear';
    const isAurora = cardBg.id === 'aurora';
    const resolvedText = isAurora ? '#070710' : textColor;
    const resolvedAccent = isAurora ? '#070710' : accent;
    const isStory = cardShape.id === 'story';
    const dateRange = fmtDateRange(roundup);
    const sources = roundup.sources?.map(s => formatSource(s)).join(' · ') ?? '';

    const titleFontSize = isStory ? '72px' : '88px';
    const statValSize  = isStory ? '48px' : '56px';

    const shadow = isClear ? '0 2px 24px rgba(0,0,0,0.9)' : undefined;

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        aspectRatio: cardShape.ratio,
        background: cardBg.style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isStory ? '100px 80px' : '80px',
        boxSizing: 'border-box',
        fontFamily: DISPLAY,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grain — skip on clear/transparent */}
        {!isClear && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        )}

        {showTypeLabel && (
          <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: resolvedAccent, opacity: isClear ? 1 : 0.8, marginBottom: '16px', textShadow: shadow }}>
            {periodTypeLabel(periodKey)}
          </div>
        )}

        <div style={{ fontFamily: DISPLAY, fontSize: titleFontSize, color: resolvedText, lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center', marginBottom: showAthleteName || showDateRange ? '12px' : '48px', textShadow: shadow }}>
          {periodLabel(periodKey)}
        </div>

        {showAthleteName && roundup.ownerDisplayName && (
          <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedText, opacity: 0.6, marginBottom: showDateRange ? '4px' : '48px', textShadow: shadow }}>
            {roundup.ownerDisplayName}
          </div>
        )}

        {showDateRange && dateRange && (
          <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: resolvedText, opacity: 0.5, marginBottom: '48px', textShadow: shadow }}>
            {dateRange}
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '80px', height: '3px', background: resolvedAccent, opacity: isClear ? 0.7 : 0.5, marginBottom: '48px' }} />

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{ display: 'flex', gap: isStory ? '48px' : '64px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: statValSize, color: resolvedAccent, lineHeight: 1, textShadow: shadow }}>{s.value}</div>
                <div style={{ fontFamily: MONO, fontSize: '17px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedText, opacity: 0.55, marginTop: '8px', textShadow: shadow }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {showSources && sources && (
          <div style={{ position: 'absolute', bottom: '32px', fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: resolvedText, opacity: 0.35, textShadow: shadow }}>
            {sources}
          </div>
        )}

        {showWatermark && (
          <div style={{ position: 'absolute', bottom: '20px', right: '32px', fontFamily: DISPLAY, fontSize: '20px', color: isClear ? 'rgba(7,7,16,0.25)' : isAurora ? 'rgba(7,7,16,0.25)' : 'rgba(245,243,235,0.2)', letterSpacing: '0.04em' }}>
            FIT<span style={{ color: isClear ? accent : resolvedAccent }}>GLUE</span>
          </div>
        )}
      </div>
    );
  }
);
OverviewFrame.displayName = 'OverviewFrame';

// ─── PR Wall frame ────────────────────────────────────────────────────────────

interface PRWallFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cardBg: typeof CARD_BACKGROUNDS[number];
  cardShape: typeof CARD_SHAPES[number];
  accent: string;
  textColor: string;
  showTypeLabel: boolean;
  showAthleteName: boolean;
  showWatermark: boolean;
}

const PRWallFrame = React.forwardRef<HTMLDivElement, PRWallFrameProps>(
  ({ roundup, periodKey, cardBg, cardShape, accent, textColor, showTypeLabel, showAthleteName, showWatermark }, ref) => {
    const isClear = cardBg.id === 'clear';
    const isAurora = cardBg.id === 'aurora';
    const resolvedText = isAurora ? '#070710' : textColor;
    const resolvedAccent = isAurora ? '#070710' : accent;
    const prs = roundup.prsAchieved ?? [];
    const isStory = cardShape.id === 'story';
    const gridCols = isStory ? 2 : 3;
    const maxPRs = isStory ? 8 : 9;
    const display = prs.slice(0, maxPRs);
    const shadow = isClear ? '0 2px 18px rgba(0,0,0,0.9)' : undefined;

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        aspectRatio: cardShape.ratio,
        background: isClear ? 'transparent' : cardBg.id === 'aurora' ? cardBg.style : (cardBg.style !== 'transparent' ? cardBg.style : 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)'),
        padding: isStory ? '80px 72px' : '72px',
        boxSizing: 'border-box',
        fontFamily: DISPLAY,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {!isClear && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        )}

        {showTypeLabel && (
          <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: resolvedAccent, marginBottom: '6px', textShadow: shadow }}>
            🏆 {periodTypeLabel(periodKey)} · {prs.length} PRS
          </div>
        )}

        <div style={{ fontFamily: DISPLAY, fontSize: isStory ? '48px' : '56px', color: resolvedText, lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: showAthleteName && roundup.ownerDisplayName ? '8px' : '40px', textShadow: shadow }}>
          {periodLabel(periodKey)}
        </div>

        {showAthleteName && roundup.ownerDisplayName && (
          <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedText, opacity: 0.6, marginBottom: '32px', textShadow: shadow }}>
            {roundup.ownerDisplayName}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '10px', flex: 1 }}>
          {display.map((pr, i) => (
            <div key={i} style={{
              background: isClear ? `${resolvedAccent}18` : `${resolvedAccent}22`,
              border: `1px solid ${resolvedAccent}${isClear ? '55' : '33'}`,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: resolvedAccent, opacity: 0.8, textShadow: shadow }}>
                {(pr.recordType ?? '').replace(/_/g, ' ')}
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: isStory ? '28px' : '34px', color: resolvedText, lineHeight: 1, letterSpacing: '-0.02em', textShadow: shadow }}>
                  {fmtVal(pr)}
                </div>
                {pr.previousValue != null && pr.value != null && (
                  <div style={{ fontFamily: MONO, fontSize: '12px', color: resolvedAccent, marginTop: '4px', opacity: 0.7 }}>
                    {pr.unit === 'kg'
                      ? `+${Math.round(pr.value - pr.previousValue)}kg`
                      : `−${Math.round(pr.previousValue - pr.value)}s`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {prs.length > maxPRs && (
          <div style={{ fontFamily: MONO, fontSize: '14px', color: isClear ? `${resolvedText}99` : 'rgba(245,243,235,0.4)', marginTop: '12px', letterSpacing: '0.1em' }}>
            + {prs.length - maxPRs} more
          </div>
        )}

        {showWatermark && (
          <div style={{ position: 'absolute', bottom: '20px', right: '32px', fontFamily: DISPLAY, fontSize: '20px', color: isClear ? 'rgba(7,7,16,0.25)' : isAurora ? 'rgba(7,7,16,0.22)' : 'rgba(245,243,235,0.18)', letterSpacing: '0.04em' }}>
            FIT<span style={{ color: resolvedAccent }}>GLUE</span>
          </div>
        )}
      </div>
    );
  }
);
PRWallFrame.displayName = 'PRWallFrame';

// ─── Story frame ──────────────────────────────────────────────────────────────
// The Story is a 9:16 composition that REUSES the real chart components
// (DonutChart / HRRingsChart / ConsistencyViz) and the PhotoWall, arranged by a
// `layout`: a photo-hero magazine, a clean chart grid, or a full-bleed photo wall.

export type StoryLayout = 'magazine' | 'grid' | 'wall';

interface StoryFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  layout: StoryLayout;
  accent: string;
  textColor: string;
  showTypeLabel: boolean;
  showAthleteName: boolean;
  showAvatar: boolean;
  showDateRange: boolean;
  showSport: boolean;
  showHR: boolean;
  showConsistency: boolean;
  showEfforts: boolean;
  showPhotos: boolean;
  showPRCallout: boolean;
  showWatermark: boolean;
}

const StoryFrame = React.forwardRef<HTMLDivElement, StoryFrameProps>(
  ({ roundup, periodKey, layout, accent, textColor, showTypeLabel, showAthleteName, showAvatar, showDateRange, showSport, showHR, showConsistency, showEfforts, showPhotos, showPRCallout, showWatermark }, ref) => {
    const dateRange = fmtDateRange(roundup);
    // Resolve chart colours the same way ChartCardFrame does, on a dark story bg.
    const cfg: CardConfig = {
      bg: { id: 'dark', style: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a20 50%,#0a0a0a 100%)' },
      shape: { id: 'story', ratio: '9/16' }, accent, textColor, showWatermark,
    };
    const colors = cardColors(cfg);

    // Data sources (reused builders).
    const stats = buildRoundupStats(roundup).slice(0, 4);
    const sportVMs = buildSportVMs(roundup.activityTypeBreakdowns ?? []);
    const sportTotal = sportVMs.reduce((a, s) => a + s.count, 0);
    const hrMinutes = roundup.hrZoneMinutes ?? [];
    const hrTracked = [1, 2, 3, 4, 5].reduce((s, i) => s + (hrMinutes[i] ?? 0), 0);
    const calDays = (roundup.periodStart && roundup.periodEnd)
      ? buildCalendarDays(roundup.periodStart, roundup.periodEnd, roundup.dayEntries ?? [])
      : [];
    const yearLabel = roundup.periodStart ? String(new Date(roundup.periodStart).getUTCFullYear()) : '';
    const photos = roundup.photos ?? [];
    const prCount = roundup.prsAchieved?.length ?? 0;
    const efforts = (roundup.bestEfforts ?? []).filter((be) => (be.timeSeconds ?? 0) > 0);

    const hasSport = showSport && sportVMs.length > 0;
    const hasHR = showHR && hrTracked >= 30;
    const hasCal = showConsistency && calDays.length > 1;
    const hasEff = showEfforts && efforts.length > 0;
    const hasPhotos = showPhotos && photos.length > 0;
    const hasPR = showPRCallout && prCount > 0;

    const baseBg = `linear-gradient(180deg, ${accent}22 0%, #070710 32%, #070710 100%)`;

    /* ---- shared bits ---- */
    const Header = ({ compact }: { compact?: boolean }) => (
      <div style={{ position: 'relative' }}>
        {(showAvatar || showAthleteName || showTypeLabel) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: compact ? '16px' : '28px' }}>
            {showAvatar && roundup.ownerProfilePictureUrl && (
              <img src={roundup.ownerProfilePictureUrl} crossOrigin="anonymous" alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: `3px solid ${accent}`, objectFit: 'cover' }} />
            )}
            <div>
              {showTypeLabel && (
                <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.accent }}>
                  {periodTypeLabel(periodKey)}
                </div>
              )}
              {showAthleteName && roundup.ownerDisplayName && (
                <div style={{ fontFamily: DISPLAY, fontSize: '24px', color: colors.text, letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 1.1 }}>
                  {roundup.ownerDisplayName}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{ fontFamily: DISPLAY, fontSize: compact ? '72px' : '84px', color: colors.text, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
          {periodLabel(periodKey)}
        </div>
        {showDateRange && dateRange && (
          <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted, marginTop: '12px' }}>
            {dateRange}
          </div>
        )}
      </div>
    );

    const StatStrip = () => (
      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
        {stats.map((s) => (
          <div key={s.id}>
            <div style={{ fontFamily: DISPLAY, fontSize: '52px', color: colors.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: MONO, fontSize: '15px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted, marginTop: '6px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    );

    const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div style={{ border: `1px solid ${colors.track}`, padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', minHeight: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.accent }}>{title}</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      </div>
    );

    const SportLegendRows = ({ max }: { max: number }) => (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {sportVMs.slice(0, max).map((s) => (
          <div key={s.type} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderTop: `1px solid ${colors.track}` }}>
            <span style={{ width: '14px', height: '14px', background: s.color, flexShrink: 0 }} />
            <span style={{ fontFamily: DISPLAY, fontSize: '22px', textTransform: 'uppercase', color: colors.text, flex: 1 }}>{s.label}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: '24px', color: colors.accent }}>{s.count}</span>
          </div>
        ))}
      </div>
    );

    const HRRows = () => {
      const zoneMin = [1, 2, 3, 4, 5].map((i) => hrMinutes[i] ?? 0);
      const total = zoneMin.reduce((a, b) => a + b, 0) || 1;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {HR_ZONES.map((z, i) => (
            <div key={z.z} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0', borderTop: `1px solid ${colors.track}` }}>
              <span style={{ width: '14px', height: '14px', background: z.color, flexShrink: 0 }} />
              <span style={{ fontFamily: DISPLAY, fontSize: '20px', textTransform: 'uppercase', color: colors.text, flex: 1 }}>{z.z} <span style={{ color: colors.muted, fontSize: '16px' }}>{z.name}</span></span>
              <span style={{ fontFamily: DISPLAY, fontSize: '22px', color: colors.accent }}>{Math.round((zoneMin[i] / total) * 100)}%</span>
            </div>
          ))}
        </div>
      );
    };

    const EffortRows = ({ max }: { max: number }) => (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {efforts.slice(0, max).map((be, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '14px', padding: '12px 0', borderTop: `1px solid ${colors.track}` }}>
            <span style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, flex: 1 }}>{be.display ?? be.distanceKey}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: '28px', letterSpacing: '-0.02em', color: colors.accent }}>{formatClock(be.timeSeconds ?? 0)}</span>
          </div>
        ))}
      </div>
    );

    const PRBar = () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px 32px', background: `${colors.accent}1f`, border: `1px solid ${colors.accent}44` }}>
        <span style={{ fontFamily: DISPLAY, fontSize: '88px', color: colors.accent, lineHeight: 0.9 }}>{prCount}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: '34px', color: colors.text, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
          New personal<br />record{prCount === 1 ? '' : 's'} 🏆
        </span>
      </div>
    );

    const Watermark = () => showWatermark ? (
      <div style={{ position: 'absolute', bottom: '28px', right: '40px', fontFamily: DISPLAY, fontSize: '22px', color: 'rgba(245,243,235,0.22)', letterSpacing: '0.04em' }}>
        FIT<span style={{ color: colors.accent }}>GLUE</span>
      </div>
    ) : null;

    const GrainOverlay = () => (
      <div style={{ position: 'absolute', inset: 0, opacity: 0.13, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    );

    const shell = (children: React.ReactNode, opts?: { pad?: string; bg?: string }) => (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`, aspectRatio: '9/16', background: opts?.bg ?? baseBg,
        position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
        padding: opts?.pad ?? '80px 64px', fontFamily: DISPLAY,
        display: 'flex', flexDirection: 'column', gap: '40px',
      }}>
        <GrainOverlay />
        {children}
        <Watermark />
      </div>
    );

    /* ---- WALL: full-bleed photo mosaic with stats overlaid ---- */
    if (layout === 'wall' && hasPhotos) {
      return (
        <div ref={ref} style={{
          width: `${EXPORT_W}px`, aspectRatio: '9/16', background: '#070710',
          position: 'relative', overflow: 'hidden', boxSizing: 'border-box', fontFamily: DISPLAY,
        }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <PhotoWall photos={photos} height="100%" gap={4} accent={accent} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,7,16,0.78) 0%, rgba(7,7,16,0) 26%, rgba(7,7,16,0) 52%, rgba(7,7,16,0.92) 100%)' }} />
          <div style={{ position: 'absolute', top: '72px', left: '64px', right: '64px' }}>
            {showTypeLabel && (
              <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>{periodTypeLabel(periodKey)}</div>
            )}
            <div style={{ fontFamily: DISPLAY, fontSize: '88px', color: '#f5f3eb', lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}>{periodLabel(periodKey)}</div>
          </div>
          <div style={{ position: 'absolute', left: '64px', right: '64px', bottom: '88px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {stats.map((s) => (
                <div key={s.id}>
                  <div style={{ fontFamily: DISPLAY, fontSize: '56px', color: accent, lineHeight: 1, textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>{s.value}</div>
                  <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,243,235,0.7)', marginTop: '6px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {hasPR && (
              <div style={{ fontFamily: DISPLAY, fontSize: '40px', color: accent, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>🏆 {prCount} new {prCount === 1 ? 'PR' : 'PRs'}</div>
            )}
          </div>
          <Watermark />
        </div>
      );
    }

    /* ---- GRID: clean 2-up grid of the reused chart components ---- */
    if (layout === 'grid') {
      const cells: React.ReactNode[] = [];
      if (hasSport) cells.push(
        <Panel key="sport" title="By Sport"><DonutChart data={sportVMs} total={sportTotal} width={300} maxWidth={300} trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} /></Panel>
      );
      if (hasHR) cells.push(
        <Panel key="hr" title="HR Zones"><HRRingsChart minutes={hrMinutes} width={300} maxWidth={300} trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} /></Panel>
      );
      if (hasCal) cells.push(
        <Panel key="cal" title="Consistency"><ConsistencyViz periodType={roundup.periodType} days={calDays} yearLabel={yearLabel} cell={14} gap={3} textColor={colors.text} mutedColor={colors.muted} /></Panel>
      );
      if (hasEff) cells.push(
        <Panel key="eff" title="Best Efforts"><EffortRows max={5} /></Panel>
      );
      if (hasPR) cells.push(
        <Panel key="pr" title="Records"><div style={{ textAlign: 'center' }}><div style={{ fontFamily: DISPLAY, fontSize: '120px', color: colors.accent, lineHeight: 0.9 }}>{prCount}</div><div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.muted, marginTop: '10px' }}>Personal Records 🏆</div></div></Panel>
      );
      return shell(
        <>
          <Header />
          <StatStrip />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: cells.length === 1 ? '1fr' : '1fr 1fr', gap: '20px', minHeight: 0 }}>
            {cells.length ? cells : <Panel title="By Sport"><SportLegendRows max={6} /></Panel>}
          </div>
        </>,
      );
    }

    /* ---- MAGAZINE (default): photo (or donut) hero, stat strip, mini panels ---- */
    return shell(
      <>
        <Header compact />
        {hasPhotos ? (
          <PhotoWall photos={photos} height={620} gap={8} accent={accent} />
        ) : hasSport ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DonutChart data={sportVMs} total={sportTotal} width={420} maxWidth={420} trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} />
          </div>
        ) : null}
        <StatStrip />
        {(hasSport || hasHR) && (
          <div style={{ display: 'grid', gridTemplateColumns: hasSport && hasHR ? '1fr 1fr' : '1fr', gap: '20px' }}>
            {hasSport && (
              <Panel title="By Sport">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <DonutChart data={sportVMs} total={sportTotal} width={220} maxWidth={220} trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} />
                  <SportLegendRows max={4} />
                </div>
              </Panel>
            )}
            {hasHR && (
              <Panel title="HR Zones">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <HRRingsChart minutes={hrMinutes} width={220} maxWidth={220} trackColor={colors.track} textColor={colors.text} mutedColor={colors.muted} />
                  <HRRows />
                </div>
              </Panel>
            )}
          </div>
        )}
        {hasCal && (
          <Panel title="Consistency">
            <ConsistencyViz periodType={roundup.periodType} days={calDays} yearLabel={yearLabel} cell={16} gap={4} textColor={colors.text} mutedColor={colors.muted} />
          </Panel>
        )}
        {hasEff && (
          <Panel title="Best Efforts"><EffortRows max={6} /></Panel>
        )}
        {hasPR && <PRBar />}
      </>,
    );
  }
);
StoryFrame.displayName = 'StoryFrame';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  roundup: ShowcaseRoundup;
  periodKey: string;
  previousRoundup?: ShowcaseRoundup | null;
  initialCard?: RoundupExportTab;
  onClose: () => void;
}

export const ShowcaseRoundupExportModal: React.FC<Props> = ({ roundup, periodKey, previousRoundup, initialCard, onClose }) => {
  const hasPRs = (roundup.prsAchieved?.length ?? 0) > 0;
  const allStats = buildRoundupStats(roundup);

  // ── Available extra cards ──
  const hasSport = (roundup.activityTypeBreakdowns?.length ?? 0) > 0;
  const hasHR = (roundup.hrZoneMinutes ?? []).slice(1, 6).reduce((a, b) => a + (b ?? 0), 0) > 0;
  const hasCal = (roundup.dayEntries?.length ?? 0) > 1;
  const hasEfforts = (roundup.bestEfforts?.filter((be) => (be.timeSeconds ?? 0) > 0).length ?? 0) > 0;
  const hasVs = !!previousRoundup && buildDeltas(roundup, previousRoundup).length > 0;
  const hasPhoto = (roundup.photos?.length ?? 0) > 0;
  const hasRoute = (roundup.routes?.length ?? 0) > 0;

  const tabAvailable = (t: RoundupExportTab): boolean => {
    switch (t) {
      case 'prs': return hasPRs;
      case 'sport': return hasSport;
      case 'hr': return hasHR;
      case 'calendar': return hasCal;
      case 'efforts': return hasEfforts;
      case 'vs': return hasVs;
      case 'photo': return hasPhoto;
      case 'route': return hasRoute;
      default: return true;
    }
  };

  // ── Shared state ──
  const [activeTab, setActiveTab] = useState<RoundupExportTab>(
    initialCard && tabAvailable(initialCard) ? initialCard : 'overview',
  );
  const [accent, setAccent] = useState(ACCENTS[0].color);
  const [exporting, setExporting] = useState(false);
  const [previewH, setPreviewH] = useState(PREVIEW_SIZE);

  // ── Overview state ──
  const [ovCardBg, setOvCardBg] = useState(CARD_BACKGROUNDS[0]);
  const [ovCardShape, setOvCardShape] = useState(CARD_SHAPES[1]); // square default
  const [ovTextColor, setOvTextColor] = useState('#ffffff');
  const [ovShowTypeLabel, setOvShowTypeLabel] = useState(true);
  const [ovShowAthleteName, setOvShowAthleteName] = useState(true);
  const [ovShowDateRange, setOvShowDateRange] = useState(true);
  const [ovShowSources, setOvShowSources] = useState(false);
  const [ovShowWatermark, setOvShowWatermark] = useState(true);
  const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() => allStats.slice(0, 4).map(s => s.id));

  // ── PR state ──
  const [prCardBg, setPrCardBg] = useState(CARD_BACKGROUNDS[1]); // dark default for PRs
  const [prCardShape, setPrCardShape] = useState(CARD_SHAPES[1]);
  const [prTextColor, setPrTextColor] = useState('#ffffff');
  const [prShowTypeLabel, setPrShowTypeLabel] = useState(true);
  const [prShowAthleteName, setPrShowAthleteName] = useState(false);
  const [prShowWatermark, setPrShowWatermark] = useState(true);

  // ── Story state ──
  const [stLayout, setStLayout] = useState<StoryLayout>('magazine');
  const [stShowTypeLabel, setStShowTypeLabel] = useState(true);
  const [stShowAthleteName, setStShowAthleteName] = useState(true);
  const [stShowAvatar, setStShowAvatar] = useState(true);
  const [stShowDateRange, setStShowDateRange] = useState(true);
  const [stShowSport, setStShowSport] = useState(true);
  const [stShowHR, setStShowHR] = useState(true);
  const [stShowConsistency, setStShowConsistency] = useState(true);
  const [stShowEfforts, setStShowEfforts] = useState(true);
  const [stShowPhotos, setStShowPhotos] = useState(true);
  const [stShowPRCallout, setStShowPRCallout] = useState(true);
  const [stShowWatermark, setStShowWatermark] = useState(true);
  const [stTextColor, setStTextColor] = useState('#ffffff');

  // ── Extra-card (sport/hr/calendar/vs) shared state ──
  const [xBg, setXBg] = useState(CARD_BACKGROUNDS[1]); // dark default
  const [xShape, setXShape] = useState(CARD_SHAPES[1]); // square default
  const [xText, setXText] = useState('#ffffff');
  const [xWatermark, setXWatermark] = useState(true);
  const [mediaIdx, setMediaIdx] = useState(0);

  const overviewRef = useRef<HTMLDivElement>(null);
  const prRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  const isExtra = activeTab === 'sport' || activeTab === 'hr' || activeTab === 'calendar' || activeTab === 'efforts' || activeTab === 'vs';
  const isMedia = activeTab === 'photo' || activeTab === 'route';
  const activeRef = activeTab === 'overview' ? overviewRef
    : activeTab === 'prs' ? prRef
    : activeTab === 'story' ? storyRef
    : extraRef;
  const xCfg: CardConfig = { bg: xBg, shape: xShape, accent, textColor: xText, showWatermark: xWatermark };
  const mediaList = activeTab === 'route' ? (roundup.routes ?? []) : (roundup.photos ?? []);
  const mediaItem = mediaList[Math.min(mediaIdx, Math.max(0, mediaList.length - 1))];
  const previewScale = PREVIEW_SIZE / EXPORT_W;

  useLayoutEffect(() => {
    const el = activeRef.current;
    if (el) {
      const h = el.scrollHeight;
      const newH = Math.round(h * previewScale);
      setPreviewH((prev) => prev === newH ? prev : newH);
    }
  });

  const handleExport = useCallback(async () => {
    const el = activeRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const h = el.scrollHeight;
      const dataUrl = await toPng(el, { width: EXPORT_W, height: h, pixelRatio: 1 });
      const label = periodKey.replace(/-/g, '_');
      await saveImage(dataUrl, `roundup-${label}-${activeTab}-fitglue.png`);
    } catch (err) { logger.error('Export failed:', err); }
    finally { setExporting(false); }
  }, [activeRef, periodKey, activeTab]);

  const selectedStats = allStats.filter(s => selectedStatIds.includes(s.id));
  const toggleStat = (id: string) => {
    setSelectedStatIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? prev : [...prev, id]
    );
  };

  const bgPickerId = `bg-${activeTab}`;

  // ── 3D tilt on the preview card ──
  const tiltRef = useRef<HTMLDivElement>(null);
  const reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const onTiltMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el || reduceMotion) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${(px * 10).toFixed(2)}deg) rotateX(${(-py * 10).toFixed(2)}deg)`;
  };
  const onTiltLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };

  return createPortal(
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>

        <div className="export-modal-header">
          <h3 className="export-modal-title">✦ Share Roundup</h3>
          <div className="export-modal-tabs">
            <button className={`export-tab${activeTab === 'overview' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            {hasPRs && <button className={`export-tab${activeTab === 'prs' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('prs')}>PRs ★</button>}
            <button className={`export-tab${activeTab === 'story' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('story')}>Story</button>
            {hasSport && <button className={`export-tab${activeTab === 'sport' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('sport')}>Sport</button>}
            {hasCal && <button className={`export-tab${activeTab === 'calendar' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('calendar')}>Calendar</button>}
            {hasHR && <button className={`export-tab${activeTab === 'hr' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('hr')}>HR</button>}
            {hasEfforts && <button className={`export-tab${activeTab === 'efforts' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('efforts')}>Efforts</button>}
            {hasVs && <button className={`export-tab${activeTab === 'vs' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('vs')}>Vs ↑</button>}
            {hasRoute && <button className={`export-tab${activeTab === 'route' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('route')}>Route</button>}
            {hasPhoto && <button className={`export-tab${activeTab === 'photo' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('photo')}>Photo</button>}
            <button className={`export-tab${activeTab === 'reel' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('reel')}>Reel ▶</button>
          </div>
          <button className="export-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="export-modal-body">
          {activeTab === 'reel' ? (
            <RoundupReelPanel roundup={roundup} periodKey={periodKey} accent={accent} onAccent={setAccent} />
          ) : (
          <>
          <div className="export-modal-preview-col">
            <div style={{ perspective: '1200px' }} onMouseMove={onTiltMove} onMouseLeave={onTiltLeave}>
            <div ref={tiltRef} className="export-preview-wrapper" style={{
              width: PREVIEW_SIZE,
              height: previewH,
              backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.12s ease-out',
              transformStyle: 'preserve-3d',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', width: EXPORT_W }}>
                {activeTab === 'overview' && (
                  <OverviewFrame
                    ref={overviewRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    cardBg={ovCardBg}
                    cardShape={ovCardShape}
                    accent={accent}
                    textColor={ovTextColor}
                    stats={selectedStats}
                    showTypeLabel={ovShowTypeLabel}
                    showAthleteName={ovShowAthleteName}
                    showDateRange={ovShowDateRange}
                    showSources={ovShowSources}
                    showWatermark={ovShowWatermark}
                  />
                )}
                {activeTab === 'prs' && (
                  <PRWallFrame
                    ref={prRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    cardBg={prCardBg}
                    cardShape={prCardShape}
                    accent={accent}
                    textColor={prTextColor}
                    showTypeLabel={prShowTypeLabel}
                    showAthleteName={prShowAthleteName}
                    showWatermark={prShowWatermark}
                  />
                )}
                {activeTab === 'story' && (
                  <StoryFrame
                    ref={storyRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    layout={stLayout}
                    accent={accent}
                    textColor={stTextColor}
                    showTypeLabel={stShowTypeLabel}
                    showAthleteName={stShowAthleteName}
                    showAvatar={stShowAvatar}
                    showDateRange={stShowDateRange}
                    showSport={stShowSport}
                    showHR={stShowHR}
                    showConsistency={stShowConsistency}
                    showEfforts={stShowEfforts}
                    showPhotos={stShowPhotos}
                    showPRCallout={stShowPRCallout}
                    showWatermark={stShowWatermark}
                  />
                )}
                {(activeTab === 'sport' || activeTab === 'hr' || activeTab === 'calendar') && (
                  <ChartCardFrame
                    ref={extraRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    variant={activeTab}
                    cfg={xCfg}
                  />
                )}
                {activeTab === 'efforts' && (
                  <EffortsCardFrame
                    ref={extraRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    cfg={xCfg}
                  />
                )}
                {activeTab === 'vs' && previousRoundup && (
                  <ComparisonCardFrame
                    ref={extraRef}
                    roundup={roundup}
                    periodKey={periodKey}
                    previousRoundup={previousRoundup}
                    cfg={xCfg}
                  />
                )}
                {isMedia && mediaItem && (
                  <MediaCardFrame
                    ref={extraRef}
                    variant={activeTab === 'route' ? 'route' : 'photo'}
                    item={mediaItem}
                    periodKey={periodKey}
                    cfg={xCfg}
                  />
                )}
              </div>
            </div>
            </div>
            <button className="export-download-btn" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : '⬇ Download PNG'}
            </button>
          </div>

          <div className="export-modal-options-col">
            <div className="export-options">

              {/* ── OVERVIEW options ── */}
              {activeTab === 'overview' && (
                <>
                  <div className="export-option-group">
                    <span className="export-option-label">Shape</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_SHAPES.map((s) => (
                        <button key={s.id} className={`export-pill${ovCardShape.id === s.id ? ' export-pill--active' : ''}`} onClick={() => setOvCardShape(s)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Card</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_BACKGROUNDS.map((b) => (
                        <button key={`${bgPickerId}-${b.id}`} className={`export-pill${ovCardBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setOvCardBg(b)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Text</span>
                    <div className="export-option-row">
                      {TEXT_SWATCHES.map((a) => (
                        <button key={a.id} className={`export-swatch${ovTextColor === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...textSwatchStyle(a.color) }} onClick={() => setOvTextColor(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  {allStats.length > 0 && (
                    <div className="export-option-group export-option-group--stats">
                      <span className="export-option-label">Stats</span>
                      <div className="export-option-row export-option-row--wrap">
                        {allStats.map((s) => (
                          <button key={s.id} className={`export-pill${selectedStatIds.includes(s.id) ? ' export-pill--active' : ''}`} onClick={() => toggleStat(s.id)} title={s.value}>{s.label}</button>
                        ))}
                      </div>
                      <p className="export-stats-hint">Up to 4 · click to toggle · hover to preview value</p>
                    </div>
                  )}
                  <div className="export-option-group">
                    <span className="export-option-label">Include</span>
                    <div className="export-option-row export-option-row--wrap">
                      <button className={`export-pill${ovShowTypeLabel ? ' export-pill--active' : ''}`} onClick={() => setOvShowTypeLabel(v => !v)}>Period Type</button>
                      {roundup.ownerDisplayName && <button className={`export-pill${ovShowAthleteName ? ' export-pill--active' : ''}`} onClick={() => setOvShowAthleteName(v => !v)}>Name</button>}
                      <button className={`export-pill${ovShowDateRange ? ' export-pill--active' : ''}`} onClick={() => setOvShowDateRange(v => !v)}>Date Range</button>
                      <button className={`export-pill${ovShowSources ? ' export-pill--active' : ''}`} onClick={() => setOvShowSources(v => !v)}>Sources</button>
                      <button className={`export-pill${ovShowWatermark ? ' export-pill--active' : ''}`} onClick={() => setOvShowWatermark(v => !v)}>Watermark</button>
                    </div>
                  </div>
                </>
              )}

              {/* ── PR WALL options ── */}
              {activeTab === 'prs' && (
                <>
                  <div className="export-option-group">
                    <span className="export-option-label">Shape</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_SHAPES.map((s) => (
                        <button key={s.id} className={`export-pill${prCardShape.id === s.id ? ' export-pill--active' : ''}`} onClick={() => setPrCardShape(s)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Card</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_BACKGROUNDS.map((b) => (
                        <button key={`${bgPickerId}-${b.id}`} className={`export-pill${prCardBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setPrCardBg(b)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Text</span>
                    <div className="export-option-row">
                      {TEXT_SWATCHES.map((a) => (
                        <button key={a.id} className={`export-swatch${prTextColor === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...textSwatchStyle(a.color) }} onClick={() => setPrTextColor(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Include</span>
                    <div className="export-option-row export-option-row--wrap">
                      <button className={`export-pill${prShowTypeLabel ? ' export-pill--active' : ''}`} onClick={() => setPrShowTypeLabel(v => !v)}>Period Type</button>
                      {roundup.ownerDisplayName && <button className={`export-pill${prShowAthleteName ? ' export-pill--active' : ''}`} onClick={() => setPrShowAthleteName(v => !v)}>Name</button>}
                      <button className={`export-pill${prShowWatermark ? ' export-pill--active' : ''}`} onClick={() => setPrShowWatermark(v => !v)}>Watermark</button>
                    </div>
                  </div>
                </>
              )}

              {/* ── STORY options ── */}
              {activeTab === 'story' && (
                <>
                  <div className="export-option-group">
                    <span className="export-option-label">Layout</span>
                    <div className="export-option-row export-option-row--wrap">
                      {([['magazine', 'Magazine'], ['grid', 'Grid'], ['wall', 'Photo Wall']] as const).map(([id, label]) => (
                        <button key={id} className={`export-pill${stLayout === id ? ' export-pill--active' : ''}`} onClick={() => setStLayout(id)}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Text</span>
                    <div className="export-option-row">
                      {TEXT_SWATCHES.map((a) => (
                        <button key={a.id} className={`export-swatch${stTextColor === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...textSwatchStyle(a.color) }} onClick={() => setStTextColor(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Include</span>
                    <div className="export-option-row export-option-row--wrap">
                      <button className={`export-pill${stShowTypeLabel ? ' export-pill--active' : ''}`} onClick={() => setStShowTypeLabel(v => !v)}>Period Type</button>
                      {roundup.ownerProfilePictureUrl && <button className={`export-pill${stShowAvatar ? ' export-pill--active' : ''}`} onClick={() => setStShowAvatar(v => !v)}>Avatar</button>}
                      {roundup.ownerDisplayName && <button className={`export-pill${stShowAthleteName ? ' export-pill--active' : ''}`} onClick={() => setStShowAthleteName(v => !v)}>Name</button>}
                      <button className={`export-pill${stShowDateRange ? ' export-pill--active' : ''}`} onClick={() => setStShowDateRange(v => !v)}>Date Range</button>
                      {hasPhoto && <button className={`export-pill${stShowPhotos ? ' export-pill--active' : ''}`} onClick={() => setStShowPhotos(v => !v)}>Photos</button>}
                      {hasSport && <button className={`export-pill${stShowSport ? ' export-pill--active' : ''}`} onClick={() => setStShowSport(v => !v)}>Sport Donut</button>}
                      {hasHR && <button className={`export-pill${stShowHR ? ' export-pill--active' : ''}`} onClick={() => setStShowHR(v => !v)}>HR Rings</button>}
                      {hasCal && <button className={`export-pill${stShowConsistency ? ' export-pill--active' : ''}`} onClick={() => setStShowConsistency(v => !v)}>Consistency</button>}
                      {hasEfforts && <button className={`export-pill${stShowEfforts ? ' export-pill--active' : ''}`} onClick={() => setStShowEfforts(v => !v)}>Best Efforts</button>}
                      {hasPRs && <button className={`export-pill${stShowPRCallout ? ' export-pill--active' : ''}`} onClick={() => setStShowPRCallout(v => !v)}>PRs Callout</button>}
                      <button className={`export-pill${stShowWatermark ? ' export-pill--active' : ''}`} onClick={() => setStShowWatermark(v => !v)}>Watermark</button>
                    </div>
                  </div>
                </>
              )}

              {/* ── EXTRA-CARD options (sport / hr / calendar / vs) ── */}
              {isExtra && (
                <>
                  <div className="export-option-group">
                    <span className="export-option-label">Shape</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_SHAPES.map((s) => (
                        <button key={s.id} className={`export-pill${xShape.id === s.id ? ' export-pill--active' : ''}`} onClick={() => setXShape(s)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Card</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_BACKGROUNDS.map((b) => (
                        <button key={`x-${b.id}`} className={`export-pill${xBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setXBg(b)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Text</span>
                    <div className="export-option-row">
                      {TEXT_SWATCHES.map((a) => (
                        <button key={a.id} className={`export-swatch${xText === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...textSwatchStyle(a.color) }} onClick={() => setXText(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Include</span>
                    <div className="export-option-row export-option-row--wrap">
                      <button className={`export-pill${xWatermark ? ' export-pill--active' : ''}`} onClick={() => setXWatermark(v => !v)}>Watermark</button>
                    </div>
                  </div>
                </>
              )}

              {/* ── MEDIA-CARD options (photo / route) ── */}
              {isMedia && (
                <>
                  <div className="export-option-group">
                    <span className="export-option-label">Shape</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_SHAPES.map((s) => (
                        <button key={s.id} className={`export-pill${xShape.id === s.id ? ' export-pill--active' : ''}`} onClick={() => setXShape(s)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  {mediaList.length > 1 && (
                    <div className="export-option-group">
                      <span className="export-option-label">{activeTab === 'route' ? 'Route' : 'Photo'}</span>
                      <div className="export-option-row export-option-row--wrap">
                        {mediaList.slice(0, 12).map((_, i) => (
                          <button key={i} className={`export-pill${Math.min(mediaIdx, mediaList.length - 1) === i ? ' export-pill--active' : ''}`} onClick={() => setMediaIdx(i)}>{i + 1}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Include</span>
                    <div className="export-option-row export-option-row--wrap">
                      <button className={`export-pill${xWatermark ? ' export-pill--active' : ''}`} onClick={() => setXWatermark(v => !v)}>Watermark</button>
                    </div>
                  </div>
                  <p className="export-stats-hint">Cross-origin photos may not appear in the exported PNG.</p>
                </>
              )}

            </div>
          </div>
          </>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
