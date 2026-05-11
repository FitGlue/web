import React, { useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import type { components } from '../../shared/api/schema-public';
import { formatActivityType, formatDateFull } from '../utils/format';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

// ─── Presets ──────────────────────────────────────────────────────────────────

const BACKGROUNDS = [
    { id: 'dark',        label: 'Dark',        style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a20 50%, #0a0a0a 100%)' },
    { id: 'midnight',    label: 'Midnight',    style: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)' },
    { id: 'ember',       label: 'Ember',       style: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #0a0a0a 100%)' },
    { id: 'forest',      label: 'Forest',      style: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0d 50%, #0a0a0a 100%)' },
    { id: 'neon',        label: 'Neon',        style: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2a 50%, #0a0a0a 100%)' },
    { id: 'transparent', label: 'Clear',       style: 'transparent' },
];

const ACCENTS = [
    { id: 'pink',   color: '#FF1B8D' },
    { id: 'cyan',   color: '#4CC9F0' },
    { id: 'orange', color: '#FF6B35' },
    { id: 'green',  color: '#4ADE80' },
    { id: 'purple', color: '#E040FB' },
    { id: 'gold',   color: '#FBBF24' },
];

const FORMATS = [
    { id: 'square',    label: 'Square',    aspect: '1 / 1',   w: 1080, h: 1080 },
    { id: 'portrait',  label: 'Story',     aspect: '9 / 16',  w: 1080, h: 1920 },
    { id: 'landscape', label: 'Landscape', aspect: '16 / 9',  w: 1920, h: 1080 },
];

// ─── Stat helpers ─────────────────────────────────────────────────────────────

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
    const stats: StatOption[] = [];

    if (session?.totalDistance) {
        stats.push({ id: 'distance', label: 'Distance', value: `${(session.totalDistance / 1000).toFixed(2)} km` });
    }
    if (session?.totalElapsedTime) {
        stats.push({ id: 'duration', label: 'Duration', value: fmtDuration(session.totalElapsedTime) });
    }
    if (session?.avgHeartRate) {
        stats.push({ id: 'avg_hr', label: 'Avg HR', value: `${Math.round(session.avgHeartRate)} bpm` });
    }
    if (session?.maxHeartRate) {
        stats.push({ id: 'max_hr', label: 'Max HR', value: `${Math.round(session.maxHeartRate)} bpm` });
    }
    if (session?.totalCalories) {
        stats.push({ id: 'calories', label: 'Calories', value: `${Math.round(session.totalCalories)} kcal` });
    }
    const sets = session?.strengthSets;
    if (sets?.length) {
        stats.push({ id: 'sets', label: 'Sets', value: `${sets.length}` });
        const totalReps = sets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
        if (totalReps) stats.push({ id: 'reps', label: 'Reps', value: `${totalReps}` });
    }

    return stats;
}

// ─── Export frame (the card to be rasterised) ─────────────────────────────────

interface ExportFrameProps {
    data: ShowcasedActivity;
    bg: typeof BACKGROUNDS[number];
    accent: string;
    format: typeof FORMATS[number];
    stats: StatOption[];
}

const ExportFrame = React.forwardRef<HTMLDivElement, ExportFrameProps>(
    ({ data, bg, accent, format, stats }, ref) => {
        const bannerUrl = data.enrichmentMetadata?.['asset_route_thumbnail'] ?? data.enrichmentMetadata?.['asset_ai_banner'];
        const isStory = format.id === 'portrait';
        const isTransparent = bg.id === 'transparent';

        return (
            <div
                ref={ref}
                style={{
                    width: `${format.w}px`,
                    height: `${format.h}px`,
                    background: bg.style,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: isStory ? 'flex-end' : 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                }}
            >
                {bannerUrl && !isTransparent && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.25,
                    }} />
                )}

                {!isTransparent && (
                    <div style={{
                        position: 'absolute',
                        width: '60%', height: '60%',
                        borderRadius: '50%',
                        background: accent,
                        filter: 'blur(200px)',
                        opacity: 0.18,
                        top: isStory ? '30%' : '20%',
                        left: '20%',
                        pointerEvents: 'none',
                    }} />
                )}

                {/* Content card */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    background: isTransparent ? 'rgba(10,10,20,0.92)' : 'rgba(0,0,0,0.55)',
                    border: `2px solid ${accent}44`,
                    borderRadius: isStory ? '48px' : '32px',
                    padding: isStory ? '80px 64px' : '60px 80px',
                    width: isStory ? '75%' : '70%',
                    textAlign: 'center',
                    marginBottom: isStory ? '80px' : '0',
                }}>
                    {/* Activity type badge — no source */}
                    <div style={{
                        display: 'inline-block',
                        background: `${accent}22`,
                        border: `1px solid ${accent}88`,
                        borderRadius: '999px',
                        padding: '10px 32px',
                        color: accent,
                        fontSize: isStory ? '32px' : '24px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '32px',
                    }}>
                        {formatActivityType(data.activityType)}
                    </div>

                    <div style={{
                        fontSize: isStory ? '72px' : '56px',
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    }}>
                        {data.title ?? 'Activity'}
                    </div>

                    {data.startTime && (
                        <div style={{
                            fontSize: isStory ? '28px' : '22px',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '40px',
                        }}>
                            {formatDateFull(data.startTime)}
                        </div>
                    )}

                    {stats.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '32px',
                            justifyContent: 'center',
                            marginBottom: '40px',
                            flexWrap: 'wrap',
                        }}>
                            {stats.map((s, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: isStory ? '52px' : '40px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                                        {s.value}
                                    </div>
                                    <div style={{ fontSize: isStory ? '24px' : '18px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.ownerDisplayName && (
                        <div style={{
                            fontSize: isStory ? '28px' : '22px',
                            color: 'rgba(255,255,255,0.5)',
                        }}>
                            {data.ownerDisplayName}
                        </div>
                    )}
                </div>

                {/* FitGlue watermark */}
                <div style={{
                    position: 'absolute',
                    bottom: isStory ? '40px' : '32px',
                    right: isStory ? '60px' : '48px',
                    fontSize: isStory ? '28px' : '22px',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                }}>
                    Fit<span style={{ color: accent }}>Glue</span>
                </div>
            </div>
        );
    }
);

ExportFrame.displayName = 'ExportFrame';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
    data: ShowcasedActivity;
    onClose: () => void;
}

const MODAL_INNER_W = 432; // 480px modal - 2×24px padding
const MAX_PREVIEW_H = 280;

export const ShowcaseExportModal: React.FC<Props> = ({ data, onClose }) => {
    const [bg, setBg] = useState(BACKGROUNDS[0]);
    const [accent, setAccent] = useState(ACCENTS[0].color);
    const [format, setFormat] = useState(FORMATS[0]);
    const [exporting, setExporting] = useState(false);
    const frameRef = useRef<HTMLDivElement>(null);

    const allStats = useMemo(() => buildAllStats(data), [data]);
    const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() =>
        allStats.slice(0, 3).map((s) => s.id)
    );
    const selectedStats = useMemo(
        () => allStats.filter((s) => selectedStatIds.includes(s.id)),
        [allStats, selectedStatIds]
    );

    const toggleStat = useCallback((id: string) => {
        setSelectedStatIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 4) return prev;
            return [...prev, id];
        });
    }, []);

    const previewScale = Math.min(MODAL_INNER_W / format.w, MAX_PREVIEW_H / format.h);
    const previewW = Math.round(format.w * previewScale);
    const previewH = Math.round(format.h * previewScale);

    const handleExport = useCallback(async () => {
        if (!frameRef.current) return;
        setExporting(true);
        try {
            const dataUrl = await toPng(frameRef.current, {
                width: format.w,
                height: format.h,
                pixelRatio: 1,
                ...(bg.id === 'transparent' ? { backgroundColor: 'rgba(0,0,0,0)' } : {}),
            });
            const link = document.createElement('a');
            link.download = `${(data.title ?? 'activity').replace(/\s+/g, '-').toLowerCase()}-fitglue.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    }, [data.title, format, bg.id]);

    return createPortal(
        <div className="export-modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal-header">
                    <h3 className="export-modal-title">✦ Share Activity</h3>
                    <button className="export-modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Preview — sized to the scaled frame dimensions */}
                <div
                    className="export-preview-wrapper"
                    style={{
                        width: `${previewW}px`,
                        height: `${previewH}px`,
                        backgroundImage: bg.id === 'transparent'
                            ? 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px'
                            : undefined,
                    }}
                >
                    <div style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                        width: `${format.w}px`,
                        height: `${format.h}px`,
                    }}>
                        <ExportFrame ref={frameRef} data={data} bg={bg} accent={accent} format={format} stats={selectedStats} />
                    </div>
                </div>

                {/* Options */}
                <div className="export-options">
                    <div className="export-option-group">
                        <span className="export-option-label">Format</span>
                        <div className="export-option-row">
                            {FORMATS.map((f) => (
                                <button
                                    key={f.id}
                                    className={`export-pill${format.id === f.id ? ' export-pill--active' : ''}`}
                                    onClick={() => setFormat(f)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="export-option-group">
                        <span className="export-option-label">Background</span>
                        <div className="export-option-row">
                            {BACKGROUNDS.map((b) => (
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
                                    onClick={() => setAccent(a.color)}
                                    aria-label={a.id}
                                />
                            ))}
                        </div>
                    </div>

                    {allStats.length > 0 && (
                        <div className="export-option-group">
                            <span className="export-option-label">Stats</span>
                            <div className="export-option-row">
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
                        </div>
                    )}
                </div>

                <button
                    className="export-download-btn"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    {exporting ? 'Exporting…' : '⬇ Download PNG'}
                </button>
            </div>
        </div>,
        document.body
    );
};
