import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { logger } from '../../shared/logger';
import { saveImage } from '../utils/exportImage';
import type { components } from '../../shared/api/schema-public';
import { formatActivityType, formatSource } from '../utils/format';
import { ACCENTS, accentSwatchStyle, TEXT_SWATCHES, textSwatchStyle } from './ShowcaseExportModal';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

type RoundupExportTab = 'overview' | 'prs' | 'story';

const EXPORT_W = 1080;
const PREVIEW_SIZE = 280;

const CARD_BACKGROUNDS = [
  { id: 'aurora',    label: 'Aurora',    style: 'linear-gradient(135deg, #ff3da6 0%, #8b5cf6 50%, #22d3ee 100%)' },
  { id: 'dark',      label: 'Dark',      style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)' },
  { id: 'midnight',  label: 'Midnight',  style: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)' },
  { id: 'ember',     label: 'Ember',     style: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #0a0a0a 100%)' },
  { id: 'forest',    label: 'Forest',    style: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0d 50%, #0a0a0a 100%)' },
];

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

function periodTitle(periodKey: string): string {
  if (periodKey.startsWith('week-')) return 'WEEKLY ROUNDUP';
  if (periodKey.startsWith('month-')) return 'MONTHLY ROUNDUP';
  if (periodKey.startsWith('year-')) return 'YEAR IN REVIEW';
  return 'TRAINING ROUNDUP';
}

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ─── Overview export frame ────────────────────────────────────────────────────

interface OverviewFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  cardBg: typeof CARD_BACKGROUNDS[number];
  accent: string;
  textColor: string;
  showWatermark: boolean;
}

const OverviewFrame = React.forwardRef<HTMLDivElement, OverviewFrameProps>(
  ({ roundup, periodKey, cardBg, accent, textColor, showWatermark }, ref) => {
    const isAurora = cardBg.id === 'aurora';
    const resolvedText = isAurora ? '#070710' : textColor;
    const resolvedAccent = isAurora ? '#070710' : accent;

    const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
    const hasStrength = roundup.activityTypeBreakdowns?.some(bd => (bd.totalSets ?? 0) > 0) ?? false;
    const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;
    const hasElevation = (roundup.totalElevationGainMeters ?? 0) > 50;

    const stats: Array<{ val: string; lbl: string }> = [
      { val: String(roundup.totalActivities ?? 0), lbl: roundup.totalActivities === 1 ? 'Session' : 'Sessions' },
    ];
    if ((roundup.totalDurationSeconds ?? 0) > 0) {
      stats.push({ val: fmtDuration(roundup.totalDurationSeconds!), lbl: 'Total Time' });
    }
    if (hasDistance) {
      const km = (roundup.totalDistanceMeters ?? 0) / 1000;
      stats.push({ val: `${km >= 10 ? km.toFixed(1) : km.toFixed(2)} km`, lbl: 'Distance' });
    } else if (hasStrength && totalWeightKg > 0) {
      const t = totalWeightKg / 1000;
      stats.push({ val: t >= 1 ? `${t.toFixed(1)}t` : `${Math.round(totalWeightKg)}kg`, lbl: 'Weight Moved' });
    }
    if (hasElevation) {
      stats.push({ val: `+${Math.round(roundup.totalElevationGainMeters!)}m`, lbl: 'Elevation' });
    } else if ((roundup.totalCaloriesKcal ?? 0) > 0) {
      stats.push({ val: `${roundup.totalCaloriesKcal!.toLocaleString()} kcal`, lbl: 'Calories' });
    }
    const display4 = stats.slice(0, 4);

    const sources = roundup.sources?.map(s => formatSource(s)).join(' · ') ?? '';

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        aspectRatio: '1',
        background: cardBg.style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        boxSizing: 'border-box',
        fontFamily: DISPLAY,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grain overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Type badge */}
        <div style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: resolvedAccent, opacity: 0.8, marginBottom: '16px' }}>
          {periodTitle(periodKey)}
        </div>

        {/* Period title */}
        <div style={{ fontFamily: DISPLAY, fontSize: '96px', color: resolvedText, lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>
          {periodLabel(periodKey)}
        </div>

        {/* Owner */}
        {roundup.ownerDisplayName && (
          <div style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedText, opacity: 0.6, marginBottom: '64px' }}>
            {roundup.ownerDisplayName}
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '80px', height: '3px', background: resolvedAccent, opacity: 0.5, marginBottom: '64px' }} />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '64px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {display4.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: DISPLAY, fontSize: '56px', color: resolvedAccent, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedText, opacity: 0.55, marginTop: '8px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Sources */}
        {sources && (
          <div style={{ position: 'absolute', bottom: '32px', fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: resolvedText, opacity: 0.35 }}>
            {sources}
          </div>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div style={{ position: 'absolute', bottom: '20px', right: '32px', fontFamily: DISPLAY, fontSize: '20px', color: isAurora ? 'rgba(7,7,16,0.25)' : 'rgba(245,243,235,0.2)', letterSpacing: '0.04em' }}>
            FIT<span style={{ color: isAurora ? '#070710' : accent }}>GLUE</span>
          </div>
        )}
      </div>
    );
  }
);
OverviewFrame.displayName = 'OverviewFrame';

// ─── PR Wall export frame ─────────────────────────────────────────────────────

interface PRWallFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  accent: string;
  showWatermark: boolean;
}

const PRWallFrame = React.forwardRef<HTMLDivElement, PRWallFrameProps>(
  ({ roundup, periodKey, accent, showWatermark }, ref) => {
    const prs = roundup.prsAchieved ?? [];
    const display = prs.slice(0, 9);

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

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        aspectRatio: '1',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)',
        padding: '72px',
        boxSizing: 'border-box',
        fontFamily: DISPLAY,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>
          🏆 {periodTitle(periodKey)} · {prs.length} PRS
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: '56px', color: '#f5f3eb', lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: '48px' }}>
          {periodLabel(periodKey)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {display.map((pr, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)`,
              border: `1px solid ${accent}33`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, opacity: 0.8 }}>
                {(pr.recordType ?? '').replace(/_/g, ' ')}
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: '36px', color: '#f5f3eb', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {fmtVal(pr)}
                </div>
                {pr.previousValue != null && pr.value != null && (
                  <div style={{ fontFamily: MONO, fontSize: '13px', color: accent, marginTop: '4px', opacity: 0.7 }}>
                    {pr.unit === 'kg'
                      ? `+${Math.round(pr.value - pr.previousValue)}kg`
                      : `−${Math.round(pr.previousValue - pr.value)}s`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {prs.length > 9 && (
          <div style={{ fontFamily: MONO, fontSize: '16px', color: 'rgba(245,243,235,0.4)', marginTop: '16px', letterSpacing: '0.1em' }}>
            + {prs.length - 9} more
          </div>
        )}

        {showWatermark && (
          <div style={{ position: 'absolute', bottom: '20px', right: '32px', fontFamily: DISPLAY, fontSize: '20px', color: 'rgba(245,243,235,0.18)', letterSpacing: '0.04em' }}>
            FIT<span style={{ color: accent }}>GLUE</span>
          </div>
        )}
      </div>
    );
  }
);
PRWallFrame.displayName = 'PRWallFrame';

// ─── Story export frame (portrait) ───────────────────────────────────────────

interface StoryFrameProps {
  roundup: ShowcaseRoundup;
  periodKey: string;
  accent: string;
  textColor: string;
  showWatermark: boolean;
}

const StoryFrame = React.forwardRef<HTMLDivElement, StoryFrameProps>(
  ({ roundup, periodKey, accent, textColor, showWatermark }, ref) => {
    const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
    const hasStrength = roundup.activityTypeBreakdowns?.some(bd => (bd.totalSets ?? 0) > 0) ?? false;
    const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;

    const topStats: Array<{ val: string; lbl: string }> = [
      { val: String(roundup.totalActivities ?? 0), lbl: 'Sessions' },
    ];
    if ((roundup.totalDurationSeconds ?? 0) > 0) {
      topStats.push({ val: fmtDuration(roundup.totalDurationSeconds!), lbl: 'Total Time' });
    }
    if (hasDistance) {
      const km = (roundup.totalDistanceMeters ?? 0) / 1000;
      topStats.push({ val: `${km >= 10 ? km.toFixed(1) : km.toFixed(2)}km`, lbl: 'Distance' });
    } else if (hasStrength && totalWeightKg > 0) {
      const t = totalWeightKg / 1000;
      topStats.push({ val: t >= 1 ? `${t.toFixed(1)}t` : `${Math.round(totalWeightKg)}kg`, lbl: 'Weight Moved' });
    }
    if ((roundup.totalCaloriesKcal ?? 0) > 0) {
      topStats.push({ val: roundup.totalCaloriesKcal!.toLocaleString(), lbl: 'Calories' });
    }

    const sportLines = (roundup.activityTypeBreakdowns ?? []).slice(0, 5).map(bd =>
      `${formatActivityType(bd.activityType)} · ${bd.activityCount} ${bd.activityCount === 1 ? 'session' : 'sessions'}`
    );

    const zones = roundup.hrZoneMinutes ?? [];
    const totalZone = zones.reduce((s, m) => s + (m ?? 0), 0);
    const ZONE_COLORS_EX = ['#334155', '#22d3ee', '#a3ff3d', '#ffd60a', '#ff3da6', '#ff0000'];

    const prCount = roundup.prsAchieved?.length ?? 0;

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        aspectRatio: '9/16',
        background: `linear-gradient(180deg, ${accent}22 0%, #070710 35%, #070710 100%)`,
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 72px',
        boxSizing: 'border-box',
        fontFamily: DISPLAY,
        position: 'relative',
        overflow: 'hidden',
        gap: '0',
      }}>
        {/* Grain */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Top: avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '60px' }}>
          {roundup.ownerProfilePictureUrl && (
            <img src={roundup.ownerProfilePictureUrl} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', border: `3px solid ${accent}`, objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent, opacity: 0.8 }}>
              {periodTitle(periodKey)}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: '28px', color: textColor, letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {roundup.ownerDisplayName}
            </div>
          </div>
        </div>

        {/* Period title */}
        <div style={{ fontFamily: DISPLAY, fontSize: '88px', color: textColor, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '48px' }}>
          {periodLabel(periodKey)}
        </div>

        {/* Top stats */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '56px', flexWrap: 'wrap' }}>
          {topStats.slice(0, 3).map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: DISPLAY, fontSize: '48px', color: accent, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: textColor, opacity: 0.5, marginTop: '4px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: `${textColor}22`, marginBottom: '48px' }} />

        {/* Sport lines */}
        {sportLines.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {sportLines.map((l, i) => (
              <div key={i} style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: textColor, opacity: 0.75 }}>{l}</div>
            ))}
          </div>
        )}

        {/* HR zones mini bar */}
        {totalZone > 30 && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: textColor, opacity: 0.4, marginBottom: '10px' }}>
              HR ZONES
            </div>
            <div style={{ display: 'flex', height: '12px', gap: '2px', overflow: 'hidden' }}>
              {zones.map((mins, i) => {
                const pct = (mins / totalZone) * 100;
                if (pct < 0.5) return null;
                return <div key={i} style={{ flex: `0 0 ${pct.toFixed(1)}%`, background: ZONE_COLORS_EX[i] ?? '#ff0000' }} />;
              })}
            </div>
          </div>
        )}

        {/* PRs callout */}
        {prCount > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: '40px', fontFamily: DISPLAY, fontSize: '36px', color: accent, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
            🏆 {prCount} NEW {prCount === 1 ? 'PR' : 'PRS'}
          </div>
        )}

        {showWatermark && (
          <div style={{ position: 'absolute', bottom: '28px', right: '40px', fontFamily: DISPLAY, fontSize: '22px', color: 'rgba(245,243,235,0.2)', letterSpacing: '0.04em' }}>
            FIT<span style={{ color: accent }}>GLUE</span>
          </div>
        )}
      </div>
    );
  }
);
StoryFrame.displayName = 'StoryFrame';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  roundup: ShowcaseRoundup;
  periodKey: string;
  onClose: () => void;
}

export const ShowcaseRoundupExportModal: React.FC<Props> = ({ roundup, periodKey, onClose }) => {
  const hasPRs = (roundup.prsAchieved?.length ?? 0) > 0;
  const [activeTab, setActiveTab] = useState<RoundupExportTab>('overview');
  const [accent, setAccent] = useState(ACCENTS[0].color);
  const [textColor, setTextColor] = useState('#ffffff');
  const [cardBg, setCardBg] = useState(CARD_BACKGROUNDS[0]);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [previewH, setPreviewH] = useState(PREVIEW_SIZE);

  const overviewRef = useRef<HTMLDivElement>(null);
  const prRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const activeRef = activeTab === 'overview' ? overviewRef : activeTab === 'prs' ? prRef : storyRef;
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
      await saveImage(dataUrl, `roundup-${label}-fitglue.png`);
    } catch (err) { logger.error('Export failed:', err); }
    finally { setExporting(false); }
  }, [activeRef, periodKey]);

  return createPortal(
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>

        <div className="export-modal-header">
          <h3 className="export-modal-title">✦ Share Roundup</h3>
          <div className="export-modal-tabs">
            <button className={`export-tab${activeTab === 'overview' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            {hasPRs && <button className={`export-tab${activeTab === 'prs' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('prs')}>PRs ★</button>}
            <button className={`export-tab${activeTab === 'story' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('story')}>Story</button>
          </div>
          <button className="export-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="export-modal-body">
          <div className="export-modal-preview-col">
            <div className="export-preview-wrapper" style={{
              width: PREVIEW_SIZE,
              height: previewH,
              backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', width: EXPORT_W }}>
                {activeTab === 'overview' && (
                  <OverviewFrame ref={overviewRef} roundup={roundup} periodKey={periodKey} cardBg={cardBg} accent={accent} textColor={textColor} showWatermark={showWatermark} />
                )}
                {activeTab === 'prs' && (
                  <PRWallFrame ref={prRef} roundup={roundup} periodKey={periodKey} accent={accent} showWatermark={showWatermark} />
                )}
                {activeTab === 'story' && (
                  <StoryFrame ref={storyRef} roundup={roundup} periodKey={periodKey} accent={accent} textColor={textColor} showWatermark={showWatermark} />
                )}
              </div>
            </div>
            <button className="export-download-btn" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : '⬇ Download PNG'}
            </button>
          </div>

          <div className="export-modal-options-col">
            <div className="export-options">

              {activeTab === 'overview' && (
                <div className="export-option-group">
                  <span className="export-option-label">Card</span>
                  <div className="export-option-row export-option-row--wrap">
                    {CARD_BACKGROUNDS.map((b) => (
                      <button key={b.id} className={`export-pill${cardBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setCardBg(b)}>{b.label}</button>
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

              {activeTab !== 'prs' && (
                <div className="export-option-group">
                  <span className="export-option-label">Text</span>
                  <div className="export-option-row">
                    {TEXT_SWATCHES.map((a) => (
                      <button key={a.id} className={`export-swatch${textColor === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...textSwatchStyle(a.color) }} onClick={() => setTextColor(a.color)} aria-label={a.id} />
                    ))}
                  </div>
                </div>
              )}

              <div className="export-option-group">
                <span className="export-option-label">Include</span>
                <div className="export-option-row export-option-row--wrap">
                  <button className={`export-pill${showWatermark ? ' export-pill--active' : ''}`} onClick={() => setShowWatermark((v) => !v)}>Watermark</button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
