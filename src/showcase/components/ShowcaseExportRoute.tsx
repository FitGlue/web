import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface LatLng { lat: number; lng: number }

// ─── Canvas renderer ──────────────────────────────────────────────────────────

const EXPORT_SIZE = 1080;
const PREVIEW_SIZE = 280;

const STROKE_OPTIONS = [
  { id: 'thin',   label: 'Thin',   value: 4 },
  { id: 'medium', label: 'Medium', value: 7 },
  { id: 'thick',  label: 'Thick',  value: 11 },
];

const BG_OPTIONS = [
  { id: 'dark',        label: 'Dark',        fill: '#0a0a0a' as string | null },
  { id: 'transparent', label: 'Transparent', fill: null },
];

const ACCENTS = [
  { id: 'pink',   color: '#FF1B8D' },
  { id: 'cyan',   color: '#4CC9F0' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

function renderRoute(
  canvas: HTMLCanvasElement,
  points: LatLng[],
  accent: string,
  bgFill: string | null,
  strokeWidth: number,
  showMarkers: boolean,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || points.length < 2) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  if (bgFill) {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);
  }

  const pad = Math.round(width * 0.1);
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const drawW = width - 2 * pad;
  const drawH = height - 2 * pad;
  const scale = Math.min(drawW / lngRange, drawH / latRange);
  const offsetX = (width - lngRange * scale) / 2;
  const offsetY = (height - latRange * scale) / 2;

  const project = (lat: number, lng: number) => ({
    x: offsetX + (lng - minLng) * scale,
    y: offsetY + (maxLat - lat) * scale,
  });

  // Glow pass
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = strokeWidth * 6;
  ctx.beginPath();
  points.forEach((p, i) => {
    const { x, y } = project(p.lat, p.lng);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Solid pass (on top, no shadow)
  ctx.beginPath();
  points.forEach((p, i) => {
    const { x, y } = project(p.lat, p.lng);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = strokeWidth * 0.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  if (showMarkers) {
    const r = strokeWidth * 2.8;
    const drawDot = (lat: number, lng: number, fill: string) => {
      const { x, y } = project(lat, lng);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = bgFill ?? '#000';
      ctx.lineWidth = r * 0.4;
      ctx.stroke();
    };
    drawDot(points[0].lat, points[0].lng, '#4ADE80');
    drawDot(points[points.length - 1].lat, points[points.length - 1].lng, accent);
  }

  // Watermark
  const fs = Math.round(width * 0.028);
  ctx.font = `700 ${fs}px 'Inter', sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const glueW = ctx.measureText('Glue').width;
  const fitW = ctx.measureText('Fit').width;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('Fit', width - pad - glueW, height - pad * 0.5);
  ctx.fillStyle = accent;
  ctx.fillText('Glue', width - pad, height - pad * 0.5);
  // suppress unused warning
  void fitW;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  gpsPoints: LatLng[];
  accent: string;
  onAccentChange: (c: string) => void;
}

export const RouteExportTab: React.FC<Props> = ({ gpsPoints, accent, onAccentChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgId, setBgId] = useState('dark');
  const [strokeId, setStrokeId] = useState('medium');
  const [showMarkers, setShowMarkers] = useState(true);

  const selectedBg = BG_OPTIONS.find((b) => b.id === bgId)!;
  const selectedStroke = STROKE_OPTIONS.find((s) => s.id === strokeId)!;

  // Re-render whenever any option changes
  useEffect(() => {
    if (!canvasRef.current || gpsPoints.length < 2) return;
    const canvas = canvasRef.current;
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    renderRoute(canvas, gpsPoints, accent, selectedBg.fill, selectedStroke.value, showMarkers);
  }, [gpsPoints, accent, bgId, strokeId, showMarkers, selectedBg.fill, selectedStroke.value]);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'route-fitglue.png';
    link.href = dataUrl;
    link.click();
  }, []);

  if (gpsPoints.length < 2) {
    return (
      <>
        <div className="export-modal-preview-col">
          <div className="export-empty-state">No GPS data available for this activity.</div>
        </div>
        <div className="export-modal-options-col" />
      </>
    );
  }

  return (
    <>
      {/* ── Left: preview + download ── */}
      <div className="export-modal-preview-col">
        <div
          className="export-preview-wrapper"
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            backgroundImage: selectedBg.fill
              ? undefined
              : 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
            background: selectedBg.fill ?? undefined,
          }}
        >
          {/* Canvas is 1080×1080 but displayed at 280×280 via CSS — toDataURL gives full res */}
          <canvas
            ref={canvasRef}
            style={{ display: 'block', width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          />
        </div>

        <button className="export-download-btn" onClick={handleExport}>
          ⬇ Download PNG
        </button>
      </div>

      {/* ── Right: options ── */}
      <div className="export-modal-options-col">
        <div className="export-options">

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
                  style={{ background: a.color }} onClick={() => onAccentChange(a.color)} aria-label={a.id} />
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Line weight</span>
            <div className="export-option-row">
              {STROKE_OPTIONS.map((s) => (
                <button key={s.id} className={`export-pill${strokeId === s.id ? ' export-pill--active' : ''}`} onClick={() => setStrokeId(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Markers</span>
            <div className="export-option-row">
              <button className={`export-pill${showMarkers ? ' export-pill--active' : ''}`} onClick={() => setShowMarkers((v) => !v)}>
                Start / Finish
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
