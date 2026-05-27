import React, { useRef, useState, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { ACCENTS, TEXT_SWATCHES } from './ShowcaseExportModal';
import { parseRecordType, prValueString, prDeltaString } from '../utils/prFormat';
import { formatDateFull } from '../utils/format';

type PersonalRecord = components['schemas']['PersonalRecord'];
type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPORT_W  = 1080;
const PREVIEW_W = 280;
const DISPLAY   = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO      = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

const PR_BACKGROUNDS = [
  { id: 'dark',     label: 'Dark',     bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)' },
  { id: 'ember',    label: 'Ember',    bg: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #0a0a0a 100%)' },
  { id: 'forest',   label: 'Forest',   bg: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0d 50%, #0a0a0a 100%)' },
  { id: 'clear',    label: 'Clear',    bg: 'transparent' },
];

const PR_SHAPES = [
  { id: 'landscape', label: 'Landscape', cols: 3 },
  { id: 'square',    label: 'Square',    cols: 2 },
  { id: 'portrait',  label: 'Portrait',  cols: 1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface DisplayPR {
  id: string;
  exerciseName: string;
  prType: string;
  value: string;
  unit: string;
  delta: string | null;
}

function buildDisplayPRs(records: PersonalRecord[]): DisplayPR[] {
  return records.map((r, i) => {
    const { label, prType } = parseRecordType(r.recordType ?? '');
    const { val, unit } = prValueString(r.newValue ?? 0, r.unit ?? '');
    const delta = prDeltaString(r.newValue ?? 0, r.previousValue, r.unit ?? '');
    return {
      id: r.recordType ?? `pr-${i}`,
      exerciseName: label.toUpperCase(),
      prType: prType.toUpperCase(),
      value: val,
      unit,
      delta,
    };
  });
}

// ─── PR Card Frame ────────────────────────────────────────────────────────────

interface PRCardProps {
  prs: DisplayPR[];
  accent: string;
  textColor: string;
  bg: string;
  cols: number;
  headerLabel: string;
  title: string;
  startTime: string | null;
  showWatermark: boolean;
}

const PRCard = React.forwardRef<HTMLDivElement, PRCardProps>(
  ({ prs, accent, textColor, bg, cols, headerLabel, title, startTime, showWatermark }, ref) => {
    const isClear = bg === 'transparent';
    const effectiveCols = prs.length === 1 ? 1 : Math.min(cols, prs.length);

    const valueFontSize = effectiveCols === 1 ? 96 : effectiveCols === 2 ? 80 : 64;
    const unitFontSize  = effectiveCols === 1 ? 28 : effectiveCols === 2 ? 24 : 20;

    return (
      <div
        ref={ref}
        style={{ width: EXPORT_W, background: bg, fontFamily: DISPLAY, boxSizing: 'border-box' }}
      >
        {/* ── Header band ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 60px 24px',
          background: isClear ? 'rgba(0,0,0,0.3)' : `${accent}14`,
          borderBottom: `2px solid ${accent}50`,
        }}>
          <div style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            color: accent,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
          }}>
            ★ {headerLabel || 'PERSONAL RECORDS'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              color: textColor,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined,
            }}>
              {title}
            </div>
            {startTime && (
              <div style={{
                fontFamily: MONO,
                fontSize: 13,
                color: `${textColor}66`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 4,
              }}>
                {formatDateFull(startTime)}
              </div>
            )}
          </div>
        </div>

        {/* ── PR grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
          rowGap: 48,
          columnGap: 60,
          padding: '48px 60px 40px',
        }}>
          {prs.map((pr) => (
            <div key={pr.id}>
              {/* Exercise name */}
              <div style={{
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: `${textColor}66`,
                marginBottom: 8,
                textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined,
              }}>
                {pr.exerciseName}
              </div>

              {/* PR type badge (strength records only) */}
              {pr.prType && (
                <div style={{
                  display: 'inline-block',
                  background: `${accent}18`,
                  border: `1.5px solid ${accent}`,
                  padding: '3px 12px',
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: accent,
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}>
                  {pr.prType}
                </div>
              )}

              {/* Value — Archivo Black, large, accent */}
              <div style={{
                fontFamily: DISPLAY,
                fontSize: valueFontSize,
                color: accent,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                textShadow: isClear ? '0 2px 20px rgba(0,0,0,0.9)' : undefined,
                marginBottom: pr.delta ? 10 : 0,
              }}>
                {pr.value}
                {pr.unit && (
                  <span style={{
                    fontFamily: MONO,
                    fontSize: unitFontSize,
                    fontWeight: 600,
                    color: `${textColor}55`,
                    marginLeft: 10,
                  }}>
                    {pr.unit}
                  </span>
                )}
              </div>

              {/* Delta (e.g. "−0:45" or "+5 kg") */}
              {pr.delta && (
                <div style={{
                  fontFamily: MONO,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: `${textColor}77`,
                  textShadow: isClear ? '0 1px 8px rgba(0,0,0,0.8)' : undefined,
                }}>
                  {pr.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Footer / watermark ── */}
        {showWatermark && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 60px 40px',
          }}>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              color: 'rgba(245,243,235,0.18)',
              letterSpacing: '0.04em',
            }}>
              FIT<span style={{ color: accent }}>GLUE</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
PRCard.displayName = 'PRCard';

// ─── Tab component ────────────────────────────────────────────────────────────

interface Props {
  records: PersonalRecord[];
  activity: ShowcasedActivity;
  accent: string;
  onAccentChange: (c: string) => void;
  textColor: string;
  onTextColorChange: (c: string) => void;
}

export const PRExportTab: React.FC<Props> = ({
  records, activity, accent, onAccentChange, textColor, onTextColorChange,
}) => {
  const allPRs = useMemo(() => buildDisplayPRs(records), [records]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => allPRs.map((p) => p.id));
  const [bgId,        setBgId]        = useState('dark');
  const [shapeId,     setShapeId]     = useState(() => {
    if (allPRs.length === 1) return 'portrait';
    if (allPRs.length <= 4) return 'square';
    return 'landscape';
  });
  const [headerLabel,   setHeaderLabel]   = useState('PERSONAL RECORDS');
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting,     setExporting]     = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);

  const selectedBg    = PR_BACKGROUNDS.find((b) => b.id === bgId)!;
  const selectedShape = PR_SHAPES.find((s) => s.id === shapeId)!;
  const selectedPRs   = useMemo(
    () => allPRs.filter((p) => selectedIds.includes(p.id)),
    [allPRs, selectedIds],
  );

  const togglePR = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const previewScale = PREVIEW_W / EXPORT_W;

  const handleExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const h = frameRef.current.scrollHeight;
      const dataUrl = await toPng(frameRef.current, {
        width: EXPORT_W, height: h, pixelRatio: 1,
      });
      const link = document.createElement('a');
      link.download = `${(activity.title ?? 'activity').replace(/\s+/g, '-').toLowerCase()}-prs-fitglue.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PR export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [activity.title]);

  const checkerBg = 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px';

  // Preview height: approximate card height × scale, capped so the modal doesn't blow up
  const effectiveCols = selectedPRs.length === 1 ? 1 : Math.min(selectedShape.cols, selectedPRs.length);
  const estimatedRows = Math.ceil((selectedPRs.length || 1) / effectiveCols);
  const estimatedCardH = 80 + estimatedRows * 180 + 60;
  const previewH = Math.min(Math.round(estimatedCardH * previewScale), 360);

  return (
    <>
      {/* ── Left: preview + download ── */}
      <div className="export-modal-preview-col">
        <div
          className="export-preview-wrapper"
          style={{
            width: PREVIEW_W,
            height: previewH,
            backgroundImage: checkerBg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
            width: EXPORT_W,
          }}>
            <PRCard
              ref={frameRef}
              prs={selectedPRs.length > 0 ? selectedPRs : allPRs}
              accent={accent}
              textColor={textColor}
              bg={selectedBg.bg}
              cols={selectedShape.cols}
              headerLabel={headerLabel}
              title={activity.title ?? 'Activity'}
              startTime={activity.startTime ?? null}
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
            <span className="export-option-label">Header</span>
            <input
              className="export-text-input"
              type="text"
              value={headerLabel}
              onChange={(e) => setHeaderLabel(e.target.value.toUpperCase())}
              placeholder="PERSONAL RECORDS"
              maxLength={40}
            />
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Layout</span>
            <div className="export-option-row">
              {PR_SHAPES.map((s) => (
                <button key={s.id} className={`export-pill${shapeId === s.id ? ' export-pill--active' : ''}`} onClick={() => setShapeId(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="export-option-group">
            <span className="export-option-label">Background</span>
            <div className="export-option-row export-option-row--wrap">
              {PR_BACKGROUNDS.map((b) => (
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
            <span className="export-option-label">Text</span>
            <div className="export-option-row">
              {TEXT_SWATCHES.map((a) => (
                <button
                  key={a.id}
                  className={`export-swatch${textColor === a.color ? ' export-swatch--active' : ''}`}
                  style={{ background: a.color, ...(a.color === '#ffffff' ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' } : {}) }}
                  onClick={() => onTextColorChange(a.color)}
                  aria-label={a.id}
                />
              ))}
            </div>
          </div>

          {allPRs.length > 1 && (
            <div className="export-option-group">
              <span className="export-option-label">Include</span>
              <div className="export-option-row export-option-row--wrap">
                {allPRs.map((pr) => (
                  <button
                    key={pr.id}
                    className={`export-pill${selectedIds.includes(pr.id) ? ' export-pill--active' : ''}`}
                    onClick={() => togglePR(pr.id)}
                    title={`${pr.value}${pr.unit ? ` ${pr.unit}` : ''}`}
                  >
                    {pr.exerciseName}{pr.prType ? ` · ${pr.prType}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="export-option-group">
            <span className="export-option-label">Also</span>
            <div className="export-option-row">
              <button className={`export-pill${showWatermark ? ' export-pill--active' : ''}`} onClick={() => setShowWatermark((v) => !v)}>Watermark</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
