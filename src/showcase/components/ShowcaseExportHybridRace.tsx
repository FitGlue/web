import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';

type HybridRaceSegment = components['schemas']['HybridRaceSegment'];

const EXPORT_W = 1080;
const PREVIEW_SIZE = 280;

const RUN_GRADIENT   = 'linear-gradient(90deg, #4CC9F0 0%, #38B6DC 100%)';
const STN_GRADIENT   = 'linear-gradient(90deg, #FF1B8D 0%, #9D4EDD 100%)';
const TOTAL_GRADIENT = 'linear-gradient(135deg, #FF1B8D, #9D4EDD)';

const BG_OPTIONS = [
  { id: 'dark',        label: 'Dark',        style: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a20 50%,#0a0a0a 100%)' as string | null },
  { id: 'midnight',    label: 'Midnight',    style: 'linear-gradient(135deg,#0a0a1a 0%,#0d1b3e 50%,#0a0a1a 100%)' as string | null },
  { id: 'ember',       label: 'Ember',       style: 'linear-gradient(135deg,#0a0a0a 0%,#2a0a0a 50%,#0a0a0a 100%)' as string | null },
  { id: 'forest',      label: 'Forest',      style: 'linear-gradient(135deg,#0a0a0a 0%,#0a1a0d 50%,#0a0a0a 100%)' as string | null },
  { id: 'neon',        label: 'Neon',        style: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a2a 50%,#0a0a0a 100%)' as string | null },
  { id: 'transparent', label: 'Transparent', style: null },
];

const CARD_SHAPES: Array<{ id: string; label: string; borderRadius: string; widthPct: number; ratio: string | null }> = [
  { id: 'default',   label: 'Default',   borderRadius: '24px',  widthPct: 100, ratio: null   },
  { id: 'landscape', label: 'Landscape', borderRadius: '24px',  widthPct: 88,  ratio: '16/7' },
  { id: 'square',    label: 'Square',    borderRadius: '32px',  widthPct: 78,  ratio: '1'    },
  { id: 'portrait',  label: 'Portrait',  borderRadius: '32px',  widthPct: 54,  ratio: '2/3'  },
  { id: 'circle',    label: 'Circle',    borderRadius: '50%',   widthPct: 72,  ratio: '1'    },
  { id: 'pill',      label: 'Pill',      borderRadius: '999px', widthPct: 90,  ratio: null   },
];

const ACCENTS = [
  { id: 'pink',   color: '#FF1B8D' },
  { id: 'cyan',   color: '#4CC9F0' },
  { id: 'orange', color: '#FF6B35' },
  { id: 'green',  color: '#4ADE80' },
  { id: 'purple', color: '#E040FB' },
  { id: 'gold',   color: '#FBBF24' },
];

// ─── Time helpers ─────────────────────────────────────────────────────────────

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

// ─── Export card (full-res DOM element) ───────────────────────────────────────

interface CardProps {
  title: string;
  segments: HybridRaceSegment[];
  bgStyle: string | null;
  accent: string;
  cardShape: typeof CARD_SHAPES[number];
  showHeader: boolean;
  showSplit: boolean;
  showWatermark: boolean;
}

const HybridRaceExportCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, segments, bgStyle, accent, cardShape, showHeader, showSplit, showWatermark }, ref) => {
    const maxDur = Math.max(...segments.map((s) => s.durationSeconds ?? 0), 1);
    const total  = segments.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
    const runs   = segments.filter((s) => s.isRun).reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
    const stns   = total - runs;
    const hasSplit = showSplit && runs > 0 && stns > 0;
    const isClear  = bgStyle === null;

    const textShadow = isClear ? '0 2px 12px rgba(0,0,0,0.9)' : undefined;

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
          fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
          position: 'relative',
        }}
      >
        <div style={cardStyle}>
          {/* ── Header ── */}
          {showHeader && (
            <div style={{ marginBottom: 44 }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: accent,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16,
                textShadow,
              }}>
                🏁 Race Breakdown
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.1, textShadow }}>
                {title}
              </div>
            </div>
          )}

          {/* ── Bars ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {segments.map((seg, i) => {
              const dur = seg.durationSeconds ?? 0;
              const pct = (dur / maxDur) * 100;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 36, textAlign: 'center', fontSize: 26, flexShrink: 0 }}>
                    {seg.icon || (seg.isRun ? '🏃' : '💪')}
                  </div>
                  <div style={{
                    width: 180, flexShrink: 0, fontSize: 20,
                    color: isClear ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textShadow,
                  }}>
                    {seg.label ?? ''}
                  </div>
                  <div style={{
                    flex: 1, height: 42,
                    background: isClear ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    borderRadius: 10, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: seg.isRun ? RUN_GRADIENT : STN_GRADIENT,
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      paddingRight: 16, minWidth: 70, boxSizing: 'border-box',
                    }}>
                      {dur > 0 && (
                        <span style={{
                          fontSize: 18, fontWeight: 700, color: '#fff',
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
              display: 'flex', marginTop: 40,
              borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${isClear ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, padding: '24px 28px',
                background: 'rgba(76,201,240,0.1)',
              }}>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', textShadow }}>🏃 Runs</span>
                <strong style={{ fontSize: 36, fontWeight: 800, color: '#4CC9F0', lineHeight: 1, textShadow }}>
                  {fmtTotal(runs)}
                </strong>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, padding: '24px 28px',
                background: 'rgba(255,27,141,0.08)',
              }}>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', textShadow }}>💪 Stations</span>
                <strong style={{ fontSize: 36, fontWeight: 800, color: '#FF1B8D', lineHeight: 1, textShadow }}>
                  {fmtTotal(stns)}
                </strong>
              </div>
            </div>
          )}

          {/* ── Total ── */}
          <div style={{
            marginTop: 28, padding: '24px 40px',
            background: isClear
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg,rgba(255,27,141,0.15),rgba(157,78,221,0.15))',
            border: `1px solid ${isClear ? 'rgba(255,255,255,0.15)' : 'rgba(255,27,141,0.3)'}`,
            borderRadius: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', textShadow }}>Total Time</span>
            <span style={{
              fontSize: 50, fontWeight: 900, lineHeight: 1,
              background: TOTAL_GRADIENT,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {fmtTotal(total)}
            </span>
          </div>

          {/* ── Watermark (inside card, clipped by shape) ── */}
          {showWatermark && (
            <div style={{
              position: 'absolute', bottom: 20, right: 28,
              fontSize: 18, fontWeight: 700, letterSpacing: '0.05em',
              color: 'rgba(255,255,255,0.22)',
            }}>
              Fit<span style={{ color: accent }}>Glue</span>
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
  accent: string;
  onAccentChange: (c: string) => void;
}

export const HybridRaceExportTab: React.FC<Props> = ({
  segments, activityTitle, accent, onAccentChange,
}) => {
  const frameRef   = useRef<HTMLDivElement>(null);
  const [bgId,          setBgId]          = useState('dark');
  const [cardShapeId,   setCardShapeId]   = useState('default');
  const [showHeader,    setShowHeader]    = useState(true);
  const [showSplit,     setShowSplit]     = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting,     setExporting]     = useState(false);

  const selectedBg    = BG_OPTIONS.find((b) => b.id === bgId)!;
  const selectedShape = CARD_SHAPES.find((s) => s.id === cardShapeId)!;
  const previewScale  = PREVIEW_SIZE / EXPORT_W;

  const checkerBg = 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px';

  const handleExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const h = frameRef.current.scrollHeight;
      const dataUrl = await toPng(frameRef.current, { width: EXPORT_W, height: h, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `race-breakdown-fitglue.png`;
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
              accent={accent}
              cardShape={selectedShape}
              showHeader={showHeader}
              showSplit={showSplit}
              showWatermark={showWatermark}
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
            <span className="export-option-label">Accent</span>
            <div className="export-option-row">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color }}
                  onClick={() => onAccentChange(a.color)}
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
