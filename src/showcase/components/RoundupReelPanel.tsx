/**
 * Reel tab for the share modal: a looping canvas preview of the Roundup Reel
 * plus a "Download Reel" button that records a single pass to WebM.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { components } from '../../shared/api/schema-public';
import { logger } from '../../shared/logger';
import { ACCENTS, accentSwatchStyle } from './ShowcaseExportModal';
import { REEL_W, REEL_H, buildReelData, drawReelFrame, recordReel } from '../utils/roundupReel';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

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
  const data = useMemo(() => buildReelData(roundup, periodKey), [roundup, periodKey]);

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
      const t = ((now - start) / 1000) % 12;
      drawReelFrame(ctx, data, t, accent);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(raf); };
  }, [data, accent, recording]);

  const onDownload = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    setError(null);
    setRecording(true);
    setProgress(0);
    try {
      const blob = await recordReel(canvas, (t) => drawReelFrame(ctx, data, t, accent), setProgress);
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

      <div className="export-option-group" style={{ marginTop: '14px' }}>
        <span className="export-option-label">Accent</span>
        <div className="export-option-row">
          {ACCENTS.map((a) => (
            <button key={a.id} className={`export-swatch${accent === a.color ? ' export-swatch--active' : ''}`} style={{ background: a.color, ...accentSwatchStyle(a.color) }} onClick={() => onAccent(a.color)} aria-label={a.id} />
          ))}
        </div>
      </div>

      <button className="export-download-btn" onClick={onDownload} disabled={recording}>
        {recording ? `Recording… ${Math.round(progress * 100)}%` : '⬇ Download Reel (WebM)'}
      </button>
      {error && <p className="export-stats-hint" style={{ color: 'var(--fg-rose)' }}>{error}</p>}
      {!error && <p className="export-stats-hint">12-second 9:16 clip · recorded in your browser · great for Stories &amp; Reels</p>}
    </div>
  );
};
