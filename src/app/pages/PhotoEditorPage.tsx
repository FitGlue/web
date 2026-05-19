import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stack } from '../components/library/layout';
import { Button, Heading, Paragraph } from '../components/library/ui';
import { FormField, Input } from '../components/library/forms';
import { client } from '../../shared/api/client';

type Format = 'square' | 'story';
type CardPosition = 'top' | 'center' | 'bottom';
type BackgroundType = 'photo' | 'gradient';

interface OverlayText {
    title: string;
    metric: string;
    date: string;
}

const GRADIENT_PRESETS: Array<{ label: string; colors: [string, string] }> = [
    { label: 'FitGlue', colors: ['#1a0a20', '#ff3da6'] },
    { label: 'Midnight', colors: ['#0a0a1a', '#22d3ee'] },
    { label: 'Ember', colors: ['#2a0a0a', '#FF6B35'] },
    { label: 'Forest', colors: ['#0a1a0d', '#4ADE80'] },
    { label: 'Neon', colors: ['#1a0a2a', '#E040FB'] },
    { label: 'Golden', colors: ['#1a1a0a', '#FBBF24'] },
];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

const PhotoEditorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const activityId = searchParams.get('activityId');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loadedImageRef = useRef<HTMLImageElement | null>(null);

    // State
    const [backgroundType, setBackgroundType] = useState<BackgroundType>('gradient');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [gradientColors, setGradientColors] = useState<[string, string]>(['#1a0a20', '#ff3da6']);
    const [cardPosition, setCardPosition] = useState<CardPosition>('center');
    const [format, setFormat] = useState<Format>('square');
    const [overlayText, setOverlayText] = useState<OverlayText>({
        title: 'Morning Run',
        metric: '10.5 km • 52 min',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    // Fetch activity photos if activityId provided
    useEffect(() => {
        if (!activityId) return;
        setLoadingActivity(true);
        client.GET('/users/me/showcases/{id}', { params: { path: { id: activityId } } })
            .then(({ data }) => {
                const showcase = data as { photoUrls?: string[]; title?: string };
                const photos = showcase?.photoUrls ?? [];
                setPhotoUrls(photos);
                if (photos.length > 0) {
                    setSelectedPhoto(photos[0]);
                    setBackgroundType('photo');
                }
                if (showcase?.title) {
                    setOverlayText(prev => ({ ...prev, title: showcase.title ?? prev.title }));
                }
            })
            .catch(() => {
                // Silently fall back to gradient if fetch fails
            })
            .finally(() => setLoadingActivity(false));
    }, [activityId]);

    // Draw canvas
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 1080;
        const H = format === 'square' ? 1080 : 1920;
        canvas.width = W;
        canvas.height = H;

        // Background
        if (backgroundType === 'photo' && selectedPhoto && loadedImageRef.current) {
            const img = loadedImageRef.current;
            // Object-fit: cover
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const canvasRatio = W / H;
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
            if (imgRatio > canvasRatio) {
                sw = img.naturalHeight * canvasRatio;
                sx = (img.naturalWidth - sw) / 2;
            } else {
                sh = img.naturalWidth / canvasRatio;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
            // Darken overlay for readability
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0, 0, W, H);
        } else {
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, gradientColors[0]);
            grad.addColorStop(1, gradientColors[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        // Stats card
        const cardH = 280;
        const cardY =
            cardPosition === 'top' ? 80 :
            cardPosition === 'bottom' ? H - cardH - 80 :
            (H - cardH) / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        roundRect(ctx, 60, cardY, W - 120, cardH, 20);
        ctx.fill();

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
        ctx.fillText(overlayText.title, 80, cardY + 80);

        // Metric text
        ctx.font = '48px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(overlayText.metric, 80, cardY + 150);

        // Date text
        ctx.font = '36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(overlayText.date, 80, cardY + 210);

        // Watermark
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'right';
        ctx.fillText('fitglue.tech', W - 40, H - 40);
        ctx.textAlign = 'left';
    }, [backgroundType, selectedPhoto, gradientColors, cardPosition, format, overlayText]);

    // Load image when selectedPhoto changes
    useEffect(() => {
        if (!selectedPhoto) {
            loadedImageRef.current = null;
            drawCanvas();
            return;
        }
        setImageLoadError(false);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            loadedImageRef.current = img;
            drawCanvas();
        };
        img.onerror = () => {
            setImageLoadError(true);
            loadedImageRef.current = null;
            drawCanvas();
        };
        img.src = selectedPhoto;
    }, [selectedPhoto, drawCanvas]);

    // Redraw on any other state change
    useEffect(() => {
        if (backgroundType !== 'photo' || loadedImageRef.current) {
            drawCanvas();
        }
    }, [backgroundType, gradientColors, cardPosition, format, overlayText, drawCanvas]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fitglue-post-${format}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    const canvasPreviewWidth = format === 'square' ? 480 : 270;
    const canvasPreviewHeight = format === 'square' ? 480 : 480;

    return (
        <div>
            <div className="page-head">
                <div>
                    <div className="page-head__eyebrow">SHOWCASE / PHOTO EDITOR</div>
                    <h1>Photo Editor</h1>
                </div>
                <div className="page-head__actions">
                    <a href="/app/settings/showcase" className="fg-button fg-button--ghost fg-button--sm">← SHOWCASE</a>
                </div>
            </div>

            <div className="fg-band">
                <span className="fg-band__label">PHOTO EDITOR</span>
                <span className="fg-band__right">SOCIAL POSTS</span>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
                {activityId && loadingActivity && (
                    <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        Loading activity photos…
                    </p>
                )}
                <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Create shareable social media posts from your activity data.
                </p>

                <Stack direction="horizontal" gap="lg" className="photo-editor__layout">
                    {/* Left Panel: Controls */}
                    <Stack gap="md" className="photo-editor__controls">

                        {/* Format */}
                        <Stack gap="sm">
                            <Heading level={4}>Format</Heading>
                            <Stack direction="horizontal" gap="sm">
                                <Button
                                    variant={format === 'square' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setFormat('square')}
                                >
                                    Square (1080×1080)
                                </Button>
                                <Button
                                    variant={format === 'story' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setFormat('story')}
                                >
                                    Story (1080×1920)
                                </Button>
                            </Stack>
                        </Stack>

                        {/* Background */}
                        <Stack gap="sm">
                            <Heading level={4}>Background</Heading>
                            <Stack direction="horizontal" gap="sm">
                                <Button
                                    variant={backgroundType === 'gradient' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setBackgroundType('gradient')}
                                >
                                    Gradient
                                </Button>
                                {photoUrls.length > 0 && (
                                    <Button
                                        variant={backgroundType === 'photo' ? 'primary' : 'secondary'}
                                        size="small"
                                        onClick={() => setBackgroundType('photo')}
                                    >
                                        Photo
                                    </Button>
                                )}
                            </Stack>

                            {backgroundType === 'gradient' && (
                                <Stack gap="sm">
                                    <Paragraph size="sm" muted>Gradient presets</Paragraph>
                                    <Stack direction="horizontal" gap="xs" style={{ flexWrap: 'wrap' }}>
                                        {GRADIENT_PRESETS.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                title={preset.label}
                                                onClick={() => setGradientColors(preset.colors)}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    border: gradientColors[0] === preset.colors[0] ? '3px solid var(--fg-paper)' : '2px solid rgba(245,243,235,0.2)',
                                                    background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <FormField label="From">
                                            <input
                                                type="color"
                                                value={gradientColors[0]}
                                                onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])}
                                                style={{ width: 48, height: 32, cursor: 'pointer', borderRadius: 4, border: 'none' }}
                                            />
                                        </FormField>
                                        <FormField label="To">
                                            <input
                                                type="color"
                                                value={gradientColors[1]}
                                                onChange={(e) => setGradientColors([gradientColors[0], e.target.value])}
                                                style={{ width: 48, height: 32, cursor: 'pointer', borderRadius: 4, border: 'none' }}
                                            />
                                        </FormField>
                                    </Stack>
                                </Stack>
                            )}

                            {backgroundType === 'photo' && photoUrls.length > 0 && (
                                <Stack gap="xs">
                                    <Paragraph size="sm" muted>Select photo</Paragraph>
                                    <Stack direction="horizontal" gap="xs" style={{ flexWrap: 'wrap' }}>
                                        {photoUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt={`Photo ${i + 1}`}
                                                onClick={() => setSelectedPhoto(url)}
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    border: selectedPhoto === url ? '3px solid var(--fg-paper)' : '2px solid rgba(245,243,235,0.2)',
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                    {imageLoadError && (
                                        <Paragraph size="sm" muted>Could not load photo — try another or use gradient</Paragraph>
                                    )}
                                </Stack>
                            )}
                        </Stack>

                        {/* Card Position */}
                        <Stack gap="sm">
                            <Heading level={4}>Card Position</Heading>
                            <Stack direction="horizontal" gap="sm">
                                {(['top', 'center', 'bottom'] as CardPosition[]).map((pos) => (
                                    <Button
                                        key={pos}
                                        variant={cardPosition === pos ? 'primary' : 'secondary'}
                                        size="small"
                                        onClick={() => setCardPosition(pos)}
                                    >
                                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                    </Button>
                                ))}
                            </Stack>
                        </Stack>

                        {/* Overlay Text */}
                        <Stack gap="sm">
                            <Heading level={4}>Text</Heading>
                            <FormField label="Title">
                                <Input
                                    value={overlayText.title}
                                    onChange={(e) => setOverlayText(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Morning Run"
                                    maxLength={60}
                                />
                            </FormField>
                            <FormField label="Metric">
                                <Input
                                    value={overlayText.metric}
                                    onChange={(e) => setOverlayText(prev => ({ ...prev, metric: e.target.value }))}
                                    placeholder="e.g. 10.5 km • 52 min"
                                    maxLength={80}
                                />
                            </FormField>
                            <FormField label="Date">
                                <Input
                                    value={overlayText.date}
                                    onChange={(e) => setOverlayText(prev => ({ ...prev, date: e.target.value }))}
                                    placeholder="e.g. 8 May 2026"
                                    maxLength={40}
                                />
                            </FormField>
                        </Stack>
                    </Stack>

                    {/* Right Panel: Preview */}
                    <Stack gap="md" className="photo-editor__preview" align="center">
                        <Heading level={4}>Preview</Heading>
                        <div style={{ width: canvasPreviewWidth, height: canvasPreviewHeight, overflow: 'hidden', border: 'var(--fg-rule-thin)' }}>
                            <canvas
                                ref={canvasRef}
                                style={{
                                    width: canvasPreviewWidth,
                                    height: canvasPreviewHeight,
                                    display: 'block',
                                }}
                            />
                        </div>
                        <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            {format === 'square' ? '1080×1080' : '1080×1920'} — actual output is full resolution
                        </p>
                        <button className="fg-button fg-button--sm" onClick={handleDownload}>
                            DOWNLOAD PNG
                        </button>
                    </Stack>
                </Stack>
            </div>
        </div>
    );
};

export default PhotoEditorPage;
