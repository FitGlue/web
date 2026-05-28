import React, { useRef, useState, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { ACCENTS, TEXT_SWATCHES, accentSwatchStyle, textSwatchStyle } from './ShowcaseExportModal';

type ActivityRecord = components['schemas']['Record'];

// ─── Chart data building ───────────────────────────────────────────────────────

interface ChartData { labels: string[]; values: number[] }

function buildTimeLabels(records: ActivityRecord[]): string[] {
  if (records.length === 0 || !records[0].timestamp) return records.map((_, i) => `${i}`);
  const first = new Date(records[0].timestamp).getTime();
  return records.map((r) => {
    const elapsed = r.timestamp ? (new Date(r.timestamp).getTime() - first) / 1000 : 0;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    return h > 0 ? `${h}h${m}m` : `${m}m`;
  });
}

interface ChartDef {
  id: string;
  label: string;
  emoji: string;
  defaultColor: string;
  unit: string;
  data: ChartData;
}

export function buildChartDefs(records: ActivityRecord[]): ChartDef[] {
  const defs: ChartDef[] = [];

  const hrRecords = records.filter((r) => (r.heartRate ?? 0) > 0);
  if (hrRecords.length > 0) {
    defs.push({ id: 'hr', label: 'Heart Rate', emoji: '❤️', defaultColor: '#EF4444', unit: 'bpm',
      data: { labels: buildTimeLabels(hrRecords), values: hrRecords.map((r) => r.heartRate!) } });
  }

  const altRecords = records.filter((r) => r.altitude !== undefined);
  if (altRecords.length > 0) {
    defs.push({ id: 'elevation', label: 'Elevation', emoji: '⛰️', defaultColor: '#10B981', unit: 'm',
      data: { labels: buildTimeLabels(altRecords), values: altRecords.map((r) => r.altitude!) } });
  }

  const speedRecords = records.filter((r) => (r.speed ?? 0) > 0);
  if (speedRecords.length > 0) {
    defs.push({ id: 'pace', label: 'Pace', emoji: '🏃', defaultColor: '#6366F1', unit: 'min/km',
      data: { labels: buildTimeLabels(speedRecords),
        values: speedRecords.map((r) => parseFloat((1000 / r.speed! / 60).toFixed(2))) } });
    defs.push({ id: 'speed', label: 'Speed', emoji: '🚀', defaultColor: '#06B6D4', unit: 'km/h',
      data: { labels: buildTimeLabels(speedRecords),
        values: speedRecords.map((r) => parseFloat((r.speed! * 3.6).toFixed(2))) } });
  }

  const powerRecords = records.filter((r) => (r.power ?? 0) > 0);
  if (powerRecords.length > 0) {
    defs.push({ id: 'power', label: 'Power', emoji: '⚡', defaultColor: '#F59E0B', unit: 'W',
      data: { labels: buildTimeLabels(powerRecords), values: powerRecords.map((r) => r.power!) } });
  }

  const cadRecords = records.filter((r) => (r.cadence ?? 0) > 0);
  if (cadRecords.length > 0) {
    defs.push({ id: 'cadence', label: 'Cadence', emoji: '🦶', defaultColor: '#8B5CF6', unit: 'rpm',
      data: { labels: buildTimeLabels(cadRecords), values: cadRecords.map((r) => r.cadence!) } });
  }

  return defs;
}

// ─── SVG Sparkline ────────────────────────────────────────────────────────────

function downsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

const AXIS_LEFT   = 88;
const AXIS_BOTTOM = 48;
const PLOT_PAD_T  = 16;
const PLOT_PAD_R  = 16;

interface SparklineProps {
  data: ChartData;
  color: string;
  showAxes: boolean;
  chartId: string;
  width: number;
  height: number;
}

function ExportSparkline({ data, color, showAxes, chartId, width, height }: SparklineProps) {
  const values = data.values;
  const labels = data.labels;
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const plotX = showAxes ? AXIS_LEFT : 0;
  const plotY = PLOT_PAD_T;
  const plotW = width - plotX - PLOT_PAD_R;
  const plotH = height - plotY - (showAxes ? AXIS_BOTTOM : PLOT_PAD_T);

  const ds       = downsample(values, 300);
  const dsLabels = downsample(labels, 300);

  const pts = ds.map((v, i) => {
    const x = plotX + (i / (ds.length - 1)) * plotW;
    const y = plotY + plotH - ((v - min) / range) * plotH;
    return { x: +x.toFixed(1), y: +y.toFixed(1) };
  });

  const linePath = `M ${pts.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${plotY + plotH} L ${plotX},${plotY + plotH} Z`;

  const lineGrad = `spark-line-${chartId}`;
  const fillGrad = `spark-fill-${chartId}`;

  const X_TICKS = 6;
  const xTickIndices = Array.from({ length: X_TICKS }, (_, i) => Math.round(i * (ds.length - 1) / (X_TICKS - 1)));
  const Y_TICKS = 4;
  const yTicks = Array.from({ length: Y_TICKS }, (_, i) => min + (range * i) / (Y_TICKS - 1));

  const MONO = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={lineGrad} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor={color} stopOpacity="0.65" />
          <stop offset="50%"  stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={fillGrad} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {showAxes && yTicks.map((v, i) => {
        const y = +(plotY + plotH - ((v - min) / range) * plotH).toFixed(1);
        const label = v % 1 === 0 ? `${Math.round(v)}` : v.toFixed(1);
        return (
          <g key={i}>
            <line x1={plotX} y1={y} x2={plotX + plotW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={plotX - 12} y={y + 5} textAnchor="end" fill="rgba(255,255,255,0.45)"
              fontSize="14" fontFamily={MONO}>{label}</text>
          </g>
        );
      })}

      {showAxes && xTickIndices.map((idx, i) => {
        const p = pts[idx];
        const label = dsLabels[idx] ?? '';
        return (
          <g key={i}>
            <line x1={p.x} y1={plotY} x2={p.x} y2={plotY + plotH} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={p.x} y={plotY + plotH + 30} textAnchor="middle" fill="rgba(255,255,255,0.45)"
              fontSize="14" fontFamily={MONO}>{label}</text>
          </g>
        );
      })}

      <path d={areaPath} fill={`url(#${fillGrad})`} />
      <path d={linePath} stroke={`url(#${lineGrad})`} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_W     = 1200;
const CHART_H     = 400;
const CHART_PAD   = 60;
const PREVIEW_SCALE = 0.233;

const BG_OPTIONS = [
  { id: 'dark',        label: 'Dark',        color: '#0a0a0a' as string | null },
  { id: 'transparent', label: 'Transparent', color: null },
];

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  records: ActivityRecord[];
  accent: string;
  onAccentChange: (c: string) => void;
  textColor: string;
  onTextColorChange: (c: string) => void;
  activityTitle: string;
}

export const ChartExportTab: React.FC<Props> = ({
  records, accent, onAccentChange, textColor, onTextColorChange, activityTitle,
}) => {
  const chartDefs = useMemo(() => buildChartDefs(records), [records]);

  const [selectedId,    setSelectedId]    = useState(() => chartDefs[0]?.id ?? '');
  const [showAxes,      setShowAxes]      = useState(true);
  const [showTitle,     setShowTitle]     = useState(true);
  const [showStats,     setShowStats]     = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [bgId,          setBgId]          = useState('dark');
  const [exporting,     setExporting]     = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);

  const selectedChart = chartDefs.find((c) => c.id === selectedId) ?? chartDefs[0];
  const selectedBg    = BG_OPTIONS.find((b) => b.id === bgId)!;

  const statsSummary = useMemo(() => {
    if (!selectedChart || selectedChart.data.values.length === 0) return null;
    const vals = selectedChart.data.values;
    const min = Math.min(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const fmt = (v: number) => (v % 1 === 0 ? `${v}` : v.toFixed(1));
    return { min: fmt(min), avg: fmt(avg), max: fmt(max), unit: selectedChart.unit };
  }, [selectedChart]);

  const handleExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const h = frameRef.current.scrollHeight;
      const dataUrl = await toPng(frameRef.current, {
        width: CHART_W,
        height: h,
        pixelRatio: 1,
        backgroundColor: selectedBg.color ?? undefined,
      });
      const link = document.createElement('a');
      link.download = `${(activityTitle || 'activity').replace(/\s+/g, '-').toLowerCase()}-${selectedId}-fitglue.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Chart export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [activityTitle, selectedId, selectedBg.color]);

  if (chartDefs.length === 0) {
    return (
      <>
        <div className="export-modal-preview-col">
          <div className="export-empty-state">No chart data available for this activity.</div>
        </div>
        <div className="export-modal-options-col" />
      </>
    );
  }

  const previewW  = Math.round(CHART_W * PREVIEW_SCALE);
  const previewH  = 210;
  const checkerBg = 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px';

  return (
    <>
      {/* ── Left: preview + download ── */}
      <div className="export-modal-preview-col">
        <div
          className="export-preview-wrapper"
          style={{
            width: previewW,
            height: previewH,
            background: selectedBg.color ?? undefined,
            backgroundImage: selectedBg.color ? undefined : checkerBg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: CHART_W }}>
            <div ref={frameRef} style={{ width: CHART_W, background: selectedBg.color ?? 'transparent', fontFamily: DISPLAY }}>
              <div style={{ padding: `48px ${CHART_PAD}px ${showTitle ? 28 : 0}px` }}>
                {showTitle && (
                  <div style={{ fontFamily: DISPLAY, fontSize: 40, color: textColor, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                    {selectedChart?.emoji} {selectedChart?.label}
                  </div>
                )}
              </div>
              <ExportSparkline
                data={selectedChart.data}
                color={accent}
                showAxes={showAxes}
                chartId={selectedChart.id}
                width={CHART_W}
                height={CHART_H}
              />
              <div style={{ display: 'flex', alignItems: 'flex-end', padding: `32px ${CHART_PAD}px 52px`, gap: 60 }}>
                {showStats && statsSummary && (
                  <>
                    {([['Min', statsSummary.min], ['Avg', statsSummary.avg], ['Max', statsSummary.max]] as [string, string][]).map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontFamily: DISPLAY, fontSize: 40, color: accent, lineHeight: 1 }}>
                          {val} <span style={{ fontFamily: MONO, fontSize: 20, color: `${textColor}59`, fontWeight: 600 }}>{statsSummary.unit}</span>
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${textColor}55`, marginTop: 8 }}>{label}</div>
                      </div>
                    ))}
                  </>
                )}
                {showWatermark && (
                  <div style={{ marginLeft: 'auto', fontFamily: DISPLAY, fontSize: 24, color: 'rgba(245,243,235,0.18)', letterSpacing: '0.04em' }}>
                    FIT<span style={{ color: accent }}>GLUE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button className="export-download-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : '⬇ Download PNG'}
        </button>
      </div>

      {/* ── Right: options ── */}
      <div className="export-modal-options-col">
        <div className="export-options">

          <div className="export-option-group">
            <span className="export-option-label">Chart</span>
            <div className="export-option-row export-option-row--wrap">
              {chartDefs.map((c) => (
                <button key={c.id} className={`export-pill${selectedId === c.id ? ' export-pill--active' : ''}`} onClick={() => setSelectedId(c.id)}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Background</span>
            <div className="export-option-row">
              {BG_OPTIONS.map((b) => (
                <button key={b.id} className={`export-pill${bgId === b.id ? ' export-pill--active' : ''}`} onClick={() => setBgId(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Accent</span>
            <div className="export-option-row">
              {ACCENTS.map((a) => (
                <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => onAccentChange(a.color)} aria-label={a.id} />
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
                  style={{ background: a.color, ...textSwatchStyle(a.color) }}
                  onClick={() => onTextColorChange(a.color)}
                  aria-label={a.id}
                />
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Include</span>
            <div className="export-option-row export-option-row--wrap">
              <button className={`export-pill${showAxes ? ' export-pill--active' : ''}`} onClick={() => setShowAxes((v) => !v)}>Axes</button>
              <button className={`export-pill${showTitle ? ' export-pill--active' : ''}`} onClick={() => setShowTitle((v) => !v)}>Title</button>
              <button className={`export-pill${showStats ? ' export-pill--active' : ''}`} onClick={() => setShowStats((v) => !v)}>Min / Avg / Max</button>
              <button className={`export-pill${showWatermark ? ' export-pill--active' : ''}`} onClick={() => setShowWatermark((v) => !v)}>Watermark</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
