/**
 * Reel tab for the share modal: a looping canvas preview of the Roundup Reel
 * plus a "Download Reel" button that records a single pass to WebM. Photos and
 * the avatar are preloaded with CORS and taint-tested up front — a tainted
 * canvas would make MediaRecorder throw, so unusable images are dropped and the
 * reel falls back to its purely-graphical scenes.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { components } from '../../shared/api/schema-public';
import { logger } from '../../shared/logger';
import { ACCENTS, accentSwatchStyle } from './ShowcaseExportModal';
import { REEL_W, REEL_H, buildReelData, drawReelFrame, recordReel, planScenes, reelDuration, SCENE_LABELS, LOCKED_SCENES, type SceneId } from '../utils/roundupReel';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

type LoadedImages = { images: HTMLImageElement[]; hasPhotos: boolean };

/** Loads an image with CORS and resolves null if it fails or is cross-origin tainted. */
function loadUsableImage(url: string, kind: 'photo' | 'avatar'): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Taint test: drawing then reading back throws on a CORS-tainted canvas.
      try {
        const test = document.createElement('canvas');
        test.width = test.height = 1;
        const tctx = test.getContext('2d');
        if (!tctx) { resolve(null); return; }
        tctx.drawImage(img, 0, 0, 1, 1);
        tctx.getImageData(0, 0, 1, 1);
        img.dataset.kind = kind;
        resolve(img);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export const RoundupReelPanel: React.FC<{
  roundup: ShowcaseRoundup;
  periodKey: string;
  accent: string;
  onAccent: (c: string) => void;
}> = ({ roundup, periodKey, accent, onAccent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedImages>({ images: [], hasPhotos: false });
  const [disabled, setDisabled] = useState<ReadonlySet<SceneId>>(new Set());
  const data = useMemo(() => buildReelData(roundup, periodKey), [roundup, periodKey]);

  // Scenes the data supports (ignoring toggles) — drives the toggle list.
  const available = useMemo(
    () => planScenes(data, loaded.hasPhotos).filter((s) => !LOCKED_SCENES.has(s.id)),
    [data, loaded.hasPhotos],
  );
  const duration = useMemo(
    () => reelDuration(planScenes(data, loaded.hasPhotos, disabled)),
    [data, loaded.hasPhotos, disabled],
  );

  const toggleScene = (id: SceneId) =>
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  // Preload avatar + photos with CORS; keep only usable (non-tainted) images.
  useEffect(() => {
    let cancelled = false;
    const jobs: Promise<HTMLImageElement | null>[] = [];
    if (data.avatarUrl) jobs.push(loadUsableImage(data.avatarUrl, 'avatar'));
    data.photos.forEach((u) => jobs.push(loadUsableImage(u, 'photo')));
    if (jobs.length === 0) { setLoaded({ images: [], hasPhotos: false }); return; }
    Promise.all(jobs).then((res) => {
      if (cancelled) return;
      const images = res.filter((i): i is HTMLImageElement => !!i);
      setLoaded({ images, hasPhotos: images.some((i) => i.dataset.kind === 'photo') });
    });
    return () => { cancelled = true; };
  }, [data]);

  const drawCtx = useMemo(
    () => ({ images: loaded.images, hasPhotos: loaded.hasPhotos, disabled }),
    [loaded, disabled],
  );

  // Looping preview — paused while recording so the two loops don't fight.
  useEffect(() => {
    if (recording) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    let active = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (!active) return;
      const t = ((now - start) / 1000) % duration;
      drawReelFrame(ctx, data, t, accent, drawCtx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(raf); };
  }, [data, accent, recording, duration, drawCtx]);

  const onDownload = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    setError(null);
    setRecording(true);
    setProgress(0);
    try {
      const blob = await recordReel(canvas, (t) => drawReelFrame(ctx, data, t, accent, drawCtx), duration, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roundup-${periodKey.replace(/-/g, '_')}-reel.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      logger.error('Reel export failed:', err);
      setError(err instanceof Error ? err.message : 'Reel export failed');
    } finally {
      setRecording(false);
      setProgress(0);
    }
  };

  return (
    <>
      <div className="export-modal-preview-col">
        <div className="export-preview-wrapper" style={{ width: 300, height: 300 * (REEL_H / REEL_W), position: 'relative', overflow: 'hidden', background: '#070710' }}>
          <canvas
            ref={canvasRef}
            width={REEL_W}
            height={REEL_H}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          {recording && (
            <div style={{ position: 'absolute', left: 0, bottom: 0, height: '4px', width: `${Math.round(progress * 100)}%`, background: accent, transition: 'width 0.1s linear' }} />
          )}
        </div>

        <button className="export-download-btn" onClick={onDownload} disabled={recording}>
          {recording ? `Recording… ${Math.round(progress * 100)}%` : '⬇ Download Reel (WebM)'}
        </button>
        {error && <p className="export-stats-hint" style={{ color: 'var(--fg-rose)' }}>{error}</p>}
        {!error && <p className="export-stats-hint">{Math.round(duration)}-second 9:16 clip · recorded in your browser · great for Stories &amp; Reels</p>}
      </div>

      <div className="export-modal-options-col">
        <div className="export-options">
          <div className="export-option-group">
            <span className="export-option-label">Accent</span>
            <div className="export-option-row">
              {ACCENTS.map((a) => (
                <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => onAccent(a.color)} aria-label={a.id} />
              ))}
            </div>
          </div>

          {available.length > 0 && (
            <div className="export-option-group">
              <span className="export-option-label">Scenes</span>
              <div className="export-option-row export-option-row--wrap">
                {available.map((s) => (
                  <button
                    key={s.id}
                    className={`export-pill${disabled.has(s.id) ? '' : ' export-pill--active'}`}
                    onClick={() => toggleScene(s.id)}
                  >
                    {SCENE_LABELS[s.id]}
                  </button>
                ))}
              </div>
              <p className="export-stats-hint">Tap to drop a scene · Intro &amp; outro always included</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
