import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';

type HybridRaceSegment = components['schemas']['HybridRaceSegment'];

const EXPORT_W    = 1080;
const PREVIEW_SIZE = 280;

const SWATCHES = [
  { id: 'cyan',   color: '#22d3ee' },
  { id: 'pink',   color: '#ff3da6' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

const BG_OPTIONS = [
  { id: 'dark',        label: 'Dark',        style: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a20 50%,#0a0a0a 100%)' as string | null },
  { id: 'midnight',    label: 'Midnight',    style: 'linear-gradient(135deg,#0a0a1a 0%,#0d1b3e 50%,#0a0a1a 100%)' as string | null },
  { id: 'ember',       label: 'Ember',       style: 'linear-gradient(135deg,#0a0a0a 0%,#2a0a0a 50%,#0a0a0a 100%)' as string | null },
  { id: 'forest',      label: 'Forest',      style: 'linear-gradient(135deg,#0a0a0a 0%,#0a1a0d 50%,#0a0a0a 100%)' as string | null },
  { id: 'neon',        label: 'Neon',        style: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a2a 50%,#0a0a0a 100%)' as string | null },
  { id: 'transparent', label: 'Transparent', style: null },
];

const CARD_SHAPES: Array<{ id: string; label: string; borderRadius: string; widthPct: number; ratio: string | null }> = [
  { id: 'default',   label: 'Default',   borderRadius: '0',     widthPct: 100, ratio: null   },
  { id: 'landscape', label: 'Landscape', borderRadius: '0',     widthPct: 88,  ratio: '16/7' },
  { id: 'square',    label: 'Square',    borderRadius: '0',     widthPct: 78,  ratio: '1'    },
  { id: 'portrait',  label: 'Portrait',  borderRadius: '0',     widthPct: 54,  ratio: '2/3'  },
  { id: 'circle',    label: 'Circle',    borderRadius: '50%',   widthPct: 72,  ratio: '1'    },
  { id: 'pill',      label: 'Pill',      borderRadius: '999px', widthPct: 90,  ratio: null   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSeg(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtTotal(s: number) {
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${m}:${String(ss).padStart(2, '0')}`;
}

function barGrad(color: string) {
  return `linear-gradient(90deg, ${color}99 0%, ${color} 100%)`;
}

// Compute a scale factor so card content fits within a fixed-aspect-ratio shape.
// Returns 1 for content-driven shapes (default / pill).
function computeContentScale(
  shape: typeof CARD_SHAPES[number],
  segments: HybridRaceSegment[],
  showHeader: boolean,
  showSplit: boolean,
): number {
  if (!shape.ratio) return 1;
  const [rw, rh] = shape.ratio.split('/').map(Number);
  const cardW  = EXPORT_W * (shape.widthPct / 100);
  const cardH  = cardW * (rh / rw);
  const innerH = cardH - 112; // 56px top + 56px bottom padding

  const headerH   = showHeader ? 140 : 0;
  const barsH     = segments.length > 0 ? segments.length * 42 + (segments.length - 1) * 16 : 0;
  const splitH    = showSplit ? 140 : 0;
  const totalH    = 108;
  const naturalH  = headerH + barsH + splitH + totalH;

  return Math.min(1, innerH / Math.max(naturalH, 1));
}

// ─── Export card ──────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  segments: HybridRaceSegment[];
  bgStyle: string | null;
  runColor: string;
  stnColor: string;
  cardShape: typeof CARD_SHAPES[number];
  showHeader: boolean;
  showSplit: boolean;
  showWatermark: boolean;
  contentScale: number;
}

const HybridRaceExportCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, segments, bgStyle, runColor, stnColor, cardShape, showHeader, showSplit, showWatermark, contentScale: cs }, ref) => {
    const maxDur   = Math.max(...segments.map((s) => s.durationSeconds ?? 0), 1);
    const total    = segments.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
    const runs     = segments.filter((s) => s.isRun).reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
    const stns     = total - runs;
    const hasSplit = showSplit && runs > 0 && stns > 0;
    const isClear  = bgStyle === null;
    const textShadow  = isClear ? '0 2px 12px rgba(0,0,0,0.9)' : undefined;

    const cardStyle: React.CSSProperties = {
      width: `${cardShape.widthPct}%`,
      background: bgStyle ?? 'transparent',
      borderRadius: cardShape.borderRadius,
      boxSizing: 'border-box',
      padding: cardShape.id === 'default' ? '80px' : '56px 64px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      ...(cardShape.ratio ? { aspectRatio: cardShape.ratio } : {}),
    };

    return (
      <div
        ref={ref}
        style={{
          width: EXPORT_W,
          background: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          padding: cardShape.id === 'default' ? '0' : '80px 0',
          fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif",
          position: 'relative',
        }}
      >
        <div style={cardStyle}>

          {/* ── Header ── */}
          {showHeader && (
            <div style={{ marginBottom: 44 * cs }}>
              <div style={{
                fontFamily: "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace",
                fontSize: 16 * cs, fontWeight: 700, color: stnColor,
                textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16 * cs,
                textShadow,
              }}>
                🏁 Race Breakdown
              </div>
              <div style={{ fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif", fontSize: 52 * cs, color: '#f5f3eb', lineHeight: 1.05, textTransform: 'uppercase', textShadow }}>
                {title}
              </div>
            </div>
          )}

          {/* ── Bars ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 * cs }}>
            {segments.map((seg, i) => {
              const dur = seg.durationSeconds ?? 0;
              const pct = (dur / maxDur) * 100;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 * cs }}>
                  <div style={{ width: 36 * cs, textAlign: 'center', fontSize: 26 * cs, flexShrink: 0 }}>
                    {seg.icon || (seg.isRun ? '🏃' : '💪')}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace",
                    width: 200 * cs, flexShrink: 0, fontSize: 16 * cs, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: isClear ? 'rgba(245,243,235,0.9)' : 'rgba(245,243,235,0.65)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textShadow,
                  }}>
                    {seg.label ?? ''}
                  </div>
                  <div style={{
                    flex: 1, height: 42 * cs,
                    background: isClear ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: seg.isRun ? barGrad(runColor) : barGrad(stnColor),
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      paddingRight: 16 * cs, minWidth: 70 * cs, boxSizing: 'border-box',
                    }}>
                      {dur > 0 && (
                        <span style={{
                          fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif",
                          fontSize: 18 * cs, color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)', whiteSpace: 'nowrap',
                        }}>
                          {fmtSeg(dur)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Run / station split ── */}
          {hasSplit && (
            <div style={{
              display: 'flex', marginTop: 40 * cs,
              border: `1px solid ${isClear ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8 * cs, padding: `${24 * cs}px ${28 * cs}px`,
                background: `${runColor}1a`,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace", fontSize: 15 * cs, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,243,235,0.5)', textShadow }}>🏃 Runs</span>
                <strong style={{ fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif", fontSize: 38 * cs, color: runColor, lineHeight: 1, textShadow }}>
                  {fmtTotal(runs)}
                </strong>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8 * cs, padding: `${24 * cs}px ${28 * cs}px`,
                background: `${stnColor}15`,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace", fontSize: 15 * cs, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,243,235,0.5)', textShadow }}>💪 Stations</span>
                <strong style={{ fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif", fontSize: 38 * cs, color: stnColor, lineHeight: 1, textShadow }}>
                  {fmtTotal(stns)}
                </strong>
              </div>
            </div>
          )}

          {/* ── Total ── */}
          <div style={{
            marginTop: 28 * cs, padding: `${24 * cs}px ${40 * cs}px`,
            background: isClear
              ? 'rgba(255,255,255,0.08)'
              : `linear-gradient(135deg,${stnColor}26,${runColor}26)`,
            border: `1px solid ${isClear ? 'rgba(255,255,255,0.15)' : `${stnColor}4d`}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace", fontSize: 20 * cs, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f5f3eb', textShadow }}>Total Time</span>
            <span style={{
              fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif",
              fontSize: 52 * cs, lineHeight: 1,
              color: stnColor,
            }}>
              {fmtTotal(total)}
            </span>
          </div>

          {/* ── Watermark (inside card, clipped by shape) ── */}
          {showWatermark && (
            <div style={{
              position: 'absolute', bottom: 20, right: 28,
              fontFamily: "'Archivo Black','Arial Black',system-ui,sans-serif",
              fontSize: Math.max(14, 18 * cs), letterSpacing: '0.04em',
              color: 'rgba(245,243,235,0.22)',
            }}>
              FIT<span style={{ color: stnColor }}>GLUE</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
HybridRaceExportCard.displayName = 'HybridRaceExportCard';

// ─── Tab ─────────────────────────────────────────────────────────────────────

interface Props {
  segments: HybridRaceSegment[];
  activityTitle: string;
  // accent / onAccentChange kept for interface compatibility — race tab uses its own run/stn colors
  accent: string;
  onAccentChange: (c: string) => void;
}

export const HybridRaceExportTab: React.FC<Props> = ({ segments, activityTitle }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bgId,          setBgId]          = useState('dark');
  const [cardShapeId,   setCardShapeId]   = useState('default');
  const [showHeader,    setShowHeader]    = useState(true);
  const [showSplit,     setShowSplit]     = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [runColor,      setRunColor]      = useState('#22d3ee');
  const [stnColor,      setStnColor]      = useState('#ff3da6');
  const [exporting,     setExporting]     = useState(false);
  const [wrapperHeight, setWrapperHeight] = useState<number | undefined>(undefined);

  const selectedBg    = BG_OPTIONS.find((b) => b.id === bgId)!;
  const selectedShape = CARD_SHAPES.find((s) => s.id === cardShapeId)!;
  const previewScale  = PREVIEW_SIZE / EXPORT_W;
  const contentScale  = computeContentScale(selectedShape, segments, showHeader, showSplit);

  const checkerBg = 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px';

  // Collapse the preview wrapper to the card's visual (scaled) height so the
  // download button isn't pushed off-screen by the unscaled layout height.
  useLayoutEffect(() => {
    if (!frameRef.current) return;
    setWrapperHeight(frameRef.current.scrollHeight * previewScale);
  }, [selectedShape, segments, showHeader, showSplit, contentScale, previewScale]);

  const handleExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const h = frameRef.current.scrollHeight;
      const dataUrl = await toPng(frameRef.current, { width: EXPORT_W, height: h, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = 'race-breakdown-fitglue.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <>
      {/* ── Left: preview + download ── */}
      <div className="export-modal-preview-col">
        <div
          className="export-preview-wrapper"
          style={{
            width: PREVIEW_SIZE,
            height: wrapperHeight,
            backgroundImage: checkerBg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            width: EXPORT_W,
          }}>
            <HybridRaceExportCard
              ref={frameRef}
              title={activityTitle}
              segments={segments}
              bgStyle={selectedBg.style}
              runColor={runColor}
              stnColor={stnColor}
              cardShape={selectedShape}
              showHeader={showHeader}
              showSplit={showSplit}
              showWatermark={showWatermark}
              contentScale={contentScale}
            />
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
            <span className="export-option-label">Shape</span>
            <div className="export-option-row export-option-row--wrap">
              {CARD_SHAPES.map((s) => (
                <button
                  key={s.id}
                  className={`export-pill${cardShapeId === s.id ? ' export-pill--active' : ''}`}
                  onClick={() => setCardShapeId(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Background</span>
            <div className="export-option-row export-option-row--wrap">
              {BG_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  className={`export-pill${bgId === b.id ? ' export-pill--active' : ''}`}
                  onClick={() => setBgId(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Runs</span>
            <div className="export-option-row">
              {SWATCHES.map((a) => (
                <button
                  key={a.id}
                  className={`export-swatch${runColor === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color }}
                  onClick={() => setRunColor(a.color)}
                  aria-label={a.id}
                />
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Stations</span>
            <div className="export-option-row">
              {SWATCHES.map((a) => (
                <button
                  key={a.id}
                  className={`export-swatch${stnColor === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color }}
                  onClick={() => setStnColor(a.color)}
                  aria-label={a.id}
                />
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Include</span>
            <div className="export-option-row export-option-row--wrap">
              <button
                className={`export-pill${showHeader ? ' export-pill--active' : ''}`}
                onClick={() => setShowHeader((v) => !v)}
              >
                Title &amp; Label
              </button>
              <button
                className={`export-pill${showSplit ? ' export-pill--active' : ''}`}
                onClick={() => setShowSplit((v) => !v)}
              >
                Run / Station Split
              </button>
              <button
                className={`export-pill${showWatermark ? ' export-pill--active' : ''}`}
                onClick={() => setShowWatermark((v) => !v)}
              >
                Watermark
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
