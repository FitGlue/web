import React, { useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { formatActivityType, formatDateFull } from '../utils/format';
import { ChartExportTab, buildChartDefs } from './ShowcaseExportChart';
import { RouteExportTab } from './ShowcaseExportRoute';
import { HybridRaceExportTab } from './ShowcaseExportHybridRace';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];
type ActivityRecord = components['schemas']['Record'];

// ─── Shared presets ───────────────────────────────────────────────────────────

export const ACCENTS = [
  { id: 'pink',   color: '#ff3da6' },
  { id: 'cyan',   color: '#22d3ee' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

export const TEXT_SWATCHES = [
  { id: 'white',  color: '#ffffff' },
  { id: 'pink',   color: '#ff3da6' },
  { id: 'cyan',   color: '#22d3ee' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

const CARD_BACKGROUNDS = [
  { id: 'dark',     label: 'Dark',     style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)' },
  { id: 'midnight', label: 'Midnight', style: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)' },
  { id: 'ember',    label: 'Ember',    style: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #0a0a0a 100%)' },
  { id: 'forest',   label: 'Forest',   style: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0d 50%, #0a0a0a 100%)' },
  { id: 'neon',     label: 'Neon',     style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2a 50%, #0a0a0a 100%)' },
  { id: 'clear',    label: 'Clear',    style: 'transparent' },
];

const CARD_SHAPES: Array<{ id: string; label: string; borderRadius: string; widthPct: number; ratio: string | null }> = [
  { id: 'landscape', label: 'Landscape', borderRadius: '0',     widthPct: 88, ratio: '16/7' },
  { id: 'square',    label: 'Square',    borderRadius: '0',     widthPct: 78, ratio: '1'    },
  { id: 'portrait',  label: 'Portrait',  borderRadius: '0',     widthPct: 54, ratio: '2/3'  },
  { id: 'circle',    label: 'Circle',    borderRadius: '50%',   widthPct: 72, ratio: '1'    },
  { id: 'pill',      label: 'Pill',      borderRadius: '999px', widthPct: 90, ratio: null   },
];

const EXPORT_W = 1080;
const PREVIEW_SIZE = 280;

// ─── Stats helpers ────────────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface StatOption { id: string; label: string; value: string }

function buildAllStats(data: ShowcasedActivity): StatOption[] {
  const session = data.activityData?.sessions?.[0];
  const allRecords: ActivityRecord[] = session?.laps?.flatMap((l) => l.records ?? []) ?? [];
  const stats: StatOption[] = [];

  if (session?.totalDistance)
    stats.push({ id: 'distance', label: 'Distance', value: `${(session.totalDistance / 1000).toFixed(2)} km` });
  if (session?.totalElapsedTime)
    stats.push({ id: 'duration', label: 'Duration', value: fmtDuration(session.totalElapsedTime) });

  const speedVals = allRecords.filter((r) => (r.speed ?? 0) > 0).map((r) => r.speed!);
  if (speedVals.length > 0) {
    const avgMs = speedVals.reduce((a, b) => a + b, 0) / speedVals.length;
    const paceSecKm = 1000 / avgMs;
    stats.push({ id: 'avg_pace', label: 'Avg Pace', value: `${Math.floor(paceSecKm / 60)}:${String(Math.round(paceSecKm % 60)).padStart(2, '0')} /km` });
    stats.push({ id: 'avg_speed', label: 'Avg Speed', value: `${(avgMs * 3.6).toFixed(1)} km/h` });
    stats.push({ id: 'max_speed', label: 'Max Speed', value: `${(Math.max(...speedVals) * 3.6).toFixed(1)} km/h` });
  }

  const hrVals = allRecords.filter((r) => (r.heartRate ?? 0) > 0).map((r) => r.heartRate!);
  const avgHr = session?.avgHeartRate ?? (hrVals.length > 0 ? Math.round(hrVals.reduce((a, b) => a + b, 0) / hrVals.length) : null);
  const maxHr = session?.maxHeartRate ?? (hrVals.length > 0 ? Math.max(...hrVals) : null);
  if (avgHr) stats.push({ id: 'avg_hr', label: 'Avg HR', value: `${avgHr} bpm` });
  if (maxHr) stats.push({ id: 'max_hr', label: 'Max HR', value: `${maxHr} bpm` });

  if (hrVals.length > 0 && maxHr) {
    const zones = [
      { id: 'hr_z1', label: 'HR Zone 1', lo: 0, hi: 0.60 },
      { id: 'hr_z2', label: 'HR Zone 2', lo: 0.60, hi: 0.70 },
      { id: 'hr_z3', label: 'HR Zone 3', lo: 0.70, hi: 0.80 },
      { id: 'hr_z4', label: 'HR Zone 4', lo: 0.80, hi: 0.90 },
      { id: 'hr_z5', label: 'HR Zone 5', lo: 0.90, hi: 1.01 },
    ];
    for (const z of zones) {
      const count = hrVals.filter((hr) => { const p = hr / maxHr; return p >= z.lo && p < z.hi; }).length;
      const pct = Math.round((count / hrVals.length) * 100);
      if (pct > 0) stats.push({ id: z.id, label: z.label, value: `${pct}%` });
    }
  }

  const powerVals = allRecords.filter((r) => (r.power ?? 0) > 0).map((r) => r.power!);
  if (powerVals.length > 0) {
    const avg = Math.round(powerVals.reduce((a, b) => a + b, 0) / powerVals.length);
    stats.push({ id: 'avg_power', label: 'Avg Power', value: `${avg}W` });
    stats.push({ id: 'max_power', label: 'Max Power', value: `${Math.max(...powerVals)}W` });
  }

  const cadVals = allRecords.filter((r) => (r.cadence ?? 0) > 0).map((r) => r.cadence!);
  if (cadVals.length > 0) {
    const avg = Math.round(cadVals.reduce((a, b) => a + b, 0) / cadVals.length);
    stats.push({ id: 'avg_cadence', label: 'Avg Cadence', value: `${avg} rpm` });
    stats.push({ id: 'max_cadence', label: 'Max Cadence', value: `${Math.max(...cadVals)} rpm` });
  }

  const altVals = allRecords.filter((r) => r.altitude !== undefined).map((r) => r.altitude!);
  if (altVals.length > 1) {
    let gain = 0;
    for (let i = 1; i < altVals.length; i++) { const d = altVals[i] - altVals[i - 1]; if (d > 0) gain += d; }
    if (gain > 0) stats.push({ id: 'elevation', label: 'Elevation', value: `+${Math.round(gain)}m` });
  }

  const gctVals = allRecords.filter((r) => (r.groundContactTime ?? 0) > 0).map((r) => r.groundContactTime!);
  if (gctVals.length > 0) {
    stats.push({ id: 'gct', label: 'Gnd Contact', value: `${Math.round(gctVals.reduce((a, b) => a + b, 0) / gctVals.length)}ms` });
  }

  const voVals = allRecords.filter((r) => (r.verticalOscillation ?? 0) > 0).map((r) => r.verticalOscillation!);
  if (voVals.length > 0) {
    stats.push({ id: 'vert_osc', label: 'Vert. Osc.', value: `${(voVals.reduce((a, b) => a + b, 0) / voVals.length / 10).toFixed(1)}cm` });
  }

  if (session?.totalCalories)
    stats.push({ id: 'calories', label: 'Calories', value: `${Math.round(session.totalCalories)} kcal` });

  // ── Typed ActivityEnrichments ────────────────────────────────────────────────

  const enrichments = data.enrichments;

  // Effort Score enricher
  if (enrichments?.effort?.score !== undefined) {
    stats.push({ id: 'effort_score', label: 'Effort Score', value: `${Math.round(enrichments.effort.score)}/100` });
    if (enrichments.effort.band) stats.push({ id: 'effort_label', label: 'Effort', value: enrichments.effort.band });
  }

  // Recovery Advisor enricher
  if (enrichments?.recovery?.hoursToRecover !== undefined) {
    const h = enrichments.recovery.hoursToRecover;
    stats.push({ id: 'recovery', label: 'Recovery', value: h >= 24 ? `${(h / 24).toFixed(1)}d` : `${Math.round(h)}h` });
  }
  if (enrichments?.recovery?.acuteChronicRatio !== undefined) {
    const acwr = enrichments.recovery.acuteChronicRatio;
    const label = enrichments.recovery.alertText ?? '';
    stats.push({ id: 'acwr', label: 'ACWR', value: label ? `${acwr.toFixed(2)} · ${label}` : acwr.toFixed(2) });
  }

  // Training Load enricher
  if (enrichments?.trainingLoad?.trimp !== undefined) {
    const zone = enrichments.trainingLoad.bucket ? ` · ${enrichments.trainingLoad.bucket}` : '';
    stats.push({ id: 'trimp', label: 'TRIMP', value: `${Math.round(enrichments.trainingLoad.trimp)}${zone}` });
  }

  // HR Zones enricher (zone minutes breakdown)
  if (enrichments?.heartRateZones?.zones?.length) {
    for (const zone of enrichments.heartRateZones.zones) {
      if ((zone.minutes ?? 0) > 0) {
        const pct = zone.percentage !== undefined ? ` (${Math.round(zone.percentage)}%)` : '';
        stats.push({ id: `zone${zone.zoneIndex}`, label: `HR ${zone.name ?? `Z${zone.zoneIndex}`}`, value: `${zone.minutes}m${pct}` });
      }
    }
  }

  const sets = session?.strengthSets;
  if (sets?.length) {
    stats.push({ id: 'sets', label: 'Sets', value: `${sets.length}` });
    const totalReps = sets.reduce((s, x) => s + (x.reps ?? 0), 0);
    if (totalReps) stats.push({ id: 'reps', label: 'Reps', value: `${totalReps}` });
    const vol = sets.reduce((s, x) => ((x.weightKg ?? 0) > 0 && (x.reps ?? 0) > 0 ? s + x.reps! * x.weightKg! : s), 0);
    if (vol > 0) stats.push({ id: 'volume', label: 'Volume', value: vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}kg` });
  }

  return stats;
}

// ─── Export frame (stats card) ────────────────────────────────────────────────

interface ExportFrameProps {
  data: ShowcasedActivity;
  cardBg: typeof CARD_BACKGROUNDS[number];
  accent: string;
  textColor: string;
  cardShape: typeof CARD_SHAPES[number];
  stats: StatOption[];
  showWatermark: boolean;
}

const ExportFrame = React.forwardRef<HTMLDivElement, ExportFrameProps>(
  ({ data, cardBg, accent, textColor, cardShape, stats, showWatermark }, ref) => {
    const bannerUrl = data.enrichments?.aiBanner?.imageUrl;
    const isClear = cardBg.id === 'clear';

    const cardStyle: React.CSSProperties = isClear ? {
      position: 'relative', zIndex: 1, textAlign: 'center',
      padding: '0 80px',
      width: `${cardShape.widthPct}%`,
    } : {
      position: 'relative', zIndex: 1, textAlign: 'center',
      background: cardBg.style,
      border: `2px solid ${accent}44`,
      borderRadius: cardShape.borderRadius,
      boxSizing: 'border-box',
      padding: '60px 80px',
      width: `${cardShape.widthPct}%`,
      ...(cardShape.ratio ? { aspectRatio: cardShape.ratio } : {}),
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
    const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`,
        background: 'transparent',
        display: 'flex', justifyContent: 'center',
        position: 'relative',
        fontFamily: DISPLAY,
        padding: '80px 0',
      }}>
        <div style={cardStyle}>
          {/* Banner image clipped to card shape via overflow:hidden on parent */}
          {bannerUrl && !isClear && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
          )}

          {/* Activity type badge — hard-edged brutal tag */}
          <div style={{ position: 'relative', zIndex: 1, display: 'inline-block', background: `${accent}18`, border: `2px solid ${accent}`, padding: '8px 28px', color: accent, fontFamily: MONO, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '36px' }}>
            {formatActivityType(data.activityType)}
          </div>

          {/* Title — display font, all-caps */}
          <div style={{ position: 'relative', zIndex: 1, fontFamily: DISPLAY, fontSize: '64px', color: textColor, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-0.01em', textShadow: isClear ? '0 2px 24px rgba(0,0,0,0.9)' : '0 2px 20px rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
            {data.title ?? 'Activity'}
          </div>

          {/* Date — mono, uppercase */}
          {data.startTime && (
            <div style={{ position: 'relative', zIndex: 1, fontFamily: MONO, fontSize: '18px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${textColor}88`, marginBottom: '48px', textShadow: isClear ? '0 1px 12px rgba(0,0,0,0.8)' : undefined }}>
              {formatDateFull(data.startTime)}
            </div>
          )}

          {/* Stats grid — display font values, mono labels */}
          {stats.length > 0 && (
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '44px', flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: '48px', color: accent, lineHeight: 1, textShadow: isClear ? '0 2px 16px rgba(0,0,0,0.9)' : undefined }}>{s.value}</div>
                  <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${textColor}66`, marginTop: '8px', textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Owner — mono, dim */}
          {data.ownerDisplayName && (
            <div style={{ position: 'relative', zIndex: 1, fontFamily: MONO, fontSize: '18px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${textColor}55`, textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined }}>
              {data.ownerDisplayName}
            </div>
          )}

          {/* Watermark — display font, bottom-right */}
          {showWatermark && (
            <div style={{ position: 'absolute', bottom: '20px', right: '28px', fontFamily: DISPLAY, fontSize: '18px', color: 'rgba(245,243,235,0.22)', letterSpacing: '0.04em', zIndex: 2 }}>
              FIT<span style={{ color: accent }}>GLUE</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
ExportFrame.displayName = 'ExportFrame';

// ─── Modal ────────────────────────────────────────────────────────────────────

export type Tab = 'stats' | 'chart' | 'route' | 'race';

interface Props {
  data: ShowcasedActivity;
  onClose: () => void;
  initialTab?: Tab;
}

export const ShowcaseExportModal: React.FC<Props> = ({ data, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'stats');
  const [accent, setAccent] = useState(ACCENTS[0].color);
  const [textColor, setTextColor] = useState('#ffffff');

  // ── Stats tab state ──
  const [cardBg, setCardBg] = useState(CARD_BACKGROUNDS[0]);
  const [cardShape, setCardShape] = useState(CARD_SHAPES[0]);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const allStats = useMemo(() => buildAllStats(data), [data]);
  const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() => allStats.slice(0, 3).map((s) => s.id));
  const selectedStats = useMemo(() => allStats.filter((s) => selectedStatIds.includes(s.id)), [allStats, selectedStatIds]);
  const toggleStat = useCallback((id: string) => {
    setSelectedStatIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]);
  }, []);

  const previewScale = PREVIEW_SIZE / EXPORT_W;

  const handleStatsExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const h = frameRef.current.scrollHeight;
      const dataUrl = await toPng(frameRef.current, { width: EXPORT_W, height: h, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `${(data.title ?? 'activity').replace(/\s+/g, '-').toLowerCase()}-fitglue.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error('Export failed:', err); }
    finally { setExporting(false); }
  }, [data.title]);

  // ── Available tabs ──
  const allRecords = useMemo<ActivityRecord[]>(
    () => data.activityData?.sessions?.[0]?.laps?.flatMap((l) => l.records ?? []) ?? [],
    [data]
  );
  const gpsPoints = useMemo(
    () => allRecords.filter((r) => r.positionLat !== undefined && r.positionLong !== undefined).map((r) => ({ lat: r.positionLat!, lng: r.positionLong! })),
    [allRecords]
  );
  const hasCharts = useMemo(() => buildChartDefs(allRecords).length > 0, [allRecords]);
  const hasRoute = gpsPoints.length > 2;
  const hybridSegments = useMemo(
    () => data.activityData?.hybridRaceSummary?.segments ?? [],
    [data]
  );
  const hasHybridRace = hybridSegments.length > 0;

  return createPortal(
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="export-modal-header">
          <h3 className="export-modal-title">✦ Share Activity</h3>
          <div className="export-modal-tabs">
            <button className={`export-tab${activeTab === 'stats' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
            {hasCharts && <button className={`export-tab${activeTab === 'chart' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('chart')}>Charts</button>}
            {hasRoute && <button className={`export-tab${activeTab === 'route' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('route')}>Route</button>}
            {hasHybridRace && <button className={`export-tab${activeTab === 'race' ? ' export-tab--active' : ''}`} onClick={() => setActiveTab('race')}>Race</button>}
          </div>
          <button className="export-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body — two columns, filled by whichever tab is active */}
        <div className="export-modal-body">

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <>
              <div className="export-modal-preview-col">
                <div className="export-preview-wrapper" style={{
                  width: PREVIEW_SIZE,
                  backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', width: EXPORT_W }}>
                    <ExportFrame ref={frameRef} data={data} cardBg={cardBg} accent={accent} textColor={textColor} cardShape={cardShape} stats={selectedStats} showWatermark={showWatermark} />
                  </div>
                </div>
                <button className="export-download-btn" onClick={handleStatsExport} disabled={exporting}>
                  {exporting ? 'Exporting…' : '⬇ Download PNG'}
                </button>
              </div>

              <div className="export-modal-options-col">
                <div className="export-options">
                  <div className="export-option-group">
                    <span className="export-option-label">Shape</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_SHAPES.map((s) => (
                        <button key={s.id} className={`export-pill${cardShape.id === s.id ? ' export-pill--active' : ''}`} onClick={() => setCardShape(s)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Card</span>
                    <div className="export-option-row export-option-row--wrap">
                      {CARD_BACKGROUNDS.map((b) => (
                        <button key={b.id} className={`export-pill${cardBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setCardBg(b)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Accent</span>
                    <div className="export-option-row">
                      {ACCENTS.map((a) => (
                        <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color }} onClick={() => setAccent(a.color)} aria-label={a.id} />
                      ))}
                    </div>
                  </div>
                  <div className="export-option-group">
                    <span className="export-option-label">Text</span>
                    <div className="export-option-row">
                      {TEXT_SWATCHES.map((a) => (
                        <button
                          key={a.id}
                          className={`export-swatch${textColor === a.color ? ' export-swatch--active' : ''}`}
                          style={{ background: a.color, ...(a.color === '#ffffff' ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' } : {}) }}
                          onClick={() => setTextColor(a.color)}
                          aria-label={a.id}
                        />
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
                    <div className="export-option-row">
                      <button className={`export-pill${showWatermark ? ' export-pill--active' : ''}`} onClick={() => setShowWatermark((v) => !v)}>Watermark</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── CHART TAB ── */}
          {activeTab === 'chart' && (
            <ChartExportTab records={allRecords} accent={accent} onAccentChange={setAccent} textColor={textColor} onTextColorChange={setTextColor} activityTitle={data.title ?? ''} />
          )}

          {/* ── ROUTE TAB ── */}
          {activeTab === 'route' && (
            <RouteExportTab gpsPoints={gpsPoints} accent={accent} onAccentChange={setAccent} />
          )}

          {/* ── RACE TAB ── */}
          {activeTab === 'race' && (
            <HybridRaceExportTab
              segments={hybridSegments}
              activityTitle={data.title ?? 'Race'}
              accent={accent}
              onAccentChange={setAccent}
            />
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
