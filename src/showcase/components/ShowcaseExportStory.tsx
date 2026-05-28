import React, { useRef, useState, useCallback, useMemo } from 'react';
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

const STORY_BACKGROUNDS = [
  { id: 'brand',    label: 'Brand',    bg: 'linear-gradient(170deg, #2a0518 0%, #120229 40%, #08041a 70%, #040310 100%)' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(170deg, #08091f 0%, #0d1b3e 40%, #080916 70%, #04040f 100%)' },
  { id: 'ember',    label: 'Ember',    bg: 'linear-gradient(170deg, #1a0505 0%, #2e0a0a 40%, #120505 70%, #080505 100%)' },
  { id: 'forest',   label: 'Forest',   bg: 'linear-gradient(170deg, #041509 0%, #0a2410 40%, #050f08 70%, #030804 100%)' },
  { id: 'neon',     label: 'Neon',     bg: 'linear-gradient(170deg, #150620 0%, #1e0833 40%, #0d051a 70%, #070310 100%)' },
  { id: 'noir',     label: 'Noir',     bg: 'linear-gradient(170deg, #111111 0%, #1a1a1a 40%, #0d0d0d 70%, #080808 100%)' },
];

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO    = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ─── Story Frame (1080×1920 — the actual export canvas) ───────────────────────

interface StoryFrameProps {
  data: ShowcasedActivity;
  bg: typeof STORY_BACKGROUNDS[number];
  accent: string;
  textColor: string;
  stats: StatOption[];
  showPRHighlight: boolean;
  showWatermark: boolean;
}

const StoryFrame = React.forwardRef<HTMLDivElement, StoryFrameProps>(
  ({ data, bg, accent, textColor, stats, showPRHighlight, showWatermark }, ref) => {
    const bannerUrl = data.enrichments?.aiBanner?.imageUrl;
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
        {/* Banner photo as full-bleed atmospheric background */}
        {bannerUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.38,
          }} />
        )}

        {/* Gradient overlay for text contrast */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.65) 28%, rgba(0,0,0,0.10) 52%, rgba(0,0,0,0.40) 72%, rgba(0,0,0,0.82) 100%)',
        }} />

        {/* Accent glow behind main title area */}
        <div style={{
          position: 'absolute',
          top: '44%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1000px', height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}1a 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Content layout */}
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
              background: `${accent}18`,
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
                color: `${textColor}55`,
              }}>
                VIA {sourceLabel}
              </div>
            )}
          </div>

          {/* Date + PR chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '0' }}>
            {data.startTime && (
              <div style={{
                fontFamily: MONO,
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: `${textColor}60`,
              }}>
                {formatDateFull(data.startTime)}
              </div>
            )}
            {prCount > 0 && (
              <div style={{
                background: `${accent}20`,
                border: `1.5px solid ${accent}55`,
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

          {/* Flex spacer — pushes title to roughly 40% down */}
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
            textShadow: '0 4px 48px rgba(0,0,0,0.9)',
            marginBottom: '36px',
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
            color: `${textColor}50`,
            marginBottom: '72px',
          }}>
            BY {(data.ownerDisplayName ?? '').toUpperCase()}
            {boosterCount > 0 && ` · ENRICHED BY ${boosterCount} BOOSTER${boosterCount !== 1 ? 'S' : ''}`}
          </div>

          {/* Gradient divider */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, ${accent}00, ${accent}99, ${accent}00)`,
            marginBottom: '56px',
            flexShrink: 0,
          }} />

          {/* Stats grid — 2-col for 3–4 stats, 1-col for 1–2 */}
          {stats.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: stats.length >= 3 ? 'repeat(2, 1fr)' : `repeat(${stats.length}, 1fr)`,
              gap: '36px 48px',
              marginBottom: showPRHighlight && topPR ? '56px' : '0',
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
                marginBottom: '44px',
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
              color: 'rgba(245,243,235,0.18)',
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
              bg={bg}
              accent={accent}
              textColor={textColor}
              stats={selectedStats}
              showPRHighlight={showPRHighlight}
              showWatermark={showWatermark}
            />
          </div>
        </div>
        <button className="export-download-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : '⬇ Download PNG'}
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
