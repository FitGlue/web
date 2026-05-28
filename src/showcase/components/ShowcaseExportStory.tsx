import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { ACCENTS, TEXT_SWATCHES, buildAllStats, StatOption } from './ShowcaseExportModal';
import { formatActivityType, formatDateFull, formatSource } from '../utils/format';
import { parseRecordType, prValueString } from '../utils/prFormat';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

const STORY_W = 1080;
const STORY_H = 1920;
const PREVIEW_W = 220;
const PREVIEW_H = Math.round(PREVIEW_W * (STORY_H / STORY_W));

// Richer brand-tinted bases — photo sits on top so these show at edges
const STORY_BACKGROUNDS = [
  { id: 'brand',    label: 'Brand',    bg: 'linear-gradient(170deg, #4a0620 0%, #220450 40%, #0e0228 70%, #060110 100%)' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(170deg, #060818 0%, #0c1840 40%, #07091a 70%, #030408 100%)' },
  { id: 'ember',    label: 'Ember',    bg: 'linear-gradient(170deg, #280606 0%, #420808 40%, #180404 70%, #090202 100%)' },
  { id: 'forest',   label: 'Forest',   bg: 'linear-gradient(170deg, #031808 0%, #082e0e 40%, #041208 70%, #020804 100%)' },
  { id: 'neon',     label: 'Neon',     bg: 'linear-gradient(170deg, #1c0428 0%, #2c0848 40%, #120320 70%, #07010f 100%)' },
  { id: 'noir',     label: 'Noir',     bg: 'linear-gradient(170deg, #181818 0%, #242424 40%, #111111 70%, #080808 100%)' },
];

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ─── Story Frame (1080×1920 — the actual export canvas) ───────────────────────

interface StoryFrameProps {
  data: ShowcasedActivity;
  photoUrl: string | null;
  bg: typeof STORY_BACKGROUNDS[number];
  accent: string;
  textColor: string;
  stats: StatOption[];
  showPRHighlight: boolean;
  showWatermark: boolean;
}

const StoryFrame = React.forwardRef<HTMLDivElement, StoryFrameProps>(
  ({ data, photoUrl, bg, accent, textColor, stats, showPRHighlight, showWatermark }, ref) => {
    const prRecords = data.enrichments?.personalRecords?.records ?? [];
    const topPR = prRecords[0];
    const prCount = prRecords.length;
    const boosterCount = (data.appliedEnrichments ?? []).length;
    const sourceLabel = data.source ? formatSource(data.source).toUpperCase() : null;

    let prExercise = '';
    let prTypeLabel = '';
    let prValue = '';
    let prUnit = '';
    if (topPR && showPRHighlight) {
      const { label, prType } = parseRecordType(topPR.recordType ?? '');
      prExercise = label.toUpperCase();
      prTypeLabel = prType.toUpperCase();
      const { val, unit } = prValueString(topPR.newValue ?? 0, topPR.unit ?? '');
      prValue = val;
      prUnit = unit;
    }

    return (
      <div ref={ref} style={{
        width: `${STORY_W}px`,
        height: `${STORY_H}px`,
        background: bg.bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: DISPLAY,
        boxSizing: 'border-box',
      }}>
        {/* Photo — full bleed, high opacity so it actually shows */}
        {photoUrl && (
          <img
            src={photoUrl}
            crossOrigin="anonymous"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              opacity: 0.68,
            }}
          />
        )}

        {/* Brand-colour wash over photo — gives the FitGlue purple/pink feel */}
        {photoUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(80,20,120,0.45) 0%, rgba(180,30,100,0.25) 35%, rgba(0,0,0,0) 65%)',
          }} />
        )}

        {/* Dark-from-bottom — keeps stats/content readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.82) 28%, rgba(0,0,0,0.30) 52%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.35) 100%)',
        }} />

        {/* Accent glow behind title */}
        <div style={{
          position: 'absolute',
          top: '46%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1100px', height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}28 0%, transparent 65%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '110px 88px 88px',
          boxSizing: 'border-box',
        }}>

          {/* Activity type badge + source */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-block',
              background: `${accent}22`,
              border: `2px solid ${accent}`,
              padding: '12px 32px',
              color: accent,
              fontFamily: MONO,
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}>
              {formatActivityType(data.activityType)}
            </div>
            {sourceLabel && (
              <div style={{
                fontFamily: MONO,
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: `${textColor}66`,
                textShadow: '0 1px 8px rgba(0,0,0,0.8)',
              }}>
                VIA {sourceLabel}
              </div>
            )}
          </div>

          {/* Date + PR chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {data.startTime && (
              <div style={{
                fontFamily: MONO,
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: `${textColor}70`,
                textShadow: '0 1px 8px rgba(0,0,0,0.8)',
              }}>
                {formatDateFull(data.startTime)}
              </div>
            )}
            {prCount > 0 && (
              <div style={{
                background: `${accent}25`,
                border: `1.5px solid ${accent}66`,
                padding: '8px 24px',
                fontFamily: MONO,
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: accent,
              }}>
                +{prCount} PR
              </div>
            )}
          </div>

          {/* Spacer — pushes title to roughly centre of frame */}
          <div style={{ flex: 1 }} />

          {/* Main title */}
          <div style={{
            fontFamily: DISPLAY,
            fontSize: '118px',
            fontWeight: 900,
            color: textColor,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            textShadow: '0 4px 48px rgba(0,0,0,0.95)',
            marginBottom: '32px',
          }}>
            {data.title ?? 'Activity'}
          </div>

          {/* Owner / enricher line */}
          <div style={{
            fontFamily: MONO,
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: `${textColor}55`,
            textShadow: '0 1px 12px rgba(0,0,0,0.9)',
            marginBottom: '68px',
          }}>
            BY {(data.ownerDisplayName ?? '').toUpperCase()}
            {boosterCount > 0 && ` · ENRICHED BY ${boosterCount} BOOSTER${boosterCount !== 1 ? 'S' : ''}`}
          </div>

          {/* Gradient divider */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, ${accent}00, ${accent}bb, ${accent}00)`,
            marginBottom: '52px',
            flexShrink: 0,
          }} />

          {/* Stats grid */}
          {stats.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: stats.length >= 3 ? 'repeat(2, 1fr)' : `repeat(${stats.length}, 1fr)`,
              gap: '36px 48px',
              marginBottom: showPRHighlight && topPR ? '52px' : '0',
            }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: DISPLAY, fontSize: '76px', color: accent, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${textColor}50`, marginTop: '10px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* PR highlight */}
          {showPRHighlight && topPR && (
            <>
              <div style={{
                height: '2px',
                background: `linear-gradient(90deg, ${accent}00, ${accent}44, ${accent}00)`,
                marginBottom: '40px',
                flexShrink: 0,
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
                <div style={{ fontSize: '72px', lineHeight: 1, flexShrink: 0 }}>🏆</div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: '40px', color: textColor, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.1, marginBottom: '12px' }}>
                    {prExercise}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: '22px', color: `${textColor}50`, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    {prTypeLabel} · NEW PERSONAL RECORD{prCount > 1 ? ` · +${prCount - 1} MORE` : ''}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: '88px', color: textColor, lineHeight: 1 }}>
                    {prValue}{' '}
                    <span style={{ fontSize: '40px', color: `${textColor}60` }}>{prUnit}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ flex: 0.6 }} />

          {/* Watermark */}
          {showWatermark && (
            <div style={{
              alignSelf: 'flex-end',
              fontFamily: DISPLAY,
              fontSize: '30px',
              color: 'rgba(245,243,235,0.20)',
              letterSpacing: '0.06em',
            }}>
              FIT<span style={{ color: accent }}>GLUE</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
StoryFrame.displayName = 'StoryFrame';

// ─── Story Export Tab ─────────────────────────────────────────────────────────

interface Props {
  data: ShowcasedActivity;
  accent: string;
  onAccentChange: (c: string) => void;
  textColor: string;
  onTextColorChange: (c: string) => void;
}

export const StoryExportTab: React.FC<Props> = ({
  data, accent, onAccentChange, textColor, onTextColorChange,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bg, setBg] = useState(STORY_BACKGROUNDS[0]);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Resolve photo to a data URL so html-to-image can inline it regardless of CORS.
  // Falls back to photoUrls[0] if no AI banner exists (e.g. FIT file uploads with attached photos).
  const rawPhotoUrl = useMemo(
    () => data.enrichments?.aiBanner?.imageUrl ?? data.photoUrls?.[0] ?? null,
    [data]
  );
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!rawPhotoUrl) { setResolvedPhotoUrl(null); return; }
    let cancelled = false;
    fetch(rawPhotoUrl)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => { if (!cancelled) setResolvedPhotoUrl(dataUrl); })
      .catch(() => { if (!cancelled) setResolvedPhotoUrl(rawPhotoUrl); });
    return () => { cancelled = true; };
  }, [rawPhotoUrl]);

  const prRecords = useMemo(() => data.enrichments?.personalRecords?.records ?? [], [data]);
  const hasPRs = prRecords.length > 0;
  const [showPRHighlight, setShowPRHighlight] = useState(hasPRs);

  const allStats = useMemo(() => buildAllStats(data), [data]);
  const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() => allStats.slice(0, 4).map((s) => s.id));
  const selectedStats = useMemo(() => allStats.filter((s) => selectedStatIds.includes(s.id)), [allStats, selectedStatIds]);
  const toggleStat = useCallback((id: string) => {
    setSelectedStatIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]
    );
  }, []);

  const previewScale = PREVIEW_W / STORY_W;

  const handleExport = useCallback(async () => {
    if (!frameRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(frameRef.current, {
        width: STORY_W,
        height: STORY_H,
        pixelRatio: 1,
      });
      const link = document.createElement('a');
      link.download = `${(data.title ?? 'activity').replace(/\s+/g, '-').toLowerCase()}-story-fitglue.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Story export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [data.title]);

  return (
    <>
      <div className="export-modal-preview-col">
        <div className="export-preview-wrapper" style={{
          width: PREVIEW_W,
          height: PREVIEW_H,
          backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            width: STORY_W,
            height: STORY_H,
          }}>
            <StoryFrame
              ref={frameRef}
              data={data}
              photoUrl={resolvedPhotoUrl}
              bg={bg}
              accent={accent}
              textColor={textColor}
              stats={selectedStats}
              showPRHighlight={showPRHighlight}
              showWatermark={showWatermark}
            />
          </div>
        </div>
        {rawPhotoUrl && !resolvedPhotoUrl && (
          <p style={{ fontFamily: MONO, fontSize: '11px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', letterSpacing: '0.08em' }}>
            Loading photo…
          </p>
        )}
        <button className="export-download-btn" onClick={handleExport} disabled={exporting || (rawPhotoUrl !== null && resolvedPhotoUrl === null)}>
          {exporting ? 'Exporting…' : rawPhotoUrl && !resolvedPhotoUrl ? 'Loading photo…' : '⬇ Download PNG'}
        </button>
      </div>

      <div className="export-modal-options-col">
        <div className="export-options">
          <div className="export-option-group">
            <span className="export-option-label">Background</span>
            <div className="export-option-row export-option-row--wrap">
              {STORY_BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  className={`export-pill${bg.id === b.id ? ' export-pill--active' : ''}`}
                  onClick={() => setBg(b)}
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
            <span className="export-option-label">Text</span>
            <div className="export-option-row">
              {TEXT_SWATCHES.map((a) => (
                <button
                  key={a.id}
                  className={`export-swatch${textColor === a.color ? ' export-swatch--active' : ''}`}
                  style={{
                    background: a.color,
                    ...(a.color === '#ffffff' ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' } : {}),
                  }}
                  onClick={() => onTextColorChange(a.color)}
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
                  <button
                    key={s.id}
                    className={`export-pill${selectedStatIds.includes(s.id) ? ' export-pill--active' : ''}`}
                    onClick={() => toggleStat(s.id)}
                    title={s.value}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="export-stats-hint">Up to 4 · click to toggle · hover to preview value</p>
            </div>
          )}
          <div className="export-option-group">
            <span className="export-option-label">Include</span>
            <div className="export-option-row export-option-row--wrap">
              {hasPRs && (
                <button
                  className={`export-pill${showPRHighlight ? ' export-pill--active' : ''}`}
                  onClick={() => setShowPRHighlight((v) => !v)}
                >
                  PR Highlight
                </button>
              )}
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
