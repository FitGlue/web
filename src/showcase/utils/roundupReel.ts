/**
 * Client-side "Roundup Reel" — an animated 9:16 video built entirely in the
 * browser (canvas 2D + MediaRecorder), no server cost. buildReelData distils a
 * roundup into a few punchy scenes; drawReelFrame renders one frame at time t;
 * recordReel captures a single pass to a downloadable WebM blob.
 */
import type { components } from '../../shared/api/schema-public';
import { buildSportVMs, heroTitle, periodWord } from './roundup';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

export const REEL_W = 1080;
export const REEL_H = 1920;
export const REEL_DURATION = 12; // seconds

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface ReelStat { num: number; suffix: string; label: string; }
interface ReelSport { label: string; color: string; count: number; pct: number; }

export interface ReelData {
  eyebrow: string;
  title: string;
  stats: ReelStat[];
  sports: ReelSport[];
  highlight: { big: string; label: string; sub: string } | null;
  name: string;
}

export function buildReelData(roundup: ShowcaseRoundup, periodKey: string): ReelData {
  const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
  const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;
  const hasStrength = (roundup.activityTypeBreakdowns?.some((bd) => (bd.totalSets ?? 0) > 0)) ?? false;

  const stats: ReelStat[] = [
    { num: roundup.totalActivities ?? 0, suffix: '', label: 'Sessions' },
    { num: Math.round((roundup.totalDurationSeconds ?? 0) / 3600), suffix: 'h', label: 'Total Time' },
  ];
  if (hasDistance) {
    stats.push({ num: Math.round((roundup.totalDistanceMeters ?? 0) / 1000), suffix: 'km', label: 'Distance' });
  } else if (hasStrength && totalWeightKg > 0) {
    stats.push({ num: Math.round(totalWeightKg / 1000), suffix: 't', label: 'Moved' });
  }
  if ((roundup.totalCaloriesKcal ?? 0) > 0) {
    stats.push({ num: roundup.totalCaloriesKcal ?? 0, suffix: '', label: 'Calories' });
  }

  const vms = buildSportVMs(roundup.activityTypeBreakdowns ?? []);
  const sportTotal = vms.reduce((a, s) => a + s.count, 0) || 1;
  const sports: ReelSport[] = vms.slice(0, 4).map((s) => ({
    label: s.label, color: s.color, count: s.count, pct: s.count / sportTotal,
  }));

  let highlight: ReelData['highlight'] = null;
  const prCount = roundup.prsAchieved?.length ?? 0;
  const elevation = roundup.totalElevationGainMeters ?? 0;
  const longest = roundup.longestActivityDurationSeconds ?? 0;
  if (prCount > 0) {
    highlight = { big: String(prCount), label: prCount === 1 ? 'Personal Record' : 'Personal Records', sub: 'New bests this period' };
  } else if (elevation > 50) {
    highlight = { big: `+${Math.round(elevation).toLocaleString()}m`, label: 'Total Vertical', sub: 'Climbed this period' };
  } else if (longest > 60) {
    const h = Math.floor(longest / 3600);
    const m = Math.floor((longest % 3600) / 60);
    highlight = { big: h > 0 ? `${h}h ${m}m` : `${m}m`, label: 'Longest Session', sub: 'The big one' };
  }

  return {
    eyebrow: `${periodWord(roundup.periodType).toUpperCase()} IN SPORT`,
    title: heroTitle(periodKey),
    stats: stats.slice(0, 4),
    sports,
    highlight,
    name: roundup.ownerDisplayName ?? '',
  };
}

/** Window helper: returns null outside [start,end], else local progress + alpha. */
function scene(t: number, start: number, end: number, fade = 0.45): { lt: number; a: number } | null {
  if (t < start - fade || t > end + fade) return null;
  const lt = clamp((t - start) / (end - start), 0, 1);
  const a = Math.min(clamp((t - start + fade) / fade, 0, 1), clamp((end + fade - t) / fade, 0, 1));
  if (a <= 0) return null;
  return { lt, a };
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = '#070710';
  ctx.fillRect(0, 0, REEL_W, REEL_H);

  const orbs = [
    { c: 'rgba(255,61,166,0.55)', x: 0.2, y: 0.18, r: 0.62 },
    { c: 'rgba(34,211,238,0.42)', x: 0.85, y: 0.42, r: 0.55 },
    { c: 'rgba(139,92,246,0.5)', x: 0.35, y: 0.86, r: 0.6 },
  ];
  for (let i = 0; i < orbs.length; i++) {
    const o = orbs[i];
    const dx = Math.sin(t * 0.5 + i * 2) * 60;
    const dy = Math.cos(t * 0.4 + i * 1.5) * 60;
    const cx = o.x * REEL_W + dx;
    const cy = o.y * REEL_H + dy;
    const rad = o.r * REEL_W;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, o.c);
    g.addColorStop(1, 'rgba(7,7,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, REEL_W, REEL_H);
  }

  // vignette
  const v = ctx.createRadialGradient(REEL_W / 2, REEL_H / 2, REEL_H * 0.3, REEL_W / 2, REEL_H / 2, REEL_H * 0.75);
  v.addColorStop(0, 'rgba(7,7,16,0)');
  v.addColorStop(1, 'rgba(7,7,16,0.7)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, REEL_W, REEL_H);
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = spacing ? 'left' : align;
  ctx.textBaseline = 'alphabetic';
  if (!spacing) { ctx.fillText(s, x, y); return; }
  // manual letter spacing, centered
  const widths = [...s].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let cx = align === 'center' ? x - total / 2 : x;
  for (let i = 0; i < s.length; i++) { ctx.fillText(s[i], cx, y); cx += widths[i]; }
}

export function drawReelFrame(ctx: CanvasRenderingContext2D, d: ReelData, t: number, accent: string) {
  drawBackground(ctx, t);
  const cx = REEL_W / 2;

  // 1 · Intro (0 – 2.6)
  const intro = scene(t, 0, 2.6);
  if (intro) {
    ctx.globalAlpha = intro.a;
    const rise = (1 - easeOut(clamp(intro.lt * 2, 0, 1))) * 60;
    text(ctx, d.eyebrow, cx, REEL_H * 0.42 - rise, `40px ${MONO}`, accent, 'center', 8);
    const titleSize = d.title.length > 6 ? 200 : 300;
    text(ctx, d.title, cx, REEL_H * 0.55 - rise, `${titleSize}px ${DISPLAY}`, '#f5f3eb', 'center');
    ctx.globalAlpha = 1;
  }

  // 2 · Big stats (2.6 – 5.4)
  const st = scene(t, 2.6, 5.4);
  if (st && d.stats.length) {
    const cols = 2;
    const cellW = REEL_W * 0.4;
    const cellH = 300;
    const gridW = cols * cellW;
    const startX = cx - gridW / 2;
    const startY = REEL_H * 0.34;
    d.stats.forEach((s, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const delay = i * 0.12;
      const lp = clamp((st.lt * 2.8) - delay * 2.8, 0, 1);
      if (lp <= 0) return;
      ctx.globalAlpha = st.a * lp;
      const x = startX + col * cellW + cellW / 2;
      const y = startY + row * (cellH + 40);
      const val = Math.round(s.num * easeOut(lp)).toLocaleString() + s.suffix;
      text(ctx, val, x, y + 90, `120px ${DISPLAY}`, accent, 'center');
      text(ctx, s.label.toUpperCase(), x, y + 150, `34px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 5);
    });
    ctx.globalAlpha = 1;
  }

  // 3 · Sport bars (5.4 – 8.2)
  const sp = scene(t, 5.4, 8.2);
  if (sp && d.sports.length) {
    text(ctx, 'WHERE THE WORK WENT', cx, REEL_H * 0.26, `38px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 6);
    const barX = REEL_W * 0.12;
    const barW = REEL_W * 0.76;
    const barH = 64;
    const gap = 52;
    const startY = REEL_H * 0.34;
    d.sports.forEach((s, i) => {
      const delay = i * 0.12;
      const lp = clamp((sp.lt * 2.6) - delay * 2.6, 0, 1);
      if (lp <= 0) return;
      ctx.globalAlpha = sp.a;
      const y = startY + i * (barH + gap);
      text(ctx, s.label.toUpperCase(), barX, y - 14, `40px ${DISPLAY}`, '#f5f3eb', 'left');
      text(ctx, String(s.count), barX + barW, y - 14, `40px ${DISPLAY}`, accent, 'right');
      ctx.fillStyle = 'rgba(245,243,235,0.08)';
      ctx.fillRect(barX, y, barW, barH);
      ctx.fillStyle = s.color;
      ctx.fillRect(barX, y, barW * s.pct * easeOut(lp), barH);
    });
    ctx.globalAlpha = 1;
  }

  // 4 · Highlight (8.2 – 10.2)
  const hl = scene(t, 8.2, 10.2);
  if (hl && d.highlight) {
    ctx.globalAlpha = hl.a;
    const pop = 0.85 + easeOut(clamp(hl.lt * 2.5, 0, 1)) * 0.15;
    text(ctx, d.highlight.sub.toUpperCase(), cx, REEL_H * 0.42, `36px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 6);
    ctx.save();
    ctx.translate(cx, REEL_H * 0.52);
    ctx.scale(pop, pop);
    text(ctx, d.highlight.big, 0, 60, `260px ${DISPLAY}`, accent, 'center');
    ctx.restore();
    text(ctx, d.highlight.label.toUpperCase(), cx, REEL_H * 0.6, `48px ${DISPLAY}`, '#f5f3eb', 'center', 2);
    ctx.globalAlpha = 1;
  }

  // 5 · Outro (10.2 – 12)
  const out = scene(t, 10.2, REEL_DURATION, 0.5);
  if (out) {
    ctx.globalAlpha = out.a;
    if (d.name) {
      text(ctx, `BY ${d.name.toUpperCase()}`, cx, REEL_H * 0.44, `40px ${MONO}`, 'rgba(245,243,235,0.7)', 'center', 6);
    }
    // gradient wordmark
    const grad = ctx.createLinearGradient(cx - 320, 0, cx + 320, 0);
    grad.addColorStop(0, '#ff3da6');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#22d3ee');
    text(ctx, 'FITGLUE', cx, REEL_H * 0.54, `150px ${DISPLAY}`, grad as unknown as string, 'center');
    text(ctx, 'FITGLUE.TECH', cx, REEL_H * 0.6, `34px ${MONO}`, 'rgba(245,243,235,0.5)', 'center', 8);
    ctx.globalAlpha = 1;
  }
}

/** Records one pass of the reel to a WebM blob. */
export function recordReel(
  canvas: HTMLCanvasElement,
  drawAt: (t: number) => void,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const ready = (typeof document !== 'undefined' && document.fonts) ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      try {
        if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
          reject(new Error('Recording not supported in this browser'));
          return;
        }
        const stream = canvas.captureStream(30);
        const mimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
        const mime = mimes.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? 'video/webm';
        const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
        const chunks: BlobPart[] = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
        rec.onerror = () => reject(new Error('Recording failed'));
        const start = performance.now();
        rec.start();
        const tick = (now: number) => {
          const t = (now - start) / 1000;
          drawAt(Math.min(t, REEL_DURATION));
          onProgress?.(clamp(t / REEL_DURATION, 0, 1));
          if (t < REEL_DURATION) requestAnimationFrame(tick);
          else setTimeout(() => rec.state !== 'inactive' && rec.stop(), 120);
        };
        requestAnimationFrame(tick);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Recording failed'));
      }
    });
  });
}
