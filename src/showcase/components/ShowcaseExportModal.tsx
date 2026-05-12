import React, { useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { formatActivityType, formatDateFull } from '../utils/format';
import { ChartExportTab, buildChartDefs } from './ShowcaseExportChart';
import { RouteExportTab } from './ShowcaseExportRoute';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];
type ActivityRecord = components['schemas']['Record'];

// ─── Shared presets ───────────────────────────────────────────────────────────

export const ACCENTS = [
  { id: 'pink',   color: '#FF1B8D' },
  { id: 'cyan',   color: '#4CC9F0' },
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

const IMAGE_BACKGROUNDS = [
  { id: 'dark',        label: 'Dark',        color: '#0a0a0a' as string | null },
  { id: 'transparent', label: 'Transparent', color: null },
];

const CARD_SHAPES = [
  { id: 'landscape', label: 'Landscape', borderRadius: '24px',  widthPct: 88, ratio: '16/7'  },
  { id: 'square',    label: 'Square',    borderRadius: '32px',  widthPct: 78, ratio: '1'     },
  { id: 'portrait',  label: 'Portrait',  borderRadius: '32px',  widthPct: 54, ratio: '2/3'   },
  { id: 'circle',    label: 'Circle',    borderRadius: '50%',   widthPct: 72, ratio: '1'     },
  { id: 'pill',      label: 'Pill',      borderRadius: '999px', widthPct: 90, ratio: '14/5'  },
];

const EXPORT_W = 1080;
const EXPORT_H = 1080;
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

  // ── Enrichment metadata ──────────────────────────────────────────────────────

  const meta = data.enrichmentMetadata ?? {};

  // Effort Score enricher
  if (meta['status'] === 'success' && meta['score']) {
    const score = parseFloat(meta['score']);
    if (!isNaN(score)) {
      stats.push({ id: 'effort_score', label: 'Effort Score', value: `${Math.round(score)}/100` });
      if (meta['label']) stats.push({ id: 'effort_label', label: 'Effort', value: meta['label'] });
    }
  }

  // Recovery Advisor enricher
  if (meta['recovery_hours']) {
    const h = parseFloat(meta['recovery_hours']);
    if (!isNaN(h)) stats.push({ id: 'recovery', label: 'Recovery', value: h >= 24 ? `${(h / 24).toFixed(1)}d` : `${Math.round(h)}h` });
  }
  if (meta['acwr'] && meta['acwr_label']) {
    const acwr = parseFloat(meta['acwr']);
    if (!isNaN(acwr)) stats.push({ id: 'acwr', label: 'ACWR', value: `${acwr.toFixed(2)} · ${meta['acwr_label']}` });
  }
  if (meta['intensity'] && meta['consecutive_hard_days']) {
    const days = parseInt(meta['consecutive_hard_days'], 10);
    if (!isNaN(days) && days >= 2) stats.push({ id: 'hard_days', label: 'Hard Days', value: `${days} streak` });
  }

  // Training Load enricher
  if (meta['trimp']) {
    const trimp = parseFloat(meta['trimp']);
    if (!isNaN(trimp)) {
      const zone = meta['trimp_zone'] ? ` · ${meta['trimp_zone']}` : '';
      stats.push({ id: 'trimp', label: 'TRIMP', value: `${Math.round(trimp)}${zone}` });
    }
  }

  // Personal Records enricher — one stat per individual PR
  if (meta['pr_status'] === 'pr_detected' && meta['pr_count']) {
    const count = parseInt(meta['pr_count'], 10);
    for (let i = 0; i < count; i++) {
      const label = meta[`pr_${i}_label`];
      const value = meta[`pr_${i}_value`];
      if (label && value) stats.push({ id: `pr_${i}`, label: `🏆 ${label}`, value });
    }
  }

  // HR Zones enricher (zone minutes breakdown)
  const zoneTotalMin = parseFloat(meta['total_duration'] ?? '0');
  if (zoneTotalMin > 0) {
    const zoneLabels = ['Rest', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
    for (let z = 1; z <= 5; z++) {
      const min = parseInt(meta[`zone${z}_minutes`] ?? '0', 10);
      if (min > 0) {
        const pct = Math.round((min / zoneTotalMin) * 100);
        stats.push({ id: `zone${z}`, label: `HR ${zoneLabels[z]}`, value: `${min}m (${pct}%)` });
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
  imageBgColor: string | null;
  accent: string;
  cardShape: typeof CARD_SHAPES[number];
  stats: StatOption[];
}

const ExportFrame = React.forwardRef<HTMLDivElement, ExportFrameProps>(
  ({ data, cardBg, imageBgColor, accent, cardShape, stats }, ref) => {
    const bannerUrl = data.enrichmentMetadata?.['asset_route_thumbnail'] ?? data.enrichmentMetadata?.['asset_ai_banner'];
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
      aspectRatio: cardShape.ratio,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div ref={ref} style={{
        width: `${EXPORT_W}px`, height: `${EXPORT_H}px`,
        background: imageBgColor ?? 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter','Helvetica Neue',sans-serif",
      }}>
        <div style={cardStyle}>
          {/* Banner image clipped to card shape via overflow:hidden on parent */}
          {bannerUrl && !isClear && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
          )}

          <div style={{ position: 'relative', zIndex: 1, display: 'inline-block', background: `${accent}22`, border: `1px solid ${accent}88`, borderRadius: '999px', padding: '10px 32px', color: accent, fontSize: '24px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '32px' }}>
            {formatActivityType(data.activityType)}
          </div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '24px', textShadow: isClear ? '0 2px 24px rgba(0,0,0,0.8)' : '0 2px 20px rgba(0,0,0,0.5)' }}>
            {data.title ?? 'Activity'}
          </div>
          {data.startTime && (
            <div style={{ position: 'relative', zIndex: 1, fontSize: '22px', color: 'rgba(255,255,255,0.65)', marginBottom: '40px', textShadow: isClear ? '0 1px 12px rgba(0,0,0,0.8)' : undefined }}>
              {formatDateFull(data.startTime)}
            </div>
          )}
          {stats.length > 0 && (
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: isClear ? '0 2px 16px rgba(0,0,0,0.9)' : undefined }}>{s.value}</div>
                  <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {data.ownerDisplayName && (
            <div style={{ position: 'relative', zIndex: 1, fontSize: '22px', color: 'rgba(255,255,255,0.45)', textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined }}>
              {data.ownerDisplayName}
            </div>
          )}
        </div>

        {!isClear && (
          <div style={{ position: 'absolute', bottom: '32px', right: '48px', fontSize: '22px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Fit<span style={{ color: accent }}>Glue</span>
          </div>
        )}
      </div>
    );
  }
);
ExportFrame.displayName = 'ExportFrame';

// ─── Modal ────────────────────────────────────────────────────────────────────

type Tab = 'stats' | 'chart' | 'route';

interface Props {
  data: ShowcasedActivity;
  onClose: () => void;
}

export const ShowcaseExportModal: React.FC<Props> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [accent, setAccent] = useState(ACCENTS[0].color);

  // ── Stats tab state ──
  const [imageBg, setImageBg] = useState(IMAGE_BACKGROUNDS[0]);
  const [cardBg, setCardBg] = useState(CARD_BACKGROUNDS[0]);
  const [cardShape, setCardShape] = useState(CARD_SHAPES[0]);
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
      const dataUrl = await toPng(frameRef.current, { width: EXPORT_W, height: EXPORT_H, pixelRatio: 1, backgroundColor: imageBg.color ?? undefined });
      const link = document.createElement('a');
      link.download = `${(data.title ?? 'activity').replace(/\s+/g, '-').toLowerCase()}-fitglue.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error('Export failed:', err); }
    finally { setExporting(false); }
  }, [data.title, imageBg.color]);

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
                  width: PREVIEW_SIZE, height: PREVIEW_SIZE,
                  background: imageBg.color ?? undefined,
                  backgroundImage: imageBg.color ? undefined : 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', width: EXPORT_W, height: EXPORT_H }}>
                    <ExportFrame ref={frameRef} data={data} cardBg={cardBg} imageBgColor={imageBg.color} accent={accent} cardShape={cardShape} stats={selectedStats} />
                  </div>
                </div>
                <button className="export-download-btn" onClick={handleStatsExport} disabled={exporting}>
                  {exporting ? 'Exporting…' : '⬇ Download PNG'}
                </button>
              </div>

              <div className="export-modal-options-col">
                <div className="export-options">
                  <div className="export-option-group">
                    <span className="export-option-label">Image</span>
                    <div className="export-option-row">
                      {IMAGE_BACKGROUNDS.map((b) => (
                        <button key={b.id} className={`export-pill${imageBg.id === b.id ? ' export-pill--active' : ''}`} onClick={() => setImageBg(b)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
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
                </div>
              </div>
            </>
          )}

          {/* ── CHART TAB ── */}
          {activeTab === 'chart' && (
            <ChartExportTab records={allRecords} accent={accent} onAccentChange={setAccent} activityTitle={data.title ?? ''} />
          )}

          {/* ── ROUTE TAB ── */}
          {activeTab === 'route' && (
            <RouteExportTab gpsPoints={gpsPoints} accent={accent} onAccentChange={setAccent} />
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
