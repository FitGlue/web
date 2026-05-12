import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';

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

// ─── Chart.js config ──────────────────────────────────────────────────────────

function buildChartConfig(data: ChartData, color: string, showAxes: boolean) {
  return {
    type: 'line' as const,
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        borderColor: color,
        backgroundColor: `${color}28`,
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      responsive: false,
      animation: false as const,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          display: showAxes,
          ticks: { maxTicksLimit: 10, color: 'rgba(255,255,255,0.45)', font: { size: 14 } },
          grid: { color: 'rgba(255,255,255,0.07)' },
        },
        y: {
          display: showAxes,
          ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 14 } },
          grid: { color: 'rgba(255,255,255,0.07)' },
        },
      },
    },
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_W = 1200;      // total export width
const CHART_H = 400;       // chart canvas height
const CHART_PAD = 60;      // horizontal padding for header/footer rows
const PREVIEW_SCALE = 0.233; // ≈ 280 / 1200

const BG_OPTIONS = [
  { id: 'dark',        label: 'Dark',        color: '#0a0a0a' as string | null },
  { id: 'transparent', label: 'Transparent', color: null },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  records: ActivityRecord[];
  accent: string;
  onAccentChange: (c: string) => void;
  activityTitle: string;
}

const ACCENTS = [
  { id: 'pink',   color: '#FF1B8D' },
  { id: 'cyan',   color: '#4CC9F0' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

export const ChartExportTab: React.FC<Props> = ({ records, accent, onAccentChange, activityTitle }) => {
  const chartDefs = useMemo(() => buildChartDefs(records), [records]);

  const [selectedId, setSelectedId] = useState(() => chartDefs[0]?.id ?? '');
  const [useAccentColor, setUseAccentColor] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [bgId, setBgId] = useState('dark');
  const [exporting, setExporting] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<{ destroy: () => void } | null>(null);

  const selectedChart = chartDefs.find((c) => c.id === selectedId) ?? chartDefs[0];
  const chartColor = useAccentColor ? accent : (selectedChart?.defaultColor ?? accent);
  const selectedBg = BG_OPTIONS.find((b) => b.id === bgId)!;

  const statsSummary = useMemo(() => {
    if (!selectedChart || selectedChart.data.values.length === 0) return null;
    const vals = selectedChart.data.values;
    const min = Math.min(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const fmt = (v: number) => (v % 1 === 0 ? `${v}` : v.toFixed(1));
    return { min: fmt(min), avg: fmt(avg), max: fmt(max), unit: selectedChart.unit };
  }, [selectedChart]);

  // Rebuild chart when anything relevant changes
  useEffect(() => {
    if (!canvasRef.current || !selectedChart || selectedChart.data.values.length === 0) return;

    const canvas = canvasRef.current;
    canvas.width = CHART_W;
    canvas.height = CHART_H;

    let destroyed = false;
    import('chart.js/auto').then((mod) => {
      if (destroyed || !canvasRef.current) return;
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chartInstanceRef.current = new (mod.default as any)(canvas, buildChartConfig(selectedChart.data, chartColor, showAxes));
    });

    return () => {
      destroyed = true;
      if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); chartInstanceRef.current = null; }
    };
  }, [selectedChart, chartColor, showAxes]);

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

  const previewW = Math.round(CHART_W * PREVIEW_SCALE);
  const previewH = 210;

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
          {/* position:absolute prevents the scaled child's layout width (1200px)
              from escaping the wrapper and expanding the modal */}
          <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: CHART_W }}>
            {/* frameRef is both the visible preview source AND the toPng capture target */}
            <div ref={frameRef} style={{ width: CHART_W, background: selectedBg.color ?? 'transparent', fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>
              {/* Header row — padded */}
              <div style={{ padding: `40px ${CHART_PAD}px ${showTitle ? 28 : 0}px` }}>
                {showTitle && (
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>
                    {selectedChart?.emoji} {selectedChart?.label}
                  </div>
                )}
              </div>
              {/* Chart canvas — full width, no padding so it doesn't overflow */}
              <canvas ref={canvasRef} style={{ display: 'block', width: CHART_W, height: CHART_H }} />
              {/* Footer row — padded */}
              <div style={{ display: 'flex', alignItems: 'flex-end', padding: `32px ${CHART_PAD}px 48px`, gap: 60 }}>
                {showStats && statsSummary && (
                  <>
                    {([['Min', statsSummary.min], ['Avg', statsSummary.avg], ['Max', statsSummary.max]] as [string, string][]).map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 34, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                          {val} <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{statsSummary.unit}</span>
                        </div>
                        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{label}</div>
                      </div>
                    ))}
                  </>
                )}
                {showWatermark && (
                  <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
                    Fit<span style={{ color: accent }}>Glue</span>
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
            <span className="export-option-label">Line color</span>
            <div className="export-option-row">
              <button className={`export-pill${!useAccentColor ? ' export-pill--active' : ''}`} onClick={() => setUseAccentColor(false)}>Default</button>
              <button className={`export-pill${useAccentColor ? ' export-pill--active' : ''}`} onClick={() => setUseAccentColor(true)}>Accent</button>
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Accent</span>
            <div className="export-option-row">
              {ACCENTS.map((a) => (
                <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color }} onClick={() => onAccentChange(a.color)} aria-label={a.id} />
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
